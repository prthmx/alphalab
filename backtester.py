import pandas as pd
import numpy as np
from data import get_stock_data

def run_backtest(ticker: str, strategy: str = "sma_cross", period: str = "2y"):
    result = get_stock_data(ticker, period)
    df = pd.DataFrame(result["data"])
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.set_index("Date")

    if strategy == "sma_cross":
        df = strategy_sma_crossover(df)
    elif strategy == "rsi":
        df = strategy_rsi(df)
    elif strategy == "macd":
        df = strategy_macd(df)
    elif strategy == "bollinger":
        df = strategy_bollinger(df)
    elif strategy == "smc":
        df = strategy_smc(df)
    else:
        raise ValueError(f"Unknown strategy: {strategy}")

    df = simulate_trades(df)
    metrics = calculate_metrics(df, ticker, strategy)

    df = df.reset_index()
    df["Date"] = df["Date"].dt.strftime("%Y-%m-%d")
    df = df.replace({np.nan: None})

    return {
        "metrics": metrics,
        "data": df.to_dict(orient="records")
    }


def strategy_sma_crossover(df):
    df["signal"] = 0
    df.loc[df["sma_50"] > df["sma_200"], "signal"] = 1
    df.loc[df["sma_50"] < df["sma_200"], "signal"] = -1
    df["position"] = df["signal"].diff()
    df["trade_type"] = ""
    return df


def strategy_rsi(df):
    df["signal"] = 0
    df["position"] = 0
    in_position = False

    for i in range(len(df)):
        rsi = df["rsi"].iloc[i]
        if not in_position and rsi < 30:
            df.iloc[i, df.columns.get_loc("position")] = 1
            in_position = True
        elif in_position and rsi > 70:
            df.iloc[i, df.columns.get_loc("position")] = -1
            in_position = False

    return df


def strategy_macd(df):
    ema_12 = df["Close"].ewm(span=12, adjust=False).mean()
    ema_26 = df["Close"].ewm(span=26, adjust=False).mean()

    df["macd"] = ema_12 - ema_26
    df["macd_signal"] = df["macd"].ewm(span=9, adjust=False).mean()
    df["macd_hist"] = df["macd"] - df["macd_signal"]

    df["signal"] = 0
    df.loc[df["macd"] > df["macd_signal"], "signal"] = 1
    df.loc[df["macd"] < df["macd_signal"], "signal"] = -1
    df["position"] = df["signal"].diff()

    return df


def strategy_bollinger(df):
    df["bb_mid"] = df["Close"].rolling(window=20).mean()
    df["bb_std"] = df["Close"].rolling(window=20).std()
    df["bb_upper"] = df["bb_mid"] + (2 * df["bb_std"])
    df["bb_lower"] = df["bb_mid"] - (2 * df["bb_std"])

    df["signal"] = 0
    df["position"] = 0
    in_position = False

    for i in range(len(df)):
        price = df["Close"].iloc[i]
        lower = df["bb_lower"].iloc[i]
        upper = df["bb_upper"].iloc[i]

        if pd.isna(lower) or pd.isna(upper):
            continue

        if not in_position and price <= lower:
            df.iloc[i, df.columns.get_loc("position")] = 1
            in_position = True
        elif in_position and price >= upper:
            df.iloc[i, df.columns.get_loc("position")] = -1
            in_position = False

    return df


def simulate_trades(df):
    capital = 100000
    position = 0
    cash = capital
    df["portfolio_value"] = float(capital)
    df["trade_type"] = ""

    for i in range(len(df)):
        pos_signal = df["position"].iloc[i]
        price = float(df["Close"].iloc[i])

        if pos_signal == 1 and cash > 0:
            position = cash / price
            cash = 0
            df.iloc[i, df.columns.get_loc("trade_type")] = "BUY"
        elif pos_signal == -1 and position > 0:
            cash = position * price
            position = 0
            df.iloc[i, df.columns.get_loc("trade_type")] = "SELL"

        df.iloc[i, df.columns.get_loc("portfolio_value")] = cash + (position * price)

    return df


def calculate_metrics(df, ticker, strategy):
    portfolio = df["portfolio_value"]
    returns = portfolio.pct_change().dropna()

    start_value = 100000
    final_value = round(float(portfolio.iloc[-1]), 2)
    total_return = round((final_value - start_value) / start_value * 100, 2)

    close_end = float(df["Close"].iloc[-1])
    close_start = float(df["Close"].iloc[0])
    buy_hold_return = round((close_end - close_start) / close_start * 100, 2)

    sharpe = round(
        float(returns.mean() / returns.std() * np.sqrt(252))
        if returns.std() > 0 else 0, 3
    )

    peak = portfolio.cummax()
    drawdown = (portfolio - peak) / peak
    max_drawdown = round(float(drawdown.min()) * 100, 2)

    trades = df[df["trade_type"].isin(["BUY", "SELL"])]
    num_buys = len(trades[trades["trade_type"] == "BUY"])
    num_sells = len(trades[trades["trade_type"] == "SELL"])

    win_count = 0
    buy_price = None
    for _, row in df.iterrows():
        if row["trade_type"] == "BUY":
            buy_price = float(row["Close"])
        elif row["trade_type"] == "SELL" and buy_price is not None:
            if float(row["Close"]) > buy_price:
                win_count += 1
            buy_price = None

    win_rate = round(win_count / num_sells * 100, 1) if num_sells > 0 else 0

    return {
        "ticker": ticker,
        "strategy": strategy,
        "start_value": start_value,
        "final_value": final_value,
        "total_return_pct": total_return,
        "buy_hold_pct": buy_hold_return,
        "alpha": round(total_return - buy_hold_return, 2),
        "sharpe_ratio": sharpe,
        "max_drawdown_pct": max_drawdown,
        "num_buys": num_buys,
        "num_sells": num_sells,
        "win_rate_pct": win_rate,
    }
def strategy_smc(df):
    """
    Smart Money Concepts Strategy
    - Detects Order Blocks (last bearish candle before bullish move)
    - Detects Fair Value Gaps (3 candle imbalance pattern)
    - Break of Structure for trend confirmation
    - Liquidity sweep detection
    """
    df["signal"]   = 0
    df["position"] = 0
    df["smc_signal_type"] = ""

    highs  = df["High"].values
    lows   = df["Low"].values
    closes = df["Close"].values
    opens  = df["Open"].values if "Open" in df.columns else df["Close"].values

    in_position = False
    swing_high  = 0
    swing_low   = float('inf')

    for i in range(3, len(df) - 1):

        # ── Update swing points ──────────────────────────
        if highs[i] > highs[i-1] and highs[i] > highs[i-2]:
            swing_high = highs[i]
        if lows[i] < lows[i-1] and lows[i] < lows[i-2]:
            swing_low = lows[i]

        # ── Fair Value Gap (Bullish) ─────────────────────
        # Candle[i-2] high is lower than Candle[i] low
        # Gap between them = imbalance = price will return to fill it
        bullish_fvg = lows[i] > highs[i-2]

        # ── Order Block (Bullish) ────────────────────────
        # Last bearish candle before a strong bullish move
        bearish_candle  = closes[i-2] < opens[i-2]
        bullish_impulse = closes[i] > highs[i-1] * 1.005

        # ── Break of Structure (Bullish) ─────────────────
        # Price breaks above previous swing high
        bos_bullish = closes[i] > swing_high * 1.002 and swing_high > 0

        # ── Liquidity Sweep ──────────────────────────────
        # Price dips below swing low then recovers strongly
        liquidity_sweep = (lows[i] < swing_low * 0.998 and
                          closes[i] > swing_low and
                          swing_low < float('inf'))

        # ── Entry Logic ──────────────────────────────────
        if not in_position:
            if bullish_fvg and bos_bullish:
                df.iloc[i, df.columns.get_loc("position")] = 1
                df.iloc[i, df.columns.get_loc("smc_signal_type")] = "FVG+BOS"
                in_position = True
            elif bearish_candle and bullish_impulse:
                df.iloc[i, df.columns.get_loc("position")] = 1
                df.iloc[i, df.columns.get_loc("smc_signal_type")] = "OrderBlock"
                in_position = True
            elif liquidity_sweep:
                df.iloc[i, df.columns.get_loc("position")] = 1
                df.iloc[i, df.columns.get_loc("smc_signal_type")] = "LiqSweep"
                in_position = True

        # ── Exit Logic ───────────────────────────────────
        elif in_position:
            # Exit if price makes new swing high (take profit)
            # or breaks below recent low (stop loss)
            recent_low  = min(lows[max(0, i-5):i])
            recent_high = max(highs[max(0, i-10):i])

            take_profit  = closes[i] >= recent_high * 1.01
            stop_loss    = closes[i] <= recent_low  * 0.995

            if take_profit or stop_loss:
                df.iloc[i, df.columns.get_loc("position")] = -1
                in_position = False

    return df