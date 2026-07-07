import yfinance as yf
import pandas as pd
import numpy as np

VALID_PERIODS = ["1mo", "3mo", "6mo", "1y", "2y", "5y"]

def compute_rsi(series, period=14):
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.round(2)

def compute_max_drawdown(prices):
    peak = prices.cummax()
    drawdown = (prices - peak) / peak
    return float(drawdown.min())

def get_stock_data(ticker: str, period: str = "1y"):
    ticker = ticker.upper().strip()

    if period not in VALID_PERIODS:
        raise ValueError(f"Invalid period. Choose from: {VALID_PERIODS}")

    stock = yf.Ticker(ticker)
    df = stock.history(period=period, auto_adjust=True)

    if df.empty:
        raise ValueError(f"No data found for ticker '{ticker}'.")

    df = df.dropna(subset=["Close"])
    df = df[["Open", "High", "Low", "Close", "Volume"]].copy()

    # All calculations in correct order
    df["daily_return"] = df["Close"].pct_change()
    df["cumulative_return"] = (1 + df["daily_return"]).cumprod() - 1
    df["sma_20"] = df["Close"].rolling(window=20).mean()
    df["sma_50"] = df["Close"].rolling(window=50).mean()
    df["sma_200"] = df["Close"].rolling(window=200).mean()
    df["volatility_20d"] = df["daily_return"].rolling(window=20).std() * np.sqrt(252)
    df["rsi"] = compute_rsi(df["Close"], period=14)
    df["volume_ma20"] = df["Volume"].rolling(window=20).mean()

    df = df.reset_index()
    df["Date"] = pd.to_datetime(df["Date"]).dt.strftime("%Y-%m-%d")

    clean_returns = df["daily_return"].dropna()

    summary = {
        "ticker": ticker,
        "period": period,
        "total_days": len(df),
        "start_date": df["Date"].iloc[0],
        "end_date": df["Date"].iloc[-1],
        "start_price": round(float(df["Close"].iloc[0]), 2),
        "current_price": round(float(df["Close"].iloc[-1]), 2),
        "total_return_pct": round(float(df["cumulative_return"].iloc[-1]) * 100, 2),
        "annualized_vol": round(float(clean_returns.std() * np.sqrt(252)) * 100, 2),
        "sharpe_ratio": round(float(clean_returns.mean() / clean_returns.std() * np.sqrt(252)), 3),
        "max_drawdown_pct": round(compute_max_drawdown(df["Close"]) * 100, 2),
        "best_day_pct": round(float(clean_returns.max()) * 100, 2),
        "worst_day_pct": round(float(clean_returns.min()) * 100, 2),
    }

    df = df.replace({np.nan: None})

    return {
        "summary": summary,
        "data": df.to_dict(orient="records")
    }

def get_multiple_stocks(tickers: list, period: str = "1y"):
    tickers = [t.upper().strip() for t in tickers]

    raw = yf.download(tickers, period=period, auto_adjust=True, progress=False)["Close"]

    if raw.empty:
        raise ValueError("No data returned. Check your tickers.")

    if isinstance(raw, pd.Series):
        raw = raw.to_frame(name=tickers[0])

    returns = raw.pct_change().dropna()

    comparison = []
    for ticker in raw.columns:
        col_returns = returns[ticker].dropna()
        total_ret = (raw[ticker].iloc[-1] - raw[ticker].iloc[0]) / raw[ticker].iloc[0]
        sharpe = col_returns.mean() / col_returns.std() * np.sqrt(252)
        drawdown = compute_max_drawdown(raw[ticker])

        comparison.append({
            "ticker": ticker,
            "total_return_pct": round(float(total_ret) * 100, 2),
            "sharpe_ratio": round(float(sharpe), 3),
            "max_drawdown_pct": round(float(drawdown) * 100, 2),
            "annualized_vol": round(float(col_returns.std() * np.sqrt(252)) * 100, 2),
            "current_price": round(float(raw[ticker].iloc[-1]), 2),
        })

    raw = raw.reset_index()
    raw["Date"] = pd.to_datetime(raw["Date"]).dt.strftime("%Y-%m-%d")
    raw = raw.replace({np.nan: None})

    return {
        "comparison": comparison,
        "price_data": raw.to_dict(orient="records")
    }