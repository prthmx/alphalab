import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'http://127.0.0.1:8000';

function MetricCard({ label, value, sub, positive, explain }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
      <p className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{label}</p>
      <p style={{
        fontSize: 22, fontWeight: 700,
        color: positive === undefined ? 'white' : positive ? '#10b981' : '#ef4444'
      }}>{value}</p>
      {sub && <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>{sub}</p>}
      {explain && (
        <div
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 16, height: 16, borderRadius: '50%',
            background: '#2a2a3e', color: '#6b7280',
            fontSize: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'help'
          }}
        >?</div>
      )}
      {showTip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%',
          transform: 'translateX(-50%)', background: '#1a1a2e',
          border: '1px solid #2a2a3e', borderRadius: 8,
          padding: '8px 12px', fontSize: 12, color: '#9ca3af',
          width: 200, zIndex: 99, textAlign: 'left', lineHeight: 1.6
        }}>{explain}</div>
      )}
    </div>
  );
}

function PlainEnglishSummary({ summary }) {
  const ret = summary.total_return_pct;
  const sharpe = summary.sharpe_ratio;
  const drawdown = Math.abs(summary.max_drawdown_pct);

  const returnMsg = ret > 20 ? `📈 Excellent! ${ret}% return this period.`
    : ret > 10 ? `👍 Good. ${ret}% return this period.`
    : ret > 0  ? `😐 Okay. Only ${ret}% return.`
    : `📉 Loss of ${Math.abs(ret)}% this period.`;

  const riskMsg = sharpe > 1.5 ? 'Risk was very well managed.'
    : sharpe > 1 ? 'Risk was acceptable.'
    : 'Return did not justify the risk taken.';

  const drawdownMsg = drawdown < 10 ? 'Very stable — barely dipped. 🟢'
    : drawdown < 20 ? `Worst drop was ${drawdown}%. Manageable. 🟡`
    : `Worst drop was ${drawdown}%. Quite volatile. 🔴`;

  return (
    <div style={{
      background: '#0d0d1a', border: '1px solid #4f46e5',
      borderRadius: 12, padding: '1.25rem', marginBottom: 24
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5', marginBottom: 8 }}>
        📊 Plain English Summary
      </p>
      <p style={{ fontSize: 14, color: '#e5e7eb', lineHeight: 1.8 }}>
        {returnMsg} {riskMsg} {drawdownMsg}
      </p>
    </div>
  );
}

function SectorBarChart({ sector }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('3mo');

  useEffect(() => {
    if (!sector) return;
    setLoading(true);
    setChartData(null);
    axios.get(`${API}/sector-performance`, {
      params: { sector, period }
    }).then(res => {
      setChartData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [sector, period]);

  if (!sector) return null;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>
          📊 Top 5 Performers — {sector}
        </h3>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          style={{ maxWidth: 120, fontSize: 12, padding: '4px 8px' }}
        >
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading sector data...
        </div>
      )}

      {chartData && chartData.stocks.map((stock, i) => (
        <div key={stock.ticker} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                background: '#1a1a2e', borderRadius: 4,
                padding: '2px 6px', fontSize: 12, fontWeight: 600
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{stock.ticker}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                {stock.name.length > 20 ? stock.name.slice(0, 20) + '…' : stock.name}
              </span>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: stock.return_pct > 0 ? '#10b981' : '#ef4444'
            }}>
              {stock.return_pct > 0 ? '+' : ''}{stock.return_pct}%
            </span>
          </div>
          <div style={{ background: '#1a1a2e', borderRadius: 4, height: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(Math.abs(stock.return_pct) * 1.5, 100)}%`,
              background: stock.return_pct > 0
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : 'linear-gradient(90deg, #ef4444, #dc2626)',
              borderRadius: 4,
              transition: 'width 0.8s ease',
              minWidth: 4
            }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span style={{ fontSize: 11, color: '#4b5563' }}>Vol: {stock.volatility}%</span>
            <span style={{ fontSize: 11, color: '#4b5563' }}>Price: {stock.current_price}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [ticker, setTicker] = useState('');
  const [period, setPeriod] = useState('1y');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState('');
  const [sectorStocks, setSectorStocks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get(`${API}/sectors`).then(res => {
      setSectors(res.data.sectors);
    });
  }, []);

  const handleSectorChange = async (sector) => {
    setSelectedSector(sector);
    setSearchResults([]);
    setSectorStocks([]);
    if (!sector) return;
    const res = await axios.get(`${API}/sector-stocks`, {
      params: { sector }
    });
    setSectorStocks(res.data.stocks);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setTicker(query);
    if (query.length < 1) { setSearchResults([]); return; }
    try {
      const res = await axios.get(`${API}/search`, { params: { q: query } });
      setSearchResults(res.data.results);
    } catch {
      setSearchResults([]);
    }
  };

  const fetchStock = async (t) => {
    const tickerToFetch = t || ticker;
    if (!tickerToFetch) return;
    setLoading(true);
    setError('');
    setData(null);
    setSearchResults([]);
    try {
      const res = await axios.post(`${API}/stock`, {
        ticker: tickerToFetch.toUpperCase(),
        period
      });
      setData(res.data);
      setTicker(tickerToFetch.toUpperCase());
      setSearchQuery('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
    setLoading(false);
  };

  const getCurrency = (t) => {
    if (!t) return '$';
    if (t.includes('.NS') || t.includes('.BO')) return '₹';
    if (t.includes('=X') || t.includes('=F')) return '';
    return '$';
  };

  const summary = data?.summary;
  const currency = getCurrency(summary?.ticker);

  const chartData = data?.data?.filter(d => d.Close && d.Date).map(d => ({
    date: d.Date,
    price: parseFloat(d.Close?.toFixed(2)),
    sma20: d.sma_20 ? parseFloat(d.sma_20.toFixed(2)) : null,
    sma50: d.sma_50 ? parseFloat(d.sma_50.toFixed(2)) : null,
  }));

  return (
    <div>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0d1a 0%, #1a1040 50%, #0d0d1a 100%)',
        border: '1px solid #2a2a3e', borderRadius: 16,
        padding: '2rem', marginBottom: 32,
        position: 'relative', overflow: 'hidden'
      }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.08 }}>
          {[...Array(10)].map((_, i) => (
            <line key={`v${i}`} x1={`${i * 12}%`} y1="0" x2={`${i * 12}%`} y2="100%" stroke="#4f46e5" strokeWidth="1"/>
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`} stroke="#4f46e5" strokeWidth="1"/>
          ))}
        </svg>
        <svg style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.15 }} width="300" height="120" viewBox="0 0 300 120">
          {[
            [20,80,40,90,30],[50,60,70,70,45],[80,70,100,85,55],
            [110,50,130,65,40],[140,55,160,75,42],[170,40,190,60,30],
            [200,30,220,55,20],[230,20,250,45,10],[260,25,280,50,15],
          ].map(([x,low,xr,high,open],i) => (
            <g key={i}>
              <line x1={x+10} y1={low} x2={x+10} y2={high} stroke="#4f46e5" strokeWidth="1.5"/>
              <rect x={x} y={open} width="20" height={Math.abs(high-open-10)}
                fill={i%2===0?'#4f46e5':'#10b981'} rx="2"/>
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', top: 16, right: 180, opacity: 0.4 }}>
          <div style={{ background: '#10b981', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>NIFTY +1.2% 🟢</div>
        </div>
        <div style={{ position: 'absolute', top: 48, right: 160, opacity: 0.4 }}>
          <div style={{ background: '#4f46e5', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>S&P 500 +0.8% 🟢</div>
        </div>
        <div style={{ position: 'absolute', top: 80, right: 175, opacity: 0.4 }}>
          <div style={{ background: '#ef4444', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>BTC -2.1% 🔴</div>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ background: '#4f46e5', borderRadius: 8, padding: '4px 10px', fontSize: 11, color: 'white', fontWeight: 600 }}>LIVE MARKET DATA</div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}/>
          </div>
          <h2 style={{
            fontSize: 26, fontWeight: 800, marginBottom: 8,
            background: 'linear-gradient(90deg, #ffffff, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Analyze Any Asset, Anywhere</h2>
          <p style={{ color: '#9ca3af', fontSize: 14, maxWidth: 420, lineHeight: 1.7 }}>
            Real-time data from Indian NSE, US markets, Forex, Crypto and Commodities.
            Professional quant tools — made simple for everyone.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            {[
              { label: 'Markets', value: '6+' },
              { label: 'Stocks',  value: '100+' },
              { label: 'Strategies', value: '5' },
              { label: 'Data Points', value: '∞' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5' }}>{value}</p>
                <p style={{ fontSize: 11, color: '#6b7280' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Stock Dashboard</h1>
        <p className="muted">Search any stock — Indian NSE, US markets, Forex, Crypto, Commodities</p>
      </div>

      {/* Sector Pills */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, letterSpacing: '0.05em' }}>BROWSE BY SECTOR</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {sectors.map(s => (
            <button key={s} onClick={() => handleSectorChange(s)} style={{
              background: selectedSector === s ? '#4f46e5' : '#1a1a2e',
              color: selectedSector === s ? 'white' : '#9ca3af',
              border: `1px solid ${selectedSector === s ? '#4f46e5' : '#2a2a3e'}`,
              borderRadius: 20, padding: '4px 12px',
              fontSize: 12, cursor: 'pointer', transition: 'all 0.2s'
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Sector Stock Buttons */}
      {selectedSector && sectorStocks.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, letterSpacing: '0.05em' }}>
            STOCKS IN {selectedSector.toUpperCase()}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {sectorStocks.map(({ ticker: t, name }) => (
              <button key={t} onClick={() => fetchStock(t)} title={name} style={{
                background: ticker === t ? '#4f46e5' : '#12121e',
                color: ticker === t ? 'white' : '#e5e7eb',
                border: `1px solid ${ticker === t ? '#4f46e5' : '#2a2a3e'}`,
                borderRadius: 8, padding: '6px 12px',
                fontSize: 12, cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <span style={{ fontWeight: 600 }}>
                  {t.replace('.NS','').replace('.BO','').replace('=X','').replace('-USD','')}
                </span>
                <span style={{ color: '#6b7280', fontSize: 11, marginLeft: 6 }}>
                  {name.length > 12 ? name.slice(0,12)+'…' : name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sector Bar Chart */}
      <SectorBarChart sector={selectedSector} />

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap', position: 'relative' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <input
            placeholder="Search stock name or ticker..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStock()}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: '#12121e', border: '1px solid #2a2a3e',
              borderRadius: 8, zIndex: 99
            }}>
              {searchResults.map(r => (
                <div key={r.ticker}
                  onClick={() => { fetchStock(r.ticker); setSearchQuery(''); }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #1a1a2e' }}
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
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ maxWidth: 120 }}>
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
          <option value="2y">2 Years</option>
          <option value="5y">5 Years</option>
        </select>
        <button className="btn" onClick={() => fetchStock()} disabled={loading}>
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>

      <p className="muted" style={{ fontSize: 11, marginBottom: 24 }}>
        Click a sector to browse — or type any ticker directly
      </p>

      {error && (
        <div style={{
          background: '#1f0a0a', border: '1px solid #ef4444',
          borderRadius: 8, padding: '1rem', marginBottom: 24, color: '#ef4444'
        }}>{error}</div>
      )}

      {summary && (
        <>
          <PlainEnglishSummary summary={summary} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16, marginBottom: 32
          }}>
            <MetricCard
              label="Current Price"
              value={`${currency}${summary.current_price}`}
              sub={`Started at ${currency}${summary.start_price}`}
              explain="The latest closing price of this stock."
            />
            <MetricCard
              label="Total Return"
              value={`${summary.total_return_pct}%`}
              positive={summary.total_return_pct > 0}
              explain="How much money you would have made or lost if you invested at the start of this period."
            />
            <MetricCard
              label="Sharpe Ratio"
              value={summary.sharpe_ratio}
              sub={summary.sharpe_ratio > 1 ? '🟢 Good' : summary.sharpe_ratio > 0 ? '🟡 Average' : '🔴 Poor'}
              positive={summary.sharpe_ratio > 1}
              explain="Measures return vs risk. Above 1 is good. How much reward for the risk you take?"
            />
            <MetricCard
              label="Max Drawdown"
              value={`${summary.max_drawdown_pct}%`}
              sub="Worst peak to trough"
              positive={false}
              explain="Worst possible loss if you bought at the top and sold at the bottom."
            />
            <MetricCard
              label="Volatility"
              value={`${summary.annualized_vol}%`}
              sub={summary.annualized_vol < 20 ? '🟢 Low risk' : summary.annualized_vol < 35 ? '🟡 Medium risk' : '🔴 High risk'}
              explain="How much the price jumps around. Low = stable, High = risky."
            />
            <MetricCard
              label="Best Day"
              value={`${summary.best_day_pct}%`}
              positive={true}
              explain="The single best day this stock had in the entire period."
            />
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600 }}>Price Chart — {summary.ticker}</h2>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <span style={{ color: '#4f46e5' }}>— Price</span>
                <span style={{ color: '#10b981' }}>-- SMA 20</span>
                <span style={{ color: '#f59e0b' }}>-- SMA 50</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                  interval={Math.floor(chartData.length / 6)} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }}
                  domain={['auto', 'auto']}
                  tickFormatter={v => `${currency}${v}`} />
                <Tooltip contentStyle={{ background: '#12121e', border: '1px solid #2a2a3e', borderRadius: 8 }} />
                <Line type="monotone" dataKey="price" stroke="#4f46e5" dot={false} strokeWidth={2} name="Price" />
                <Line type="monotone" dataKey="sma20" stroke="#10b981" dot={false} strokeWidth={1.5} strokeDasharray="4 4" name="SMA 20" />
                <Line type="monotone" dataKey="sma50" stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 4" name="SMA 50" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Period Summary</h3>
              {[
                ['Ticker', summary.ticker],
                ['Period', summary.period],
                ['Start Date', summary.start_date],
                ['End Date', summary.end_date],
                ['Trading Days', summary.total_days],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
                  <span className="muted" style={{ fontSize: 13 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Risk Metrics</h3>
              {[
                ['Best Day', `${summary.best_day_pct}%`],
                ['Worst Day', `${summary.worst_day_pct}%`],
                ['Annualized Vol', `${summary.annualized_vol}%`],
                ['Max Drawdown', `${summary.max_drawdown_pct}%`],
                ['Sharpe Ratio', summary.sharpe_ratio],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a2e' }}>
                  <span className="muted" style={{ fontSize: 13 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}