"""
Moving Average Cross brute-force backtest – EURUSD M15 (25y)
Entry: EMA short crosses above EMA long → Long (Golden Cross)
       EMA short crosses below EMA long → Short (Death Cross)
Precomputes outcome table for all bars × TP/SL combos once.

Short EMA: 5..50  (46 values)
Long  EMA: 20..200 (181 values)
Constraint: short < long
TP/SL: 5,10,...,100 (20 values each)
Total EMA configs: sum of valid pairs = ~3,289
Total records: ~3,289 × 400 ≈ 1.3M
"""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

OUT     = "/home/tj/dev/delver/frontend/public/blog/moving-average-cross-backtest-25year-results"
PARQUET = "/home/tj/dev/delver/data/EURUSD_M15.parquet"
SPREAD  = 0.7    # pips
PIP     = 0.0001
MAX_H   = 600    # max look-ahead bars

# ── TP / SL grids ─────────────────────────────────────────────────────────────
TP_VALS = list(range(5, 105, 5))   # 5,10,...,100  (20 values)
SL_VALS = list(range(5, 105, 5))
N_TP, N_SL = len(TP_VALS), len(SL_VALS)

# ── EMA parameter grids ───────────────────────────────────────────────────────
SHORT_RANGE = list(range(5,  51))    # 5..50   (46 values)
LONG_RANGE  = list(range(20, 201))   # 20..200 (181 values)

MIN_TRADES = 200

# ── Load data ─────────────────────────────────────────────────────────────────
print("Loading data...", flush=True)
df_all = pd.read_parquet(PARQUET).reset_index().rename(columns={"datetime": "date"})
df_all["date"] = pd.to_datetime(df_all["date"])
df_all = df_all.sort_values("date").reset_index(drop=True)

df5  = df_all[(df_all.date >= "2020-01-01") & (df_all.date < "2025-01-01")].reset_index(drop=True)
df25 = df_all[(df_all.date >= "2000-01-01") & (df_all.date < "2025-01-01")].reset_index(drop=True)
print(f"5y : {len(df5):,} bars,  25y : {len(df25):,} bars", flush=True)

def to_np(df):
    return (df.close.values.astype(np.float64),
            df.high.values.astype(np.float64),
            df.low.values.astype(np.float64))

c5,  h5,  l5  = to_np(df5)
c25, h25, l25 = to_np(df25)

# count valid EMA pairs
valid_pairs = [(s, l) for s in SHORT_RANGE for l in LONG_RANGE if s < l]
print(f"Valid EMA pairs: {len(valid_pairs):,}", flush=True)

# ── EMA ───────────────────────────────────────────────────────────────────────
def ema(s: np.ndarray, n: int) -> np.ndarray:
    a = 2.0 / (n + 1)
    out = np.empty_like(s)
    out[0] = s[0]
    for i in range(1, len(s)):
        out[i] = a * s[i] + (1 - a) * out[i-1]
    return out

def ma_cross_signal(close: np.ndarray, short_n: int, long_n: int) -> np.ndarray:
    """
    +1: short EMA crosses above long EMA (Golden Cross → Long)
    -1: short EMA crosses below long EMA (Death Cross  → Short)
     0: no signal
    """
    es = ema(close, short_n)
    el = ema(close, long_n)
    diff_prev = es[:-1] - el[:-1]
    diff_curr = es[1:]  - el[1:]
    sig = np.zeros(len(close), dtype=np.int8)
    sig[1:][(diff_prev <= 0) & (diff_curr > 0)] =  1   # cross up
    sig[1:][(diff_prev >= 0) & (diff_curr < 0)] = -1   # cross down
    return sig

# ── Precompute outcome table ───────────────────────────────────────────────────
def build_outcome_table(close, high, low):
    n     = len(close)
    tp_p  = np.array(TP_VALS) * PIP
    sl_p  = np.array(SL_VALS) * PIP
    cost  = SPREAD * PIP
    tp_arr = np.array(TP_VALS, np.float32)[:, None]
    sl_arr = np.array(SL_VALS, np.float32)[None, :]

    long_pnl  = np.zeros((n, N_TP, N_SL), dtype=np.float32)
    short_pnl = np.zeros((n, N_TP, N_SL), dtype=np.float32)

    warmup = max(SHORT_RANGE) + max(LONG_RANGE) + 10  # safe warmup

    for i in range(warmup, n - 1):
        end = min(i + 1 + MAX_H, n)
        fh  = high[i+1:end]
        fl  = low[i+1:end]
        if len(fh) == 0:
            continue
        H = len(fh)

        # LONG
        ep  = close[i] + cost
        cg  = np.maximum.accumulate(fh - ep)
        cd  = np.maximum.accumulate(ep - fl)
        ftp = np.searchsorted(cg, tp_p)[:, None]
        fsl = np.searchsorted(cd, sl_p)[None, :]
        win = (ftp < H) & (ftp <= fsl)
        los = (fsl < H) & (fsl < ftp)
        long_pnl[i]  = (win * (tp_arr - SPREAD) - los * sl_arr).astype(np.float32)

        # SHORT
        ep  = close[i] - cost
        cg  = np.maximum.accumulate(ep - fl)
        cd  = np.maximum.accumulate(fh - ep)
        ftp = np.searchsorted(cg, tp_p)[:, None]
        fsl = np.searchsorted(cd, sl_p)[None, :]
        win = (ftp < H) & (ftp <= fsl)
        los = (fsl < H) & (fsl < ftp)
        short_pnl[i] = (win * (tp_arr - SPREAD) - los * sl_arr).astype(np.float32)

        if i % 10000 == 0:
            print(f"  Precompute {i}/{n}", flush=True)

    return long_pnl, short_pnl

print("\n[STEP 1] Precomputing 5y outcome table...", flush=True)
lp5, sp5 = build_outcome_table(c5, h5, l5)
print("  Done.", flush=True)

# ── Fast simulation per config ────────────────────────────────────────────────
def run_config(sig, lp, sp):
    lm = sig == 1
    sm = sig == -1
    total  = lp[lm].sum(0) + sp[sm].sum(0)
    trades = (lp[lm] != 0).sum(0) + (sp[sm] != 0).sum(0)
    n_t    = trades.astype(np.float32)
    exp    = np.where(n_t > 0, total / n_t, 0.0)
    return exp.astype(np.float32), n_t.astype(np.float32)

# ── Basic EMA(25,75) single run ───────────────────────────────────────────────
print("\n[STEP 2] Basic EMA(25,75) 5y run...", flush=True)
sig_basic5 = ma_cross_signal(c5, 25, 75)
exp_b, trades_b = run_config(sig_basic5, lp5, sp5)
tp_idx, sl_idx = TP_VALS.index(20), SL_VALS.index(20)
basic_exp    = float(exp_b[tp_idx, sl_idx])
basic_trades = int(trades_b[tp_idx, sl_idx])
print(f"  EMA(25,75) TP20/SL20 → expectancy={basic_exp:.3f} pips, trades={basic_trades}", flush=True)

# ── Brute-force sweep ─────────────────────────────────────────────────────────
print("\n[STEP 3] MA cross parameter sweep...", flush=True)
records = []
done    = 0
total_configs = len(valid_pairs)

for short_n, long_n in valid_pairs:
    sig = ma_cross_signal(c5, short_n, long_n)
    exp_mat, trades_mat = run_config(sig, lp5, sp5)
    done += 1
    if done % 500 == 0:
        print(f"  {done}/{total_configs} EMA pairs", flush=True)

    for ti, tp in enumerate(TP_VALS):
        for si, sl in enumerate(SL_VALS):
            t = int(trades_mat[ti, si])
            if t < 10:
                continue
            records.append({
                "short_n":    short_n,
                "long_n":     long_n,
                "tp":         tp,
                "sl":         sl,
                "expectancy": float(exp_mat[ti, si]),
                "trades":     t,
            })

df_res = pd.DataFrame(records)
print(f"\n  Total valid records: {len(df_res):,}", flush=True)

# ── Basic EMA(25,75) 25y equity curve ─────────────────────────────────────────
print("\n[STEP 4] Basic EMA(25,75) 25y run...", flush=True)

def equity_curve_sim(close, high, low, sig_arr, tp_pips, sl_pips):
    tp_p, sl_p, cost = tp_pips * PIP, sl_pips * PIP, SPREAD * PIP
    pnls, in_trade, side, ep = [], False, 0, 0.0
    warmup = 210
    for i in range(warmup, len(close) - 1):
        if not in_trade:
            if sig_arr[i] != 0:
                side = sig_arr[i]
                ep   = close[i] + (cost if side == 1 else -cost)
                in_trade = True
        else:
            j = i + 1
            if side == 1:
                if   low[j]  <= ep - sl_p: pnls.append(-sl_pips); in_trade = False
                elif high[j] >= ep + tp_p: pnls.append(tp_pips - SPREAD); in_trade = False
            else:
                if   high[j] >= ep + sl_p: pnls.append(-sl_pips); in_trade = False
                elif low[j]  <= ep - tp_p: pnls.append(tp_pips - SPREAD); in_trade = False
    return np.cumsum(pnls) if pnls else np.array([0.0])

sig_basic25 = ma_cross_signal(c25, 25, 75)
cum_basic   = equity_curve_sim(c25, h25, l25, sig_basic25, 20, 20)
print(f"  Basic EMA(25,75) 25y final PnL: {cum_basic[-1]:.0f} pips,  trades: {len(cum_basic)}", flush=True)

# ── Plot helpers ──────────────────────────────────────────────────────────────
BG   = "#0f1117"
GRID = "#374151"
TC   = "#9ca3af"

def dark_fig(w, h):
    f, a = plt.subplots(figsize=(w, h), facecolor=BG)
    a.set_facecolor(BG)
    return f, a

def save(name):
    plt.tight_layout()
    plt.savefig(f"{OUT}/{name}", dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {name}", flush=True)

# ── Image 1: Basic 25y equity curve ──────────────────────────────────────────
f, a = dark_fig(12, 5)
a.plot(cum_basic, color="#ef4444", lw=1.2)
a.axhline(0, color=GRID, lw=0.8, ls="--")
a.set_title("EMA Golden Cross (25/75) TP20/SL20 – EURUSD M15 25年間の損益推移",
            color="white", fontsize=13, pad=12)
a.set_xlabel("トレード数", color=TC)
a.set_ylabel("累積損益 (pips)", color=TC)
a.tick_params(colors=TC)
[s.set_edgecolor(GRID) for s in a.spines.values()]
save("ma_cross_basic_equity_curve.png")

# ── Image 2: Expectancy histogram ─────────────────────────────────────────────
f, a = dark_fig(10, 5)
ev   = df_res.expectancy.values
bins = np.linspace(ev.min(), ev.max(), 80)
a.hist(ev[ev <  0], bins=bins[bins <  0], color="#ef4444", alpha=0.85, label="期待値マイナス")
a.hist(ev[ev >= 0], bins=bins[bins >= 0], color="#22c55e", alpha=0.85, label="期待値プラス")
a.axvline(0, color="white", lw=1.2, ls="--")
neg_pct = (ev < 0).sum() / len(ev) * 100
a.set_title(f"MAクロスパラメータ総当り – 期待値の分布 (マイナス: {neg_pct:.1f}%)",
            color="white", fontsize=13, pad=12)
a.set_xlabel("期待値 (pips/トレード)", color=TC)
a.set_ylabel("条件数", color=TC)
a.tick_params(colors=TC)
a.legend(facecolor="#1f2937", edgecolor=GRID, labelcolor="white")
[s.set_edgecolor(GRID) for s in a.spines.values()]
print(f"\n  Negative: {(ev<0).sum():,} ({neg_pct:.1f}%),  Positive: {(ev>=0).sum():,} ({100-neg_pct:.1f}%)", flush=True)
save("expectancy_distribution.png")

# ── Image 3: Expectancy heatmap (TP × SL) ────────────────────────────────────
pvt_e = df_res.groupby(["tp", "sl"])["expectancy"].mean().unstack("sl")
f, a  = dark_fig(11, 8)
vmax  = max(abs(pvt_e.values.min()), abs(pvt_e.values.max()))
im    = a.imshow(pvt_e.values, aspect="auto", cmap="RdYlGn",
                 vmin=-vmax, vmax=vmax, origin="lower")
a.set_xticks(range(len(pvt_e.columns)))
a.set_xticklabels(pvt_e.columns, fontsize=7, color=TC, rotation=45)
a.set_yticks(range(len(pvt_e.index)))
a.set_yticklabels(pvt_e.index, fontsize=7, color=TC)
a.set_xlabel("損切り SL (pips)", color=TC, fontsize=11)
a.set_ylabel("利確 TP (pips)", color=TC, fontsize=11)
a.set_title("MAクロス総当り – 期待値ヒートマップ (TP × SL)", color="white", fontsize=13, pad=12)
cb = plt.colorbar(im, ax=a)
cb.ax.tick_params(colors=TC)
cb.set_label("期待値 (pips)", color=TC)
save("expectancy_heatmap.png")

# ── Image 4: MaxDD heatmap ────────────────────────────────────────────────────
df_neg    = df_res[df_res.expectancy < 0].copy()
df_neg["cum_loss"] = (-df_neg["expectancy"]) * df_neg["trades"]
pvt_dd    = df_neg.groupby(["tp", "sl"])["cum_loss"].mean().unstack("sl").fillna(0)

f, a = dark_fig(11, 8)
vals_dd = np.nan_to_num(pvt_dd.values)
im2  = a.imshow(vals_dd, aspect="auto", cmap="RdYlBu_r", origin="lower")
a.set_xticks(range(len(pvt_dd.columns)))
a.set_xticklabels(pvt_dd.columns, fontsize=7, color=TC, rotation=45)
a.set_yticks(range(len(pvt_dd.index)))
a.set_yticklabels(pvt_dd.index, fontsize=7, color=TC)
a.set_xlabel("損切り SL (pips)", color=TC, fontsize=11)
a.set_ylabel("利確 TP (pips)", color=TC, fontsize=11)
a.set_title("MAクロス総当り – 累積損失マップ (TP × SL)", color="white", fontsize=13, pad=12)
cb2 = plt.colorbar(im2, ax=a)
cb2.ax.tick_params(colors=TC)
cb2.set_label("累積損失 (pips推定)", color=TC)
save("maxdd_heatmap.png")

# ── Top candidates ────────────────────────────────────────────────────────────
df_pos = df_res[(df_res.trades >= MIN_TRADES) & (df_res.expectancy > 0)].copy()
if len(df_pos) < 5:
    df_pos = df_res[df_res.trades >= MIN_TRADES].nlargest(20, "expectancy").copy()

df_pos["score"] = df_pos["expectancy"] - 0.30 * (df_pos["sl"] / df_pos["trades"])
top = df_pos.nlargest(10, "score").reset_index(drop=True)
print("\nTop candidates:", flush=True)
print(top[["short_n", "long_n", "tp", "sl", "expectancy", "trades", "score"]].to_string(), flush=True)

# ── Image 5: Candidates table ─────────────────────────────────────────────────
f, a = plt.subplots(figsize=(13, 4), facecolor=BG)
a.set_facecolor(BG)
a.axis("off")
cols = ["短期EMA", "長期EMA", "TP", "SL", "期待値(pips)", "取引数", "スコア"]
rows = [
    [int(r.short_n), int(r.long_n), int(r.tp), int(r.sl),
     f"{r.expectancy:.3f}", int(r.trades), f"{r.score:.3f}"]
    for _, r in top.iterrows()
]
tbl = a.table(cellText=rows, colLabels=cols, loc="center", cellLoc="center")
tbl.auto_set_font_size(False)
tbl.set_fontsize(10)
for (row, col), cell in tbl.get_celld().items():
    cell.set_facecolor("#1d4ed8" if row == 0 else ("#1f2937" if row % 2 == 0 else "#111827"))
    cell.set_text_props(color="white", fontweight="bold" if row == 0 else "normal")
    cell.set_edgecolor(GRID)
tbl.scale(1, 1.6)
a.set_title("MAクロス 優秀条件 TOP10（5年間スコア順）",
            color="white", fontsize=13, pad=20, y=0.95)
save("EURUSD_ma_cross_candidates_table.png")

# ── Image 6: 25y endurance test ───────────────────────────────────────────────
print("\n[STEP 5] 25y endurance test...", flush=True)
f, a = dark_fig(13, 6)
COLORS = ["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6",
          "#06b6d4","#f97316","#84cc16","#e11d48","#0ea5e9"]
finals = []
for idx, row in top.iterrows():
    sig25 = ma_cross_signal(c25, int(row.short_n), int(row.long_n))
    cum   = equity_curve_sim(c25, h25, l25, sig25, int(row.tp), int(row.sl))
    finals.append(cum[-1])
    a.plot(cum, color=COLORS[idx % len(COLORS)], lw=1.0, alpha=0.85,
           label=f"EMA{int(row.short_n)}/{int(row.long_n)} TP{int(row.tp)}/SL{int(row.sl)}")
    print(f"  {idx+1}. EMA{int(row.short_n)}/{int(row.long_n)} "
          f"TP{int(row.tp)}/SL{int(row.sl)} → {cum[-1]:.0f} pips", flush=True)

a.axhline(0, color=GRID, lw=1.0, ls="--")
a.set_title("MAクロス 優秀条件 TOP10 – EURUSD M15 25年間耐久テスト",
            color="white", fontsize=13, pad=12)
a.set_xlabel("トレード数", color=TC)
a.set_ylabel("累積損益 (pips)", color=TC)
a.tick_params(colors=TC)
a.legend(facecolor="#1f2937", edgecolor=GRID, labelcolor="white", fontsize=7, loc="lower left")
[s.set_edgecolor(GRID) for s in a.spines.values()]
save("EURUSD_ma_cross_25y_endurance.png")

# ── Summary stats ──────────────────────────────────────────────────────────────
print("\n=== ARTICLE STATS ===", flush=True)
print(f"Total valid records   : {len(df_res):,}")
print(f"Negative expectancy   : {(df_res.expectancy<0).sum():,} ({(df_res.expectancy<0).mean()*100:.1f}%)")
print(f"Positive expectancy   : {(df_res.expectancy>=0).sum():,} ({(df_res.expectancy>=0).mean()*100:.1f}%)")
print(f"Basic EMA(25,75) 25y PnL : {cum_basic[-1]:.0f} pips  /  {len(cum_basic)} trades")
print(f"25y endurance finals  : {[f'{v:.0f}' for v in finals]}")
print("\n✅ All done.", flush=True)
