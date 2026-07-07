import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'http://127.0.0.1:8000';

function BacktestHero() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d0d1a 0%, #0d1a0d 50%, #0d0d1a 100%)',
      border: '1px solid #2a2a3e',
      borderRadius: 16,
      padding: '2rem',
      marginBottom: 32,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background grid */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.06 }}>
        {[...Array(10)].map((_, i) => (
          <line key={i} x1={`${i * 12}%`} y1="0" x2={`${i * 12}%`} y2="100%" stroke="#10b981" strokeWidth="1"/>
        ))}
        {[...Array(6)].map((_, i) => (
          <line key={i} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#10b981" strokeWidth="1"/>
        ))}
      </svg>

      {/* Fake line chart in background */}
      <svg style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.12 }} width="280" height="100" viewBox="0 0 280 100">
        <polyline
          points="0,80 40,60 80,70 120,40 160,50 200,25 240,35 280,15"
          fill="none" stroke="#10b981" strokeWidth="2.5"/>
        <polyline
          points="0,80 40,60 80,70 120,40 160,50 200,25 240,35 280,15"
          fill="url(#green-fade)" stroke="none"/>
        <defs>
          <linearGradient id="green-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            background: '#10b981', borderRadius: 8,
            padding: '4px 10px', fontSize: 11,
            color: 'white', fontWeight: 600
          }}>STRATEGY BACKTESTER</div>
        </div>

        <h2 style={{
          fontSize: 26, fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(90deg, #ffffff, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Test Before You Invest
        </h2>

        <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 420, lineHeight: 1.7, marginBottom: 20 }}>
          Run professional trading strategies on real historical data.
          See exactly how much money you would have made — before risking a single rupee.
        </p>

        {/* Strategy cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { name: 'SMA Cross', icon: '📈', desc: 'Golden Cross signal' },
            { name: 'RSI',       icon: '🔄', desc: 'Buy panic, sell greed' },
            { name: 'MACD',      icon: '⚡', desc: 'Momentum shifts' },
            { name: 'Bollinger', icon: '📊', desc: 'Statistical bands' },
          ].map(({ name, icon, desc }) => (
            <div key={name} style={{
              background: '#0a0a0f',
              border: '1px solid #2a2a3e',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 12
            }}>
              <span style={{ marginRight: 6 }}>{icon}</span>
              <span style={{ fontWeight: 600 }}>{name}</span>
              <span style={{ color: '#6b7280', marginLeft: 6 }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlainEnglishBacktest({ metrics }) {
  const alpha = metrics.alpha;
  const winRate = metrics.win_rate_pct;
  const sharpe = metrics.sharpe_ratio;

  const alphaMsg = alpha > 10
    ? `🏆 Excellent! This strategy beat buy-and-hold by ${alpha}%. It actually added value.`
    : alpha > 0
    ? `✅ This strategy slightly outperformed buy-and-hold by ${alpha}%.`
    : `❌ Buy-and-hold would have been better by ${Math.abs(alpha)}%. The strategy didn't add value.`;

  const winMsg = winRate > 60
    ? `Win rate of ${winRate}% is strong — more than 6 out of 10 trades were profitable.`
    : winRate > 50
    ? `Win rate of ${winRate}% is decent — just above 50/50.`
    : `Win rate of ${winRate}% means more losing trades than winning ones.`;

  const sharpeMsg = sharpe > 1.5
    ? `Risk was very well managed (Sharpe ${sharpe}). 🟢`
    : sharpe > 1
    ? `Risk was acceptable (Sharpe ${sharpe}). 🟡`
    : `Risk wasn't justified by returns (Sharpe ${sharpe}). 🔴`;

  return (
    <div style={{
      background: '#0d0d1a',
      border: '1px solid #10b981',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: 24
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginBottom: 8 }}>
        ⚡ Plain English Result
      </p>
      <p style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.9 }}>
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
      const data = await res.json();
      setSearchResults(data.results);
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
      price: parseFloat(d.Close?.toFixed(2)),
    }));

  const strategyDescriptions = {
    sma_cross: '📈 Buy when 50-day average crosses above 200-day average (Golden Cross). Sell on Death Cross. Classic institutional signal.',
    rsi:       '🔄 Buy when RSI drops below 30 (stock beaten down too much). Sell when RSI rises above 70 (stock gone up too much). Buy the panic, sell the greed.',
    macd:      '⚡ Buy when MACD line crosses above signal line (momentum building). Sell when it crosses below. One of the most used indicators worldwide.',
    bollinger: '📊 Buy when price touches lower Bollinger Band (statistically cheap). Sell at upper band (statistically expensive). Pure math based trading.'
  };

  return (
    <div>
      <BacktestHero />

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Strategy Backtester
      </h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Test trading strategies on real historical data
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'relative', maxWidth: 220 }}>
          <input
            placeholder="Ticker (e.g. AAPL, TCS.NS)"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runBacktest()}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: '#12121e', border: '1px solid #2a2a3e',
              borderRadius: 8, zIndex: 99
            }}>
              {searchResults.map(r => (
                <div
                  key={r.ticker}
                  onClick={() => { runBacktest(r.ticker); setSearchQuery(r.name); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: '1px solid #1a1a2e'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a2e'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.ticker}</span>
                  <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>{r.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <select value={strategy} onChange={e => setStrategy(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="sma_cross">SMA Crossover</option>
          <option value="rsi">RSI Mean Reversion</option>
          <option value="macd">MACD</option>
          <option value="bollinger">Bollinger Bands</option>
          <option value="smc">SMC — Smart Money Concepts</option>
        </select>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ maxWidth: 120 }}>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
        </select>
        <button className="btn" onClick={() => runBacktest()} disabled={loading}>
          {loading ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {/* Strategy Description */}
      <div style={{
        background: '#0d0d1a', border: '1px solid #2a2a3e',
        borderRadius: 8, padding: '0.75rem 1rem',
        marginBottom: 24, fontSize: 13, color: '#6b7280'
      }}>
        {strategyDescriptions[strategy]}
        smc: '🏦 Smart Money Concepts — detects institutional Order Blocks, Fair Value Gaps, Break of Structure and Liquidity Sweeps. Follows where big money moves.',
      </div>

      {error && (
        <div style={{
          background: '#1f0a0a', border: '1px solid #ef4444',
          borderRadius: 8, padding: '1rem', marginBottom: 24, color: '#ef4444'
        }}>{error}</div>
      )}

      {metrics && (
        <>
          <PlainEnglishBacktest metrics={metrics} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            {[
              { label: 'Final Value',      value: `₹${metrics.final_value?.toLocaleString()}`,  positive: metrics.total_return_pct > 0 },
              { label: 'Strategy Return',  value: `${metrics.total_return_pct}%`,                positive: metrics.total_return_pct > 0 },
              { label: 'Buy & Hold',       value: `${metrics.buy_hold_pct}%`,                    positive: metrics.buy_hold_pct > 0 },
              { label: 'Alpha',            value: `${metrics.alpha}%`,                           positive: metrics.alpha > 0 },
              { label: 'Sharpe Ratio',     value: metrics.sharpe_ratio,                          positive: metrics.sharpe_ratio > 1 },
              { label: 'Max Drawdown',     value: `${metrics.max_drawdown_pct}%`,                positive: false },
              { label: 'Win Rate',         value: `${metrics.win_rate_pct}%`,                    positive: metrics.win_rate_pct > 50 },
              { label: 'Trades',           value: `${metrics.num_buys}B / ${metrics.num_sells}S` },
            ].map(({ label, value, positive }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{label}</p>
                <p style={{
                  fontSize: 20, fontWeight: 700,
                  color: positive === undefined ? 'white' : positive ? '#10b981' : '#ef4444'
                }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Portfolio Value Over Time
            </h2>
            <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
              Starting capital ₹1,00,000
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#12121e',
                    border: '1px solid #2a2a3e',
                    borderRadius: 8
                  }}
                  formatter={v => [`₹${v.toLocaleString()}`, '']}
                />
                <Line type="monotone" dataKey="portfolio" stroke="#10b981" dot={false} strokeWidth={2} name="Portfolio" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}