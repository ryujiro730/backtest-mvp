import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScatterCard } from "./ScatterCard";
import { HeatmapCard } from "./HeatmapCard";

export function VisualizationTabs() {
  return (
    <Tabs defaultValue="scatter" className="space-y-4">
      <TabsList>
        <TabsTrigger value="scatter">散布図</TabsTrigger>
        <TabsTrigger value="heatmap">ヒートマップ</TabsTrigger>
      </TabsList>

      <TabsContent value="scatter">
        <ScatterCard />
      </TabsContent>

      <TabsContent value="heatmap">
        <HeatmapCard />
      </TabsContent>
    </Tabs>
  );
}
