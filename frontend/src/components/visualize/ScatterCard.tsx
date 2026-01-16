"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ParamScatter } from "./ParamScatter";

export function ScatterCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>散布図（パラメータ探索）</CardTitle>
      </CardHeader>
      <CardContent>
        <ParamScatter />
      </CardContent>
    </Card>
  );
}
