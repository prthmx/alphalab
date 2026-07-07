import yfinance as yf

tickers = ["GLD", "SLV", "USO", "UNG", "CPER", "PPLT", "PALL", "WEAT", "CORN", "DJP"]

for ticker in tickers:
    stock = yf.Ticker(ticker)
    df = stock.history(period="5d")
    if df.empty:
        print(f"❌ {ticker}")
    else:
        print(f"✅ {ticker} — {df['Close'].iloc[-1]:.2f}")