"""
MACD brute-force backtest – EURUSD M15 (optimised version)
Precomputes outcome table for all bars × TP/SL combos once,
then each MACD config is just an array sum (microseconds per config).
"""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import warnings, sys
warnings.filterwarnings("ignore")

OUT     = "/home/tj/dev/delver/frontend/public/blog/macd-backtest-25year-results"
PARQUET = "/home/tj/dev/delver/data/EURUSD_M15.parquet"
SPREAD  = 0.7   # pips
PIP     = 0.0001
MAX_H   = 600   # max look-ahead bars

# ── TP / SL grids ──────────────────────────────────────────────────────────
TP_VALS = list(range(5, 105, 5))   # 5,10,...,100  (20 values)
SL_VALS = list(range(5, 105, 5))
N_TP, N_SL = len(TP_VALS), len(SL_VALS)

# ── Load data ──────────────────────────────────────────────────────────────
print("Loading data...", flush=True)
df_all = pd.read_parquet(PARQUET).reset_index().rename(columns={"datetime":"date"})
df_all["date"] = pd.to_datetime(df_all["date"])
df_all = df_all.sort_values("date").reset_index(drop=True)

df5  = df_all[(df_all.date >= "2020-01-01") & (df_all.date < "2025-01-01")].reset_index(drop=True)
df25 = df_all[(df_all.date >= "2000-01-01") & (df_all.date < "2025-01-01")].reset_index(drop=True)
print(f"5y: {len(df5)} bars, 25y: {len(df25)} bars", flush=True)

def to_np(df):
    return df.close.values, df.high.values, df.low.values

c5,h5,l5 = to_np(df5)
c25,h25,l25 = to_np(df25)

# ── EMA (numba-free vectorised) ────────────────────────────────────────────
def ema(s, n):
    a = 2./(n+1)
    out = np.empty_like(s)
    out[0] = s[0]
    for i in range(1,len(s)):
        out[i] = a*s[i] + (1-a)*out[i-1]
    return out

def macd_signal(close, fast, slow, sig):
    m = ema(close,fast) - ema(close,slow)
    s = ema(m, sig)
    prev,curr = m[:-1]-s[:-1], m[1:]-s[1:]
    arr = np.zeros(len(close), np.int8)
    arr[1:][(prev<=0)&(curr>0)]  =  1   # cross up  → long
    arr[1:][(prev>=0)&(curr<0)]  = -1   # cross down → short
    return arr

# ── Precompute outcome table ───────────────────────────────────────────────
# long_pnl[i]  / short_pnl[i]  shape (N_TP, N_SL)  in pips
# A zero entry means "neither TP nor SL hit within MAX_H bars"
def build_outcome_table(close, high, low):
    n = len(close)
    tp_p = np.array(TP_VALS)*PIP  # (N_TP,)
    sl_p = np.array(SL_VALS)*PIP  # (N_SL,)
    cost = SPREAD*PIP
    tp_arr = np.array(TP_VALS, np.float32)[:,None]  # (N_TP,1)
    sl_arr = np.array(SL_VALS, np.float32)[None,:]  # (1,N_SL)

    long_pnl  = np.zeros((n, N_TP, N_SL), dtype=np.float32)
    short_pnl = np.zeros((n, N_TP, N_SL), dtype=np.float32)

    for i in range(200, n-1):
        end = min(i+1+MAX_H, n)
        fh = high[i+1:end]; fl = low[i+1:end]
        if len(fh) == 0: continue
        H = len(fh)

        # --- LONG ---
        ep = close[i] + cost
        cg = np.maximum.accumulate(fh - ep)   # cummax of gains
        cd = np.maximum.accumulate(ep - fl)   # cummax of losses
        ftp = np.searchsorted(cg, tp_p)[:,None]   # (N_TP,1)
        fsl = np.searchsorted(cd, sl_p)[None,:]   # (1,N_SL)
        win = (ftp<H)&(ftp<=fsl); los = (fsl<H)&(fsl<ftp)
        long_pnl[i] = (win*(tp_arr-SPREAD) - los*sl_arr).astype(np.float32)

        # --- SHORT ---
        ep = close[i] - cost
        cg = np.maximum.accumulate(ep - fl)
        cd = np.maximum.accumulate(fh - ep)
        ftp = np.searchsorted(cg, tp_p)[:,None]
        fsl = np.searchsorted(cd, sl_p)[None,:]
        win = (ftp<H)&(ftp<=fsl); los = (fsl<H)&(fsl<ftp)
        short_pnl[i] = (win*(tp_arr-SPREAD) - los*sl_arr).astype(np.float32)

        if i % 10000 == 0:
            print(f"  Precompute {i}/{n}", flush=True)
    return long_pnl, short_pnl

print("\n[STEP 1] Precomputing 5y outcome table...", flush=True)
lp5, sp5 = build_outcome_table(c5,h5,l5)
print("  Done.", flush=True)

# ── Fast simulation for one MACD config ───────────────────────────────────
def run_config(sig, lp, sp):
    """Returns (N_TP×N_SL) total pnl, trade count, and max-dd arrays."""
    lm = sig==1; sm = sig==-1
    total = lp[lm].sum(0) + sp[sm].sum(0)   # (N_TP,N_SL)
    trades= ((lp[lm]!=0).sum(0) + (sp[sm]!=0).sum(0))
    wins  = ((lp[lm]>0).sum(0) + (sp[sm]>0).sum(0))
    n_trades = trades.astype(np.float32)
    exp = np.where(n_trades>0, total/n_trades, 0.)
    return exp.astype(np.float32), n_trades.astype(np.float32)

# ── Brute-force MACD parameter sweep ──────────────────────────────────────
FAST_RANGE   = range(5,21)
SLOW_RANGE   = range(20,51)
SIGNAL_RANGE = range(5,16)
MIN_TRADES = 200

print("\n[STEP 2] MACD parameter sweep...", flush=True)
records = []
done = 0
for fast in FAST_RANGE:
    for slow in SLOW_RANGE:
        if fast >= slow: continue
        for sig_n in SIGNAL_RANGE:
            sig = macd_signal(c5, fast, slow, sig_n)
            exp_mat, trades_mat = run_config(sig, lp5, sp5)
            done += 1
            if done % 200 == 0:
                print(f"  {done} MACD configs", flush=True)
            for ti,tp in enumerate(TP_VALS):
                for si,sl in enumerate(SL_VALS):
                    t = int(trades_mat[ti,si])
                    if t < 10: continue
                    records.append({
                        "fast":fast,"slow":slow,"signal":sig_n,
                        "tp":tp,"sl":sl,
                        "expectancy":float(exp_mat[ti,si]),
                        "trades":t,
                    })

df_res = pd.DataFrame(records)
print(f"\n  Total valid records: {len(df_res):,}", flush=True)

# ── Basic MACD(12,26,9) 25y equity curve ──────────────────────────────────
print("\n[STEP 3] Basic MACD(12,26,9) run...", flush=True)
def equity_curve_sim(close, high, low, sig_arr, tp_pips, sl_pips):
    tp_p, sl_p, cost = tp_pips*PIP, sl_pips*PIP, SPREAD*PIP
    pnls, in_trade, side, ep = [], False, 0, 0.
    for i in range(200, len(close)-1):
        if not in_trade:
            if sig_arr[i]!=0:
                side=sig_arr[i]; ep=close[i]+(cost if side==1 else -cost); in_trade=True
        else:
            j=i+1
            if side==1:
                if low[j]<=ep-sl_p: pnls.append(-sl_pips); in_trade=False
                elif high[j]>=ep+tp_p: pnls.append(tp_pips-SPREAD); in_trade=False
            else:
                if high[j]>=ep+sl_p: pnls.append(-sl_pips); in_trade=False
                elif low[j]<=ep-tp_p: pnls.append(tp_pips-SPREAD); in_trade=False
    return np.cumsum(pnls) if pnls else np.array([0.])

sig_basic25 = macd_signal(c25,12,26,9)
cum_basic   = equity_curve_sim(c25,h25,l25,sig_basic25,20,20)
print(f"  Basic 25y final PnL: {cum_basic[-1]:.0f} pips, trades: {len(cum_basic)}", flush=True)

# ── Plot helpers ──────────────────────────────────────────────────────────
BG="#0f1117"; GRID="#374151"; TC="#9ca3af"

def dark_fig(w,h):
    f,a=plt.subplots(figsize=(w,h),facecolor=BG); a.set_facecolor(BG); return f,a

def save(name): plt.tight_layout(); plt.savefig(f"{OUT}/{name}",dpi=150,bbox_inches="tight"); plt.close(); print(f"  Saved: {name}",flush=True)

# ── Image 1: Basic equity curve (25y) ─────────────────────────────────────
f,a=dark_fig(12,5)
a.plot(cum_basic,color="#ef4444",lw=1.2)
a.axhline(0,color=GRID,lw=0.8,ls="--")
a.set_title("MACD(12,26,9) TP20/SL20 – EURUSD M15 25年間の損益推移",color="white",fontsize=13,pad=12)
a.set_xlabel("トレード数",color=TC); a.set_ylabel("累積損益 (pips)",color=TC)
a.tick_params(colors=TC);  [s.set_edgecolor(GRID) for s in a.spines.values()]
save("macd_basic_equity_curve.png")

# ── Image 2: Expectancy histogram ─────────────────────────────────────────
f,a=dark_fig(10,5)
ev=df_res.expectancy.values
bins=np.linspace(ev.min(),ev.max(),80)
a.hist(ev[ev<0],bins=bins[bins<0],color="#ef4444",alpha=0.85,label="期待値マイナス")
a.hist(ev[ev>=0],bins=bins[bins>=0],color="#22c55e",alpha=0.85,label="期待値プラス")
a.axvline(0,color="white",lw=1.2,ls="--")
neg_pct=(ev<0).sum()/len(ev)*100
a.set_title(f"MACDパラメータ総当り – 期待値の分布 (マイナス: {neg_pct:.1f}%)",color="white",fontsize=13,pad=12)
a.set_xlabel("期待値 (pips/トレード)",color=TC); a.set_ylabel("条件数",color=TC)
a.tick_params(colors=TC); a.legend(facecolor="#1f2937",edgecolor=GRID,labelcolor="white")
[s.set_edgecolor(GRID) for s in a.spines.values()]
print(f"\n  Negative: {(ev<0).sum():,} ({neg_pct:.1f}%), Positive: {(ev>=0).sum():,} ({100-neg_pct:.1f}%)", flush=True)
save("expectancy_distribution.png")

# ── Image 3: Expectancy heatmap (TP × SL) ─────────────────────────────────
pvt_e=df_res.groupby(["tp","sl"])["expectancy"].mean().unstack("sl")
f,a=dark_fig(11,8)
vmax=max(abs(pvt_e.values.min()),abs(pvt_e.values.max()))
im=a.imshow(pvt_e.values,aspect="auto",cmap="RdYlGn",vmin=-vmax,vmax=vmax,origin="lower")
a.set_xticks(range(len(pvt_e.columns))); a.set_xticklabels(pvt_e.columns,fontsize=7,color=TC,rotation=45)
a.set_yticks(range(len(pvt_e.index)));   a.set_yticklabels(pvt_e.index,fontsize=7,color=TC)
a.set_xlabel("損切り SL (pips)",color=TC,fontsize=11); a.set_ylabel("利確 TP (pips)",color=TC,fontsize=11)
a.set_title("MACD総当り – 期待値ヒートマップ (TP × SL)",color="white",fontsize=13,pad=12)
cb=plt.colorbar(im,ax=a); cb.ax.tick_params(colors=TC); cb.set_label("期待値 (pips)",color=TC)
save("expectancy_heatmap.png")

# ── Image 4: MaxDD heatmap ─────────────────────────────────────────────────
# Proxy: average loss per config = -mean(negative expectancy) * trades
df_neg = df_res[df_res.expectancy < 0].copy()
df_neg["cum_loss"] = (-df_neg["expectancy"]) * df_neg["trades"]
pvt_dd2 = df_neg.groupby(["tp","sl"])["cum_loss"].mean().unstack("sl").fillna(0)

f,a=dark_fig(11,8)
vals_dd = pvt_dd2.values; vals_dd = np.nan_to_num(vals_dd)
im2=a.imshow(vals_dd,aspect="auto",cmap="RdYlBu_r",origin="lower")
a.set_xticks(range(len(pvt_dd2.columns))); a.set_xticklabels(pvt_dd2.columns,fontsize=7,color=TC,rotation=45)
a.set_yticks(range(len(pvt_dd2.index)));   a.set_yticklabels(pvt_dd2.index,fontsize=7,color=TC)
a.set_xlabel("損切り SL (pips)",color=TC,fontsize=11); a.set_ylabel("利確 TP (pips)",color=TC,fontsize=11)
a.set_title("MACD総当り – 累積損失マップ (TP × SL)",color="white",fontsize=13,pad=12)
cb2=plt.colorbar(im2,ax=a); cb2.ax.tick_params(colors=TC); cb2.set_label("累積損失 (pips推定)",color=TC)
save("maxdd_heatmap.png")

# ── Top candidates ─────────────────────────────────────────────────────────
df_pos = df_res[(df_res.trades>=MIN_TRADES)&(df_res.expectancy>0)].copy()
if len(df_pos)<5: df_pos = df_res[df_res.trades>=MIN_TRADES].nlargest(20,"expectancy").copy()
df_pos["score"] = df_pos["expectancy"] - 0.01*(df_pos["sl"]/df_pos["trades"]*10)
top = df_pos.nlargest(10,"score").reset_index(drop=True)
print("\nTop candidates:", flush=True)
print(top[["fast","slow","signal","tp","sl","expectancy","trades","score"]].to_string(), flush=True)

# ── Image 5: Candidates table ──────────────────────────────────────────────
f,a=plt.subplots(figsize=(13,4),facecolor=BG); a.set_facecolor(BG); a.axis("off")
cols=["fast","slow","signal","TP","SL","期待値(pips)","取引数","スコア"]
rows=[[int(r.fast),int(r.slow),int(r.signal),int(r.tp),int(r.sl),
       f"{r.expectancy:.3f}",int(r.trades),f"{r.score:.3f}"] for _,r in top.iterrows()]
tbl=a.table(cellText=rows,colLabels=cols,loc="center",cellLoc="center")
tbl.auto_set_font_size(False); tbl.set_fontsize(10)
for (row,col),cell in tbl.get_celld().items():
    cell.set_facecolor("#1d4ed8" if row==0 else ("#1f2937" if row%2==0 else "#111827"))
    cell.set_text_props(color="white",fontweight="bold" if row==0 else "normal")
    cell.set_edgecolor(GRID)
tbl.scale(1,1.6)
a.set_title("MACD 優秀条件 TOP10（5年間スコア順）",color="white",fontsize=13,pad=20,y=0.95)
save("EURUSD_macd_candidates_table.png")

# ── Image 6: 25y endurance ────────────────────────────────────────────────
print("\n[STEP 4] 25y endurance test...", flush=True)
f,a=dark_fig(13,6)
COLORS=["#3b82f6","#22c55e","#f59e0b","#ec4899","#8b5cf6","#06b6d4","#f97316","#84cc16","#e11d48","#0ea5e9"]
finals=[]
for idx,row in top.iterrows():
    sig25=macd_signal(c25,int(row.fast),int(row.slow),int(row.signal))
    cum=equity_curve_sim(c25,h25,l25,sig25,int(row.tp),int(row.sl))
    finals.append(cum[-1])
    a.plot(cum,color=COLORS[idx%len(COLORS)],lw=1.0,alpha=0.85,
           label=f"F{int(row.fast)}/S{int(row.slow)} TP{int(row.tp)}/SL{int(row.sl)}")
    print(f"  {idx+1}. F{int(row.fast)}/S{int(row.slow)}/Sig{int(row.signal)} TP{int(row.tp)}/SL{int(row.sl)} → {cum[-1]:.0f} pips", flush=True)
a.axhline(0,color=GRID,lw=1.,ls="--")
a.set_title("MACD 優秀条件 TOP10 – EURUSD M15 25年間耐久テスト",color="white",fontsize=13,pad=12)
a.set_xlabel("トレード数",color=TC); a.set_ylabel("累積損益 (pips)",color=TC)
a.tick_params(colors=TC); a.legend(facecolor="#1f2937",edgecolor=GRID,labelcolor="white",fontsize=7,loc="lower left")
[s.set_edgecolor(GRID) for s in a.spines.values()]
save("EURUSD_macd_25y_endurance.png")

# ── Summary for article ───────────────────────────────────────────────────
print("\n=== ARTICLE STATS ===", flush=True)
print(f"Total records: {len(df_res):,}")
print(f"Negative: {(df_res.expectancy<0).sum():,} ({(df_res.expectancy<0).mean()*100:.1f}%)")
print(f"Positive: {(df_res.expectancy>=0).sum():,} ({(df_res.expectancy>=0).mean()*100:.1f}%)")
print(f"Basic(12,26,9) 25y: {cum_basic[-1]:.0f} pips over {len(cum_basic)} trades")
print(f"25y endurance finals: {[f'{v:.0f}' for v in finals]}")
print("\n✅ All done.", flush=True)
