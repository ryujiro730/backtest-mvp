'use client';

import { Section } from "@/components/forms/Section";
import { Field } from "@/components/forms/Field";
import { NumberField } from "@/components/forms/NumberField";

type ExitSectionProps = {
  // Time stop
  useTimeStop: boolean;
  setUseTimeStop: (v: boolean) => void;
  timeStopBars: number;
  setTimeStopBars: (v: number) => void;

  // Take profit
  useTP: boolean;
  setUseTP: (v: boolean) => void;
  tpRR: number;
  setTpRR: (v: number) => void;

  // Initial SL (ATR)
  useSLATR: boolean;
  setUseSLATR: (v: boolean) => void;
  trailAtr: number;
  setTrailAtr: (v: number) => void;

  // Trailing
  useTrailing: boolean;
  setUseTrailing: (v: boolean) => void;
  trailingMode: "breakeven" | "atr";
  setTrailingMode: (v: "breakeven" | "atr") => void;

  // Breakeven
  trailRRToBE: number;
  setTrailRRToBE: (v: number) => void;
  beOffsetPips: number;
  setBeOffsetPips: (v: number) => void;

  // ATR trailing detail
  trailAtrLen: number;
  setTrailAtrLen: (v: number) => void;
  trailAtrMult: number;
  setTrailAtrMult: (v: number) => void;
  trailAtrMode: "chandelier" | "step";
  setTrailAtrMode: (v: "chandelier" | "step") => void;
  trailAtrLookback: number;
  setTrailAtrLookback: (v: number) => void;

  // Indicator / opposite exit
  useIndicatorExit: boolean;
  setUseIndicatorExit: (v: boolean) => void;
  rsiExitLen: number;
  setRsiExitLen: (v: number) => void;

  useOppositeExit: boolean;
  setUseOppositeExit: (v: boolean) => void;

  // Costs
  feeBps: number;
  setFeeBps: (v: number) => void;
  slipBps: number;
  setSlipBps: (v: number) => void;
};

export function ExitSection(props: ExitSectionProps) {
  const {
    useTimeStop, setUseTimeStop, timeStopBars, setTimeStopBars,
    useTP, setUseTP, tpRR, setTpRR,
    useSLATR, setUseSLATR, trailAtr, setTrailAtr,
    useTrailing, setUseTrailing, trailingMode, setTrailingMode,
    trailRRToBE, setTrailRRToBE, beOffsetPips, setBeOffsetPips,
    trailAtrLen, setTrailAtrLen, trailAtrMult, setTrailAtrMult,
    trailAtrMode, setTrailAtrMode, trailAtrLookback, setTrailAtrLookback,
    useIndicatorExit, setUseIndicatorExit, rsiExitLen, setRsiExitLen,
    useOppositeExit, setUseOppositeExit,
    feeBps, setFeeBps, slipBps, setSlipBps,
  } = props;

  return (
    <Section title="決済 / トレーリング / コスト">
      {/* Time stop */}
      <Field label="タイムストップ（バー数）">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useTimeStop} onChange={e => setUseTimeStop(e.target.checked)} />
          <NumberField integer value={timeStopBars} onChange={setTimeStopBars} min={1} disabled={!useTimeStop} />
        </div>
      </Field>

      {/* Take profit */}
      <Field label="利確（R倍）">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useTP} onChange={e => setUseTP(e.target.checked)} />
          <NumberField value={tpRR} onChange={setTpRR} min={0.1} step={0.1} disabled={!useTP} />
        </div>
      </Field>

      {/* Initial SL */}
      <Field label="初期ストップ（ATR倍）">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useSLATR} onChange={e => setUseSLATR(e.target.checked)} />
          <NumberField value={trailAtr} onChange={setTrailAtr} min={0} disabled={!useSLATR} />
        </div>
      </Field>

      {/* Trailing */}
      <Field label="トレーリング">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useTrailing} onChange={e => setUseTrailing(e.target.checked)} />
          <select
            className="p-2 rounded-xl border"
            value={trailingMode}
            onChange={e => setTrailingMode(e.target.value as any)}
            disabled={!useTrailing}
          >
            <option value="breakeven">ブレークイーブン</option>
            <option value="atr">ATR</option>
          </select>

          {trailingMode === "breakeven" ? (
            <NumberField value={trailRRToBE} onChange={setTrailRRToBE} min={0} disabled={!useTrailing} />
          ) : (
            <NumberField value={trailAtr} onChange={setTrailAtr} min={0} disabled={!useTrailing} />
          )}
        </div>
      </Field>

      {useTrailing && trailingMode === "breakeven" && (
        <Field label="ブレークイーブン オフセット（pips）">
          <NumberField value={beOffsetPips} onChange={setBeOffsetPips} min={0} />
        </Field>
      )}

      {useTrailing && trailingMode === "atr" && (
        <Section title="ATRトレーリング詳細">
          <div className="grid grid-cols-3 gap-3">
            <Field label="ATR期間">
              <NumberField integer value={trailAtrLen} onChange={setTrailAtrLen} min={1} />
            </Field>
            <Field label="ATR倍率">
              <NumberField value={trailAtrMult} onChange={setTrailAtrMult} min={0.1} step={0.1} />
            </Field>
            <Field label="方式">
              <select className="p-2 rounded-xl border" value={trailAtrMode} onChange={e => setTrailAtrMode(e.target.value as any)}>
                <option value="chandelier">シャンデリア</option>
                <option value="step">ステップ</option>
              </select>
            </Field>
            <Field label="Lookback">
              <NumberField integer value={trailAtrLookback} onChange={setTrailAtrLookback} min={1} />
            </Field>
          </div>
        </Section>
      )}

      {/* Indicator exit */}
      <Field label="インジケーター決済（RSI）">
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useIndicatorExit} onChange={e => setUseIndicatorExit(e.target.checked)} />
          <NumberField integer value={rsiExitLen} onChange={setRsiExitLen} min={1} disabled={!useIndicatorExit} />
        </div>
      </Field>

      {/* Opposite exit */}
      <Field label="逆シグナル決済">
        <input type="checkbox" checked={useOppositeExit} onChange={e => setUseOppositeExit(e.target.checked)} />
      </Field>

      {/* Costs */}
      <Field label="手数料（bps）">
        <NumberField value={feeBps} onChange={setFeeBps} min={0} />
      </Field>
      <Field label="スリッページ（bps）">
        <NumberField value={slipBps} onChange={setSlipBps} min={0} />
      </Field>
    </Section>
  );
}
