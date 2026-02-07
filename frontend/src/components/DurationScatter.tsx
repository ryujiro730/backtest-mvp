"use client"

import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function DurationScatter() {
  return (
    <Card>
      <CardHeader>保有時間 × 損益</CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <XAxis dataKey="duration" name="保有時間（分）" />
            <YAxis dataKey="profit" name="損益" />
            <Tooltip />
            <Scatter data={dummyData} fill="#22c55e" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
