from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from data import get_stock_data, get_multiple_stocks
from backtester import run_backtest
from portfolio import optimize_portfolio, efficient_frontier_data, portfolio_correlation
from stocks import get_all_sectors, get_stocks_by_sector, search_stocks

app = FastAPI(
    title="AlphaLab API",
    description="Quantitative Finance Research Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request Models ─────────────────────────────────────────

class StockRequest(BaseModel):
    ticker: str
    period: Optional[str] = "1y"

class MultiStockRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "1y"

class BacktestRequest(BaseModel):
    ticker: str
    strategy: Optional[str] = "sma_cross"
    period: Optional[str] = "2y"

class PortfolioRequest(BaseModel):
    tickers: List[str]
    period: Optional[str] = "2y"
    portfolio_value: Optional[int] = 100000

# ── Health Check ───────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "AlphaLab API is running!",
        "version": "1.0.0"
    }

# ── Stock Endpoints ────────────────────────────────────────

@app.post("/stock")
def stock_data(req: StockRequest):
    try:
        result = get_stock_data(req.ticker, req.period)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/stocks/compare")
def compare_stocks(req: MultiStockRequest):
    try:
        if len(req.tickers) < 2:
            raise HTTPException(status_code=400, detail="Provide at least 2 tickers")
        if len(req.tickers) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 tickers allowed")
        result = get_multiple_stocks(req.tickers, req.period)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Backtester Endpoints ───────────────────────────────────

@app.post("/backtest")
def backtest(req: BacktestRequest):
    try:
        valid_strategies = ["sma_cross", "rsi", "macd", "bollinger", "smc"]
        if req.strategy not in valid_strategies:
            raise HTTPException(status_code=400, detail=f"Invalid strategy. Choose from: {valid_strategies}")
        result = run_backtest(req.ticker, req.strategy, req.period)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Portfolio Endpoints ────────────────────────────────────

@app.post("/portfolio/optimize")
def portfolio_optimize(req: PortfolioRequest):
    try:
        if len(req.tickers) < 2:
            raise HTTPException(status_code=400, detail="Provide at least 2 tickers")
        if req.portfolio_value < 1000:
            raise HTTPException(status_code=400, detail="Minimum portfolio value is 1000")
        result = optimize_portfolio(req.tickers, req.period, req.portfolio_value)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/portfolio/frontier")
def portfolio_frontier(req: PortfolioRequest):
    try:
        result = efficient_frontier_data(req.tickers, req.period)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/portfolio/correlation")
def portfolio_corr(req: PortfolioRequest):
    try:
        result = portfolio_correlation(req.tickers, req.period)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Stock Database Endpoints ───────────────────────────────

@app.get("/sectors")
def sectors():
    return {"sectors": get_all_sectors()}

@app.get("/sector-stocks")
def stocks_by_sector(sector: str):
    stocks = get_stocks_by_sector(sector)
    if not stocks:
        raise HTTPException(status_code=404, detail="Sector not found")
    stocks_list = [
        {"ticker": ticker, "name": name}
        for ticker, name in stocks.items()
        if isinstance(name, str)
    ]
    return {"sector": sector, "stocks": stocks_list}

@app.get("/search")
def search(q: str = ""):
    if not q:
        return {"results": []}
    results = search_stocks(q)
@app.get("/sector-performance")
async def sector_performance(sector: str, period: str = "3mo"):
    import yfinance as yf
    import pandas as pd
    
    stocks = get_stocks_by_sector(sector)
    if not stocks:
        raise HTTPException(status_code=404, detail="Sector not found")
    
    results = []
    for ticker, name in list(stocks.items())[:10]:
        try:
            df = yf.Ticker(ticker).history(period=period, auto_adjust=True)
            if df.empty or len(df) < 2:
                continue
            ret = round((df["Close"].iloc[-1] - df["Close"].iloc[0]) / df["Close"].iloc[0] * 100, 2)
            vol = round(df["Close"].pct_change().std() * (252**0.5) * 100, 2)
            results.append({
                "ticker": ticker.replace(".NS","").replace(".BO","").replace("=X","").replace("-USD",""),
                "full_ticker": ticker,
                "name": name,
                "return_pct": ret,
                "volatility": vol,
                "current_price": round(float(df["Close"].iloc[-1]), 2)
            })
        except:
            continue
    
    results = sorted(results, key=lambda x: x["return_pct"], reverse=True)[:5]
    
    return {"sector": sector, "period": period, "stocks": results}