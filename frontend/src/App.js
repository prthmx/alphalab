import React, { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Backtester from './pages/Backtester';
import Portfolio from './pages/Portfolio';

const navItems = [
  { id: 'dashboard',  icon: '📊', label: 'Dashboard' },
  { id: 'backtester', icon: '⚡', label: 'Backtester' },
  { id: 'portfolio',  icon: '💼', label: 'Portfolio' },
];

function MarketStatusBar() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcMin = now.getUTCMinutes();
  const utcTime = utcHour + utcMin / 60;
  const day = now.getUTCDay();
  const isWeekday = day >= 1 && day <= 5;
  const nseOpen = isWeekday && utcTime >= 3.75 && utcTime < 10;
  const nyseOpen = isWeekday && utcTime >= 14.5 && utcTime < 21;

  const Tag = ({ label, open }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 11, color: open ? '#10b981' : '#6b7280'
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: open ? '#10b981' : '#4b5563',
        boxShadow: open ? '0 0 6px #10b981' : 'none'
      }}/>
      {label} {open ? 'Open' : 'Closed'}
    </div>
  );

  return (
    <div style={{
      background: '#0a0a0f',
      borderBottom: '1px solid #1a1a2e',
      padding: '6px 2rem',
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
      <Tag label="🇮🇳 NSE" open={nseOpen} />
      <Tag label="🇺🇸 NYSE" open={nyseOpen} />
      <Tag label="💱 Forex" open={isWeekday} />
      <Tag label="🪙 Crypto" open={true} />
      <Tag label="🥇 Commodities" open={isWeekday} />
      <div style={{ marginLeft: 'auto', fontSize: 11, color: '#4b5563' }}>
        {now.toUTCString().slice(0, 25)}
      </div>
    </div>
  );
}

function LandingPage({ onEnter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.05 }}>
        {[...Array(20)].map((_, i) => (
          <line key={`v${i}`} x1={`${i * 5}%`} y1="0" x2={`${i * 5}%`} y2="100%" stroke="#4f46e5" strokeWidth="1"/>
        ))}
        {[...Array(20)].map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${i * 5}%`} x2="100%" y2={`${i * 5}%`} stroke="#4f46e5" strokeWidth="1"/>
        ))}
      </svg>

      <div style={{
        position: 'absolute',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)'
      }}/>

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <svg width="80" height="80" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#4f46e5" strokeWidth="2.5"/>
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#4f46e5" strokeWidth="2.5" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#4f46e5" strokeWidth="2.5" transform="rotate(120 50 50)"/>
            <circle cx="50" cy="50" r="8" fill="#4f46e5"/>
            <circle cx="95" cy="50" r="4" fill="#10b981"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 800, marginBottom: 8,
          background: 'linear-gradient(90deg, #4f46e5, #818cf8, #10b981)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px'
        }}>AlphaLab</h1>

        <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 48, letterSpacing: '0.1em' }}>
          QUANTITATIVE FINANCE RESEARCH PLATFORM
        </p>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          {[
            { icon: '📊', title: 'Real Market Data', desc: 'Live prices from NSE, NYSE, Forex & Crypto' },
            { icon: '⚡', title: 'Strategy Backtester', desc: 'Test 4 pro trading strategies on real history' },
            { icon: '💼', title: 'Portfolio Optimizer', desc: 'Nobel Prize winning Markowitz optimization' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#12121e', border: '1px solid #2a2a3e',
              borderRadius: 12, padding: '1.25rem', width: 180, textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 48 }}>
          {[
            { value: '100+', label: 'Stocks' },
            { value: '6',    label: 'Markets' },
            { value: '4',    label: 'Strategies' },
            { value: '∞',   label: 'Data Points' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#4f46e5' }}>{value}</p>
              <p style={{ fontSize: 12, color: '#6b7280' }}>{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onEnter}
          style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white', border: 'none',
            padding: '1rem 3rem', borderRadius: 12,
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 0 30px rgba(79,70,229,0.4)',
            transition: 'all 0.2s', letterSpacing: '0.05em'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Start Analyzing →
        </button>

        <p style={{ color: '#4b5563', fontSize: 12, marginTop: 16 }}>
          Free • No signup required • Real data
        </p>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <MarketStatusBar />
      <div className="app-layout">

        <aside className="sidebar">
          <div className="sidebar-logo">
            <svg width="36" height="36" viewBox="0 0 100 100">
              <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#4f46e5" strokeWidth="2.5" opacity="0.9"/>
              <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#4f46e5" strokeWidth="2.5" opacity="0.9" transform="rotate(60 50 50)"/>
              <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#4f46e5" strokeWidth="2.5" opacity="0.9" transform="rotate(120 50 50)"/>
              <circle cx="50" cy="50" r="8" fill="#4f46e5"/>
              <circle cx="95" cy="50" r="4" fill="#10b981"/>
            </svg>
            <div className="sidebar-brand">
              <span className="brand-alpha">Alpha</span>
              <span className="brand-lab">Lab</span>
            </div>
          </div>

          <div className="sidebar-divider" />

          <nav className="sidebar-nav">
            <p className="sidebar-section-label">MENU</p>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-btn ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-divider" />

          <div className="sidebar-footer">
            <p className="sidebar-section-label">MARKETS</p>
            <p className="sidebar-info">🇮🇳 NSE / BSE</p>
            <p className="sidebar-info">🇺🇸 NYSE / NASDAQ</p>
            <p className="sidebar-info">🌍 Global</p>
            <p className="sidebar-info">💱 Forex</p>
            <p className="sidebar-info">🥇 Commodities</p>
            <p className="sidebar-info">🪙 Crypto</p>
          </div>
        </aside>

        <main className="main-content">
          {page === 'dashboard'  && <Dashboard />}
          {page === 'backtester' && <Backtester />}
          {page === 'portfolio'  && <Portfolio />}
        </main>

      </div>
    </div>
  );
}

export default App;