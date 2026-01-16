// src/lib/strategy/buildEntry.ts
import type { Direction, EntryType } from "@/features/run/types";
import { toNum } from "@/lib/strategy/number";

/**
 * UI → API/Worker への正規化
 */
export function buildEntry(
  type: EntryType,
  p: any,
  side: "long" | "short" | "single",
  direction: "long" | "short" | "both"
) {
  const params = p?.params ?? p;

  const toInt = (x: any) => {
    const n = Number(x);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  };

  const normalizeSide = () => {
    if (side === "single") {
      return direction === "long" ? "long" : "short";
    }
    return side;
  };

  const normStr = (v: any) => (v == null ? undefined : String(v).toLowerCase());

  switch (type) {
    /* ============================
       TIME WINDOW
    ============================ */
    case "time_window": {
      return {
        type: "time_window",
        days: params.days,
        intraday: params.intraday,
        side: normalizeSide(),
      };
    }

    /* ============================
       EMA CROSS
       UI: { fast, slow, cross }
       Worker: fast/slow/cross
    ============================ */
    case "ema_cross": {
      const fast = toInt(params.fast ?? params.emaFast);
      const slow = toInt(params.slow ?? params.emaSlow);
      const cross = normStr(params.cross);

      if (!fast || !slow || !cross) {
        throw new Error("ema_cross: fast/slow/cross が不足しています");
      }

      return {
        type: "ema_cross",
        fast,
        slow,
        cross,
        side: normalizeSide(),
      };
    }

    /* ============================
       SMA CROSS
       UI: same as EMA (fast/slow/cross)
       Worker: fast/slow/cross
    ============================ */
    case "sma_cross": {
      const fast = toInt(params.fast);
      const slow = toInt(params.slow);
      const cross = normStr(params.cross);

      if (!fast || !slow || !cross) {
        throw new Error("sma_cross: fast/slow/cross が不足しています");
      }

      return {
        type: "sma_cross",
        fast,
        slow,
        cross,
        side: normalizeSide(),
      };
    }

    /* ============================
       RSI THRESHOLD
       UI: { length, level, event }
       Worker: length, level, event
    ============================ */
    case "rsi_threshold": {
      const length = toInt(params.length);
      const level = toNum(params.level);
      const event = normStr(params.event);

      if (!length || level == null || !event) {
        throw new Error("rsi_threshold: length/level/event が不足");
      }

      return {
        type: "rsi_threshold",
        length,
        level,
        event,
        side: normalizeSide(),
      };
    }

    /* ============================
       MACD
       UI: { fast, slow, signal, event }
    ============================ */
    case "macd": {
      return {
        type: "macd",
        fast: toInt(params.fast),
        slow: toInt(params.slow),
        signal: toInt(params.signal),
        event: normStr(params.event),
        side: normalizeSide(),
      };
    }

    /* ============================
       BOLLINGER BANDS
       UI: { length, mult, event }
    ============================ */
    case "bbands": {
      return {
        type: "bbands",
        length: toInt(params.length),
        mult: Number(params.mult),
        event: normStr(params.event),
        side: normalizeSide(),
      };
    }

    /* ============================
       STOCHASTIC
       UI: { k, d, smooth, overbought, oversold }
    ============================ */
    case "stoch": {
      return {
        type: "stoch",
        k: toInt(params.k),
        d: toInt(params.d),
        smooth: toInt(params.smooth),
        overbought: Number(params.overbought),
        oversold: Number(params.oversold),
        side: normalizeSide(),
      };
    }

    /* ============================
       ADX
       UI: { length, level, event }
    ============================ */
    case "adx_threshold": {
      return {
        type: "adx_threshold",
        length: toInt(params.length),
        level: Number(params.level),
        event: normStr(params.event),
        side: normalizeSide(),
      };
    }

    /* ============================
       CCI
    ============================ */
    case "cci_threshold": {
      return {
        type: "cci_threshold",
        length: toInt(params.length),
        level: Number(params.level),
        event: normStr(params.event),
        side: normalizeSide(),
      };
    }

    /* ============================
       VWAP
       UI: { event }
    ============================ */
    case "vwap": {
      return {
        type: "vwap",
        event: normStr(params.event),
        side: normalizeSide(),
      };
    }

    /* ============================
       SUPER TREND
       UI: { length, multiplier, event }
    ============================ */
    case "supertrend": {
      return {
        type: "supertrend",
        length: toInt(params.length),
        multiplier: Number(params.multiplier),
        event: normStr(params.event),
        side: normalizeSide(),
      };
    }

    /* ============================
       DONCHIAN BREAKOUT
       UI: { lookback, side }
    ============================ */
    case "donchian_breakout": {
      return {
        type: "donchian_breakout",
        lookback: toInt(params.lookback),
        side: normalizeSide(),
      };
    }

    /* ============================
       Price Action 系
    ============================ */
    case "pinbar":
    case "engulfing":
    case "inside_bar":
      return {
        type,
        ...(params ?? {}),
        side: normalizeSide(),
      };

    /* ============================
       Chart Pattern 系
    ============================ */
    case "triangle":
    case "double_top":
    case "head_and_shoulders":
      return {
        type,
        ...(params ?? {}),
        side: normalizeSide(),
      };

    /* ============================
       FALLBACK
    ============================ */
    default:
      return {
        type,
        ...(params ?? {}),
        side: normalizeSide(),
      };
  }
}
