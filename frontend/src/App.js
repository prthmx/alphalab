import React, { useState } from 'react';
import './App.css';
import Dashboard from './pages/Dashboard';
import Backtester from './pages/Backtester';
import Portfolio from './pages/Portfolio';

const navItems = [
  { id: 'dashboard',  icon: '▦', label: 'Dashboard' },
  { id: 'backtester', icon: '↻', label: 'Backtester' },
  { id: 'portfolio',  icon: '◈', label: 'Portfolio' },
];

function LandingPage({ onEnter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="56" height="56" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#00b386" strokeWidth="2.5"/>
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#00b386" strokeWidth="2.5" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#00b386" strokeWidth="2.5" transform="rotate(120 50 50)"/>
            <circle cx="50" cy="50" r="7" fill="#00b386"/>
            <circle cx="95" cy="50" r="4" fill="#1a1a1a"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: 44, fontWeight: 700, marginBottom: 6,
          color: '#1a1a1a', letterSpacing: '-1.5px',
        }}>AlphaLab</h1>

        <p style={{
          color: '#757575', fontSize: 14, marginBottom: 40,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Quantitative Finance Research
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { title: 'Market Data', desc: 'Live prices from NSE, NYSE, Forex and Crypto' },
            { title: 'Backtester', desc: 'Test 5 trading strategies on real historical data' },
            { title: 'Portfolio', desc: 'Nobel Prize winning Markowitz optimization' },
          ].map(({ title, desc }) => (
            <div key={title} style={{
              background: '#ffffff',
              border: '1px solid #eeeeee',
              borderRadius: 12,
              padding: '1.1rem',
              width: 155,
              textAlign: 'left'
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 5, color: '#1a1a1a' }}>{title}</p>
              <p style={{ fontSize: 12, color: '#757575', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginBottom: 40 }}>
          {[
            { value: '100+', label: 'Stocks' },
            { value: '6', label: 'Markets' },
            { value: '5', label: 'Strategies' },
            { value: '∞', label: 'Data' },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#00b386' }}>{value}</p>
              <p style={{ fontSize: 12, color: '#757575', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onEnter}
          className="btn"
          style={{ padding: '0.875rem 3rem', fontSize: 15 }}
        >
          Start Analyzing
        </button>

        <p style={{ color: '#b0b0b0', fontSize: 12, marginTop: 14 }}>
          Free — no signup required — real data
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
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 100 100">
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#00b386" strokeWidth="3"/>
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#00b386" strokeWidth="3" transform="rotate(60 50 50)"/>
            <ellipse cx="50" cy="50" rx="45" ry="18" fill="none" stroke="#00b386" strokeWidth="3" transform="rotate(120 50 50)"/>
            <circle cx="50" cy="50" r="7" fill="#00b386"/>
            <circle cx="95" cy="50" r="4" fill="#1a1a1a"/>
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

        <div style={{ marginTop: 'auto' }} />
      </aside>

      <main className="main-content">
        {page === 'dashboard'  && <Dashboard />}
        {page === 'backtester' && <Backtester />}
        {page === 'portfolio'  && <Portfolio />}
      </main>
    </div>
  );
}

export default App;