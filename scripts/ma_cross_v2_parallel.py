"""
MA Cross v2 Parallel – multiprocessing で9ペア×4時間足を並列処理
既存キャッシュ(ma_v2_cache.pkl)から再開可能

言語選定メモ:
  Rust/cargo: 未インストール
  numba:      未インストール
  → Python + numpy vectorize + multiprocessing.Pool(28) を採用
"""
import os, sys, time, pickle, json
import numpy as np
import pandas as pd
import multiprocessing as mp
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

# ── パス ─────────────────────────────────────────────────────────────────────
OUT         = "/home/tj/dev/delver/frontend/public/blog/moving-average-cross-backtest-25year-results/v2"
DATA        = "/home/tj/dev/delver/data"
CACHE       = "/home/tj/dev/delver/scripts/ma_v2_cache.pkl"
RESULTS_DIR = "/home/tj/dev/delver/scripts/ma_cross_v2_results"
os.makedirs(OUT,         exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

# ── 通貨ペア設定 ─────────────────────────────────────────────────────────────
PAIRS = ['EURUSD','USDJPY','AUDUSD','EURGBP','EURJPY','GBPJPY','NZDUSD','USDCAD','XAUUSD']
TIMEFRAMES = ['H1', 'M15', 'M5', 'M1']   # M1 最後

PAIR_CFG = {
    'EURUSD': {'pip': 0.0001, 'spread': 0.7,  'unit': 'pips'},
    'USDJPY': {'pip': 0.01,   'spread': 0.7,  'unit': 'pips'},
    'AUDUSD': {'pip': 0.0001, 'spread': 0.8,  'unit': 'pips'},
    'EURGBP': {'pip': 0.0001, 'spread': 1.0,  'unit': 'pips'},
    'EURJPY': {'pip': 0.01,   'spread': 1.0,  'unit': 'pips'},
    'GBPJPY': {'pip': 0.01,   'spread': 1.5,  'unit': 'pips'},
    'NZDUSD': {'pip': 0.0001, 'spread': 1.0,  'unit': 'pips'},
    'USDCAD': {'pip': 0.0001, 'spread': 1.0,  'unit': 'pips'},
    'XAUUSD': {'pip': 0.1,    'spread': 3.0,  'unit': 'USD/oz'},
}

TF_MAX_H = {'H1': 500, 'M15': 600, 'M5': 500, 'M1': 400}

# ── パラメータグリッド ────────────────────────────────────────────────────────
TP_VALS     = list(range(5, 205, 5))   # 40値
SL_VALS     = list(range(5, 205, 5))
N_LEVELS    = 40
SHORT_RANGE = list(range(5, 101))      # 96値
LONG_RANGE  = list(range(20, 301))     # 281値
VALID_PAIRS = [(s, l) for s in SHORT_RANGE for l in LONG_RANGE if s < l]
# 23,655 有効EMAペア × 1,600 TP/SL = 37,848,000 評価 / (pair×tf)

MIN_TRADES = 100
TOP_K      = 20

# ── プロットスタイル ──────────────────────────────────────────────────────────
BG     = "#0f1117"
GRID   = "#374151"
TC     = "#9ca3af"
COLORS = ["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6",
          "#06b6d4","#f97316","#84cc16","#e11d48","#0ea5e9"]


# ═════════════════════════════════════════════════════════════════════════════
# コア計算関数（モジュールレベル必須 → multiprocessing でpickle可能）
# ═════════════════════════════════════════════════════════════════════════════

def compute_ema(s: np.ndarray, n: int) -> np.ndarray:
    a   = 2.0 / (n + 1)
    out = np.empty(len(s), dtype=np.float32)
    out[0] = s[0]
    for i in range(1, len(s)):
        out[i] = a * s[i] + (1 - a) * out[i - 1]
    return out


def build_ema_cache(close: np.ndarray, periods: list) -> dict:
    return {p: compute_ema(close, p) for p in periods}


def ma_cross_signal(cache, short_n, long_n, n):
    diff = cache[short_n] - cache[long_n]
    prev, curr = diff[:-1], diff[1:]
    sig = np.zeros(n, dtype=np.int8)
    sig[1:][(prev <= 0) & (curr > 0)] =  1
    sig[1:][(prev >= 0) & (curr < 0)] = -1
    return sig


def build_hit_time_matrices(close, high, low, pip_size, spread_pips, max_h):
    """(n, N_LEVELS) の uint16 行列を4本返す"""
    n      = len(close)
    levels = np.array(TP_VALS, dtype=np.float64) * pip_size
    cost   = spread_pips * pip_size
    warmup = max(SHORT_RANGE) + max(LONG_RANGE) + 10

    lgt = np.full((n, N_LEVELS), max_h, dtype=np.uint16)
    llt = np.full((n, N_LEVELS), max_h, dtype=np.uint16)
    sgt = np.full((n, N_LEVELS), max_h, dtype=np.uint16)
    slt = np.full((n, N_LEVELS), max_h, dtype=np.uint16)

    for i in range(warmup, n - 1):
        end = min(i + 1 + max_h, n)
        H   = end - i - 1
        if H == 0:
            continue
        fh = high[i+1:end]
        fl = low[i+1:end]

        lep = close[i] + cost
        cg  = np.maximum.accumulate(fh - lep)
        cd  = np.maximum.accumulate(lep - fl)
        idg = np.searchsorted(cg, levels); idg[idg >= H] = max_h
        idl = np.searchsorted(cd, levels); idl[idl >= H] = max_h
        lgt[i] = idg.astype(np.uint16)
        llt[i] = idl.astype(np.uint16)

        sep = close[i] - cost
        cg2 = np.maximum.accumulate(sep - fl)
        cd2 = np.maximum.accumulate(fh - sep)
        igs = np.searchsorted(cg2, levels); igs[igs >= H] = max_h
        ils = np.searchsorted(cd2, levels); ils[ils >= H] = max_h
        sgt[i] = igs.astype(np.uint16)
        slt[i] = ils.astype(np.uint16)

        if i % 200_000 == 0 and i > 0:
            print(f"    hit-time {i}/{n}", flush=True)

    return lgt, llt, sgt, slt


def run_config_hittimes(sig, lgt, llt, sgt, slt, spread_pips, max_h):
    """(N_LEVELS, N_LEVELS) の期待値行列とトレード数行列を返す"""
    tp_arr = np.array(TP_VALS, dtype=np.float32)
    sl_arr = np.array(SL_VALS, dtype=np.float32)
    pnl    = np.zeros((N_LEVELS, N_LEVELS), dtype=np.float32)
    trades = np.zeros((N_LEVELS, N_LEVELS), dtype=np.int32)

    for entries, gain_t, loss_t in [(np.where(sig == 1)[0], lgt, llt),
                                     (np.where(sig ==-1)[0], sgt, slt)]:
        if len(entries) == 0:
            continue
        lg = gain_t[entries]
        ll = loss_t[entries]
        for ti in range(N_LEVELS):
            lt   = lg[:, ti:ti+1]
            wins = (lt < ll) & (lt < max_h)
            loss = (ll < lt) & (ll < max_h)
            pnl[ti]    += wins.sum(0) * (tp_arr[ti] - spread_pips) - loss.sum(0) * sl_arr
            trades[ti] += (wins | loss).sum(0)

    t_f = trades.astype(np.float32)
    exp = np.where(t_f > 0, pnl / t_f, 0.0)
    return exp.astype(np.float32), trades


def equity_curve(close, high, low, sig, tp_pips, sl_pips, pip_size, spread_pips, max_h):
    n      = len(close)
    cost   = spread_pips * pip_size
    tp_p   = tp_pips * pip_size
    sl_p   = sl_pips * pip_size
    ebars  = np.where(sig != 0)[0]
    esides = sig[ebars]
    if len(ebars) == 0:
        return np.array([0.0])

    pnl_list    = []
    active_exit = -1
    for ebar, side in zip(ebars, esides):
        if ebar <= active_exit:
            continue
        end = min(ebar + 1 + max_h, n)
        H   = end - ebar - 1
        if H == 0:
            continue
        fh = high[ebar+1:end]
        fl = low[ebar+1:end]
        if side == 1:
            ep  = close[ebar] + cost
            cg  = np.maximum.accumulate(fh - ep)
            cd  = np.maximum.accumulate(ep - fl)
        else:
            ep  = close[ebar] - cost
            cg  = np.maximum.accumulate(ep - fl)
            cd  = np.maximum.accumulate(fh - ep)
        tp_hit = int(np.searchsorted(cg, tp_p))
        sl_hit = int(np.searchsorted(cd, sl_p))
        if tp_hit <= sl_hit and tp_hit < H:
            pnl_list.append(tp_pips - spread_pips)
            active_exit = ebar + tp_hit + 1
        elif sl_hit < tp_hit and sl_hit < H:
            pnl_list.append(-sl_pips)
            active_exit = ebar + sl_hit + 1

    return np.cumsum(pnl_list) if pnl_list else np.array([0.0])


# ═════════════════════════════════════════════════════════════════════════════
# ワーカー関数（1ペア × 1時間足）
# ═════════════════════════════════════════════════════════════════════════════

def process_job(args):
    """multiprocessing.Pool ワーカー。1(pair, tf)を完全処理して結果dictを返す。"""
    pair, tf = args
    tag       = f"[{pair} {tf}]"
    t_start   = time.time()
    cfg        = PAIR_CFG[pair]
    pip_size   = cfg['pip']
    spread     = cfg['spread']
    max_h      = TF_MAX_H[tf]

    print(f"{tag} start  pid={os.getpid()}", flush=True)

    parquet = f"{DATA}/{pair}_{tf}.parquet"
    if not os.path.exists(parquet):
        print(f"{tag} SKIP (file not found)", flush=True)
        return None

    # ── データ読み込み ────────────────────────────────────────────────────
    df = (pd.read_parquet(parquet).reset_index()
            .rename(columns={'datetime': 'date'}))
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date').reset_index(drop=True)

    df5  = df[(df.date >= '2020-01-01') & (df.date < '2025-01-01')].reset_index(drop=True)
    df25 = df[(df.date >= '2000-01-01') & (df.date < '2025-01-01')].reset_index(drop=True)
    c5,  h5,  l5  = df5.close.values,  df5.high.values,  df5.low.values
    c25, h25, l25 = df25.close.values, df25.high.values, df25.low.values
    n5, n25 = len(c5), len(c25)
    print(f"{tag} {n5:,} bars(5y) / {n25:,} bars(25y)", flush=True)
    del df, df5, df25

    # ── Phase1: EMAキャッシュ（5年分） ────────────────────────────────────
    unique_periods = sorted(set(SHORT_RANGE + LONG_RANGE))
    t1 = time.time()
    ema5 = build_ema_cache(c5, unique_periods)
    print(f"{tag} EMA cache {time.time()-t1:.1f}s", flush=True)

    # ── Phase2: ヒットタイム行列（5年分） ────────────────────────────────
    t2 = time.time()
    lgt, llt, sgt, slt = build_hit_time_matrices(c5, h5, l5, pip_size, spread, max_h)
    print(f"{tag} hit-time {time.time()-t2:.1f}s", flush=True)

    # ── Phase3: EMAスウィープ ──────────────────────────────────────────────
    t3 = time.time()
    pvt_exp_sum   = np.zeros((N_LEVELS, N_LEVELS), dtype=np.float64)
    pvt_exp_count = np.zeros((N_LEVELS, N_LEVELS), dtype=np.int64)
    pvt_dd_sum    = np.zeros((N_LEVELS, N_LEVELS), dtype=np.float64)
    pvt_dd_count  = np.zeros((N_LEVELS, N_LEVELS), dtype=np.int64)

    # メモリ効率化: per-configで最良(tp,sl)のみ保持 → 最大23,655レコード
    sl_vec   = np.array(SL_VALS, dtype=np.float32)    # (N_LEVELS,)
    top_records = []
    n_configs   = len(VALID_PAIRS)
    last_log    = time.time()

    for ci, (short_n, long_n) in enumerate(VALID_PAIRS):
        sig      = ma_cross_signal(ema5, short_n, long_n, n5)
        exp_mat, trades_mat = run_config_hittimes(sig, lgt, llt, sgt, slt, spread, max_h)

        # ヒートマップ集計
        pvt_exp_sum   += exp_mat
        pvt_exp_count += 1
        neg_mask = exp_mat < 0
        pvt_dd_sum[neg_mask]   += (-exp_mat[neg_mask]) * trades_mat[neg_mask]
        pvt_dd_count[neg_mask] += 1

        # top_records: このEMA configの最良(tp,sl)を1件だけ追加
        valid = trades_mat >= MIN_TRADES
        if valid.any():
            # score = exp - 0.30 * (sl / trades)
            score_mat = exp_mat - 0.30 * (sl_vec / np.maximum(trades_mat, 1))
            score_mat[~valid] = -np.inf
            best_flat = int(np.nanargmax(score_mat))
            ti, si = np.unravel_index(best_flat, score_mat.shape)
            if np.isfinite(score_mat[ti, si]):
                top_records.append({
                    'short':  short_n,
                    'long':   long_n,
                    'tp':     TP_VALS[ti],
                    'sl':     SL_VALS[si],
                    'exp':    float(exp_mat[ti, si]),
                    'trades': int(trades_mat[ti, si]),
                    'score':  float(score_mat[ti, si]),
                })

        # 30秒ごとにログ
        if time.time() - last_log >= 30:
            elapsed = time.time() - t3
            eta     = elapsed / (ci + 1) * (n_configs - ci - 1)
            print(f"{tag} {ci+1}/{n_configs} ({(ci+1)/n_configs*100:.0f}%) "
                  f"ETA {eta/60:.1f}min", flush=True)
            last_log = time.time()

    del lgt, llt, sgt, slt
    print(f"{tag} sweep {time.time()-t3:.1f}s  {len(top_records):,} EMA configs valid", flush=True)

    # ── Phase4: トップ候補 + 25年耐久 ────────────────────────────────────
    if top_records:
        df_rec  = pd.DataFrame(top_records)
        neg_pct = float((df_rec.exp < 0).mean() * 100)
        pos_pct = 100 - neg_pct
        df_pos  = df_rec[df_rec.exp > 0]
        top_df  = (df_pos if len(df_pos) >= 5 else df_rec).nlargest(TOP_K, 'score').reset_index(drop=True)
    else:
        df_rec   = pd.DataFrame()
        neg_pct  = 100.0; pos_pct = 0.0
        top_df   = pd.DataFrame()

    needed = set()
    if len(top_df) > 0:
        needed = set(top_df['short'].tolist() + top_df['long'].tolist())
    ema25 = build_ema_cache(c25, sorted(needed)) if needed else {}

    endurance_results = []
    for _, row in top_df.iterrows():
        s_n, l_n = int(row['short']), int(row['long'])
        tp_p, sl_p = int(row['tp']), int(row['sl'])
        if s_n not in ema25 or l_n not in ema25:
            continue
        sig25 = ma_cross_signal(ema25, s_n, l_n, n25)
        cum   = equity_curve(c25, h25, l25, sig25, tp_p, sl_p, pip_size, spread, max_h)
        endurance_results.append({
            'short': s_n, 'long': l_n, 'tp': tp_p, 'sl': sl_p,
            'exp':    float(row['exp']),
            'trades': int(row['trades']),
            'pnl_25y':      float(cum[-1]),
            'curve_25y':    cum,
            'positive_25y': bool(cum[-1] > 0),
        })

    survival = sum(r['positive_25y'] for r in endurance_results) / max(len(endurance_results), 1)
    best_exp = float(top_df['exp'].max()) if len(top_df) > 0 else 0.0

    pvt_exp = np.where(pvt_exp_count > 0, pvt_exp_sum / pvt_exp_count, 0.0).astype(np.float32)
    pvt_dd  = np.where(pvt_dd_count  > 0, pvt_dd_sum  / pvt_dd_count,  0.0).astype(np.float32)

    elapsed = time.time() - t_start
    print(f"{tag} done {elapsed/60:.1f}min  neg={neg_pct:.0f}%  "
          f"best_exp={best_exp:.3f}  survival={survival*100:.0f}%", flush=True)

    # 個別JSON保存（サマリーのみ、カーブなし）
    json_path = f"{RESULTS_DIR}/{pair}_{tf}.json"
    with open(json_path, 'w') as fj:
        json.dump({
            'pair': pair, 'tf': tf,
            'neg_pct': neg_pct, 'pos_pct': pos_pct,
            'best_exp': best_exp, 'survival_rate': survival,
            'top_configs': top_df.head(10).to_dict(orient='records') if len(top_df) > 0 else [],
            'endurance_summary': [
                {'short': r['short'], 'long': r['long'],
                 'tp': r['tp'], 'sl': r['sl'],
                 'pnl_25y': r['pnl_25y'], 'positive_25y': r['positive_25y']}
                for r in endurance_results],
        }, fj, indent=2)

    return (pair, tf), {
        'pair': pair, 'tf': tf,
        'neg_pct': neg_pct, 'pos_pct': pos_pct,
        'best_exp': best_exp, 'survival_rate': survival,
        'top_df': top_df,
        'endurance': endurance_results,
        'pvt_exp': pvt_exp,
        'pvt_dd':  pvt_dd,
    }


# ═════════════════════════════════════════════════════════════════════════════
# 画像生成
# ═════════════════════════════════════════════════════════════════════════════

def dark_fig(w, h):
    f, a = plt.subplots(figsize=(w, h), facecolor=BG)
    a.set_facecolor(BG)
    return f, a


def save_fig(name):
    plt.tight_layout()
    plt.savefig(f"{OUT}/{name}", dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {name}", flush=True)


def generate_images(all_results):
    print("\n=== 画像生成 ===", flush=True)

    def get(pair, tf):
        return all_results.get((pair, tf), {})

    # ── 上位3ペアを特定 ───────────────────────────────────────────────────
    pair_score = {}
    for p in PAIRS:
        exps = [get(p, tf).get('best_exp', 0) for tf in TIMEFRAMES]
        pair_score[p] = np.mean(exps)
    top3 = sorted(pair_score, key=pair_score.get, reverse=True)[:3]
    print(f"Top 3 pairs: {top3}", flush=True)

    # ── Image 1: 9×4 期待値ヒートマップ ─────────────────────────────────
    matrix = np.array([[get(p, tf).get('best_exp', 0)
                        for tf in TIMEFRAMES] for p in PAIRS])
    f, a = plt.subplots(figsize=(10, 8), facecolor=BG)
    a.set_facecolor(BG)
    vmax = max(abs(matrix.min()), abs(matrix.max()), 1)
    im   = a.imshow(matrix, aspect='auto', cmap='RdYlGn', vmin=-vmax, vmax=vmax)
    a.set_xticks(range(len(TIMEFRAMES))); a.set_xticklabels(TIMEFRAMES, color=TC)
    a.set_yticks(range(len(PAIRS)));     a.set_yticklabels(PAIRS, color=TC)
    for pi, p in enumerate(PAIRS):
        for ti, tf in enumerate(TIMEFRAMES):
            v = matrix[pi, ti]
            a.text(ti, pi, f"{v:.1f}", ha='center', va='center',
                   color='white' if abs(v) < vmax * 0.7 else 'black', fontsize=8)
    a.set_title("最良期待値ヒートマップ（全9通貨ペア × 4時間足）", color='white', fontsize=13, pad=12)
    a.set_xlabel("時間足", color=TC); a.set_ylabel("通貨ペア", color=TC)
    cb = plt.colorbar(im, ax=a)
    cb.ax.tick_params(colors=TC); cb.set_label("期待値 (pips/トレード)", color=TC)
    save_fig("summary_best_exp_heatmap.png")

    # ── Image 2: 通貨ペア別生存率 ────────────────────────────────────────
    pair_surv = {p: np.mean([get(p, tf).get('survival_rate', 0) for tf in TIMEFRAMES])
                 for p in PAIRS}
    sorted_p  = sorted(pair_surv, key=pair_surv.get, reverse=True)
    f, a = dark_fig(10, 5)
    bars = a.bar(sorted_p, [pair_surv[p] * 100 for p in sorted_p],
                 color=[COLORS[i % len(COLORS)] for i in range(len(PAIRS))])
    a.axhline(50, color='white', lw=0.8, ls='--', alpha=0.5)
    a.set_title("通貨ペア別 25年生存率（全4時間足の平均）", color='white', fontsize=13, pad=12)
    a.set_xlabel("通貨ペア", color=TC); a.set_ylabel("25年プラス条件の割合 (%)", color=TC)
    a.tick_params(colors=TC)
    [s.set_edgecolor(GRID) for s in a.spines.values()]
    for bar, p in zip(bars, sorted_p):
        a.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
               f"{pair_surv[p]*100:.0f}%", ha='center', color='white', fontsize=8)
    save_fig("survival_by_pair.png")

    # ── Image 3: 時間足別生存率 ──────────────────────────────────────────
    tf_surv = {tf: np.mean([get(p, tf).get('survival_rate', 0) for p in PAIRS])
               for tf in TIMEFRAMES}
    f, a = dark_fig(8, 5)
    tf_bars = a.bar(TIMEFRAMES, [tf_surv[tf] * 100 for tf in TIMEFRAMES], color=COLORS[:4])
    a.axhline(50, color='white', lw=0.8, ls='--', alpha=0.5)
    a.set_title("時間足別 25年生存率（全9通貨ペアの平均）", color='white', fontsize=13, pad=12)
    a.set_xlabel("時間足", color=TC); a.set_ylabel("25年プラス条件の割合 (%)", color=TC)
    a.tick_params(colors=TC)
    [s.set_edgecolor(GRID) for s in a.spines.values()]
    for bar, tf in zip(tf_bars, TIMEFRAMES):
        a.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
               f"{tf_surv[tf]*100:.0f}%", ha='center', color='white', fontsize=9)
    save_fig("survival_by_tf.png")

    # ── Image 4: XAUUSD vs FX 比較 ───────────────────────────────────────
    fx_pairs    = [p for p in PAIRS if p != 'XAUUSD']
    fx_surv     = [np.mean([get(p, tf).get('survival_rate', 0) for tf in TIMEFRAMES]) for p in fx_pairs]
    xau_surv    = [get('XAUUSD', tf).get('survival_rate', 0) for tf in TIMEFRAMES]
    fx_bexp     = [np.mean([get(p, tf).get('best_exp', 0)     for tf in TIMEFRAMES]) for p in fx_pairs]
    xau_bexp    = [get('XAUUSD', tf).get('best_exp', 0)       for tf in TIMEFRAMES]

    f, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=BG)
    for ax in axes:
        ax.set_facecolor(BG)
    axes[0].bar(fx_pairs, [v * 100 for v in fx_surv], color='#3b82f6', alpha=0.8, label='FX平均')
    axes[0].bar(['XAUUSD'], [np.mean(xau_surv) * 100], color='#f59e0b', label='XAUUSD平均')
    axes[0].set_title("生存率：FX vs XAUUSD", color='white', fontsize=11)
    axes[0].set_ylabel("25年生存率 (%)", color=TC)
    axes[0].tick_params(colors=TC, axis='x', rotation=45)
    axes[0].legend(facecolor='#1f2937', edgecolor=GRID, labelcolor='white')
    [s.set_edgecolor(GRID) for s in axes[0].spines.values()]

    axes[1].bar(fx_pairs, fx_bexp, color='#3b82f6', alpha=0.8, label='FX平均')
    axes[1].bar(TIMEFRAMES, xau_bexp, color='#f59e0b', label='XAUUSD (時間足別)')
    axes[1].set_title("最良期待値：FX vs XAUUSD", color='white', fontsize=11)
    axes[1].set_ylabel("最良期待値 (pips / USD/oz)", color=TC)
    axes[1].tick_params(colors=TC, axis='x', rotation=45)
    axes[1].legend(facecolor='#1f2937', edgecolor=GRID, labelcolor='white')
    [s.set_edgecolor(GRID) for s in axes[1].spines.values()]
    plt.suptitle("XAUUSDと為替ペアの比較", color='white', fontsize=13, y=1.02)
    save_fig("xauusd_vs_fx_comparison.png")

    # ── Images 5-13: 上位3ペア 詳細チャート ──────────────────────────────
    for rank, pair in enumerate(top3, 1):
        unit    = PAIR_CFG[pair]['unit']
        best_tf = max(TIMEFRAMES, key=lambda tf: get(pair, tf).get('best_exp', 0))
        res     = get(pair, best_tf)
        print(f"  {pair} (rank#{rank}, best tf={best_tf})…", flush=True)

        # 期待値ヒートマップ
        pvt_exp = res.get('pvt_exp', np.zeros((N_LEVELS, N_LEVELS)))
        f, a = dark_fig(11, 8)
        vmax = max(abs(pvt_exp.min()), abs(pvt_exp.max()), 0.01)
        im   = a.imshow(pvt_exp, aspect='auto', cmap='RdYlGn',
                        vmin=-vmax, vmax=vmax, origin='lower')
        a.set_xticks(range(N_LEVELS)); a.set_xticklabels(SL_VALS, fontsize=6, color=TC, rotation=45)
        a.set_yticks(range(N_LEVELS)); a.set_yticklabels(TP_VALS, fontsize=6, color=TC)
        a.set_xlabel("損切り SL", color=TC); a.set_ylabel("利確 TP", color=TC)
        a.set_title(f"{pair} {best_tf} – 期待値ヒートマップ ({unit})",
                    color='white', fontsize=13)
        cb = plt.colorbar(im, ax=a)
        cb.ax.tick_params(colors=TC); cb.set_label(f"期待値 ({unit})", color=TC)
        save_fig(f"detail_{pair}_exp_heatmap.png")

        # DDヒートマップ
        pvt_dd = res.get('pvt_dd', np.zeros((N_LEVELS, N_LEVELS)))
        f, a   = dark_fig(11, 8)
        im2    = a.imshow(np.nan_to_num(pvt_dd), aspect='auto',
                          cmap='RdYlBu_r', origin='lower')
        a.set_xticks(range(N_LEVELS)); a.set_xticklabels(SL_VALS, fontsize=6, color=TC, rotation=45)
        a.set_yticks(range(N_LEVELS)); a.set_yticklabels(TP_VALS, fontsize=6, color=TC)
        a.set_xlabel("損切り SL", color=TC); a.set_ylabel("利確 TP", color=TC)
        a.set_title(f"{pair} {best_tf} – DDヒートマップ", color='white', fontsize=13)
        cb2 = plt.colorbar(im2, ax=a)
        cb2.ax.tick_params(colors=TC); cb2.set_label("累積損失推定", color=TC)
        save_fig(f"detail_{pair}_dd_heatmap.png")

        # 25年耐久テスト
        endurance = res.get('endurance', [])
        if endurance:
            f, a = dark_fig(13, 6)
            for idx, r in enumerate(endurance[:10]):
                curve = r['curve_25y']
                lbl   = (f"EMA{r['short']}/{r['long']} TP{r['tp']}/SL{r['sl']}"
                         f" ({r['pnl_25y']:+.0f})")
                a.plot(curve, color=COLORS[idx % len(COLORS)], lw=1.0, alpha=0.85, label=lbl)
            a.axhline(0, color=GRID, lw=1.0, ls='--')
            a.set_title(f"{pair} {best_tf} – TOP10 優秀条件 25年耐久テスト",
                        color='white', fontsize=13)
            a.set_xlabel("トレード数", color=TC)
            a.set_ylabel(f"累積損益 ({unit})", color=TC)
            a.tick_params(colors=TC)
            a.legend(facecolor='#1f2937', edgecolor=GRID, labelcolor='white',
                     fontsize=6, loc='upper left')
            [s.set_edgecolor(GRID) for s in a.spines.values()]
            save_fig(f"detail_{pair}_25y_endurance.png")


# ═════════════════════════════════════════════════════════════════════════════
# メイン
# ═════════════════════════════════════════════════════════════════════════════

def main():
    t_all = time.time()

    # ── 既存キャッシュのロード ───────────────────────────────────────────
    all_results = {}
    if os.path.exists(CACHE):
        with open(CACHE, 'rb') as f:
            all_results = pickle.load(f)
        print(f"キャッシュ読み込み: {len(all_results)} ジョブ完了済み", flush=True)

    # ── 残ジョブを特定 ───────────────────────────────────────────────────
    all_jobs  = [(pair, tf) for tf in TIMEFRAMES for pair in PAIRS]
    remaining = [(p, tf) for p, tf in all_jobs if (p, tf) not in all_results]
    print(f"総ジョブ数: {len(all_jobs)}  残り: {len(remaining)}", flush=True)
    for job in remaining:
        print(f"  未完了: {job[0]} {job[1]}", flush=True)

    if not remaining:
        print("全ジョブ完了済み → 画像生成へ", flush=True)
    else:
        # ── メモリ確認 ────────────────────────────────────────────────────
        with open('/proc/meminfo') as _mf:
            _lines = {l.split(':')[0]: int(l.split()[1]) for l in _mf if ':' in l}
        avail_gb = _lines.get('MemAvailable', _lines.get('MemFree', 0)) / 1e6
        # M1ワーカー1本あたりのピーク推定: EMA(~2.1GB) + hit-time(~0.6GB) + overhead = ~3.5GB
        est_per_worker = 3.5
        n_workers      = min(28, len(remaining))
        est_total      = est_per_worker * n_workers
        print(f"\nメモリ確認: 利用可能 {avail_gb:.1f}GB  "
              f"推定必要 {est_total:.0f}GB ({n_workers}ワーカー × {est_per_worker}GB)",
              flush=True)
        if est_total > avail_gb * 0.85:
            # 安全のためワーカー数を削減
            n_workers = max(1, int(avail_gb * 0.85 / est_per_worker))
            print(f"  OOM回避のためワーカー数を {n_workers} に削減", flush=True)
        else:
            print(f"  メモリ余裕あり → {n_workers} ワーカーで起動", flush=True)

        # ── 並列実行 ─────────────────────────────────────────────────────
        print(f"\n{'='*60}", flush=True)
        print(f"並列バックテスト開始: {n_workers} ワーカー", flush=True)
        print(f"{'='*60}\n", flush=True)

        # maxtasksperchild=1: 各ワーカーは1タスク完了後にプロセス終了 → メモリ解放
        with mp.Pool(processes=n_workers, maxtasksperchild=1) as pool:
            results = pool.map(process_job, remaining)

        # ── 結果マージ & キャッシュ保存 ──────────────────────────────────
        new_count = 0
        for item in results:
            if item is None:
                continue
            key, result = item
            all_results[key] = result
            new_count += 1
        print(f"\n{new_count} ジョブ新規完了 → キャッシュ保存", flush=True)
        with open(CACHE, 'wb') as f:
            pickle.dump(all_results, f)

    # ── アーティクル統計出力 ─────────────────────────────────────────────
    print("\n=== ARTICLE STATS ===", flush=True)
    grand = len(VALID_PAIRS) * N_LEVELS * N_LEVELS * len(PAIRS) * len(TIMEFRAMES)
    print(f"有効EMAペア数       : {len(VALID_PAIRS):,}")
    print(f"TP/SL組み合わせ     : {N_LEVELS*N_LEVELS:,}")
    print(f"総評価回数          : {grand:,}")
    print(f"総経過時間          : {(time.time()-t_all)/60:.1f} min")
    print()
    for tf in TIMEFRAMES:
        for pair in PAIRS:
            r = all_results.get((pair, tf), {})
            if r:
                surv_n = sum(1 for e in r.get('endurance', []) if e['positive_25y'])
                surv_d = len(r.get('endurance', []))
                print(f"  {pair:8s} {tf:4s}: neg={r['neg_pct']:.0f}%  "
                      f"best_exp={r['best_exp']:.3f}  survival={surv_n}/{surv_d}")

    # ── 画像生成 ─────────────────────────────────────────────────────────
    generate_images(all_results)

    elapsed = (time.time() - t_all) / 60
    print(f"\n✅ 完了: {elapsed:.1f}min  画像保存先: {OUT}", flush=True)


if __name__ == "__main__":
    # multiprocessing on Linux: spawn or fork
    # fork はデフォルトで動くが、大きいデータを持ち込まないよう注意
    mp.set_start_method('fork', force=True)
    main()
