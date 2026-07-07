import yfinance as yf

indian_stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"]

for ticker in indian_stocks:
    stock = yf.Ticker(ticker)
    df = stock.history(period="5d")
    if df.empty:
        print(f"❌ {ticker} — No data")
    else:
        print(f"✅ {ticker} — Latest price: {df['Close'].iloc[-1]:.2f}")
        