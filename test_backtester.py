from backtester import run_backtest

strategies = ["sma_cross", "rsi", "macd", "bollinger"]

for strategy in strategies:
    print(f"\n{'='*50}")
    result = run_backtest("AAPL", strategy=strategy, period="2y")
    m = result["metrics"]
    print(f"Strategy: {m['strategy'].upper()}")
    print(f"Final Value:  ₹{m['final_value']:,.0f}")
    print(f"Total Return: {m['total_return_pct']}%")
    print(f"Buy & Hold: {m['buy_hold_pct']}%")
    print(f"Alpha: {m['alpha']}%")
    print(f"Sharpe Ratio: {m['sharpe_ratio']}")
    print(f"Max Drawdown: {m['max_drawdown_pct']}%")
    print(f"Trades: {m['num_buys']} buys, {m['num_sells']} sells")
    print(f"Win Rate: {m['win_rate_pct']}%")