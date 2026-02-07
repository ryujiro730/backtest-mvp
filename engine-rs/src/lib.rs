//! Delver backtest engine core — callable from Python via PyO3.
//! バーループを Rust で実行し、M1 等の大量バーを高速化する。
//! PyArrayLike1 で numpy 配列または list を受け取り、.tolist() コピーを避ける。

use numpy::PyArrayLike1;
use pyo3::prelude::*;
use pyo3::types::PyList;

const CONTRACT_SIZE: f64 = 100_000.0;

fn array_like_to_f64_vec(arr: &PyArrayLike1<'_, f64>) -> PyResult<Vec<f64>> {
    let s = arr
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    Ok(s.to_vec())
}

fn array_like_to_u8_vec(arr: &PyArrayLike1<'_, u8>) -> PyResult<Vec<u8>> {
    let s = arr
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    Ok(s.to_vec())
}

#[derive(Clone)]
struct Position {
    entry_bar: usize,
    entry_px: f64,
    stop: Option<f64>,
    tp: Option<f64>,
    balance_at_entry: f64,
    position_notional: f64,
    long: bool,
}

/// 実バーループ: entry_mask でエントリー、SL/TP/反対シグナル/時間で決済。
/// open/high/low/close/entry_mask は numpy 1D 配列または list を渡す（numpy 推奨、コピー削減）。
#[pyfunction]
#[pyo3(signature = (
    open,
    high,
    low,
    close,
    entry_mask,
    entry_mask_opposite,
    direction_long,
    lot_size,
    pip_size,
    spread_pips,
    slippage_pips,
    sl_fixed_pips,
    tp_r_multiple,
    time_stop_bars,
    sl_time_stop_bars,
    tp_time_stop_bars,
    opposite_signal_exit,
    initial_balance,
    commission_round_trip_per_lot
))]
fn run_engine_core(
    py: Python<'_>,
    open: PyArrayLike1<'_, f64>,
    high: PyArrayLike1<'_, f64>,
    low: PyArrayLike1<'_, f64>,
    close: PyArrayLike1<'_, f64>,
    entry_mask: PyArrayLike1<'_, u8>,
    entry_mask_opposite: PyArrayLike1<'_, u8>,
    direction_long: bool,
    lot_size: f64,
    pip_size: f64,
    spread_pips: f64,
    slippage_pips: f64,
    sl_fixed_pips: Option<f64>,
    tp_r_multiple: Option<f64>,
    time_stop_bars: Option<u32>,
    sl_time_stop_bars: Option<u32>,
    tp_time_stop_bars: Option<u32>,
    opposite_signal_exit: bool,
    initial_balance: f64,
    commission_round_trip_per_lot: f64,
) -> PyResult<PyObject> {
    let open = array_like_to_f64_vec(&open)?;
    let high = array_like_to_f64_vec(&high)?;
    let low = array_like_to_f64_vec(&low)?;
    let close = array_like_to_f64_vec(&close)?;
    let entry_mask = array_like_to_u8_vec(&entry_mask)?;
    let entry_mask_opposite = array_like_to_u8_vec(&entry_mask_opposite)?;

    let n = open.len();
    if high.len() != n
        || low.len() != n
        || close.len() != n
        || entry_mask.len() != n
        || entry_mask_opposite.len() != n
    {
        return Err(pyo3::exceptions::PyValueError::new_err(
            "length mismatch: open/high/low/close/entry_mask/entry_mask_opposite",
        ));
    }

    let mut strat_ret = vec![0.0; n];
    let mut balance = initial_balance;
    let mut position: Option<Position> = None;
    let mut trades: Vec<(usize, usize, f64, f64, f64)> = Vec::new(); // entry_bar, exit_bar, pnl, entry_px, exit_px

    let cost_pips = (spread_pips + slippage_pips) * pip_size;

    for i in 1..n.saturating_sub(1) {
        let prev = entry_mask[i - 1];
        let curr = entry_mask[i];
        let hi = high[i];
        let lo = low[i];
        let next_open = open[i + 1];

        // === ENTRY ===
        if prev == 0 && curr == 1 && position.is_none() {
            let raw_entry = next_open;
            let entry_px = if direction_long {
                raw_entry + cost_pips
            } else {
                raw_entry - cost_pips
            };

            let (stop, r) = if let Some(sl_pips) = sl_fixed_pips {
                let width = sl_pips * pip_size;
                let sl = if direction_long {
                    entry_px - width
                } else {
                    entry_px + width
                };
                (Some(sl), width)
            } else {
                (None, 0.0)
            };

            let tp = if let Some(rr) = tp_r_multiple {
                if r > 0.0 {
                    let width = r * rr;
                    Some(if direction_long {
                        entry_px + width
                    } else {
                        entry_px - width
                    })
                } else {
                    None
                }
            } else {
                None
            };

            let position_notional = lot_size * CONTRACT_SIZE;
            position = Some(Position {
                entry_bar: i,
                entry_px,
                stop,
                tp,
                balance_at_entry: balance,
                position_notional,
                long: direction_long,
            });
            continue;
        }

        // === EXIT ===
        let pos = match &position {
            Some(p) => p.clone(),
            None => continue,
        };

        let slip_rate = (slippage_pips * pip_size) / pos.entry_px.max(1e-9);
        let close_px = if pos.long {
            next_open * (1.0 - slip_rate)
        } else {
            next_open * (1.0 + slip_rate)
        };

        let mut closed = false;

        // 反対シグナル
        if opposite_signal_exit && entry_mask_opposite[i] == 1 {
            closed = true;
        }

        // 時間ストップ (time_stop_bars / sl_time_stop_bars / tp_time_stop_bars)
        if !closed {
            let bars_held = i - pos.entry_bar;
            if time_stop_bars.map(|tsb| bars_held >= tsb as usize).unwrap_or(false)
                || sl_time_stop_bars.map(|s| bars_held >= s as usize).unwrap_or(false)
                || tp_time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false)
            {
                closed = true;
            }
        }

        // SL (intrabar)
        if !closed {
            if let Some(stop_px) = pos.stop {
                let hit = if pos.long {
                    lo <= stop_px
                } else {
                    hi >= stop_px
                };
                if hit {
                    closed = true;
                }
            }
        }

        // TP (intrabar)
        if !closed {
            if let Some(tp_px) = pos.tp {
                let hit = if pos.long {
                    hi >= tp_px
                } else {
                    lo <= tp_px
                };
                if hit {
                    closed = true;
                }
            }
        }

        if closed {
            let bars_held = i - pos.entry_bar;
            let time_stop_hit = time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false)
                || sl_time_stop_bars.map(|s| bars_held >= s as usize).unwrap_or(false)
                || tp_time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false);
            let exit_px = if opposite_signal_exit && entry_mask_opposite[i] == 1 {
                close_px
            } else if time_stop_hit {
                close_px
            } else if let Some(stop_px) = pos.stop {
                if (pos.long && lo <= stop_px) || (!pos.long && hi >= stop_px) {
                    if pos.long {
                        stop_px * (1.0 - slip_rate)
                    } else {
                        stop_px * (1.0 + slip_rate)
                    }
                } else if let Some(tp_px) = pos.tp {
                    if (pos.long && hi >= tp_px) || (!pos.long && lo <= tp_px) {
                        if pos.long {
                            tp_px * (1.0 - slip_rate)
                        } else {
                            tp_px * (1.0 + slip_rate)
                        }
                    } else {
                        close_px
                    }
                } else {
                    close_px
                }
            } else if let Some(tp_px) = pos.tp {
                if (pos.long && hi >= tp_px) || (!pos.long && lo <= tp_px) {
                    if pos.long {
                        tp_px * (1.0 - slip_rate)
                    } else {
                        tp_px * (1.0 + slip_rate)
                    }
                } else {
                    close_px
                }
            } else {
                close_px
            };

            let price_return = if pos.long {
                exit_px / pos.entry_px - 1.0
            } else {
                pos.entry_px / exit_px - 1.0
            };

            let lots = pos.position_notional / CONTRACT_SIZE;
            let commission_money = commission_round_trip_per_lot * lots;
            let pnl_money = price_return * pos.position_notional - commission_money;
            balance += pnl_money;
            let pnl_ratio = if pos.balance_at_entry > 0.0 {
                pnl_money / pos.balance_at_entry
            } else {
                0.0
            };

            strat_ret[i + 1] += pnl_ratio;
            trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, exit_px));
            position = None;
        }
    }

    // equity = (1 + strat_ret).cumprod()
    let mut equity = vec![1.0; n];
    for i in 1..n {
        equity[i] = equity[i - 1] * (1.0 + strat_ret[i]);
    }

    let equity_py = equity.into_py(py);
    let list = PyList::empty_bound(py);
    for (ei, ex, pnl, entry_px, exit_px) in trades {
        let t: Py<PyAny> = (ei as i64, ex as i64, pnl, entry_px, exit_px).into_py(py);
        list.append(t)?;
    }
    let out = (equity_py, list.into_py(py)).into_py(py);
    Ok(out)
}

#[pymodule]
fn engine_rs(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(run_engine_core, m)?)?;
    Ok(())
}
