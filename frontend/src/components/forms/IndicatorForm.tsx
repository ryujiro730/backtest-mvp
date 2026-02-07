// components/forms/IndicatorForm.tsx
import { Field } from "./Field";
import { NumberField } from "./NumberField";

type Props = {
  type: string;
  params: Record<string, any>;
  onChange: (p: Record<string, any>) => void;
};

export function IndicatorForm({ type, params, onChange }: Props) {
  switch (type) {
case "ema_cross":
  return (
    <>
      <Field label="EMA Fast">
        <NumberField
          value={params.emaFast ?? 12}
          onChange={(v) => onChange({ ...params, emaFast: v })}
        />
      </Field>

      <Field label="EMA Slow">
        <NumberField
          value={params.emaSlow ?? 26}
          onChange={(v) => onChange({ ...params, emaSlow: v })}
        />
      </Field>

      <Field label="Cross">
        <select
          value={params.emaCross ?? "above"}
          onChange={(e) =>
            onChange({ ...params, emaCross: e.target.value as "above" | "below" })
          }
          className="border rounded px-2 py-1"
        >
          {/* 表示は好きに、value は必ず小文字 */}
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
      </Field>
    </>
  );
    case "breakout":
      return (
        <>
          <Field label="Lookback">
            <NumberField value={params.lookback ?? 20}
                         onChange={(v) => onChange({ ...params, lookback: v })}/>
          </Field>
          <Field label="Side">
            <select
              value={params.side ?? "high"}
              onChange={e => onChange({ ...params, side: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="high">high</option>
              <option value="low">low</option>
            </select>
          </Field>
        </>
      );
    case "rsi_threshold":
      return (
        <>
          <Field label="Length">
            <NumberField value={params.length ?? 14}
                         onChange={(v) => onChange({ ...params, length: v })}/>
          </Field>
          <Field label="Level">
            <NumberField value={params.level ?? 50}
                         onChange={(v) => onChange({ ...params, level: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "cross_up"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="cross_up">cross_up</option>
              <option value="cross_down">cross_down</option>
            </select>
          </Field>
        </>
      );
    case "macd":
      return (
        <>
          <Field label="Fast">
            <NumberField value={params.fast ?? 12}
                         onChange={(v) => onChange({ ...params, fast: v })}/>
          </Field>
          <Field label="Slow">
            <NumberField value={params.slow ?? 26}
                         onChange={(v) => onChange({ ...params, slow: v })}/>
          </Field>
          <Field label="Signal">
            <NumberField value={params.signal ?? 9}
                         onChange={(v) => onChange({ ...params, signal: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "cross_up"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="cross_up">cross_up</option>
              <option value="cross_down">cross_down</option>
              <option value="above_zero">above_zero</option>
              <option value="below_zero">below_zero</option>
            </select>
          </Field>
        </>
      );
    case "bbands":
      return (
        <>
          <Field label="Length">
            <NumberField value={params.length ?? 20}
                         onChange={(v) => onChange({ ...params, length: v })}/>
          </Field>
          <Field label="Std Mult">
            <NumberField value={params.mult ?? 2.0}
                         onChange={(v) => onChange({ ...params, mult: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "cross_below_lower"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="cross_below_lower">cross_below_lower</option>
              <option value="cross_above_upper">cross_above_upper</option>
              <option value="cross_above_middle">cross_above_middle</option>
              <option value="cross_below_middle">cross_below_middle</option>
              <option value="touch_upper">touch_upper</option>
              <option value="touch_lower">touch_lower</option>
            </select>
          </Field>
        </>
      );
    case "stoch":
      return (
        <>
          <Field label="%K">
            <NumberField value={params.k ?? 14}
                         onChange={(v) => onChange({ ...params, k: v })}/>
          </Field>
          <Field label="%D">
            <NumberField value={params.d ?? 3}
                         onChange={(v) => onChange({ ...params, d: v })}/>
          </Field>
          <Field label="Smooth">
            <NumberField value={params.smooth ?? 1}
                         onChange={(v) => onChange({ ...params, smooth: v })}/>
          </Field>
          <Field label="Overbought">
            <NumberField value={params.overbought ?? 80}
                         onChange={(v) => onChange({ ...params, overbought: v })}/>
          </Field>
          <Field label="Oversold">
            <NumberField value={params.oversold ?? 20}
                         onChange={(v) => onChange({ ...params, oversold: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "k_over_d_cross_up"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="k_over_d_cross_up">k_over_d_cross_up</option>
              <option value="k_over_d_cross_down">k_over_d_cross_down</option>
              <option value="overbought_cross_down">overbought_cross_down</option>
              <option value="oversold_cross_up">oversold_cross_up</option>
            </select>
          </Field>
        </>
      );
    case "adx_threshold":
      return (
        <>
          <Field label="Length">
            <NumberField value={params.length ?? 14}
                         onChange={(v) => onChange({ ...params, length: v })}/>
          </Field>
          <Field label="Level">
            <NumberField value={params.level ?? 20}
                         onChange={(v) => onChange({ ...params, level: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "adx_gt"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="adx_gt">adx_gt</option>
              <option value="adx_lt">adx_lt</option>
            </select>
          </Field>
        </>
      );
    case "cci_threshold":
      return (
        <>
          <Field label="Length">
            <NumberField value={params.length ?? 20}
                         onChange={(v) => onChange({ ...params, length: v })}/>
          </Field>
          <Field label="Level">
            <NumberField value={params.level ?? 100}
                         onChange={(v) => onChange({ ...params, level: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "cross_down"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="cross_up">cross_up</option>
              <option value="cross_down">cross_down</option>
            </select>
          </Field>
        </>
      );
    case "vwap":
      return (
        <>
          <Field label="Event">
            <select
              value={params.event ?? "price_cross_above"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="price_cross_above">price_cross_above</option>
              <option value="price_cross_below">price_cross_below</option>
            </select>
          </Field>
        </>
      );
    case "supertrend":
      return (
        <>
          <Field label="Length">
            <NumberField value={params.length ?? 10}
                         onChange={(v) => onChange({ ...params, length: v })}/>
          </Field>
          <Field label="Multiplier">
            <NumberField value={params.multiplier ?? 3.0}
                         onChange={(v) => onChange({ ...params, multiplier: v })}/>
          </Field>
          <Field label="Event">
            <select
              value={params.event ?? "trend_up"}
              onChange={e => onChange({ ...params, event: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="trend_up">trend_up</option>
              <option value="trend_down">trend_down</option>
            </select>
          </Field>
        </>
      );
    case "donchian_breakout":
      return (
        <>
          <Field label="Lookback">
            <NumberField value={params.lookback ?? 20}
                         onChange={(v) => onChange({ ...params, lookback: v })}/>
          </Field>
          <Field label="Side">
            <select
              value={params.side ?? "high"}
              onChange={e => onChange({ ...params, side: e.target.value })}
              className="mt-1 p-2 rounded-xl border"
            >
              <option value="high">high</option>
              <option value="low">low</option>
            </select>
          </Field>
        </>
      );
    default:
      return <p>Unsupported indicator: {type}</p>;
  }
}