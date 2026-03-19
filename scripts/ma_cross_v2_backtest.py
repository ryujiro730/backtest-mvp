"""
MA Cross v2 – 9 pairs × 4 timeframes × ~23,655 EMA configs × 1,600 TP/SL
= ~3.4 billion total evaluations

Method:
  1. Precompute per-bar "first-hit-time" matrices (uint16, memory-efficient)
  2. Cache all unique EMA arrays once per (pair, tf)
  3. Vectorised EMA sweep → expectancy (N_TP × N_SL) per config
  4. 25y endurance for top candidates via fast forward-scan equity curve
"""
import os, sys, time, pickle
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import warnings
warnings.filterwarnings("ignore")

# ── Output / Data paths ──────────────────────────────────────────────────────
OUT   = "/home/tj/dev/delver/frontend/public/blog/moving-average-cross-backtest-25year-results/v2"
DATA  = "/home/tj/dev/delver/data"
CACHE = "/home/tj/dev/delver/scripts/ma_v2_cache.pkl"

# ── Pairs / timeframes ───────────────────────────────────────────────────────
PAIRS = ['EURUSD','USDJPY','AUDUSD','EURGBP','EURJPY','GBPJPY','NZDUSD','USDCAD','XAUUSD']
TIMEFRAMES = ['H1','M15','M5','M1']   # M1 processed last

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

# ── Parameter grids ───────────────────────────────────────────────────────────
TP_VALS = list(range(5, 205, 5))   # 40 values
SL_VALS = list(range(5, 205, 5))
N_LEVELS = 40
SHORT_RANGE = list(range(5, 101))  # 96 values
LONG_RANGE  = list(range(20, 301)) # 281 values
VALID_PAIRS = [(s, l) for s in SHORT_RANGE for l in LONG_RANGE if s < l]
# 23,655 valid EMA pairs

MIN_TRADES = 100   # minimum trades for 5y grid search
TOP_K      = 20    # keep top-K candidates per (pair, tf)

# ── Plot style ────────────────────────────────────────────────────────────────
BG   = "#0f1117"
GRID = "#374151"
TC   = "#9ca3af"
COLORS = ["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6",
          "#06b6d4","#f97316","#84cc16","#e11d48","#0ea5e9"]

def dark_fig(w, h):
    f, a = plt.subplots(figsize=(w, h), facecolor=BG)
    a.set_facecolor(BG)
    return f, a

def save(name):
    plt.tight_layout()
    plt.savefig(f"{OUT}/{name}", dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {name}", flush=True)

# ── Core: EMA ─────────────────────────────────────────────────────────────────
def compute_ema(s: np.ndarray, n: int) -> np.ndarray:
    a = 2.0 / (n + 1)
    out = np.empty(len(s), dtype=np.float32)
    out[0] = s[0]
    for i in range(1, len(s)):
        out[i] = a * s[i] + (1 - a) * out[i-1]
    return out

def build_ema_cache(close: np.ndarray, periods: list) -> dict:
    return {p: compute_ema(close, p) for p in periods}

def ma_cross_signal_from_cache(cache, short_n, long_n, n):
    diff = cache[short_n] - cache[long_n]
    prev, curr = diff[:-1], diff[1:]
    sig = np.zeros(n, dtype=np.int8)
    sig[1:][(prev <= 0) & (curr > 0)] =  1
    sig[1:][(prev >= 0) & (curr < 0)] = -1
    return sig

# ── Core: Hit-time matrix ─────────────────────────────────────────────────────
def build_hit_time_matrices(close, high, low, pip_size, spread_pips, max_h):
    """
    Returns 4 uint16 arrays of shape (n, N_LEVELS):
      long_gain_t, long_loss_t, short_gain_t, short_loss_t
    value = first bar offset where price crosses level; max_h means "not hit"
    """
    n = len(close)
    levels = np.array(TP_VALS, dtype=np.float64) * pip_size  # same for TP and SL
    cost = spread_pips * pip_size

    long_gain_t  = np.full((n, N_LEVELS), max_h, dtype=np.uint16)
    long_loss_t  = np.full((n, N_LEVELS), max_h, dtype=np.uint16)
    short_gain_t = np.full((n, N_LEVELS), max_h, dtype=np.uint16)
    short_loss_t = np.full((n, N_LEVELS), max_h, dtype=np.uint16)

    warmup = max(SHORT_RANGE) + max(LONG_RANGE) + 10  # ~400

    for i in range(warmup, n - 1):
        end = min(i + 1 + max_h, n)
        H   = end - i - 1
        if H == 0:
            continue
        fh = high[i+1:end]
        fl = low[i+1:end]

        # LONG
        lep = close[i] + cost
        cg  = np.maximum.accumulate(fh - lep)
        cd  = np.maximum.accumulate(lep - fl)
        idg = np.searchsorted(cg, levels); idg[idg >= H] = max_h
        idl = np.searchsorted(cd, levels); idl[idl >= H] = max_h
        long_gain_t[i] = idg.astype(np.uint16)
        long_loss_t[i] = idl.astype(np.uint16)

        # SHORT
        sep = close[i] - cost
        cg2 = np.maximum.accumulate(sep - fl)
        cd2 = np.maximum.accumulate(fh - sep)
        igs = np.searchsorted(cg2, levels); igs[igs >= H] = max_h
        ils = np.searchsorted(cd2, levels); ils[ils >= H] = max_h
        short_gain_t[i] = igs.astype(np.uint16)
        short_loss_t[i] = ils.astype(np.uint16)

        if i % 200000 == 0 and i > 0:
            print(f"    hit-time {i}/{n}", flush=True)

    return long_gain_t, long_loss_t, short_gain_t, short_loss_t

# ── Core: Config evaluation ───────────────────────────────────────────────────
def run_config_hittimes(sig, lgt, llt, sgt, slt, spread_pips, max_h):
    """Returns (exp_mat, trades_mat) each (N_LEVELS, N_LEVELS)."""
    tp_arr = np.array(TP_VALS, dtype=np.float32)
    sl_arr = np.array(SL_VALS, dtype=np.float32)
    pnl    = np.zeros((N_LEVELS, N_LEVELS), dtype=np.float32)
    trades = np.zeros((N_LEVELS, N_LEVELS), dtype=np.int32)

    lm = np.where(sig == 1)[0]
    sm = np.where(sig == -1)[0]

    for entries, gain_t, loss_t, sign in [(lm, lgt, llt, 1), (sm, sgt, slt, -1)]:
        if len(entries) == 0:
            continue
        lg = gain_t[entries]   # (n_entries, N_LEVELS)
        ll = loss_t[entries]

        for ti in range(N_LEVELS):
            lt = lg[:, ti:ti+1]              # (n_entries, 1)
            wins = (lt < ll) & (lt < max_h) # (n_entries, N_LEVELS)
            loss = (ll < lt) & (ll < max_h)
            pnl[ti]    += wins.sum(0) * (tp_arr[ti] - spread_pips) - loss.sum(0) * sl_arr
            trades[ti] += (wins | loss).sum(0)

    t_f = trades.astype(np.float32)
    exp = np.where(t_f > 0, pnl / t_f, 0.0)
    return exp.astype(np.float32), trades

# ── Core: Equity curve ────────────────────────────────────────────────────────
def equity_curve(close, high, low, sig, tp_pips, sl_pips, pip_size, spread_pips, max_h):
    """Fast equity curve using forward scan (O(n_trades))."""
    n    = len(close)
    cost = spread_pips * pip_size
    tp_p = tp_pips * pip_size
    sl_p = sl_pips * pip_size

    entry_bars  = np.where(sig != 0)[0]
    entry_sides = sig[entry_bars]
    if len(entry_bars) == 0:
        return np.array([0.0])

    pnl_list    = []
    active_exit = -1

    for ebar, side in zip(entry_bars, entry_sides):
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

# ── Main processing loop ──────────────────────────────────────────────────────
all_results = {}   # (pair, tf) -> dict
unique_periods = sorted(set(SHORT_RANGE + LONG_RANGE))  # 296 periods

grand_total_configs = len(VALID_PAIRS) * N_LEVELS * N_LEVELS * len(PAIRS) * len(TIMEFRAMES)
print(f"=== MA Cross v2 Backtest ===", flush=True)
print(f"Valid EMA pairs   : {len(VALID_PAIRS):,}", flush=True)
print(f"TP/SL combos      : {N_LEVELS*N_LEVELS:,}", flush=True)
print(f"Pairs × timeframes: {len(PAIRS)} × {len(TIMEFRAMES)} = {len(PAIRS)*len(TIMEFRAMES)}", flush=True)
print(f"Total evaluations : {grand_total_configs:,.0f}", flush=True)
print(f"Started at: {time.strftime('%H:%M:%S')}", flush=True)

start_all = time.time()

# Load cache from disk if it exists (resume-capable)
if os.path.exists(CACHE):
    with open(CACHE, 'rb') as f:
        all_results = pickle.load(f)
    print(f"Resumed from cache: {len(all_results)} (pair,tf) already done", flush=True)

for tf in TIMEFRAMES:
    max_h = TF_MAX_H[tf]
    for pair in PAIRS:
        key = (pair, tf)
        if key in all_results:
            print(f"Skip {pair} {tf} (cached)", flush=True)
            continue

        cfg = PAIR_CFG[pair]
        pip_size    = cfg['pip']
        spread_pips = cfg['spread']

        print(f"\n{'='*60}", flush=True)
        print(f"[{pair} {tf}]  pip={pip_size}  spread={spread_pips}  max_h={max_h}", flush=True)
        parquet = f"{DATA}/{pair}_{tf}.parquet"
        if not os.path.exists(parquet):
            print(f"  SKIP – file not found: {parquet}", flush=True)
            continue

        t_pair = time.time()

        # ── Load data ──────────────────────────────────────────────────────
        df_all = pd.read_parquet(parquet).reset_index().rename(columns={'datetime':'date'})
        df_all['date'] = pd.to_datetime(df_all['date'])
        df_all = df_all.sort_values('date').reset_index(drop=True)

        df5  = df_all[(df_all.date >= '2020-01-01') & (df_all.date < '2025-01-01')].reset_index(drop=True)
        df25 = df_all[(df_all.date >= '2000-01-01') & (df_all.date < '2025-01-01')].reset_index(drop=True)

        c5,  h5,  l5  = df5.close.values,  df5.high.values,  df5.low.values
        c25, h25, l25 = df25.close.values, df25.high.values, df25.low.values
        n5, n25 = len(c5), len(c25)
        print(f"  5y: {n5:,} bars   25y: {n25:,} bars", flush=True)

        # ── Phase 1: EMA cache (5y) ────────────────────────────────────────
        t1 = time.time()
        print(f"  [1/4] Building EMA cache ({len(unique_periods)} periods)…", flush=True)
        ema5 = build_ema_cache(c5, unique_periods)
        print(f"        Done in {time.time()-t1:.1f}s", flush=True)

        # ── Phase 2: Hit-time matrices (5y) ───────────────────────────────
        t2 = time.time()
        print(f"  [2/4] Building hit-time matrices ({n5:,} bars)…", flush=True)
        lgt5, llt5, sgt5, slt5 = build_hit_time_matrices(c5, h5, l5, pip_size, spread_pips, max_h)
        print(f"        Done in {time.time()-t2:.1f}s", flush=True)

        # ── Phase 3: EMA config sweep ──────────────────────────────────────
        t3 = time.time()
        print(f"  [3/4] EMA sweep ({len(VALID_PAIRS):,} configs)…", flush=True)

        # Aggregation matrices (for heatmaps)
        pvt_exp_sum   = np.zeros((N_LEVELS, N_LEVELS), dtype=np.float64)
        pvt_exp_count = np.zeros((N_LEVELS, N_LEVELS), dtype=np.int64)
        pvt_dd_sum    = np.zeros((N_LEVELS, N_LEVELS), dtype=np.float64)
        pvt_dd_count  = np.zeros((N_LEVELS, N_LEVELS), dtype=np.int64)

        top_records = []  # list of dicts for top candidates

        for ci, (short_n, long_n) in enumerate(VALID_PAIRS):
            sig = ma_cross_signal_from_cache(ema5, short_n, long_n, n5)
            exp_mat, trades_mat = run_config_hittimes(sig, lgt5, llt5, sgt5, slt5,
                                                       spread_pips, max_h)
            # Accumulate for heatmaps
            pvt_exp_sum   += exp_mat
            pvt_exp_count += 1
            neg_mask = exp_mat < 0
            pvt_dd_sum[neg_mask]   += (-exp_mat[neg_mask]) * trades_mat[neg_mask]
            pvt_dd_count[neg_mask] += 1

            # Collect per-cell records that pass MIN_TRADES filter
            mask = trades_mat >= MIN_TRADES
            if mask.any():
                ti_arr, si_arr = np.where(mask)
                for ti, si in zip(ti_arr, si_arr):
                    top_records.append({
                        'short': short_n, 'long': long_n,
                        'tp': TP_VALS[ti], 'sl': SL_VALS[si],
                        'exp': float(exp_mat[ti, si]),
                        'trades': int(trades_mat[ti, si]),
                    })

            if ci % 3000 == 0 and ci > 0:
                elapsed = time.time() - t3
                eta = elapsed / ci * (len(VALID_PAIRS) - ci)
                print(f"        {ci}/{len(VALID_PAIRS)} configs, ETA {eta/60:.1f} min", flush=True)

        print(f"        Sweep done in {time.time()-t3:.1f}s, {len(top_records):,} valid records", flush=True)

        # ── Phase 4: Top candidates + 25y endurance ────────────────────────
        t4 = time.time()
        print(f"  [4/4] Top candidates + 25y endurance…", flush=True)

        df_rec = pd.DataFrame(top_records)
        neg_pct = 0.0; pos_pct = 0.0
        if len(df_rec) > 0:
            neg_pct = (df_rec.exp < 0).mean() * 100
            pos_pct = 100 - neg_pct
            # Score: expectancy penalised by SL/trades
            df_rec['score'] = df_rec['exp'] - 0.30 * (df_rec['sl'] / df_rec['trades'])
            df_rec = df_rec[df_rec.exp > 0].copy() if (df_rec.exp > 0).sum() >= 5 \
                     else df_rec.nlargest(TOP_K, 'score').copy()
            top_df = df_rec.nlargest(TOP_K, 'score').reset_index(drop=True)
        else:
            top_df = pd.DataFrame()

        print(f"        Neg: {neg_pct:.1f}%  Pos: {pos_pct:.1f}%", flush=True)

        # Prepare 25y EMA cache (only needed periods)
        needed_periods = set()
        if len(top_df) > 0:
            needed_periods = set(top_df['short'].tolist() + top_df['long'].tolist())
        ema25 = build_ema_cache(c25, sorted(needed_periods)) if needed_periods else {}

        # 25y endurance for each top candidate
        endurance_results = []
        for _, row in top_df.iterrows():
            short_n = int(row['short']); long_n = int(row['long'])
            tp_p    = int(row['tp']);    sl_p   = int(row['sl'])
            if short_n not in ema25 or long_n not in ema25:
                continue
            sig25 = ma_cross_signal_from_cache(ema25, short_n, long_n, n25)
            cum   = equity_curve(c25, h25, l25, sig25, tp_p, sl_p,
                                 pip_size, spread_pips, max_h)
            endurance_results.append({
                'short': short_n, 'long': long_n, 'tp': tp_p, 'sl': sl_p,
                'exp': row['exp'], 'trades': int(row['trades']),
                'pnl_25y': float(cum[-1]),
                'curve_25y': cum,
                'positive_25y': bool(cum[-1] > 0),
            })

        survival_rate = sum(r['positive_25y'] for r in endurance_results) / max(len(endurance_results), 1)
        best_exp      = float(top_df['exp'].max()) if len(top_df) > 0 else 0.0
        print(f"        25y survival: {survival_rate*100:.0f}%  best_exp: {best_exp:.3f}", flush=True)

        # Heatmap matrices
        pvt_exp = np.where(pvt_exp_count > 0,
                           pvt_exp_sum / pvt_exp_count, 0.0).astype(np.float32)
        pvt_dd  = np.where(pvt_dd_count > 0,
                           pvt_dd_sum  / pvt_dd_count,  0.0).astype(np.float32)

        # Store result
        all_results[key] = {
            'pair': pair, 'tf': tf,
            'neg_pct': neg_pct, 'pos_pct': pos_pct,
            'best_exp': best_exp,
            'survival_rate': survival_rate,
            'top_df': top_df,
            'endurance': endurance_results,
            'pvt_exp': pvt_exp,
            'pvt_dd':  pvt_dd,
        }

        # Save checkpoint
        with open(CACHE, 'wb') as f:
            pickle.dump(all_results, f)

        elapsed_pair = time.time() - t_pair
        print(f"  [{pair} {tf}] Total: {elapsed_pair/60:.1f} min", flush=True)

        # Free large arrays
        del lgt5, llt5, sgt5, slt5, ema5, ema25
        del c5, h5, l5, c25, h25, l25

print(f"\n{'='*60}")
print(f"All pair/tf combos done in {(time.time()-start_all)/60:.1f} min")

# ─────────────────────────────────────────────────────────────────────────────
# IMAGE GENERATION
# ─────────────────────────────────────────────────────────────────────────────

print("\n=== Generating images ===", flush=True)

# ── Helper: lookup result ─────────────────────────────────────────────────────
def get_result(pair, tf):
    return all_results.get((pair, tf), {})

# ── Identify top 3 pairs by average best_exp across all timeframes ─────────────
pair_score = {}
for pair in PAIRS:
    exps = [get_result(pair, tf).get('best_exp', 0) for tf in TIMEFRAMES]
    pair_score[pair] = np.mean(exps)
top3_pairs = sorted(pair_score, key=pair_score.get, reverse=True)[:3]
print(f"Top 3 pairs: {top3_pairs}", flush=True)

# ── Image 1: 9×4 Summary Heatmap (best expectancy per pair/tf) ────────────────
print("  Generating summary heatmap…", flush=True)
matrix = np.zeros((len(PAIRS), len(TIMEFRAMES)))
for pi, pair in enumerate(PAIRS):
    for ti, tf in enumerate(TIMEFRAMES):
        matrix[pi, ti] = get_result(pair, tf).get('best_exp', 0)

f, a = plt.subplots(figsize=(10, 8), facecolor=BG)
a.set_facecolor(BG)
vmax = max(abs(matrix.min()), abs(matrix.max()), 1)
im = a.imshow(matrix, aspect='auto', cmap='RdYlGn', vmin=-vmax, vmax=vmax)
a.set_xticks(range(len(TIMEFRAMES))); a.set_xticklabels(TIMEFRAMES, color=TC)
a.set_yticks(range(len(PAIRS)));     a.set_yticklabels(PAIRS, color=TC)
for pi in range(len(PAIRS)):
    for ti in range(len(TIMEFRAMES)):
        v = matrix[pi, ti]
        a.text(ti, pi, f"{v:.1f}", ha='center', va='center',
               color='white' if abs(v) < vmax * 0.7 else 'black', fontsize=8)
a.set_title("最良期待値ヒートマップ（全9通貨ペア × 4時間足）", color='white', fontsize=13, pad=12)
a.set_xlabel("時間足", color=TC); a.set_ylabel("通貨ペア", color=TC)
cb = plt.colorbar(im, ax=a); cb.ax.tick_params(colors=TC); cb.set_label("期待値 (pips/トレード)", color=TC)
save("summary_best_exp_heatmap.png")

# ── Image 2: Survival rate by pair ────────────────────────────────────────────
print("  Generating survival rate by pair…", flush=True)
pair_surv = {pair: np.mean([get_result(pair, tf).get('survival_rate', 0) for tf in TIMEFRAMES])
             for pair in PAIRS}
sorted_pairs = sorted(pair_surv, key=pair_surv.get, reverse=True)

f, a = dark_fig(10, 5)
bars = a.bar(sorted_pairs, [pair_surv[p]*100 for p in sorted_pairs],
             color=[COLORS[i % len(COLORS)] for i in range(len(PAIRS))])
a.axhline(50, color='white', lw=0.8, ls='--', alpha=0.5)
a.set_title("通貨ペア別 25年生存率（全4時間足の平均）", color='white', fontsize=13, pad=12)
a.set_xlabel("通貨ペア", color=TC); a.set_ylabel("25年プラス条件の割合 (%)", color=TC)
a.tick_params(colors=TC); [s.set_edgecolor(GRID) for s in a.spines.values()]
for bar, pair in zip(bars, sorted_pairs):
    a.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
           f"{pair_surv[pair]*100:.0f}%", ha='center', color='white', fontsize=8)
save("survival_by_pair.png")

# ── Image 3: Survival rate by timeframe ───────────────────────────────────────
print("  Generating survival rate by timeframe…", flush=True)
tf_surv = {tf: np.mean([get_result(pair, tf).get('survival_rate', 0) for pair in PAIRS])
           for tf in TIMEFRAMES}

f, a = dark_fig(8, 5)
tf_bars = a.bar(TIMEFRAMES, [tf_surv[tf]*100 for tf in TIMEFRAMES],
                color=COLORS[:4])
a.axhline(50, color='white', lw=0.8, ls='--', alpha=0.5)
a.set_title("時間足別 25年生存率（全9通貨ペアの平均）", color='white', fontsize=13, pad=12)
a.set_xlabel("時間足", color=TC); a.set_ylabel("25年プラス条件の割合 (%)", color=TC)
a.tick_params(colors=TC); [s.set_edgecolor(GRID) for s in a.spines.values()]
for bar, tf in zip(tf_bars, TIMEFRAMES):
    a.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
           f"{tf_surv[tf]*100:.0f}%", ha='center', color='white', fontsize=9)
save("survival_by_tf.png")

# ── Image 4: XAUUSD vs FX comparison ─────────────────────────────────────────
print("  Generating XAUUSD vs FX comparison…", flush=True)
fx_pairs = [p for p in PAIRS if p != 'XAUUSD']
fx_survival  = [np.mean([get_result(p, tf).get('survival_rate', 0) for tf in TIMEFRAMES]) for p in fx_pairs]
xau_survival = [get_result('XAUUSD', tf).get('survival_rate', 0) for tf in TIMEFRAMES]
fx_best_exp  = [np.mean([get_result(p, tf).get('best_exp', 0) for tf in TIMEFRAMES]) for p in fx_pairs]
xau_best_exp = [get_result('XAUUSD', tf).get('best_exp', 0) for tf in TIMEFRAMES]

f, axes = plt.subplots(1, 2, figsize=(14, 5), facecolor=BG)
for a in axes: a.set_facecolor(BG)

# Left: survival rate comparison
axes[0].bar(fx_pairs, [v*100 for v in fx_survival], color='#3b82f6', alpha=0.8, label='FX平均')
axes[0].bar(['XAUUSD'], [np.mean(xau_survival)*100], color='#f59e0b', label='XAUUSD平均')
axes[0].set_title("生存率：FX vs XAUUSD", color='white', fontsize=11)
axes[0].set_ylabel("25年生存率 (%)", color=TC)
axes[0].tick_params(colors=TC, axis='x', rotation=45)
axes[0].legend(facecolor='#1f2937', edgecolor=GRID, labelcolor='white')
[s.set_edgecolor(GRID) for s in axes[0].spines.values()]

# Right: best expectancy comparison
axes[1].bar(fx_pairs, fx_best_exp, color='#3b82f6', alpha=0.8, label='FX平均')
axes[1].bar(TIMEFRAMES, xau_best_exp, color='#f59e0b', label='XAUUSD (時間足別)')
axes[1].set_title("最良期待値：FX vs XAUUSD", color='white', fontsize=11)
axes[1].set_ylabel("最良期待値 (pips / USD/oz)", color=TC)
axes[1].tick_params(colors=TC, axis='x', rotation=45)
axes[1].legend(facecolor='#1f2937', edgecolor=GRID, labelcolor='white')
[s.set_edgecolor(GRID) for s in axes[1].spines.values()]

plt.suptitle("XAUUSDと為替ペアの比較", color='white', fontsize=13, y=1.02)
save("xauusd_vs_fx_comparison.png")

# ── Images 5-7: Top 3 pairs – detailed charts ─────────────────────────────────
for rank, pair in enumerate(top3_pairs, 1):
    cfg = PAIR_CFG[pair]
    unit = cfg['unit']
    print(f"  Generating detailed charts for {pair} (rank #{rank})…", flush=True)

    # Best timeframe for this pair
    best_tf = max(TIMEFRAMES, key=lambda tf: get_result(pair, tf).get('best_exp', 0))
    res = get_result(pair, best_tf)

    # Expectancy heatmap
    pvt_exp = res.get('pvt_exp', np.zeros((N_LEVELS, N_LEVELS)))
    f, a = dark_fig(11, 8)
    vmax = max(abs(pvt_exp.min()), abs(pvt_exp.max()), 0.01)
    im   = a.imshow(pvt_exp, aspect='auto', cmap='RdYlGn', vmin=-vmax, vmax=vmax, origin='lower')
    a.set_xticks(range(N_LEVELS)); a.set_xticklabels(SL_VALS, fontsize=6, color=TC, rotation=45)
    a.set_yticks(range(N_LEVELS)); a.set_yticklabels(TP_VALS, fontsize=6, color=TC)
    a.set_xlabel("損切り SL", color=TC); a.set_ylabel("利確 TP", color=TC)
    a.set_title(f"{pair} {best_tf} – 期待値ヒートマップ ({unit})", color='white', fontsize=13)
    cb = plt.colorbar(im, ax=a); cb.ax.tick_params(colors=TC); cb.set_label(f"期待値 ({unit})", color=TC)
    save(f"detail_{pair}_exp_heatmap.png")

    # DD heatmap
    pvt_dd = res.get('pvt_dd', np.zeros((N_LEVELS, N_LEVELS)))
    f, a = dark_fig(11, 8)
    vals_dd = np.nan_to_num(pvt_dd)
    im2 = a.imshow(vals_dd, aspect='auto', cmap='RdYlBu_r', origin='lower')
    a.set_xticks(range(N_LEVELS)); a.set_xticklabels(SL_VALS, fontsize=6, color=TC, rotation=45)
    a.set_yticks(range(N_LEVELS)); a.set_yticklabels(TP_VALS, fontsize=6, color=TC)
    a.set_xlabel("損切り SL", color=TC); a.set_ylabel("利確 TP", color=TC)
    a.set_title(f"{pair} {best_tf} – DDヒートマップ", color='white', fontsize=13)
    cb2 = plt.colorbar(im2, ax=a); cb2.ax.tick_params(colors=TC); cb2.set_label("累積損失推定", color=TC)
    save(f"detail_{pair}_dd_heatmap.png")

    # 25y endurance for this pair (best tf or combine)
    endurance = res.get('endurance', [])
    if endurance:
        f, a = dark_fig(13, 6)
        plotted = 0
        for idx, r in enumerate(endurance[:10]):
            curve = r['curve_25y']
            color = COLORS[idx % len(COLORS)]
            lbl   = f"EMA{r['short']}/{r['long']} TP{r['tp']}/SL{r['sl']} ({r['pnl_25y']:+.0f})"
            a.plot(curve, color=color, lw=1.0, alpha=0.85, label=lbl)
            plotted += 1
        a.axhline(0, color=GRID, lw=1.0, ls='--')
        a.set_title(f"{pair} {best_tf} – TOP10 優秀条件 25年耐久テスト", color='white', fontsize=13)
        a.set_xlabel("トレード数", color=TC); a.set_ylabel(f"累積損益 ({unit})", color=TC)
        a.tick_params(colors=TC)
        a.legend(facecolor='#1f2937', edgecolor=GRID, labelcolor='white', fontsize=6, loc='upper left')
        [s.set_edgecolor(GRID) for s in a.spines.values()]
        save(f"detail_{pair}_25y_endurance.png")

# ── Global summary stats ──────────────────────────────────────────────────────
print("\n=== ARTICLE STATS ===", flush=True)
total_evals = len(VALID_PAIRS) * N_LEVELS * N_LEVELS
print(f"Total EMA valid pairs   : {len(VALID_PAIRS):,}")
print(f"TP/SL combos per config : {N_LEVELS*N_LEVELS:,}")
print(f"Evaluations per (pair,tf): {total_evals:,}")
print(f"Total evaluations       : {total_evals * len(PAIRS) * len(TIMEFRAMES):,}")
print(f"Total elapsed           : {(time.time()-start_all)/60:.1f} min")
print()
print("Per (pair, tf) summary:")
for tf in TIMEFRAMES:
    for pair in PAIRS:
        r = get_result(pair, tf)
        if r:
            surv_n = sum(1 for e in r.get('endurance', []) if e['positive_25y'])
            surv_d = len(r.get('endurance', []))
            print(f"  {pair:8s} {tf:4s}: neg={r['neg_pct']:.0f}%  best_exp={r['best_exp']:.3f}  "
                  f"survival={surv_n}/{surv_d}  ({r['survival_rate']*100:.0f}%)")
print()
print(f"Top 3 pairs: {top3_pairs}")
print(f"\n✅ All done. Images in: {OUT}", flush=True)
