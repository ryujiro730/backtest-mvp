import { RulesBuilder } from "@/rules/RulesBuilder";
import RunClient from "../RunClient";
export default function AppPage() {
  return (
    <>
      {/* 既存UI */}
      <RunClient />

      {/* ↓ 下に仮で挿す */}
      <div className="mt-12 border-t pt-8">
        <RulesBuilder />
      </div>
    </>
  );
}
