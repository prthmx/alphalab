from data import get_stock_data, get_multiple_stocks

# Test single stock
result = get_stock_data("AAPL", "1y")
print("=== AAPL Summary ===")
for key, val in result["summary"].items():
    print(f"  {key}: {val}")

print(f"\nTotal data points: {len(result['data'])}")
print(f"Latest RSI: {result['data'][-1]['rsi']}")

# Test multiple stocks
comparison = get_multiple_stocks(["AAPL", "TSLA", "GOOGL"], "1y")
print("\n=== Comparison ===")
for stock in comparison["comparison"]:
    print(stock)