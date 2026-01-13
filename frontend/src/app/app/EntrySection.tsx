import { Section } from "@/components/forms/Section";
import { Field } from "@/components/forms/Field";
import { IndicatorForm } from "@/components/forms/IndicatorForm";
import { DEFAULT_PARAMS } from "./defaults";
import type { Direction, EntryType } from "@/features/run/types";

type EntryState = {
  single: { type: EntryType; params: any };
  long:   { type: EntryType; params: any };
  short:  { type: EntryType; params: any };
};

type EntrySectionProps = {
  direction: Direction;
  setDirection: (v: Direction) => void;

  entry: EntryState;
  setEntry: React.Dispatch<React.SetStateAction<EntryState>>;

  onChangeSingleType: (t: EntryType) => void;
  onChangeLongType: (t: EntryType) => void;
  onChangeShortType: (t: EntryType) => void;
};

export function EntrySection(props: EntrySectionProps) {
  const {
    direction,
    setDirection,
    entry,
    setEntry,
    onChangeSingleType,
    onChangeLongType,
    onChangeShortType,
  } = props;

  const ENTRY_TYPES: Record<EntryType, string> = {
    ema_cross: "EMAクロス",
    breakout: "ブレイクアウト",
    rsi_threshold: "RSIしきい値",
    macd: "MACD",
    bbands: "ボリンジャーバンド",
    stoch: "ストキャスティクス",
    adx_threshold: "ADX",
    cci_threshold: "CCI",
    vwap: "VWAP",
    supertrend: "スーパートレンド",
    donchian_breakout: "ドンチャン",
  };

  return (
    <>
      {/* Direction */}
      <Section title="戦略パラメータ">
        <Field label="方向">
          <select
            className="mt-1 p-2 rounded-xl border"
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
          >
            <option value="long">ロングのみ</option>
            <option value="short">ショートのみ</option>
            <option value="both">ロング＋ショート</option>
          </select>
        </Field>
      </Section>

      {direction === "both" ? (
        <>
          {/* Long */}
          <Section title="ロングエントリー">
            <Field label="エントリータイプ">
              <select
                value={entry.long.type}
                onChange={(e) => onChangeLongType(e.target.value as EntryType)}
              >
                {Object.entries(ENTRY_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            <IndicatorForm
              type={entry.long.type}
              params={entry.long.params ?? DEFAULT_PARAMS[entry.long.type]}
              onChange={(newParams) =>
                setEntry((prev) => ({
                  ...prev,
                  long: { ...prev.long, params: newParams },
                }))
              }
            />
          </Section>

          {/* Short */}
          <Section title="ショートエントリー">
            <Field label="エントリータイプ">
              <select
                value={entry.short.type}
                onChange={(e) => onChangeShortType(e.target.value as EntryType)}
              >
                {Object.entries(ENTRY_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>

            <IndicatorForm
              type={entry.short.type}
              params={entry.short.params}
              onChange={(newParams) =>
                setEntry((prev) => ({
                  ...prev,
                  short: { ...prev.short, params: newParams },
                }))
              }
            />
          </Section>
        </>
      ) : (
        <Section title="エントリー">
          <Field label="エントリータイプ">
            <select
              value={entry.single.type}
              onChange={(e) =>
                onChangeSingleType(e.target.value as EntryType)
              }
            >
              {Object.entries(ENTRY_TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>

          <IndicatorForm
            type={entry.single.type}
            params={entry.single.params ?? DEFAULT_PARAMS[entry.single.type]}
            onChange={(newParams) =>
              setEntry((prev) => ({
                ...prev,
                single: { ...prev.single, params: newParams },
              }))
            }
          />
        </Section>
      )}
    </>
  );
}
