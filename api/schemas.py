# scihemas.py  —  StrategyMvp0 の型定義（Pydantic）
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

class SmaCross(BaseModel):
    type: Literal["sma_cross"]
    short: int = Field(ge=1)
    long: int = Field(ge=1)
    fee_bps: Optional[float] = Field(default=None, ge=0)         # ★追加（任意）
    slippage_bps: Optional[float] = Field(default=None, ge=0)    # ★追加（任意）

class EmaCross(BaseModel):
    type: Literal["ema_cross"]
    fast: int
    slow: int
    cross: Literal["above","below"]
    fee_bps: Optional[float] = Field(default=None, ge=0)         # ★追加（任意）
    slippage_bps: Optional[float] = Field(default=None, ge=0)    # ★追加（任意）

class RsiThreshold(BaseModel):
    type: Literal["rsi_threshold"]
    length: int
    level: float
    event: Literal["cross_up","cross_down"]

class Breakout(BaseModel):
    type: Literal["breakout"]
    lookback: int
    side: Literal["high","low"]

Entry = Union[EmaCross, SmaCross, RsiThreshold, Breakout]

class Exit(BaseModel):
    sl_atr: Optional[dict] = None   # {"n": int, "k": float}
    tp_rr: Optional[float] = None
    time_stop_bars: Optional[int] = None
    trailing: Optional[Literal["none","breakeven","atr"]] = None

class StrategyMvp0(BaseModel):
    pair: str
    timeframe: str
    direction: Literal["long","short"] = "long"
    entry: List[dict]
    exit: Optional[dict] = None
    fee_bps: Optional[float] = 5.0
    slippage_bps: Optional[float] = 0.5
    # これを任意に（存在しなくてもOK）
    date_range: Optional[dict] = None
