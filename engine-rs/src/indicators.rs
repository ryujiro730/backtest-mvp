//! テクニカル指標の計算（ta クレート使用）。Rayon で並列化可能。

use ta::indicators::{ExponentialMovingAverage, RelativeStrengthIndex};
use ta::Next;

/// close から RSI(period) を計算。先頭 (period+1) は NaN 扱いで 0.0 を詰める。
pub fn compute_rsi(close: &[f64], period: u32) -> Vec<f64> {
    let period = period.max(1) as usize;
    let mut out = vec![0.0; close.len()];
    let mut rsi = RelativeStrengthIndex::new(period).unwrap_or_default();
    for (i, &c) in close.iter().enumerate() {
        out[i] = rsi.next(c);
    }
    // warmup 区間は 0 のまま（エントリー条件で使わない）
    for i in 0..(period + 1).min(out.len()) {
        out[i] = 0.0;
    }
    out
}

/// close から EMA(period) を計算。
pub fn compute_ema(close: &[f64], period: u32) -> Vec<f64> {
    let period = period.max(1) as usize;
    let mut out = vec![0.0; close.len()];
    let mut ema = ExponentialMovingAverage::new(period).unwrap_or_default();
    for (i, &c) in close.iter().enumerate() {
        out[i] = ema.next(c);
    }
    out
}

/// 複数指標を並列計算（Rayon）。4コアなら4タスクに分けて並列実行。
/// 返り値は (rsi, ema_fast, ema_slow)。
pub fn compute_indicators_parallel(
    close: &[f64],
    rsi_period: u32,
    ema_fast: u32,
    ema_slow: u32,
) -> (Vec<f64>, Vec<f64>, Vec<f64>) {
    let n = close.len();
    let (rsi, (ema_f, (ema_s, _))) = rayon::join(
        || compute_rsi(close, rsi_period),
        || {
            rayon::join(
                || compute_ema(close, ema_fast),
                || {
                    rayon::join(
                        || compute_ema(close, ema_slow),
                        || vec![0.0; n], // 4本目: スレッドプールを埋めて4コア並列
                    )
                },
            )
        },
    );
    (rsi, ema_f, ema_s)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rsi_len() {
        let close: Vec<f64> = (0..100).map(|i| 100.0 + i as f64 * 0.1).collect();
        let r = compute_rsi(&close, 14);
        assert_eq!(r.len(), close.len());
    }

    #[test]
    fn test_ema_len() {
        let close: Vec<f64> = (0..100).map(|i| 100.0 + i as f64 * 0.1).collect();
        let e = compute_ema(&close, 12);
        assert_eq!(e.len(), close.len());
    }
}
