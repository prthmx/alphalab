import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'https://alphalab-3dvd.onrender.com';

function BacktestHero() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #eeeeee',
      borderRadius: 16,
      padding: '1.75rem 2rem',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00b386' }}/>
        <span style={{ fontSize: 11, color: '#00b386', fontWeight: 600, letterSpacing: '0.08em' }}>STRATEGY BACKTESTER</span>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
        Test Before You Invest
      </h2>
      <p style={{ color: '#757575', fontSize: 13, lineHeight: 1.6, maxWidth: 420, marginBottom: 20 }}>
        Run professional trading strategies on real historical data. See exactly how much money you would have made — before risking a single rupee.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { name: 'SMA Cross', desc: 'Golden Cross signal' },
          { name: 'RSI', desc: 'Buy panic, sell greed' },
          { name: 'MACD', desc: 'Momentum shifts' },
          { name: 'Bollinger', desc: 'Statistical bands' },
          { name: 'SMC', desc: 'Smart money flow' },
        ].map(({ name, desc }) => (
          <div key={name} style={{
            background: '#f5f5f5',
            border: '1px solid #eeeeee',
            borderRadius: 8, padding: '6px 12px',
            fontSize: 12
          }}>
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{name}</span>
            <span style={{ color: '#b0b0b0', marginLeft: 6 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlainEnglishBacktest({ metrics }) {
  const alpha = metrics.alpha;
  const winRate = metrics.win_rate_pct;
  const sharpe = metrics.sharpe_ratio;

  const alphaMsg = alpha > 10
    ? `Strong result — this strategy beat buy-and-hold by ${alpha}%. It actually added value.`
    : alpha > 0
    ? `This strategy slightly outperformed buy-and-hold by ${alpha}%.`
    : `Buy-and-hold would have been better by ${Math.abs(alpha)}%. The strategy did not add value.`;

  const winMsg = winRate > 60
    ? `Win rate of ${winRate}% is strong — more than 6 out of 10 trades were profitable.`
    : winRate > 50
    ? `Win rate of ${winRate}% is decent — just above 50/50.`
    : `Win rate of ${winRate}% means more losing trades than winning ones.`;

  const sharpeMsg = sharpe > 1.5
    ? `Risk was very well managed (Sharpe ${sharpe}).`
    : sharpe > 1
    ? `Risk was acceptable (Sharpe ${sharpe}).`
    : `Risk was not justified by returns (Sharpe ${sharpe}).`;

  return (
    <div style={{
      background: '#f0faf6',
      border: '1px solid #b2dfdb',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: 20
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#00b386', marginBottom: 6, letterSpacing: '0.05em' }}>
        RESULT SUMMARY
      </p>
      <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.9 }}>
        {alphaMsg}<br/>
        {winMsg}<br/>
        {sharpeMsg}
      </p>
    </div>
  );
}

export default function Backtester() {
  const [ticker, setTicker] = useState('');
  const [strategy, setStrategy] = useState('sma_cross');
  const [period, setPeriod] = useState('2y');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setTicker(query);
    if (query.length < 1) { setSearchResults([]); return; }
    try {
      const res = await fetch(`${API}/search?q=${query}`);
      const json = await res.json();
      setSearchResults(json.results);
    } catch {
      setSearchResults([]);
    }
  };

  const runBacktest = async (t) => {
    const tickerToUse = t || ticker;
    if (!tickerToUse) return;
    setLoading(true);
    setError('');
    setData(null);
    setSearchResults([]);
    try {
      const res = await axios.post(`${API}/backtest`, {
        ticker: tickerToUse.toUpperCase(),
        strategy,
        period
      });
      setData(res.data);
      setTicker(tickerToUse.toUpperCase());
      setSearchQuery('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  const metrics = data?.metrics;
  const chartData = data?.data?.filter(d => d.Close && d.portfolio_value)
    .map(d => ({
      date: d.Date,
      portfolio: parseFloat(d.portfolio_value?.toFixed(2)),
    }));

  const strategyDescriptions = {
    sma_cross: 'Buy when the 50-day average crosses above the 200-day average (Golden Cross). Sell on Death Cross. Classic institutional signal.',
    rsi: 'Buy when RSI drops below 30 — stock beaten down too much. Sell when RSI rises above 70 — stock gone up too much. Buy the panic, sell the greed.',
    macd: 'Buy when MACD line crosses above the signal line — momentum building. Sell when it crosses below. One of the most used indicators worldwide.',
    bollinger: 'Buy when price touches the lower Bollinger Band — statistically cheap. Sell at the upper band — statistically expensive. Pure math based trading.',
    smc: 'Smart Money Concepts — detects institutional order blocks, fair value gaps, break of structure and liquidity sweeps. Follows where big money moves.',
  };

  return (
    <div>
      <BacktestHero />

      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
        Strategy Backtester
      </h1>
      <p style={{ fontSize: 13, color: '#757575', marginBottom: 20 }}>
        Test trading strategies on real historical data
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'relative', maxWidth: 240 }}>
          <input
            placeholder="Ticker (e.g. AAPL, TCS.NS)"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runBacktest()}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: '#ffffff', border: '1px solid #eeeeee',
              borderRadius: 8, zIndex: 99,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              {searchResults.map(r => (
                <div key={r.ticker}
                  onClick={() => { runBacktest(r.ticker); setSearchQuery(r.name); }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{r.ticker}</span>
                  <span style={{ color: '#b0b0b0', fontSize: 12, marginLeft: 8 }}>{r.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ maxWidth: 200, width: 'auto' }}>
          <option value="sma_cross">SMA Crossover</option>
          <option value="rsi">RSI Mean Reversion</option>
          <option value="macd">MACD</option>
          <option value="bollinger">Bollinger Bands</option>
          <option value="smc">SMC — Smart Money Concepts</option>
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ maxWidth: 120, width: 'auto' }}>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
        </select>
        <button className="btn" onClick={() => runBacktest()} disabled={loading}>
          {loading ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      <div style={{
        background: '#f9fafb', border: '1px solid #eeeeee',
        borderRadius: 8, padding: '0.75rem 1rem',
        marginBottom: 20, fontSize: 13, color: '#757575'
      }}>
        {strategyDescriptions[strategy]}
      </div>

      {error && (
        <div style={{
          background: '#fff5f5', border: '1px solid #fecaca',
          borderRadius: 8, padding: '1rem', marginBottom: 20, color: '#e74c3c', fontSize: 14
        }}>{error}</div>
      )}

      {metrics && (
        <>
          <PlainEnglishBacktest metrics={metrics} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12, marginBottom: 24
          }}>
            {[
              { label: 'Final Value',     value: `₹${metrics.final_value?.toLocaleString()}`, positive: metrics.total_return_pct > 0 },
              { label: 'Strategy Return', value: `${metrics.total_return_pct}%`,               positive: metrics.total_return_pct > 0 },
              { label: 'Buy & Hold',      value: `${metrics.buy_hold_pct}%`,                   positive: metrics.buy_hold_pct > 0 },
              { label: 'Alpha',           value: `${metrics.alpha}%`,                          positive: metrics.alpha > 0 },
              { label: 'Sharpe Ratio',    value: metrics.sharpe_ratio,                         positive: metrics.sharpe_ratio > 1 },
              { label: 'Max Drawdown',    value: `${metrics.max_drawdown_pct}%`,               positive: false },
              { label: 'Win Rate',        value: `${metrics.win_rate_pct}%`,                   positive: metrics.win_rate_pct > 50 },
              { label: 'Trades',          value: `${metrics.num_buys}B / ${metrics.num_sells}S` },
            ].map(({ label, value, positive }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: '#757575', marginBottom: 8 }}>{label}</p>
                <p style={{
                  fontSize: 20, fontWeight: 700,
                  color: positive === undefined ? '#1a1a1a' : positive ? '#00b386' : '#e74c3c'
                }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>
              Portfolio Value Over Time
            </h2>
            <p style={{ fontSize: 13, color: '#757575', marginBottom: 20 }}>
              Starting capital ₹1,00,000
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#b0b0b0', fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fill: '#b0b0b0', fontSize: 11 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #eeeeee',
                    borderRadius: 8, fontSize: 13
                  }}
                  formatter={v => [`₹${v.toLocaleString()}`, '']}
                />
                <Line type="monotone" dataKey="portfolio" stroke="#00b386" dot={false} strokeWidth={2} name="Portfolio" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}