"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Rewind,
  Play,
  Square,
  FastForward,
  Ruler,
  Pencil,
  User,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ChartArea } from "@/components/chart/ChartArea";
import { useChartData } from "@/components/chart/useChartData";
import { cn } from "@/lib/utils";
import type { CandlestickBar } from "@/components/chart/ChartArea";

const TIMEFRAMES = [
  { label: "1m", value: "M1" },
  { label: "5m", value: "M5" },
  { label: "15m", value: "M15" },
  { label: "30m", value: "M30" },
  { label: "1H", value: "H1" },
  { label: "4H", value: "H4" },
  { label: "1D", value: "D1" },
  { label: "1W", value: "W1" },
] as const;

const PLAY_INTERVAL_MS = 400;

export type Position = {
  id: string;
  symbol: string;
  side: "Long" | "Short";
  quantity: number;
  entryTime: number;
  entryPrice: number;
  takeProfit: number | null;
  stopLoss: number | null;
  leverage: string;
};

function computeUnrealizedPnl(pos: Position, currentPrice: number): number {
  const diff = currentPrice - pos.entryPrice;
  const pnl = pos.side === "Long" ? diff * pos.quantity : -diff * pos.quantity;
  return Math.round(pnl * 100000) / 100000;
}

export default function ChartPage() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const { bars, loading, error, reachedStart, loadMore } = useChartData(symbol, timeframe);

  const [currentBarIndex, setCurrentBarIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const replayInitializedRef = useRef(false);

  const [entryOpen, setEntryOpen] = useState(false);
  const [entrySide, setEntrySide] = useState<"Long" | "Short">("Long");
  const [entryQty, setEntryQty] = useState("1");
  const [entryTp, setEntryTp] = useState("");
  const [entrySl, setEntrySl] = useState("");

  const replayToIndex = bars.length > 0 ? currentBarIndex : null;
  const currentBar: CandlestickBar | null =
    bars.length > 0 && currentBarIndex >= 0 && currentBarIndex < bars.length
      ? bars[currentBarIndex]
      : null;
  const currentPrice = currentBar?.close ?? 0;

  useEffect(() => {
    replayInitializedRef.current = false;
  }, [symbol, timeframe]);

  useEffect(() => {
    if (bars.length > 0 && !replayInitializedRef.current) {
      replayInitializedRef.current = true;
      setCurrentBarIndex(bars.length - 1);
    }
  }, [bars.length]);

  useEffect(() => {
    if (bars.length > 0 && currentBarIndex >= bars.length) {
      setCurrentBarIndex(bars.length - 1);
    }
  }, [bars.length, currentBarIndex]);

  useEffect(() => {
    if (!isPlaying || bars.length === 0) return;

    const id = setInterval(() => {
      setCurrentBarIndex((i) => {
        if (i >= bars.length - 1) {
          setIsPlaying(false);
          return bars.length - 1;
        }
        return i + 1;
      });
    }, PLAY_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isPlaying, bars.length]);

  const handleRewind = useCallback(() => {
    setIsPlaying(false);
    setCurrentBarIndex((i) => Math.max(0, i - 1));
  }, []);
  const handleForward = useCallback(() => {
    if (bars.length === 0) return;
    setCurrentBarIndex((i) => Math.min(bars.length - 1, i + 1));
  }, [bars.length]);
  const handleRewindFast = useCallback(() => {
    setIsPlaying(false);
    setCurrentBarIndex((i) => Math.max(0, i - 10));
  }, []);
  const handleForwardFast = useCallback(() => {
    if (bars.length === 0) return;
    setCurrentBarIndex((i) => Math.min(bars.length - 1, i + 10));
  }, [bars.length]);

  const onLoadMore = useCallback(async () => {
    const oldest = bars[0]?.time;
    if (oldest != null && !reachedStart) await loadMore(oldest);
  }, [bars, reachedStart, loadMore]);

  const handleAddPosition = useCallback(() => {
    if (!currentBar) return;
    const qty = parseInt(entryQty, 10) || 1;
    const tp = entryTp ? parseFloat(entryTp) : null;
    const sl = entrySl ? parseFloat(entrySl) : null;
    setPositions((prev) => [
      ...prev,
      {
        id: `pos-${Date.now()}`,
        symbol,
        side: entrySide,
        quantity: qty,
        entryTime: currentBar.time,
        entryPrice: currentBar.close,
        takeProfit: tp,
        stopLoss: sl,
        leverage: "1x",
      },
    ]);
    setEntryOpen(false);
    setEntryQty("1");
    setEntryTp("");
    setEntrySl("");
  }, [currentBar, symbol, entrySide, entryQty, entryTp, entrySl]);

  const visiblePositions = positions.filter(
    (p) => currentBar && p.entryTime <= currentBar.time
  );
  const unrealizedSum = visiblePositions.reduce(
    (acc, p) => acc + computeUnrealizedPnl(p, currentPrice),
    0
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center gap-4 border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="シンボル"
            className="w-28 font-mono"
          />
        </div>
        <Tabs defaultValue="indicators" className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="indicators" className="text-xs">
              Indicators
            </TabsTrigger>
            <TabsTrigger value="rules" className="text-xs">
              Rules
            </TabsTrigger>
            <TabsTrigger value="mode" className="text-xs">
              Mode
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-1 justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="早戻し（10本）"
            onClick={handleRewindFast}
            disabled={bars.length === 0}
          >
            <Rewind className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="1本戻る"
            onClick={handleRewind}
            disabled={bars.length === 0}
          >
            <Rewind className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title={isPlaying ? "一時停止" : "再生"}
            onClick={() => setIsPlaying((p) => !p)}
            disabled={bars.length === 0}
          >
            <Play className={cn("h-4 w-4", isPlaying && "text-primary")} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="再生停止"
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
          >
            <Square className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="1本進む"
            onClick={handleForward}
            disabled={bars.length === 0}
          >
            <FastForward className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            title="早送り（10本）"
            onClick={handleForwardFast}
            disabled={bars.length === 0}
          >
            <FastForward className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="定規">
            <Ruler className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="描画">
            <Pencil className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>アカウント</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex shrink-0 items-center gap-1 border-b px-4 py-1.5">
        {TIMEFRAMES.map(({ label, value }) => (
          <Button
            key={value}
            variant={timeframe === value ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs font-mono"
            onClick={() => setTimeframe(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="min-h-0 flex-1">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            読み込み中...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-destructive">
            {error}
          </div>
        ) : bars.length > 0 ? (
          <ChartArea
            bars={bars}
            replayToIndex={replayToIndex}
            onLoadMore={onLoadMore}
            className="h-full w-full"
          />
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col border-t">
        <Tabs defaultValue="position" className="w-full">
          <div className="flex items-center justify-between border-b px-4 pt-2">
            <TabsList className="h-8">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => setEntryOpen(true)}
              disabled={!currentBar}
              title="現在の足で手動エントリー"
            >
              <Plus className="h-4 w-4" />
              手動エントリー
            </Button>
          </div>
          <div className="px-4 py-2">
            <div className="mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 md:grid-cols-6">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">再生位置</span>
                <span className="font-mono tabular-nums">
                  {bars.length > 0 ? `${currentBarIndex + 1} / ${bars.length}` : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">現在価格</span>
                <span className="font-mono tabular-nums">
                  {currentPrice > 0 ? currentPrice.toFixed(5) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Unrealized P&L</span>
                <span
                  className={cn(
                    "font-mono tabular-nums",
                    unrealizedSum >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  {unrealizedSum >= 0 ? "+" : ""}
                  {unrealizedSum.toFixed(2)}
                </span>
              </div>
            </div>
            <TabsContent value="position" className="mt-0">
              <Card>
                <CardHeader className="py-2 text-sm font-medium">ポジション</CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead className="text-right">Unrealized P&L</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead>Long/Short</TableHead>
                        <TableHead>Take Profit</TableHead>
                        <TableHead>Stop Loss</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Executed</TableHead>
                        <TableHead>Leverage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visiblePositions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            ポジションはありません（手動エントリーで追加）
                          </TableCell>
                        </TableRow>
                      ) : (
                        visiblePositions.map((pos) => {
                          const pnl = computeUnrealizedPnl(pos, currentPrice);
                          return (
                            <TableRow key={pos.id}>
                              <TableCell className="font-mono">{pos.symbol}</TableCell>
                              <TableCell
                                className={cn(
                                  "text-right font-mono tabular-nums",
                                  pnl >= 0 ? "text-primary" : "text-destructive"
                                )}
                              >
                                {pnl >= 0 ? "+" : ""}
                                {pnl.toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-mono">{pos.quantity}</TableCell>
                              <TableCell
                                className={pos.side === "Long" ? "text-primary" : "text-destructive"}
                              >
                                {pos.side}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {pos.takeProfit != null ? pos.takeProfit.toFixed(5) : "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {pos.stopLoss != null ? pos.stopLoss.toFixed(5) : "—"}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {currentPrice.toFixed(5)}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {pos.entryPrice.toFixed(5)}
                              </TableCell>
                              <TableCell className="font-mono">{pos.leverage}</TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-0">
              <Card>
                <CardHeader className="py-2 text-sm font-medium">注文履歴</CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          注文履歴はありません
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Dialog open={entryOpen} onOpenChange={setEntryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>手動エントリー</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>方向</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={entrySide === "Long" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntrySide("Long")}
                >
                  Long
                </Button>
                <Button
                  type="button"
                  variant={entrySide === "Short" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntrySide("Short")}
                >
                  Short
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="qty">数量</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                value={entryQty}
                onChange={(e) => setEntryQty(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tp">Take Profit（任意）</Label>
              <Input
                id="tp"
                type="number"
                step="any"
                placeholder="例: 1.10000"
                value={entryTp}
                onChange={(e) => setEntryTp(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sl">Stop Loss（任意）</Label>
              <Input
                id="sl"
                type="number"
                step="any"
                placeholder="例: 1.08000"
                value={entrySl}
                onChange={(e) => setEntrySl(e.target.value)}
              />
            </div>
            {currentBar && (
              <p className="text-xs text-muted-foreground">
                エントリー価格: {currentBar.close.toFixed(5)}（現在の足の終値）
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEntryOpen(false)}>
              キャンセル
            </Button>
            <Button type="button" onClick={handleAddPosition} disabled={!currentBar}>
              エントリー
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
