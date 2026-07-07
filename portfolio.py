import numpy as np
import pandas as pd
import yfinance as yf
from pypfopt import EfficientFrontier, risk_models, expected_returns
from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices

def get_portfolio_data(tickers: list, period: str = "2y"):
    tickers = [t.upper().strip() for t in tickers]

    # Download price data for all stocks
    raw = yf.download(tickers, period=period, auto_adjust=True, progress=False)["Close"]

    if isinstance(raw, pd.Series):
        raw = raw.to_frame(name=tickers[0])

    raw = raw.dropna()

    return raw


def optimize_portfolio(tickers: list, period: str = "2y", portfolio_value: int = 100000):

    # Step 1 — Get historical prices
    df = get_portfolio_data(tickers, period)

    if df.empty:
        raise ValueError("No price data found. Check your tickers.")

    # Step 2 — Calculate expected returns
    # mu = expected annual return for each stock
    mu = expected_returns.mean_historical_return(df)

    # Step 3 — Calculate risk (covariance matrix)
    # Shows how stocks move together — key for diversification
    S = risk_models.sample_cov(df)

    # Step 4 — Find optimal weights using Efficient Frontier
    ef = EfficientFrontier(mu, S)

    # Maximize Sharpe ratio — best return per unit of risk
    ef.max_sharpe()
    cleaned_weights = ef.clean_weights()

    # Step 5 — Get portfolio performance
    perf = ef.portfolio_performance(verbose=False)
    expected_return = round(perf[0] * 100, 2)
    annual_volatility = round(perf[1] * 100, 2)
    sharpe_ratio = round(perf[2], 3)

    # Step 6 — Discrete allocation
    # How many actual shares to buy with your money
    latest_prices = get_latest_prices(df)
    da = DiscreteAllocation(
        cleaned_weights,
        latest_prices,
        total_portfolio_value=portfolio_value
    )
    allocation, leftover = da.greedy_portfolio()

    # Step 7 — Build weights list for response
    weights = []
    for ticker, weight in cleaned_weights.items():
        if weight > 0.001:
            weights.append({
                "ticker": ticker,
                "weight_pct": round(weight * 100, 2),
                "amount_invested": round(weight * portfolio_value, 2),
                "shares_to_buy": allocation.get(ticker, 0),
                "current_price": round(float(latest_prices[ticker]), 2),
            })

    # Sort by weight descending
    weights = sorted(weights, key=lambda x: x["weight_pct"], reverse=True)

    return {
        "tickers": tickers,
        "period": period,
        "portfolio_value": portfolio_value,
        "expected_annual_return": expected_return,
        "annual_volatility": annual_volatility,
        "sharpe_ratio": sharpe_ratio,
        "leftover_cash": round(leftover, 2),
        "weights": weights,
    }


def efficient_frontier_data(tickers: list, period: str = "2y"):
    df = get_portfolio_data(tickers, period)

    mu = expected_returns.mean_historical_return(df)
    S = risk_models.sample_cov(df)

    frontier_points = []
    
    # Generate 50 points along the frontier curve
    target_returns = np.linspace(
        float(mu.min()) + 0.01,
        float(mu.max()) - 0.01,
        50
    )

    for target in target_returns:
        try:
            ef = EfficientFrontier(mu, S)
            ef.efficient_return(target_return=target)
            perf = ef.portfolio_performance(verbose=False)
            frontier_points.append({
                "volatility": round(perf[1] * 100, 2),
                "return": round(perf[0] * 100, 2),
                "sharpe": round(perf[2], 3),
            })
        except:
            continue

    # Also calculate individual stock risk/return for plotting
    individual_stocks = []
    for ticker in df.columns:
        stock_returns = df[ticker].pct_change().dropna()
        individual_stocks.append({
            "ticker": ticker,
            "volatility": round(float(stock_returns.std() * np.sqrt(252)) * 100, 2),
            "return": round(float(stock_returns.mean() * 252) * 100, 2),
        })

    return {
        "frontier": frontier_points,
        "individual_stocks": individual_stocks,
    }


def portfolio_correlation(tickers: list, period: str = "2y"):
    df = get_portfolio_data(tickers, period)
    
    returns = df.pct_change().dropna()
    
    # Correlation matrix — how much do stocks move together
    # 1.0 = move perfectly together (no diversification)
    # 0.0 = move independently (good diversification)
    # -1.0 = move opposite (perfect hedge)
    corr = returns.corr().round(3)
    
    corr = corr.reset_index()
    corr.columns = ["ticker"] + list(corr.columns[1:])
    
    return corr.to_dict(orient="records")