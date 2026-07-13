import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API = 'https://alphalab-3dvd.onrender.com';

function MetricCard({ label, value, sub, positive, explain }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div className="card" style={{ textAlign: 'center', position: 'relative' }}>
      <p style={{ fontSize: 12, color: '#757575', marginBottom: 8 }}>{label}</p>
      <p style={{
        fontSize: 22, fontWeight: 700,
        color: positive === undefined ? '#1a1a1a' : positive ? '#00b386' : '#e74c3c'
      }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#757575', marginTop: 4 }}>{sub}</p>}
      {explain && (
        <div
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 16, height: 16, borderRadius: '50%',
            background: '#f0f0f0', color: '#757575',
            fontSize: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'help'
          }}
        >?</div>
      )}
      {showTip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%',
          transform: 'translateX(-50%)', background: '#1a1a1a',
          borderRadius: 8, padding: '8px 12px',
          fontSize: 12, color: '#ffffff',
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

  const returnMsg = ret > 20 ? `Strong performance — ${ret}% return this period.`
    : ret > 10 ? `Decent performance — ${ret}% return this period.`
    : ret > 0  ? `Modest gains — only ${ret}% return.`
    : `Negative period — loss of ${Math.abs(ret)}%.`;

  const riskMsg = sharpe > 1.5 ? 'Risk was very well managed.'
    : sharpe > 1 ? 'Risk was acceptable.'
    : 'Returns did not justify the risk taken.';

  const drawdownMsg = drawdown < 10 ? 'Very stable — barely dipped.'
    : drawdown < 20 ? `Worst drop was ${drawdown}%. Manageable.`
    : `Worst drop was ${drawdown}%. Quite volatile.`;

  return (
    <div style={{
      background: '#f0faf6',
      border: '1px solid #b2dfdb',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: 24
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: '#00b386', marginBottom: 6, letterSpacing: '0.05em' }}>
        SUMMARY
      </p>
      <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.8 }}>
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
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
          Top performers in {sector.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '').replace(/[^\w\s—]/g, '').trim()}
        </p>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          style={{ maxWidth: 110, fontSize: 12, padding: '4px 8px', width: 'auto' }}
        >
          <option value="1mo">1 Month</option>
          <option value="3mo">3 Months</option>
          <option value="6mo">6 Months</option>
          <option value="1y">1 Year</option>
        </select>
      </div>

      {loading && (
        <p style={{ textAlign: 'center', padding: '1.5rem', color: '#757575', fontSize: 13 }}>
          Loading...
        </p>
      )}

      {chartData && chartData.stocks.map((stock, i) => (
        <div key={stock.ticker} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                background: '#f5f5f5', borderRadius: 4,
                padding: '1px 6px', fontSize: 11,
                fontWeight: 600, color: '#757575'
              }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{stock.ticker}</span>
              <span style={{ fontSize: 11, color: '#b0b0b0' }}>
                {stock.name.length > 20 ? stock.name.slice(0, 20) + '...' : stock.name}
              </span>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: stock.return_pct > 0 ? '#00b386' : '#e74c3c'
            }}>
              {stock.return_pct > 0 ? '+' : ''}{stock.return_pct}%
            </span>
          </div>
          <div style={{ background: '#f5f5f5', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.min(Math.abs(stock.return_pct) * 1.5, 100)}%`,
              background: stock.return_pct > 0 ? '#00b386' : '#e74c3c',
              borderRadius: 4,
              transition: 'width 0.8s ease',
              minWidth: 4
            }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span style={{ fontSize: 11, color: '#b0b0b0' }}>Vol: {stock.volatility}%</span>
            <span style={{ fontSize: 11, color: '#b0b0b0' }}>Price: {stock.current_price}</span>
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
    const res = await axios.get(`${API}/sector-stocks`, { params: { sector } });
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

  const cleanSectorName = (s) =>
    s.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
     .replace(/[^\w\s—]/g, '')
     .trim();

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

      {/* Hero */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #eeeeee',
        borderRadius: 16,
        padding: '1.75rem 2rem',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#00b386', animation: 'pulse 2s infinite' }}/>
              <span style={{ fontSize: 11, color: '#00b386', fontWeight: 600, letterSpacing: '0.08em' }}>LIVE MARKET DATA</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
              Analyze Any Asset, Anywhere
            </h2>
            <p style={{ color: '#757575', fontSize: 13, lineHeight: 1.6, maxWidth: 380 }}>
              Real-time data from Indian NSE, US markets, Forex, Crypto and Commodities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { label: 'Markets', value: '6+' },
              { label: 'Stocks', value: '100+' },
              { label: 'Strategies', value: '5' },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#00b386' }}>{value}</p>
                <p style={{ fontSize: 11, color: '#757575', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Stock Dashboard</h1>
        <p style={{ fontSize: 13, color: '#757575' }}>Search any stock — Indian NSE, US markets, Forex, Crypto, Commodities</p>
      </div>

      {/* Sector Pills */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 10, color: '#b0b0b0', marginBottom: 8, letterSpacing: '0.06em', fontWeight: 600 }}>BROWSE BY SECTOR</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sectors.map(s => (
            <button key={s} onClick={() => handleSectorChange(s)} style={{
              background: selectedSector === s ? '#00b386' : '#ffffff',
              color: selectedSector === s ? 'white' : '#757575',
              border: `1px solid ${selectedSector === s ? '#00b386' : '#e0e0e0'}`,
              borderRadius: 20, padding: '4px 12px',
              fontSize: 12, cursor: 'pointer', transition: 'all 0.15s'
            }}>{cleanSectorName(s)}</button>
          ))}
        </div>
      </div>

      {/* Sector Stocks */}
      {selectedSector && sectorStocks.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, color: '#b0b0b0', marginBottom: 8, letterSpacing: '0.06em', fontWeight: 600 }}>
            STOCKS IN {cleanSectorName(selectedSector).toUpperCase()}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sectorStocks.map(({ ticker: t, name }) => (
              <button key={t} onClick={() => fetchStock(t)} title={name} style={{
                background: ticker === t ? '#00b386' : '#ffffff',
                color: ticker === t ? 'white' : '#1a1a1a',
                border: `1px solid ${ticker === t ? '#00b386' : '#e0e0e0'}`,
                borderRadius: 8, padding: '5px 10px',
                fontSize: 12, cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <span style={{ fontWeight: 600 }}>
                  {t.replace('.NS','').replace('.BO','').replace('=X','').replace('-USD','')}
                </span>
                <span style={{ color: ticker === t ? 'rgba(255,255,255,0.7)' : '#b0b0b0', fontSize: 11, marginLeft: 5 }}>
                  {name.length > 12 ? name.slice(0,12)+'...' : name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sector Bar Chart */}
      <SectorBarChart sector={selectedSector} />

      {/* Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap', position: 'relative' }}>
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
              background: '#ffffff', border: '1px solid #eeeeee',
              borderRadius: 8, zIndex: 99,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              {searchResults.map(r => (
                <div key={r.ticker}
                  onClick={() => { fetchStock(r.ticker); setSearchQuery(''); }}
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
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ maxWidth: 120, width: 'auto' }}>
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

      <p style={{ fontSize: 11, color: '#b0b0b0', marginBottom: 24 }}>
        Click a sector to browse — or type any ticker directly
      </p>

      {error && (
        <div style={{
          background: '#fff5f5', border: '1px solid #fecaca',
          borderRadius: 8, padding: '1rem', marginBottom: 20, color: '#e74c3c', fontSize: 14
        }}>{error}</div>
      )}

      {summary && (
        <>
          <PlainEnglishSummary summary={summary} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12, marginBottom: 24
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
              explain="How much you would have made or lost investing at the start of this period."
            />
            <MetricCard
              label="Sharpe Ratio"
              value={summary.sharpe_ratio}
              sub={summary.sharpe_ratio > 1 ? 'Good' : summary.sharpe_ratio > 0 ? 'Average' : 'Poor'}
              positive={summary.sharpe_ratio > 1}
              explain="Return vs risk. Above 1 is good. How much reward for the risk you take?"
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
              sub={summary.annualized_vol < 20 ? 'Low risk' : summary.annualized_vol < 35 ? 'Medium risk' : 'High risk'}
              explain="How much the price jumps around. Low is stable, high is risky."
            />
            <MetricCard
              label="Best Day"
              value={`${summary.best_day_pct}%`}
              positive={true}
              explain="The single best day this stock had in the entire period."
            />
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Price Chart — {summary.ticker}</h2>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#757575' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 20, height: 2, background: '#00b386', display: 'inline-block' }}/>Price
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 20, height: 2, background: '#f59e0b', display: 'inline-block', borderTop: '2px dashed #f59e0b' }}/>SMA 20
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 20, height: 2, background: '#6366f1', display: 'inline-block', borderTop: '2px dashed #6366f1' }}/>SMA 50
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fill: '#b0b0b0', fontSize: 11 }}
                  tickFormatter={d => d.slice(5)}
                  interval={Math.floor(chartData.length / 6)} />
                <YAxis tick={{ fill: '#b0b0b0', fontSize: 11 }}
                  domain={['auto', 'auto']}
                  tickFormatter={v => `${currency}${v}`} />
                <Tooltip contentStyle={{
                  background: '#ffffff', border: '1px solid #eeeeee',
                  borderRadius: 8, fontSize: 13
                }} />
                <Line type="monotone" dataKey="price" stroke="#00b386" dot={false} strokeWidth={2} name="Price" />
                <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1.5} strokeDasharray="4 4" name="SMA 20" />
                <Line type="monotone" dataKey="sma50" stroke="#6366f1" dot={false} strokeWidth={1.5} strokeDasharray="4 4" name="SMA 50" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Period Summary</h3>
              {[
                ['Ticker', summary.ticker],
                ['Period', summary.period],
                ['Start Date', summary.start_date],
                ['End Date', summary.end_date],
                ['Trading Days', summary.total_days],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: 13, color: '#757575' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 14 }}>Risk Metrics</h3>
              {[
                ['Best Day', `${summary.best_day_pct}%`],
                ['Worst Day', `${summary.worst_day_pct}%`],
                ['Annualized Vol', `${summary.annualized_vol}%`],
                ['Max Drawdown', `${summary.max_drawdown_pct}%`],
                ['Sharpe Ratio', summary.sharpe_ratio],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ fontSize: 13, color: '#757575' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}