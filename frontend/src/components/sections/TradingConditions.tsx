"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { useRuleStore } from "../../rules/store";

/* =========================================================
   Trading Conditions（取引条件）
   ========================================================= */
export function TradingConditions() {
const rule = useRuleStore((s) => s.rule);
const update = useRuleStore((s) => s.update);


  return (
    <Card>
      <CardHeader>
        <CardTitle>取引条件</CardTitle>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* -------------------------------
           基本コスト
        -------------------------------- */}
        <div className="grid grid-cols-2 gap-6">
          {/* 初期残高 */}
<Field label="初期残高">
  <UnitInput
    unit="円"
    value={rule.tradingConditions.balance}
    onChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          balance: Number(v),
        },
      })
    }
  />
</Field>


          {/* スプレッド */}
<Field label="スプレッド">
  <UnitInput
    unit="pips"
    value={rule.tradingConditions.spread}
    onChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          spread: Number(v),
        },
      })
    }
  />
</Field>

<Field label="スリッページ">
  <UnitInput
    unit="pips"
    value={rule.tradingConditions.slippage}
    onChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          slippage: Number(v),
        },
      })
    }
  />
</Field>

<Field label="スワップ">
  <UnitInput
    unit="円"
    value={rule.tradingConditions.swap}
    onChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          swap: Number(v),
        },
      })
    }
  />
</Field>

<Field label="手数料">
  <UnitInput
    unit="円/lot"
    value={rule.tradingConditions.commission}
    onChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          commission: Number(v),
        },
      })
    }
  />
</Field>

        </div>

        {/* -------------------------------
           レバレッジ / マージン
        -------------------------------- */}
        <div className="grid grid-cols-2 gap-6">
          {/* レバレッジ */}
<Field label="レバレッジ">
  <Select
    value={String(rule.tradingConditions.leverage)}
    onValueChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          leverage: Number(v),
        },
      })
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="25">1 : 25</SelectItem>
      <SelectItem value="50">1 : 50</SelectItem>
      <SelectItem value="100">1 : 100</SelectItem>
      <SelectItem value="200">1 : 200</SelectItem>
      <SelectItem value="500">1 : 500</SelectItem>
    </SelectContent>
  </Select>
</Field>


          {/* マージンコール水準 */}
<Field label="マージンコール水準">
  <UnitInput
    unit="%"
    value={rule.tradingConditions.marginCall}
    onChange={(v) =>
      update({
        tradingConditions: {
          ...rule.tradingConditions,
          marginCall: Number(v),
        },
      })
    }
  />
</Field>

        </div>

        {/* -------------------------------
           ロットモード
        -------------------------------- */}
        <div className="space-y-3">
          <Label>ロットモード</Label>

<RadioGroup
  value={rule.tradingConditions.lotMode}
  onValueChange={(v) =>
    update({
      tradingConditions: {
        ...rule.tradingConditions,
        lotMode: v as "fixed" | "dynamic",
      },
    })
  }
>

            {/* Fixed */}
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="fixed" />
              <div>
                <div className="font-medium">固定ロット</div>
                <div className="text-sm text-muted-foreground">
                  口座残高に関係なく、常に一定ロットで取引します（例：0.1 lot）
                </div>
              </div>
            </label>

            {/* Dynamic */}
            <label className="flex items-start gap-3 cursor-pointer">
              <RadioGroupItem value="dynamic" />
              <div>
                <div className="font-medium">動的ロット</div>
                <div className="text-sm text-muted-foreground">
                  口座残高に応じてロットサイズが変動し、複利運用が可能になります
                </div>
              </div>
            </label>
          </RadioGroup>
           {rule.tradingConditions.lotMode === "fixed" && (
    <Field label="固定ロットサイズ">
      <UnitInput
        unit="lot"
        value={rule.tradingConditions.lotSize}
        onChange={(v) =>
          update({
            tradingConditions: {
              ...rule.tradingConditions,
              lotSize: Number(v),
            },
          })
        }
      />
    </Field>
  )}

  {rule.tradingConditions.lotMode === "dynamic" && (
    <Field label="リスク（%）">
      <UnitInput
        unit="%"
        value={rule.tradingConditions.riskPct}
        onChange={(v) =>
          update({
            tradingConditions: {
              ...rule.tradingConditions,
              riskPct: Number(v),
            },
          })
        }
      />
    </Field>
  )}
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   小物コンポーネント
   ========================================================= */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function UnitInput({
  unit,
  placeholder,
  value,
  onChange,
}: {
  unit: string;
  placeholder?: string;
  value: number | string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Input
        className="pr-14"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {unit}
      </span>
    </div>
  );
}
