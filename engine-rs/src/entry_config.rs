//! JSON の entries 設定をパースし、指標からエントリーマスクを構築。

use serde_json::Value;

use crate::indicators;

/// entries_config_json: [{"type":"rsi_threshold","period":14,"level":70,"event":"cross_up"}, ...]
/// logic_and: true で AND、false で OR。
/// 対応: rsi_threshold (period, level, event=cross_up|cross_down|above|below), ema_cross (fast, slow, cross=above|below|cross_up|cross_down)
pub fn build_entry_mask_from_config(
    close: &[f64],
    _high: &[f64],
    _low: &[f64],
    config_json: &str,
    logic_and: bool,
) -> Vec<u8> {
    let n = close.len();
    let mut mask = if logic_and {
        vec![1u8; n]
    } else {
        vec![0u8; n]
    };

    let arr: Vec<Value> = match serde_json::from_str(config_json) {
        Ok(a) => a,
        Err(_) => return vec![0; n],
    };
    if arr.is_empty() {
        return vec![0; n];
    }

    let mut rsi_period = 14u32;
    let mut ema_fast = 12u32;
    let mut ema_slow = 26u32;
    for cond in &arr {
        if let Some(o) = cond.as_object() {
            if o.get("type").and_then(|v| v.as_str()) == Some("rsi_threshold") {
                rsi_period = o.get("period").or(o.get("length")).and_then(|v| v.as_u64()).unwrap_or(14) as u32;
            }
            if o.get("type").and_then(|v| v.as_str()) == Some("ema_cross") {
                ema_fast = o.get("fast").and_then(|v| v.as_u64()).unwrap_or(12) as u32;
                ema_slow = o.get("slow").and_then(|v| v.as_u64()).unwrap_or(26) as u32;
            }
        }
    }

    let (rsi, ema_f, ema_s) = indicators::compute_indicators_parallel(close, rsi_period, ema_fast, ema_slow);

    for cond in arr {
        let cond = match cond.as_object() {
            Some(o) => o,
            None => continue,
        };
        let typ = cond.get("type").and_then(|v| v.as_str()).unwrap_or("");
        let cond_mask = match typ {
            "rsi_threshold" => mask_rsi_threshold(
                &rsi,
                cond.get("period").or(cond.get("length")).and_then(|v| v.as_u64()).unwrap_or(14) as u32,
                cond.get("level").and_then(|v| v.as_f64()).unwrap_or(50.0),
                cond.get("event").or(cond.get("mode")).and_then(|v| v.as_str()).unwrap_or("above"),
            ),
            "ema_cross" => mask_ema_cross(
                &ema_f,
                &ema_s,
                cond.get("fast").and_then(|v| v.as_u64()).unwrap_or(12) as u32,
                cond.get("slow").and_then(|v| v.as_u64()).unwrap_or(26) as u32,
                cond.get("cross").and_then(|v| v.as_str()).unwrap_or("above"),
            ),
            _ => continue,
        };
        if cond_mask.len() != n {
            continue;
        }
        if logic_and {
            for i in 0..n {
                mask[i] = if mask[i] != 0 && cond_mask[i] != 0 { 1 } else { 0 };
            }
        } else {
            for i in 0..n {
                if cond_mask[i] != 0 {
                    mask[i] = 1;
                }
            }
        }
    }

    // warmup: 先頭 5 バーはエントリーしない
    for i in 0..5.min(mask.len()) {
        mask[i] = 0;
    }
    mask
}

fn mask_rsi_threshold(rsi: &[f64], _period: u32, level: f64, event: &str) -> Vec<u8> {
    let n = rsi.len();
    let mut out = vec![0u8; n];
    let event = event.to_lowercase();
    for i in 1..n {
        let prev = rsi[i - 1];
        let curr = rsi[i];
        let cross_up = prev < level && curr >= level;
        let cross_down = prev > level && curr <= level;
        let above = curr > level;
        let below = curr < level;
        let hit = match event.as_str() {
            "cross_up" | "cross up" => cross_up,
            "cross_down" | "cross down" => cross_down,
            "above" | "gt" | ">" => above,
            "below" | "lt" | "<" => below,
            _ => above,
        };
        out[i] = if hit { 1 } else { 0 };
    }
    out
}

fn mask_ema_cross(ema_fast: &[f64], ema_slow: &[f64], _fast: u32, _slow: u32, cross: &str) -> Vec<u8> {
    let n = ema_fast.len().min(ema_slow.len());
    let mut out = vec![0u8; n];
    let cross = cross.to_lowercase();
    for i in 1..n {
        let f_prev = ema_fast[i - 1];
        let s_prev = ema_slow[i - 1];
        let f_curr = ema_fast[i];
        let s_curr = ema_slow[i];
        let above = f_curr > s_curr;
        let prev_above = f_prev > s_prev;
        let cross_up = !prev_above && above;
        let cross_down = prev_above && !above;
        let hit = match cross.as_str() {
            "cross_up" | "up" => cross_up,
            "cross_down" | "down" => cross_down,
            "above" | "gt" | ">" => above,
            "below" | "lt" | "<" => !above,
            _ => above,
        };
        out[i] = if hit { 1 } else { 0 };
    }
    out
}
