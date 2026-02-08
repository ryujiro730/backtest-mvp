//! Delver backtest engine core — callable from Python via PyO3.
//! - バーループは Rust で実行。OHLC は as_slice() でゼロコピー参照。
//! - run_engine_core: Python 側で計算した entry_mask を受け取る（従来 API・ゼロコピー化済み）。
//! - run_engine_core_native: entries 設定 JSON を渡し、Rust 側で指標計算・エントリー判定まで完結（ta クレート + Rayon 並列）。

mod entry_config;
mod indicators;

use numpy::PyArrayLike1;
use pyo3::prelude::*;
use pyo3::types::PyList;

const CONTRACT_SIZE: f64 = 100_000.0;

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

/// バーループ本体。OHLC と entry_mask はスライス参照でゼロコピー。
fn run_bar_loop(
    open: &[f64],
    high: &[f64],
    low: &[f64],
    entry_mask: &[u8],
    entry_mask_opposite: &[u8],
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
) -> (Vec<f64>, Vec<(usize, usize, f64, f64, f64)>) {
    let n = open.len();
    let mut strat_ret = vec![0.0; n];
    let mut balance = initial_balance;
    let mut position: Option<Position> = None;
    let mut trades: Vec<(usize, usize, f64, f64, f64)> = Vec::new();
    let cost_pips = (spread_pips + slippage_pips) * pip_size;

    for i in 1..n.saturating_sub(1) {
        let prev = entry_mask[i - 1];
        let curr = entry_mask[i];
        let hi = high[i];
        let lo = low[i];
        let next_open = open[i + 1];

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
        if opposite_signal_exit && entry_mask_opposite[i] == 1 {
            closed = true;
        }
        if !closed {
            let bars_held = i - pos.entry_bar;
            if time_stop_bars.map(|tsb| bars_held >= tsb as usize).unwrap_or(false)
                || sl_time_stop_bars.map(|s| bars_held >= s as usize).unwrap_or(false)
                || tp_time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false)
            {
                closed = true;
            }
        }
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

    let mut equity = vec![1.0; n];
    for i in 1..n {
        equity[i] = equity[i - 1] * (1.0 + strat_ret[i]);
    }
    (equity, trades)
}

/// direction=both 用: ロング・ショート両マスクを渡し、1本のバーループで両方向エントリー・反対シグナルで反転。ゼロコピー。
fn run_bar_loop_bidirectional(
    open: &[f64],
    high: &[f64],
    low: &[f64],
    em_long: &[u8],
    em_short: &[u8],
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
) -> (Vec<f64>, Vec<(usize, usize, f64, f64, f64)>) {
    let n = open.len();
    let mut strat_ret = vec![0.0; n];
    let mut balance = initial_balance;
    let mut position: Option<Position> = None;
    let mut trades: Vec<(usize, usize, f64, f64, f64)> = Vec::new();
    let cost_pips = (spread_pips + slippage_pips) * pip_size;

    for i in 1..n.saturating_sub(1) {
        let prev_long = em_long[i - 1];
        let curr_long = em_long[i];
        let prev_short = em_short[i - 1];
        let curr_short = em_short[i];
        let hi = high[i];
        let lo = low[i];
        let next_open = open[i + 1];

        if position.is_none() {
            if prev_long == 0 && curr_long == 1 {
                let entry_px = next_open + cost_pips;
                let (stop, r) = if let Some(sl_pips) = sl_fixed_pips {
                    let width = sl_pips * pip_size;
                    (Some(entry_px - width), width)
                } else {
                    (None, 0.0)
                };
                let tp = tp_r_multiple.and_then(|rr| if r > 0.0 { Some(entry_px + r * rr) } else { None });
                position = Some(Position {
                    entry_bar: i,
                    entry_px,
                    stop,
                    tp,
                    balance_at_entry: balance,
                    position_notional: lot_size * CONTRACT_SIZE,
                    long: true,
                });
                continue;
            }
            if prev_short == 0 && curr_short == 1 {
                let entry_px = next_open - cost_pips;
                let (stop, r) = if let Some(sl_pips) = sl_fixed_pips {
                    let width = sl_pips * pip_size;
                    (Some(entry_px + width), width)
                } else {
                    (None, 0.0)
                };
                let tp = tp_r_multiple.and_then(|rr| if r > 0.0 { Some(entry_px - r * rr) } else { None });
                position = Some(Position {
                    entry_bar: i,
                    entry_px,
                    stop,
                    tp,
                    balance_at_entry: balance,
                    position_notional: lot_size * CONTRACT_SIZE,
                    long: false,
                });
                continue;
            }
            continue;
        }

        let pos = position.as_ref().unwrap();
        let slip_rate = (slippage_pips * pip_size) / pos.entry_px.max(1e-9);
        let bars_held = i - pos.entry_bar;

        if pos.long {
            let mkt_px = next_open * (1.0 - slip_rate);
            if opposite_signal_exit && curr_short == 1 {
                let price_return = mkt_px / pos.entry_px - 1.0;
                let lots = pos.position_notional / CONTRACT_SIZE;
                let commission_money = commission_round_trip_per_lot * lots;
                let pnl_money = price_return * pos.position_notional - commission_money;
                balance += pnl_money;
                let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                strat_ret[i + 1] += pnl_ratio;
                trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, mkt_px));
                position = None;
                let entry_px = next_open - cost_pips;
                let (stop, r) = if let Some(sl_pips) = sl_fixed_pips {
                    let width = sl_pips * pip_size;
                    (Some(entry_px + width), width)
                } else {
                    (None, 0.0)
                };
                let tp = tp_r_multiple.and_then(|rr| if r > 0.0 { Some(entry_px - r * rr) } else { None });
                position = Some(Position {
                    entry_bar: i,
                    entry_px,
                    stop,
                    tp,
                    balance_at_entry: balance,
                    position_notional: lot_size * CONTRACT_SIZE,
                    long: false,
                });
                continue;
            }
            let time_stop_hit = time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false)
                || sl_time_stop_bars.map(|s| bars_held >= s as usize).unwrap_or(false)
                || tp_time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false);
            if time_stop_hit {
                let price_return = mkt_px / pos.entry_px - 1.0;
                let lots = pos.position_notional / CONTRACT_SIZE;
                let commission_money = commission_round_trip_per_lot * lots;
                let pnl_money = price_return * pos.position_notional - commission_money;
                balance += pnl_money;
                let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                strat_ret[i + 1] += pnl_ratio;
                trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, mkt_px));
                position = None;
                continue;
            }
            if let Some(stop_px) = pos.stop {
                if lo <= stop_px {
                    let exit_px = stop_px * (1.0 - slip_rate);
                    let price_return = exit_px / pos.entry_px - 1.0;
                    let lots = pos.position_notional / CONTRACT_SIZE;
                    let commission_money = commission_round_trip_per_lot * lots;
                    let pnl_money = price_return * pos.position_notional - commission_money;
                    balance += pnl_money;
                    let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                    strat_ret[i + 1] += pnl_ratio;
                    trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, exit_px));
                    position = None;
                    continue;
                }
            }
            if let Some(tp_px) = pos.tp {
                if hi >= tp_px {
                    let exit_px = tp_px * (1.0 - slip_rate);
                    let price_return = exit_px / pos.entry_px - 1.0;
                    let lots = pos.position_notional / CONTRACT_SIZE;
                    let commission_money = commission_round_trip_per_lot * lots;
                    let pnl_money = price_return * pos.position_notional - commission_money;
                    balance += pnl_money;
                    let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                    strat_ret[i + 1] += pnl_ratio;
                    trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, exit_px));
                    position = None;
                    continue;
                }
            }
        } else {
            let mkt_px = next_open * (1.0 + slip_rate);
            if opposite_signal_exit && curr_long == 1 {
                let price_return = pos.entry_px / mkt_px - 1.0;
                let lots = pos.position_notional / CONTRACT_SIZE;
                let commission_money = commission_round_trip_per_lot * lots;
                let pnl_money = price_return * pos.position_notional - commission_money;
                balance += pnl_money;
                let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                strat_ret[i + 1] += pnl_ratio;
                trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, mkt_px));
                position = None;
                let entry_px = next_open + cost_pips;
                let (stop, r) = if let Some(sl_pips) = sl_fixed_pips {
                    let width = sl_pips * pip_size;
                    (Some(entry_px - width), width)
                } else {
                    (None, 0.0)
                };
                let tp = tp_r_multiple.and_then(|rr| if r > 0.0 { Some(entry_px + r * rr) } else { None });
                position = Some(Position {
                    entry_bar: i,
                    entry_px,
                    stop,
                    tp,
                    balance_at_entry: balance,
                    position_notional: lot_size * CONTRACT_SIZE,
                    long: true,
                });
                continue;
            }
            let time_stop_hit = time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false)
                || sl_time_stop_bars.map(|s| bars_held >= s as usize).unwrap_or(false)
                || tp_time_stop_bars.map(|t| bars_held >= t as usize).unwrap_or(false);
            if time_stop_hit {
                let price_return = pos.entry_px / mkt_px - 1.0;
                let lots = pos.position_notional / CONTRACT_SIZE;
                let commission_money = commission_round_trip_per_lot * lots;
                let pnl_money = price_return * pos.position_notional - commission_money;
                balance += pnl_money;
                let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                strat_ret[i + 1] += pnl_ratio;
                trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, mkt_px));
                position = None;
                continue;
            }
            if let Some(stop_px) = pos.stop {
                if hi >= stop_px {
                    let exit_px = stop_px * (1.0 + slip_rate);
                    let price_return = pos.entry_px / exit_px - 1.0;
                    let lots = pos.position_notional / CONTRACT_SIZE;
                    let commission_money = commission_round_trip_per_lot * lots;
                    let pnl_money = price_return * pos.position_notional - commission_money;
                    balance += pnl_money;
                    let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                    strat_ret[i + 1] += pnl_ratio;
                    trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, exit_px));
                    position = None;
                    continue;
                }
            }
            if let Some(tp_px) = pos.tp {
                if lo <= tp_px {
                    let exit_px = tp_px * (1.0 + slip_rate);
                    let price_return = pos.entry_px / exit_px - 1.0;
                    let lots = pos.position_notional / CONTRACT_SIZE;
                    let commission_money = commission_round_trip_per_lot * lots;
                    let pnl_money = price_return * pos.position_notional - commission_money;
                    balance += pnl_money;
                    let pnl_ratio = if pos.balance_at_entry > 0.0 { pnl_money / pos.balance_at_entry } else { 0.0 };
                    strat_ret[i + 1] += pnl_ratio;
                    trades.push((pos.entry_bar, i + 1, pnl_ratio, pos.entry_px, exit_px));
                    position = None;
                    continue;
                }
            }
        }
    }

    let mut equity = vec![1.0; n];
    for i in 1..n {
        equity[i] = equity[i - 1] * (1.0 + strat_ret[i]);
    }
    (equity, trades)
}

/// 従来 API: Python 側で計算した entry_mask を渡す。OHLC とマスクは as_slice() でゼロコピー。
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
    let open_slice = open
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let high_slice = high
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let low_slice = low
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let close_slice = close
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let em_slice = entry_mask
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let em_opp_slice = entry_mask_opposite
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;

    let n = open_slice.len();
    if high_slice.len() != n
        || low_slice.len() != n
        || close_slice.len() != n
        || em_slice.len() != n
        || em_opp_slice.len() != n
    {
        return Err(pyo3::exceptions::PyValueError::new_err(
            "length mismatch: open/high/low/close/entry_mask/entry_mask_opposite",
        ));
    }

    let (equity, trades) = run_bar_loop(
        open_slice,
        high_slice,
        low_slice,
        em_slice,
        em_opp_slice,
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
        commission_round_trip_per_lot,
    );

    let equity_py = equity.into_py(py);
    let list = PyList::empty_bound(py);
    for (ei, ex, pnl, entry_px, exit_px) in trades {
        let t: Py<PyAny> = (ei as i64, ex as i64, pnl, entry_px, exit_px).into_py(py);
        list.append(t)?;
    }
    let out = (equity_py, list.into_py(py)).into_py(py);
    Ok(out)
}

/// direction=both 用: ロング・ショート両マスクを渡し、バーループを Rust で実行（ゼロコピー）。Python の 33 秒ループを回避。
#[pyfunction]
#[pyo3(signature = (
    open,
    high,
    low,
    close,
    entry_mask_long,
    entry_mask_short,
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
fn run_engine_core_bidirectional(
    py: Python<'_>,
    open: PyArrayLike1<'_, f64>,
    high: PyArrayLike1<'_, f64>,
    low: PyArrayLike1<'_, f64>,
    close: PyArrayLike1<'_, f64>,
    entry_mask_long: PyArrayLike1<'_, u8>,
    entry_mask_short: PyArrayLike1<'_, u8>,
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
    let open_slice = open
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let high_slice = high
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let low_slice = low
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let _close_slice = close
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let em_long = entry_mask_long
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let em_short = entry_mask_short
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;

    let n = open_slice.len();
    if high_slice.len() != n
        || low_slice.len() != n
        || em_long.len() != n
        || em_short.len() != n
    {
        return Err(pyo3::exceptions::PyValueError::new_err(
            "length mismatch: open/high/low/entry_mask_long/entry_mask_short",
        ));
    }

    let (equity, trades) = run_bar_loop_bidirectional(
        open_slice,
        high_slice,
        low_slice,
        em_long,
        em_short,
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
        commission_round_trip_per_lot,
    );

    let equity_py = equity.into_py(py);
    let list = PyList::empty_bound(py);
    for (ei, ex, pnl, entry_px, exit_px) in trades {
        let t: Py<PyAny> = (ei as i64, ex as i64, pnl, entry_px, exit_px).into_py(py);
        list.append(t)?;
    }
    let out = (equity_py, list.into_py(py)).into_py(py);
    Ok(out)
}

/// 新 API: OHLC のみ受け取り、entries_config_json で Rust 側で指標計算・エントリー判定。
/// entry と opposite の 2 本の JSON（ロング用・ショート用）。ゼロコピー + Rayon 並列指標計算。
#[pyfunction]
#[pyo3(signature = (
    open,
    high,
    low,
    close,
    entries_config_json,
    opposite_config_json,
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
fn run_engine_core_native(
    py: Python<'_>,
    open: PyArrayLike1<'_, f64>,
    high: PyArrayLike1<'_, f64>,
    low: PyArrayLike1<'_, f64>,
    close: PyArrayLike1<'_, f64>,
    entries_config_json: &str,
    opposite_config_json: &str,
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
    let open_slice = open
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let high_slice = high
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let low_slice = low
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;
    let close_slice = close
        .as_slice()
        .map_err(|e| pyo3::exceptions::PyValueError::new_err(e.to_string()))?;

    let n = open_slice.len();
    if high_slice.len() != n || low_slice.len() != n || close_slice.len() != n {
        return Err(pyo3::exceptions::PyValueError::new_err(
            "length mismatch: open/high/low/close",
        ));
    }

    let entry_mask = entry_config::build_entry_mask_from_config(
        close_slice,
        high_slice,
        low_slice,
        entries_config_json,
        true,
    );
    let entry_mask_opposite = entry_config::build_entry_mask_from_config(
        close_slice,
        high_slice,
        low_slice,
        opposite_config_json,
        true,
    );

    if entry_mask.len() != n || entry_mask_opposite.len() != n {
        return Err(pyo3::exceptions::PyValueError::new_err(
            "entry_mask length mismatch after build",
        ));
    }

    let (equity, trades) = run_bar_loop(
        open_slice,
        high_slice,
        low_slice,
        &entry_mask,
        &entry_mask_opposite,
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
        commission_round_trip_per_lot,
    );

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
    m.add_function(wrap_pyfunction!(run_engine_core_bidirectional, m)?)?;
    m.add_function(wrap_pyfunction!(run_engine_core_native, m)?)?;
    Ok(())
}
