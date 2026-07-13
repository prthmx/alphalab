# Complete stock database for AlphaLab
# Indian NSE, US, and Global markets

STOCKS = {

    " Nifty 50 — Top Indian": {
        "RELIANCE.NS":  "Reliance Industries",
        "TCS.NS":       "Tata Consultancy Services",
        "HDFCBANK.NS":  "HDFC Bank",
        "INFY.NS":      "Infosys",
        "ICICIBANK.NS": "ICICI Bank",
        "HINDUNILVR.NS":"Hindustan Unilever",
        "SBIN.NS":      "State Bank of India",
        "BHARTIARTL.NS":"Bharti Airtel",
        "ITC.NS":       "ITC Limited",
        "KOTAKBANK.NS": "Kotak Mahindra Bank",
        "LT.NS":        "Larsen & Toubro",
        "AXISBANK.NS":  "Axis Bank",
        "ASIANPAINT.NS":"Asian Paints",
        "MARUTI.NS":    "Maruti Suzuki",
        "TITAN.NS":     "Titan Company",
        "WIPRO.NS":     "Wipro",
        "HCLTECH.NS":   "HCL Technologies",
        "BAJFINANCE.NS":"Bajaj Finance",
        "NESTLEIND.NS": "Nestle India",
        "POWERGRID.NS": "Power Grid Corp",
    },

    " Indian Banks": {
        "HDFCBANK.NS":  "HDFC Bank",
        "ICICIBANK.NS": "ICICI Bank",
        "SBIN.NS":      "State Bank of India",
        "KOTAKBANK.NS": "Kotak Mahindra Bank",
        "AXISBANK.NS":  "Axis Bank",
        "INDUSINDBK.NS":"IndusInd Bank",
        "BANDHANBNK.NS":"Bandhan Bank",
        "FEDERALBNK.NS":"Federal Bank",
        "IDFCFIRSTB.NS":"IDFC First Bank",
        "PNB.NS":       "Punjab National Bank",
    },

    " Indian IT": {
        "TCS.NS":       "Tata Consultancy Services",
        "INFY.NS":      "Infosys",
        "WIPRO.NS":     "Wipro",
        "HCLTECH.NS":   "HCL Technologies",
        "TECHM.NS":     "Tech Mahindra",
        "MPHASIS.NS":   "Mphasis",
        "LTIM.NS":      "LTIMindtree",
        "PERSISTENT.NS":"Persistent Systems",
        "COFORGE.NS":   "Coforge",
        "OFSS.NS":      "Oracle Financial Services",
    },

    " Indian Auto": {
        "MARUTI.NS":    "Maruti Suzuki",
        "TATAMOTORS.NS":"Tata Motors",
        "M&M.NS":       "Mahindra & Mahindra",
        "BAJAJ-AUTO.NS":"Bajaj Auto",
        "HEROMOTOCO.NS":"Hero MotoCorp",
        "EICHERMOT.NS": "Eicher Motors",
        "TVSMOTORS.NS": "TVS Motor",
        "ASHOKLEY.NS":  "Ashok Leyland",
    },

    " Indian Pharma": {
        "SUNPHARMA.NS": "Sun Pharmaceutical",
        "DRREDDY.NS":   "Dr. Reddy's Laboratories",
        "CIPLA.NS":     "Cipla",
        "DIVISLAB.NS":  "Divi's Laboratories",
        "APOLLOHOSP.NS":"Apollo Hospitals",
        "TORNTPHARM.NS":"Torrent Pharmaceuticals",
        "AUROPHARMA.NS":"Aurobindo Pharma",
        "LUPIN.NS":     "Lupin",
    },

    " US Big Tech": {
        "AAPL":  "Apple",
        "MSFT":  "Microsoft",
        "GOOGL": "Alphabet (Google)",
        "AMZN":  "Amazon",
        "META":  "Meta (Facebook)",
        "NVDA":  "NVIDIA",
        "TSLA":  "Tesla",
        "NFLX":  "Netflix",
        "AMD":   "AMD",
        "INTC":  "Intel",
    },

    " US Finance": {
        "JPM":  "JPMorgan Chase",
        "BAC":  "Bank of America",
        "GS":   "Goldman Sachs",
        "MS":   "Morgan Stanley",
        "WFC":  "Wells Fargo",
        "BRK-B":"Berkshire Hathaway",
        "C":    "Citigroup",
        "AXP":  "American Express",
        "BLK":  "BlackRock",
        "SCHW": "Charles Schwab",
    },

    " US Healthcare": {
        "JNJ":  "Johnson & Johnson",
        "PFE":  "Pfizer",
        "UNH":  "UnitedHealth Group",
        "ABBV": "AbbVie",
        "MRK":  "Merck",
        "LLY":  "Eli Lilly",
        "BMY":  "Bristol-Myers Squibb",
        "AMGN": "Amgen",
    },

    " Global Giants": {
        "TSM":   "Taiwan Semiconductor",
        "ASML":  "ASML Holding",
        "NVO":   "Novo Nordisk",
        "SAP":   "SAP SE",
        "TM":    "Toyota",
        "SONY":  "Sony Group",
        "BABA":  "Alibaba",
        "TCEHY": "Tencent",
        "SHOP":  "Shopify",
        "SE":    "Sea Limited",
    },

    " EV & Clean Energy": {
        "TSLA":  "Tesla",
        "RIVN":  "Rivian",
        "LCID":  "Lucid Motors",
        "NIO":   "NIO",
        "XPEV":  "XPeng",
        "ENPH":  "Enphase Energy",
        "FSLR":  "First Solar",
        "PLUG":  "Plug Power",
        "CHPT":  "ChargePoint",
        "BLNK":  "Blink Charging",
    },

    " AI & Semiconductors": {
        "NVDA":  "NVIDIA",
        "AMD":   "AMD",
        "INTC":  "Intel",
        "QCOM":  "Qualcomm",
        "AVGO":  "Broadcom",
        "TSM":   "Taiwan Semiconductor",
        "ASML":  "ASML",
        "ARM":   "ARM Holdings",
        "SMCI":  "Super Micro Computer",
        "AMAT":  "Applied Materials",
    },

    " Forex Major Pairs": {
        "EURUSD=X":  "Euro / US Dollar",
        "GBPUSD=X":  "British Pound / US Dollar",
        "USDJPY=X":  "US Dollar / Japanese Yen",
        "USDCHF=X":  "US Dollar / Swiss Franc",
        "AUDUSD=X":  "Australian Dollar / US Dollar",
        "USDCAD=X":  "US Dollar / Canadian Dollar",
        "NZDUSD=X":  "New Zealand Dollar / US Dollar",
        "USDINR=X":  "US Dollar / Indian Rupee",
        "EURGBP=X":  "Euro / British Pound",
        "EURJPY=X":  "Euro / Japanese Yen",
    },

     " Commodities & Metals": {
        "GLD":   "Gold (XAU/USD)",
        "SLV":   "Silver (XAG/USD)",
        "USO":   "Crude Oil WTI",
        "UNG":   "Natural Gas",
        "CPER":  "Copper",
        "PPLT":  "Platinum",
        "PALL":  "Palladium",
        "WEAT":  "Wheat",
        "CORN":  "Corn",
        "DJP":   "Bloomberg Commodity Index",
    },

    " Crypto": {
        "BTC-USD":  "Bitcoin",
        "ETH-USD":  "Ethereum",
        "BNB-USD":  "Binance Coin",
        "SOL-USD":  "Solana",
        "XRP-USD":  "XRP",
        "ADA-USD":  "Cardano",
        "DOGE-USD": "Dogecoin",
        "MATIC-USD":"Polygon",
        "DOT-USD":  "Polkadot",
        "AVAX-USD": "Avalanche",
    },

    " Market Indices": {
        "^NSEI":   "Nifty 50 (India)",
        "^BSESN":  "BSE Sensex (India)",
        "^GSPC":   "S&P 500 (US)",
        "^DJI":    "Dow Jones (US)",
        "^IXIC":   "NASDAQ (US)",
        "^FTSE":   "FTSE 100 (UK)",
        "^N225":   "Nikkei 225 (Japan)",
        "^HSI":    "Hang Seng (Hong Kong)",
        "^GDAXI":  "DAX (Germany)",
        "^FCHI":   "CAC 40 (France)",
    },

}

# Flat list of all tickers for search
ALL_TICKERS = {}
for sector, stocks in STOCKS.items():
    for ticker, name in stocks.items():
        ALL_TICKERS[ticker] = {"name": name, "sector": sector}


def get_all_sectors():
    return list(STOCKS.keys())


def get_stocks_by_sector(sector: str):
    return STOCKS.get(sector, {})


def search_stocks(query: str):
    query = query.upper().strip()
    exact = []
    starts = []
    contains = []

    for ticker, info in ALL_TICKERS.items():
        ticker_clean = ticker.replace('.NS', '').replace('.BO', '').replace('=X', '').replace('-USD', '').replace('=F', '')
        name_upper = info["name"].upper()

        item = {
            "ticker": ticker,
            "name": info["name"],
            "sector": info["sector"]
        }

        # Exact match
        if ticker_clean == query:
            exact.append(item)
        # Ticker starts with query
        elif ticker_clean.startswith(query):
            starts.append(item)
        # Name starts with query
        elif name_upper.startswith(query):
            starts.append(item)
        # Ticker or name contains query
        elif query in ticker_clean or query in name_upper:
            contains.append(item)

    # Return exact first, then starts with, then contains
    return (exact + starts + contains)[:10]