import React, { useState } from 'react';
import axios from 'axios';
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'https://alphalab-3dvd.onrender.com';
function PortfolioHero() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0d1a 50%, #0d0d1a 100%)',
      border: '1px solid #2a2a3e',
      borderRadius: 16,
      padding: '2rem',
      marginBottom: 32,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.06 }}>
        {[...Array(10)].map((_, i) => (
          <line key={i} x1={`${i * 12}%`} y1="0" x2={`${i * 12}%`} y2="100%" stroke="#7c3aed" strokeWidth="1"/>
        ))}
        {[...Array(6)].map((_, i) => (
          <line key={i} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#7c3aed" strokeWidth="1"/>
        ))}
      </svg>

      {/* Fake pie chart */}
      <svg style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', opacity: 0.15 }} width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#4f46e5" strokeWidth="20" strokeDasharray="100 152" strokeDashoffset="0"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="60 192" strokeDashoffset="-100"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" strokeWidth="20" strokeDasharray="40 212" strokeDashoffset="-160"/>
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="52 200" strokeDashoffset="-200"/>
      </svg>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            background: '#7c3aed', borderRadius: 8,
            padding: '4px 10px', fontSize: 11,
            color: 'white', fontWeight: 600
          }}>PORTFOLIO OPTIMIZER</div>
        </div>

        <h2 style={{
          fontSize: 26, fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(90deg, #ffffff, #7c3aed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Nobel Prize Winning Math
        </h2>

        <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 420, lineHeight: 1.7, marginBottom: 16 }}>
          Harry Markowitz won the 1990 Nobel Prize for proving that the right
          combination of stocks matters more than picking the best individual stock.
          AlphaLab runs this math for you instantly.
        </p>

        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { icon: '🎯', text: 'Maximum return for minimum risk' },
            { icon: '📐', text: 'Efficient Frontier visualization' },
            { icon: '🔗', text: 'Correlation analysis' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlainEnglishPortfolio({ data }) {
  const sharpe = data.sharpe_ratio;
  const ret = data.expected_annual_return;
  const vol = data.annual_volatility;
  const topStock = data.weights[0];

  const sharpeMsg = sharpe > 1.5
    ? `🏆 Excellent portfolio! Sharpe of ${sharpe} means strong returns for the risk taken.`
    : sharpe > 1
    ? `✅ Good portfolio. Sharpe of ${sharpe} — returns justify the risk.`
    : `⚠️ Sharpe of ${sharpe} is below 1. Consider adding more diversified stocks.`;

  return (
    <div style={{
      background: '#0d0d1a',
      border: '1px solid #7c3aed',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: 24
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', marginBottom: 8 }}>
        💼 Plain English Result
      </p>
      <p style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.9 }}>
        The optimizer picked <strong style={{ color: 'white' }}>{data.weights.length} stocks</strong> out of {data.tickers.length} analyzed.
        Best choice was <strong style={{ color: '#7c3aed' }}>{topStock?.ticker}</strong> at {topStock?.weight_pct}% of the portfolio.
        Expected return is <strong style={{ color: '#10b981' }}>{ret}% per year</strong> with <strong style={{ color: '#ef4444' }}>{vol}% volatility</strong>.
        {sharpeMsg}
        {' '}Think of it like this: for every unit of risk you take, you get {sharpe} units of reward.
      </p>
    </div>
  );
}

export default function Portfolio() {
  const [tickerInput, setTickerInput] = useState('');
  const [period, setPeriod] = useState('2y');
  const [capital, setCapital] = useState('100000');
  const [data, setData] = useState(null);
  const [frontier, setFrontier] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const optimize = async () => {
    const tickers = tickerInput.split(',').map(t => t.trim()).filter(Boolean);
    if (tickers.length < 2) {
      setError('Please enter at least 2 tickers separated by commas');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    setFrontier(null);
    try {
      const [optRes, frontRes] = await Promise.all([
        axios.post(`${API}/portfolio/optimize`, {
          tickers, period,
          portfolio_value: parseInt(capital)
        }),
        axios.post(`${API}/portfolio/frontier`, {
          tickers, period,
          portfolio_value: parseInt(capital)
        })
      ]);
      setData(optRes.data);
      setFrontier(frontRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div>
      <PortfolioHero />

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Portfolio Optimizer
      </h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Markowitz Modern Portfolio Theory — Nobel Prize winning optimization
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          placeholder="Tickers: AAPL, GOOGL, TSLA, TCS.NS"
          value={tickerInput}
          onChange={e => setTickerInput(e.target.value)}
          style={{ maxWidth: 350 }}
        />
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ maxWidth: 120 }}>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
        </select>
        <input
          placeholder="Capital (₹)"
          value={capital}
          onChange={e => setCapital(e.target.value)}
          style={{ maxWidth: 150 }}
        />
        <button className="btn" onClick={optimize} disabled={loading}>
          {loading ? 'Optimizing...' : 'Optimize Portfolio'}
        </button>
      </div>

      <p className="muted" style={{ fontSize: 12, marginBottom: 24 }}>
        Separate tickers with commas — mix Indian and US stocks freely!
      </p>

      {error && (
        <div style={{
          background: '#1f0a0a', border: '1px solid #ef4444',
          borderRadius: 8, padding: '1rem', marginBottom: 24, color: '#ef4444'
        }}>{error}</div>
      )}

      {data && (
        <>
          <PlainEnglishPortfolio data={data} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            {[
              { label: 'Expected Annual Return', value: `${data.expected_annual_return}%`, positive: true },
              { label: 'Annual Volatility',      value: `${data.annual_volatility}%`,      positive: false },
              { label: 'Sharpe Ratio',           value: data.sharpe_ratio,                 positive: data.sharpe_ratio > 1 },
              { label: 'Leftover Cash',          value: `₹${data.leftover_cash}` },
            ].map(({ label, value, positive }) => (
              <div key={label} className="card" style={{ textAlign: 'center' }}>
                <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{label}</p>
                <p style={{
                  fontSize: 22, fontWeight: 700,
                  color: positive === undefined ? 'white' : positive ? '#10b981' : '#ef4444'
                }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
              Optimal Portfolio Weights
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a3e' }}>
                  {['Ticker', 'Weight', 'Amount Invested', 'Shares to Buy', 'Price'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px',
                      color: '#6b7280', fontWeight: 500, fontSize: 12
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.weights.map(w => (
                  <tr key={w.ticker} style={{ borderBottom: '1px solid #1a1a2e' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#7c3aed' }}>{w.ticker}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: `${w.weight_pct}%`, maxWidth: 100,
                          height: 6, background: '#7c3aed',
                          borderRadius: 3, minWidth: 4
                        }}/>
                        <span>{w.weight_pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: '#10b981' }}>₹{w.amount_invested?.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{w.shares_to_buy} shares</td>
                    <td style={{ padding: '12px' }}>${w.current_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {frontier && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
                Efficient Frontier
              </h2>
              <p className="muted" style={{ fontSize: 13, marginBottom: 6 }}>
                Each dot = a possible portfolio. The curve = optimal portfolios.
              </p>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
                🟣 Purple dots = efficient portfolios &nbsp;|&nbsp; 🟡 Yellow dots = individual stocks
              </p>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                  <XAxis
                    dataKey="volatility" name="Risk"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={v => `${v}%`}
                    label={{ value: 'Risk %', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="return" name="Return"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickFormatter={v => `${v}%`}
                    label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#12121e', border: '1px solid #2a2a3e', borderRadius: 8 }}
                    formatter={(v, name) => [`${v}%`, name]}
                  />
                  <Scatter name="Efficient Frontier" data={frontier.frontier} fill="#7c3aed" opacity={0.8}/>
                  <Scatter name="Individual Stocks"  data={frontier.individual_stocks} fill="#f59e0b" opacity={0.9}/>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              What is the Efficient Frontier? (Plain English)
            </h3>
            <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.8 }}>
              Imagine plotting every possible way to split your money across these stocks on a graph.
              The curved line at the top is the Efficient Frontier — these are the <strong style={{ color: 'white' }}>best possible portfolios</strong>.
              Any portfolio below that curve means you're taking unnecessary risk.
              The yellow dots show individual stocks — notice how the optimized portfolio (purple)
              often has better risk/return than any single stock alone.
              That's the power of diversification. 🎯
            </p>
          </div>
        </>
      )}
    </div>
  );
}