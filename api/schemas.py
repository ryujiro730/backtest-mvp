# api/schemas.py
from __future__ import annotations
from typing import List, Literal, Optional, Union, Annotated
from pydantic import BaseModel, Field, field_validator


# === 基本型 ===
Pair = Literal["EURUSD","GBPUSD","USDJPY","USDCAD","AUDUSD","NZDUSD","XAUUSD","GBPJPY"]
Timeframe = Literal["M1","M15","H1","H4"]
Direction = Literal["long","short","both"]


class DateRange(BaseModel):
    from_: str = Field(..., alias="from")
    to: str
    tz: Literal["UTC"] = "UTC"
    model_config = {"populate_by_name": True}

class Session(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None

class Filters(BaseModel):
    days: Optional[List[Literal["Mon","Tue","Wed","Thu","Fri"]]] = None
    session: Optional[Session] = None

# === インジケータ ===
class SmaCross(BaseModel):
    type: Literal["sma_cross"]
    short: int = Field(ge=1, default=5)
    long: int = Field(ge=1, default=20)
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class EmaCross(BaseModel):
    type: Literal["ema_cross"]
    fast: int = Field(ge=1, default=12)
    slow: int = Field(ge=1, default=26)
    cross: Literal["above","below"] = "above"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class RsiThreshold(BaseModel):
    type: Literal["rsi_threshold"]
    length: int = Field(ge=1, default=14)
    level: float = Field(ge=0, le=100, default=50)
    event: Literal["cross_up","cross_down"] = "cross_up"
    side: Optional[Literal["long","short"]] = None

class Breakout(BaseModel):
    type: Literal["breakout"]
    lookback: int = Field(ge=1, default=20)
    side: Literal["high","low"] = "high"

class Macd(BaseModel):
    type: Literal["macd"]
    fast: int = Field(ge=1, default=12)
    slow: int = Field(ge=1, default=26)
    signal: int = Field(ge=1, default=9)
    event: Literal["cross_up","cross_down","above_zero","below_zero"] = "cross_up"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class BollingerBands(BaseModel):
    type: Literal["bbands"]
    length: int = Field(ge=1, default=20)
    mult: float = Field(gt=0, default=2.0)
    event: Literal[
        "cross_above_upper","cross_below_lower",
        "cross_above_middle","cross_below_middle",
        "touch_upper","touch_lower"
    ] = "cross_below_lower"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class Stochastic(BaseModel):
    type: Literal["stoch"]
    k: int = Field(ge=1, default=14)
    d: int = Field(ge=1, default=3)
    smooth: int = Field(ge=1, default=1)
    overbought: float = Field(ge=0, le=100, default=80)
    oversold: float = Field(ge=0, le=100, default=20)
    event: Literal[
        "k_over_d_cross_up","k_over_d_cross_down",
        "overbought_cross_down","oversold_cross_up"
    ] = "k_over_d_cross_up"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class AdxThreshold(BaseModel):
    type: Literal["adx_threshold"]
    length: int = Field(ge=1, default=14)
    level: float = Field(ge=0, default=20)
    event: Literal["adx_gt","adx_lt"] = "adx_gt"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class CciThreshold(BaseModel):
    type: Literal["cci_threshold"]
    length: int = Field(ge=1, default=20)
    level: float = 100
    event: Literal["cross_up","cross_down"] = "cross_down"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class VwapCross(BaseModel):
    type: Literal["vwap"]
    event: Literal["price_cross_above","price_cross_below"] = "price_cross_above"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class SupertrendSignal(BaseModel):
    type: Literal["supertrend"]
    length: int = Field(ge=1, default=10)
    multiplier: float = Field(gt=0, default=3.0)
    event: Literal["trend_up","trend_down"] = "trend_up"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)
    side: Optional[Literal["long","short"]] = None

class DonchianBreakout(BaseModel):
    type: Literal["donchian_breakout"]
    lookback: int = Field(ge=1, default=20)
    side: Literal["high","low"] = "high"
    fee_bps: Optional[float] = Field(default=None, ge=0)
    slippage_bps: Optional[float] = Field(default=None, ge=0)

# === 判別ユニオン ===
Entry = Annotated[
    Union[
        EmaCross, SmaCross, RsiThreshold, Breakout,
        Macd, BollingerBands, Stochastic, AdxThreshold,
        CciThreshold, VwapCross, SupertrendSignal, DonchianBreakout,
    ],
    Field(discriminator="type"),
]

# === Exit 関連 ===
class IndicatorLevel(BaseModel):
    kind: str
    dir: Optional[Literal["up","down"]] = None
    fast: Optional[int] = None
    slow: Optional[int] = None
    n: Optional[int] = None
    k: Optional[float] = None
    level: Optional[float] = None
    op: Optional[Literal[">=", "<=", ">", "<"]] = None
    side: Optional[Literal["long","short"]] = None
    band: Optional[Literal["mid","upper","lower"]] = None

class Breakeven(BaseModel):
    activate_at_R: float = 1.0
    offset_pips: float = 0.0

class TrailATR(BaseModel):
    n: int = 14
    k: float = 2.5
    mode: Literal["step","chandelier"] = "chandelier"
    lookback: int = 22

class TPLeg(BaseModel):
    mode: Literal["R","pips","atr","pct"] = "R"
    value: float
    close_pct: float

class Exit(BaseModel):
    sl_atr: Optional[dict] = None
    sl_fixed_pips: Optional[float] = None
    tp_rr: Optional[float] = None
    tp_legs: Optional[List[TPLeg]] = None
    time_stop_bars: Optional[int] = None
    trailing: Optional[Literal["none","breakeven","atr"]] = None
    breakeven: Optional[Breakeven] = None
    trail_atr: Optional[TrailATR] = None
    indicator_exit: Optional[List[IndicatorLevel]] = None
    opposite_signal_exit: Optional[bool] = None

# === Strategy ===
class StrategyMvp0(BaseModel):
    pair: Pair
    timeframe: Timeframe
    direction: Direction = "long"
    entry: List[Entry]
    exit: Optional[Exit] = None
    fee_bps: Optional[float] = 5.0
    slippage_bps: Optional[float] = 0.5
    date_range: Optional[DateRange] = None
    filters: Optional[Filters] = None

    @field_validator("entry", mode="before")
    @classmethod
    def coerce_entry_to_list(cls, v):
        return [v] if isinstance(v, dict) else v

    @field_validator("direction", mode="before")
    @classmethod
    def normalize_direction(cls, v):
        return v.lower() if isinstance(v, str) else v
