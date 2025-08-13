# schemas.py  —  StrategyMvp0 の型定義（Pydantic）
from __future__ import annotations
from typing import List, Literal, Optional, Union
from pydantic import BaseModel, Field

Pair = Literal["EURUSD","GBPUSD","USDJPY","USDCAD","AUDUSD","NZDUSD"]
Timeframe = Literal["M15","H1","H4"]
Direction = Literal["long","short"]

class DateRange(BaseModel):
    from_: str = Field(..., alias="from")  # "from" は予約語なので alias を使う
    to: str
    tz: Literal["UTC"]

class Session(BaseModel):
    start: Optional[str] = None  # "HH:MM"
    end: Optional[str] = None

class Filters(BaseModel):
    days: Optional[List[Literal["Mon","Tue","Wed","Thu","Fri"]]] = None
    session: Optional[Session] = None

class EmaCross(BaseModel):
    type: Literal["ema_cross"]
    fast: int
    slow: int
    cross: Literal["above","below"]

class RsiThreshold(BaseModel):
    type: Literal["rsi_threshold"]
    length: int
    level: float
    event: Literal["cross_up","cross_down"]

class Breakout(BaseModel):
    type: Literal["breakout"]
    lookback: int
    side: Literal["high","low"]

Entry = Union[EmaCross, RsiThreshold, Breakout]

class Exit(BaseModel):
    sl_atr: Optional[dict] = None   # {"n": int, "k": float}
    tp_rr: Optional[float] = None
    time_stop_bars: Optional[int] = None
    trailing: Optional[Literal["none","breakeven","atr"]] = None

class StrategyMvp0(BaseModel):
    pair: Pair
    timeframe: Timeframe
    date_range: DateRange
    direction: Direction
    entry: List[Entry] = Field(..., max_items=3)
    filters: Optional[Filters] = None
    exit: Exit

