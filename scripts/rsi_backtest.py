"""
RSI brute-force backtest – EURUSD M15 (25y)
Precomputes outcome table for all bars × TP/SL combos once,
then each RSI config is just an array sum (fast per config).

Entry logic (mean-reversion):
  Long  : RSI crosses BELOW the oversold threshold  (enters oversold zone)
  Short : RSI crosses ABOVE the overbought threshold (enters overbought zone)
"""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import warnings
warnings.filterwarnings("ignore")

OUT     = "/home/tj/dev/delver/frontend/public/blog/rsi-backtest-25year-results"
PARQUET = "/home/tj/dev/delver/data/EURUSD_M15.parquet"
SPREAD  = 0.7   # pips
PIP     = 0.0001
MAX_H   = 600   # max look-ahead bars

# ── TP / SL grids ───────────────────────────────────────────────────────────
TP_VALS = list(range(5, 105, 5))   # 5,10,...,100  (20 values)
SL_VALS = list(range(5, 105, 5))
N_TP, N_SL = len(TP_VALS), len(SL_VALS)

# ── RSI parameter grids ─────────────────────────────────────────────────────
RSI_PERIODS  = list(range(5, 31))        # 5..30  (26 values)
OS_LEVELS    = list(range(20, 41))       # 20..40 (21 values) oversold
OB_LEVELS    = list(range(60, 81))       # 60..80 (21 values) overbought

MIN_TRADES = 200

# ── Load data ────────────────────────────────────────────────────────────────
print("Loading data...", flush=True)
df_all = pd.read_parquet(PARQUET).reset_index().rename(columns={"datetime": "date"})
df_all["date"] = pd.to_datetime(df_all["date"])
df_all = df_all.sort_values("date").reset_index(drop=True)

df5  = df_all[(df_all.date >= "2020-01-01") & (df_all.date < "2025-01-01")].reset_index(drop=True)
df25 = df_all[(df_all.date >= "2000-01-01") & (df_all.date < "2025-01-01")].reset_index(drop=True)
print(f"5y : {len(df5):,} bars,  25y : {len(df25):,} bars", flush=True)

def to_np(df):
    return df.close.values.astype(np.float64), df.high.values.astype(np.float64), df.low.values.astype(np.float64)

c5, h5, l5   = to_np(df5)
c25, h25, l25 = to_np(df25)

# ── RSI ──────────────────────────────────────────────────────────────────────
def calc_rsi(close, n):
    delta = np.diff(close)
    gain  = np.where(delta > 0,  delta, 0.0)
    loss  = np.where(delta < 0, -delta, 0.0)
    avg_g = np.zeros(len(close))
    avg_l = np.zeros(len(close))
    avg_g[n] = gain[:n].mean()
    avg_l[n] = loss[:n].mean()
    for i in range(n + 1, len(close)):
        avg_g[i] = (avg_g[i-1] * (n - 1) + gain[i-1]) / n
        avg_l[i] = (avg_l[i-1] * (n - 1) + loss[i-1]) / n
    rs  = np.where(avg_l == 0, np.inf, avg_g / avg_l)
    val = 100.0 - 100.0 / (1.0 + rs)
    val[:n] = 50.0   # neutral before warmup
    return val

def rsi_signal(close, period, os_lvl, ob_lvl):
    """Returns signal array: +1 long, -1 short, 0 flat."""
    r    = calc_rsi(close, period)
    prev = r[:-1]
    curr = r[1:]
    sig  = np.zeros(len(close), dtype=np.int8)
    # enter oversold (mean-reversion long)
    sig[1:][(prev >= os_lvl) & (curr < os_lvl)] =  1
    # enter overbought (mean-reversion short)
    sig[1:][(prev <= ob_lvl) & (curr > ob_lvl)] = -1
    return sig

# ── Precompute outcome table ─────────────────────────────────────────────────
def build_outcome_table(close, high, low):
    n     = len(close)
    tp_p  = np.array(TP_VALS) * PIP
    sl_p  = np.array(SL_VALS) * PIP
    cost  = SPREAD * PIP
    tp_arr = np.array(TP_VALS, np.float32)[:, None]
    sl_arr = np.array(SL_VALS, np.float32)[None, :]

    long_pnl  = np.zeros((n, N_TP, N_SL), dtype=np.float32)
    short_pnl = np.zeros((n, N_TP, N_SL), dtype=np.float32)

    for i in range(200, n - 1):
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

# ── Fast simulation per RSI config ───────────────────────────────────────────
def run_config(sig, lp, sp):
    lm = sig == 1
    sm = sig == -1
    total  = lp[lm].sum(0) + sp[sm].sum(0)   # (N_TP, N_SL)
    trades = (lp[lm] != 0).sum(0) + (sp[sm] != 0).sum(0)
    n_t    = trades.astype(np.float32)
    exp    = np.where(n_t > 0, total / n_t, 0.0)
    return exp.astype(np.float32), n_t.astype(np.float32)

# ── Basic RSI(14, OS=30, OB=70) quick check ─────────────────────────────────
print("\n[STEP 2] Basic RSI(14, 30, 70) single run...", flush=True)
sig_basic5 = rsi_signal(c5, 14, 30, 70)
exp_b, trades_b = run_config(sig_basic5, lp5, sp5)
# TP=20, SL=20 → index 3 (5,10,15,20 → index 3)
tp_idx, sl_idx = TP_VALS.index(20), SL_VALS.index(20)
basic_exp    = float(exp_b[tp_idx, sl_idx])
basic_trades = int(trades_b[tp_idx, sl_idx])
print(f"  RSI(14,30,70) TP20/SL20 → expectancy={basic_exp:.3f} pips, trades={basic_trades}", flush=True)

# ── Brute-force sweep ────────────────────────────────────────────────────────
print("\n[STEP 3] RSI parameter sweep...", flush=True)
records = []
done    = 0
total_configs = len(RSI_PERIODS) * len(OS_LEVELS) * len(OB_LEVELS)

for period in RSI_PERIODS:
    rsi_vals = calc_rsi(c5, period)
    prev_r   = rsi_vals[:-1]
    curr_r   = rsi_vals[1:]
    for os_lvl in OS_LEVELS:
        for ob_lvl in OB_LEVELS:
            if os_lvl >= ob_lvl:
                continue   # invalid (shouldn't happen with our grids)
            sig = np.zeros(len(c5), dtype=np.int8)
            sig[1:][(prev_r >= os_lvl) & (curr_r < os_lvl)] =  1
            sig[1:][(prev_r <= ob_lvl) & (curr_r > ob_lvl)] = -1

            exp_mat, trades_mat = run_config(sig, lp5, sp5)
            done += 1
            if done % 500 == 0:
                print(f"  {done}/{total_configs} RSI configs", flush=True)

            for ti, tp in enumerate(TP_VALS):
                for si, sl in enumerate(SL_VALS):
                    t = int(trades_mat[ti, si])
                    if t < 10:
                        continue
                    records.append({
                        "period": period,
                        "os":     os_lvl,
                        "ob":     ob_lvl,
                        "tp":     tp,
                        "sl":     sl,
                        "expectancy": float(exp_mat[ti, si]),
                        "trades":     t,
                    })

df_res = pd.DataFrame(records)
print(f"\n  Total valid records: {len(df_res):,}", flush=True)

# ── Basic RSI(14) 25y equity curve ──────────────────────────────────────────
print("\n[STEP 4] Basic RSI(14,30,70) 25y run...", flush=True)

def equity_curve_sim(close, high, low, sig_arr, tp_pips, sl_pips):
    tp_p, sl_p, cost = tp_pips * PIP, sl_pips * PIP, SPREAD * PIP
    pnls, in_trade, side, ep = [], False, 0, 0.0
    for i in range(200, len(close) - 1):
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

sig_basic25 = rsi_signal(c25, 14, 30, 70)
cum_basic   = equity_curve_sim(c25, h25, l25, sig_basic25, 20, 20)
print(f"  Basic RSI(14,30,70) 25y final PnL : {cum_basic[-1]:.0f} pips,  trades : {len(cum_basic)}", flush=True)

# ── Plot helpers ─────────────────────────────────────────────────────────────
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

# ── Image 1: Basic 25y equity curve ─────────────────────────────────────────
f, a = dark_fig(12, 5)
a.plot(cum_basic, color="#ef4444", lw=1.2)
a.axhline(0, color=GRID, lw=0.8, ls="--")
a.set_title("RSI(14, OS=30, OB=70) TP20/SL20 – EURUSD M15 25年間の損益推移",
            color="white", fontsize=13, pad=12)
a.set_xlabel("トレード数", color=TC)
a.set_ylabel("累積損益 (pips)", color=TC)
a.tick_params(colors=TC)
[s.set_edgecolor(GRID) for s in a.spines.values()]
save("rsi_basic_equity_curve.png")

# ── Image 2: Expectancy histogram ────────────────────────────────────────────
f, a = dark_fig(10, 5)
ev   = df_res.expectancy.values
bins = np.linspace(ev.min(), ev.max(), 80)
a.hist(ev[ev <  0], bins=bins[bins <  0], color="#ef4444", alpha=0.85, label="期待値マイナス")
a.hist(ev[ev >= 0], bins=bins[bins >= 0], color="#22c55e", alpha=0.85, label="期待値プラス")
a.axvline(0, color="white", lw=1.2, ls="--")
neg_pct = (ev < 0).sum() / len(ev) * 100
a.set_title(f"RSIパラメータ総当り – 期待値の分布 (マイナス: {neg_pct:.1f}%)",
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
a.set_title("RSI総当り – 期待値ヒートマップ (TP × SL)", color="white", fontsize=13, pad=12)
cb = plt.colorbar(im, ax=a)
cb.ax.tick_params(colors=TC)
cb.set_label("期待値 (pips)", color=TC)
save("expectancy_heatmap.png")

# ── Image 4: MaxDD heatmap (cumulative loss proxy) ────────────────────────────
df_neg   = df_res[df_res.expectancy < 0].copy()
df_neg["cum_loss"] = (-df_neg["expectancy"]) * df_neg["trades"]
pvt_dd   = df_neg.groupby(["tp", "sl"])["cum_loss"].mean().unstack("sl").fillna(0)

f, a = dark_fig(11, 8)
vals_dd = np.nan_to_num(pvt_dd.values)
im2  = a.imshow(vals_dd, aspect="auto", cmap="RdYlBu_r", origin="lower")
a.set_xticks(range(len(pvt_dd.columns)))
a.set_xticklabels(pvt_dd.columns, fontsize=7, color=TC, rotation=45)
a.set_yticks(range(len(pvt_dd.index)))
a.set_yticklabels(pvt_dd.index, fontsize=7, color=TC)
a.set_xlabel("損切り SL (pips)", color=TC, fontsize=11)
a.set_ylabel("利確 TP (pips)", color=TC, fontsize=11)
a.set_title("RSI総当り – 累積損失マップ (TP × SL)", color="white", fontsize=13, pad=12)
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
print(top[["period", "os", "ob", "tp", "sl", "expectancy", "trades", "score"]].to_string(), flush=True)

# ── Image 5: Candidates table ─────────────────────────────────────────────────
f, a = plt.subplots(figsize=(14, 4), facecolor=BG)
a.set_facecolor(BG)
a.axis("off")
cols = ["RSI期間", "売られ過ぎ", "買われ過ぎ", "TP", "SL", "期待値(pips)", "取引数", "スコア"]
rows = [
    [int(r.period), int(r.os), int(r.ob), int(r.tp), int(r.sl),
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
a.set_title("RSI 優秀条件 TOP10（5年間スコア順）",
            color="white", fontsize=13, pad=20, y=0.95)
save("EURUSD_rsi_candidates_table.png")

# ── Image 6: 25y endurance test ───────────────────────────────────────────────
print("\n[STEP 5] 25y endurance test...", flush=True)
f, a = dark_fig(13, 6)
COLORS = ["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6",
          "#06b6d4","#f97316","#84cc16","#e11d48","#0ea5e9"]
finals = []
for idx, row in top.iterrows():
    sig25 = rsi_signal(c25, int(row.period), int(row.os), int(row.ob))
    cum   = equity_curve_sim(c25, h25, l25, sig25, int(row.tp), int(row.sl))
    finals.append(cum[-1])
    a.plot(cum, color=COLORS[idx % len(COLORS)], lw=1.0, alpha=0.85,
           label=f"RSI{int(row.period)} OS{int(row.os)}/OB{int(row.ob)} TP{int(row.tp)}/SL{int(row.sl)}")
    print(f"  {idx+1}. RSI{int(row.period)} OS{int(row.os)}/OB{int(row.ob)} "
          f"TP{int(row.tp)}/SL{int(row.sl)} → {cum[-1]:.0f} pips", flush=True)

a.axhline(0, color=GRID, lw=1.0, ls="--")
a.set_title("RSI 優秀条件 TOP10 – EURUSD M15 25年間耐久テスト",
            color="white", fontsize=13, pad=12)
a.set_xlabel("トレード数", color=TC)
a.set_ylabel("累積損益 (pips)", color=TC)
a.tick_params(colors=TC)
a.legend(facecolor="#1f2937", edgecolor=GRID, labelcolor="white", fontsize=7, loc="lower left")
[s.set_edgecolor(GRID) for s in a.spines.values()]
save("EURUSD_rsi_25y_endurance.png")

# ── Summary stats for article ─────────────────────────────────────────────────
print("\n=== ARTICLE STATS ===", flush=True)
print(f"Total valid records   : {len(df_res):,}")
print(f"Negative expectancy   : {(df_res.expectancy<0).sum():,} ({(df_res.expectancy<0).mean()*100:.1f}%)")
print(f"Positive expectancy   : {(df_res.expectancy>=0).sum():,} ({(df_res.expectancy>=0).mean()*100:.1f}%)")
print(f"Basic RSI(14,30,70) 25y final PnL : {cum_basic[-1]:.0f} pips  /  {len(cum_basic)} trades")
print(f"25y endurance finals  : {[f'{v:.0f}' for v in finals]}")
print("\n✅ All done.", flush=True)
