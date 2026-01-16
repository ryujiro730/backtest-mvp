/// frontend/src/components/run/RunPanel.tsx
'use client';

import { useState } from 'react';
import { RulesBuilder } from '@/rules/RulesBuilder';
import { RunButton } from '@/components/run/RunButton';
import { RunResult } from '@/components/run/RunResult';

export function RunPanel() {
  const [runId, setRunId] = useState<string | null>(null);

  const [payload, setPayload] = useState<StrategyPayload>({
  pair: "EURUSD",
  timeframe: "H1",
  direction: "long",
  fee_bps: 1.5,
  slip_bps: 2,
  entry: [
    {
      type: "rsi_threshold",
      length: 14,
      level: 30,
      event: "cross_down",
      side: "long",
    },
  ],
  exit: {},
});


  console.log('RunPanel runId =', runId);

  return (
    <>
          {/* ★ エントリー条件はここで入力する */}
      <RulesBuilder />
      <RunButton onRunStarted={setRunId} />
      <RunResult runId={runId} />
    </>
  );
}
