# api/schemas.py
from __future__ import annotations
from typing import Optional, Dict, Any, List, Literal, Annotated, Union
from pydantic import BaseModel, Field, field_validator


# === 基本型 ===
Pair = Literal["EURUSD","GBPUSD","USDJPY","USDCAD","AUDUSD","NZDUSD","XAUUSD","GBPJPY"]
Timeframe = Literal["M1","M15","H1","H4"]
Direction = Literal["long","short","both"]

class EntrySchema(BaseModel):
    type: str
    params: Optional[Dict[str, Any]] = None
    side: Optional[str] = None


class Trading(BaseModel):
    balance: Optional[float] = None
    spread: Optional[float] = None
    slippage: Optional[float] = None
    swap: Optional[float] = None
    commission: Optional[float] = None
    leverage: Optional[float] = None
    margin_call: Optional[float] = None
    lot_mode: Literal["fixed", "dynamic"] = "fixed"
    lot_size: Optional[float] = None
    risk_pct: Optional[float] = None

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

# === タイムゾーン ===
class IntradayWindow(BaseModel):
    enabled: bool
    from_: Optional[str] = Field(None, alias="from")
    to: Optional[str] = Field(None, alias="to")

    model_config = {"populate_by_name": True}

class TimeWindowEntry(BaseModel):
    type: Literal["time_window"]
    days: Dict[str, bool]
    intraday: Optional[IntradayWindow] = None
    side: Optional[str] = None





# === プライスアクション ===
class Pinbar(BaseModel):
    type: Literal["pinbar"]
    signal: Literal["bullish", "bearish"]
    entrySide: Literal["long", "short"]
    side: Optional[Literal["long", "short"]] = None  # 方向（オプション）

class InsideBar(BaseModel):
    type: Literal["inside_bar"]
    signal: Literal["bullish", "bearish"]
    entrySide: Literal["long", "short"]

class ThreeBarReversal(BaseModel):
    type: Literal["threebar"]
    signal: Literal["bullish", "bearish"]
    entrySide: Literal["long", "short"]

    # === チャートパターン ===

class HeadAndShoulders(BaseModel):
    type: Literal["head_and_shoulders"]
    direction: Literal["reversal", "continuation"]
    entry: Literal["long", "short"]
    option: Literal["neckline", "none", "tight"] = "none"
    side: Optional[Literal["long","short"]] = None

class AscendingTriangle(BaseModel):
    type: Literal["ascending_triangle"]
    direction: Literal["reversal", "continuation"]
    entry: Literal["long", "short"]
    option: Literal["none", "tight", "neckline"] = "none"
    side: Optional[Literal["long","short"]] = None

class BearFlag(BaseModel):
    type: Literal["bear_flag"]
    direction: Literal["reversal", "continuation"]
    entry: Literal["long", "short"]
    option: Literal["none", "tight"] = "none"
    side: Optional[Literal["long","short"]] = None

class BullFlag(BaseModel):
    type: Literal["bull_flag"]
    direction: Literal["reversal", "continuation"]
    entry: Literal["long", "short"]
    option: Literal["none", "tight"] = "none"
    side: Optional[Literal["long","short"]] = None

class Triangle(BaseModel):
    type: Literal["triangle"]
    direction: Literal["reversal", "continuation"]
    entry: Literal["long", "short"]
    option: Literal["none", "tight", "breakout"] = "none"
    side: Optional[Literal["long","short"]] = None


class Engulfing(BaseModel):
    type: Literal["engulfing"]
    signal: Literal["bullish", "bearish"]
    entrySide: Literal["long", "short"]
    side: Optional[Literal["long","short"]] = None



# === 判別ユニオン ===
Entry = Annotated[
    Union[
        EmaCross, SmaCross, RsiThreshold, Breakout,
        Macd, BollingerBands, Stochastic, AdxThreshold,
        CciThreshold, VwapCross, SupertrendSignal, DonchianBreakout, Pinbar, InsideBar, ThreeBarReversal,
        HeadAndShoulders, AscendingTriangle, BearFlag, BullFlag, Triangle, TimeWindowEntry, Engulfing
    ],
    Field(discriminator="type"),
]

# === Exit 関連 ===
class ForcedExit(BaseModel):
    start: Optional[str] = None
    end: Optional[str] = None


class CandleExit(BaseModel):
    pattern: str  # "pinbar" / "engulfing" / "inside"
    signal: Literal["bullish", "bearish"]
    entrySide: Literal["long", "short"]


class TrailPips(BaseModel):
    activate: float
    trail: float


class Exit(BaseModel):
    # pips-based SL/TP
    sl_fixed_pips: Optional[float] = None
    tp_r_multiple: Optional[float] = None

    # percentage-based exit (new)
    tp_pct: Optional[float] = None
    sl_pct: Optional[float] = None

    # time-based exit (bars)
    time_stop_bars: Optional[int] = None

    # forced exit window (new)
    forced_exit: Optional[ForcedExit] = None

    # candle exit (new)
    candle_exit: Optional[List[CandleExit]] = None

    # trail by fixed pips (new)
    trail_pips: Optional[TrailPips] = None


# === Strategy ===
class StrategyMvp0(BaseModel):
    pair: str
    timeframe: str
    direction: str

    fee_bps: float = 5.0
    slippage_bps: float = 0.5

    entry: List[EntrySchema]
    exit: Optional[Dict[str, Any]] = None
    trading: Optional[Trading] = None


    @field_validator("entry", mode="before")
    @classmethod
    def coerce_entry_to_list(cls, v):
        return [v] if isinstance(v, dict) else v

    @field_validator("direction", mode="before")
    @classmethod
    def normalize_direction(cls, v):
        return v.lower() if isinstance(v, str) else v

# === rebuild models for Pydantic v2 ===
StrategyMvp0.model_rebuild()
