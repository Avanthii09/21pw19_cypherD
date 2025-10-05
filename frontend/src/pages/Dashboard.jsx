import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ wallet, balance, onLogout, onRefreshBalance }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  const exportMnemonic = () => {
    const walletInfo = wallet;
    if (walletInfo && walletInfo.mnemonic) {
      navigator.clipboard.writeText(walletInfo.mnemonic);
      alert('Mnemonic phrase copied to clipboard!');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Dashboard</h2>
        
        {/* Balance Display */}
        <div className="balance-display">
          <div className="balance-amount">
            {balance ? parseFloat(balance.balance_eth).toFixed(4) : '0.0000'} ETH
          </div>
          {balance && (
            <div className="balance-usd">
              ≈ ${parseFloat(balance.balance_usd).toFixed(2)} USD
            </div>
          )}
        </div>

        {/* Wallet Address */}
        <div className="form-group">
          <label>Wallet Address:</label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: '#f8f9fa',
            padding: '0.75rem',
            borderRadius: '0px',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.9rem'
          }}>
            <span style={{ flex: 1, wordBreak: 'break-all' }}>
              {wallet.address}
            </span>
            <button 
              className="btn btn-secondary"
              onClick={() => copyToClipboard(wallet.address)}
              style={{ padding: '0.5rem', fontSize: '0.875rem' }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <Link to="/send" className="btn" style={{ textAlign: 'center' }}>
            Send Funds
          </Link>
          <Link to="/history" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            Transaction History
          </Link>
          <Link to="/settings" className="btn btn-secondary" style={{ textAlign: 'center' }}>
            Settings
          </Link>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button 
            className="btn btn-secondary"
            onClick={onRefreshBalance}
            style={{ fontSize: '0.875rem' }}
          >
            Refresh Balance
          </button>
          <button 
            className="btn btn-secondary"
            onClick={exportMnemonic}
            style={{ fontSize: '0.875rem' }}
          >
            Export Mnemonic
          </button>
          <button 
            className="btn btn-danger"
            onClick={onLogout}
            style={{ fontSize: '0.875rem' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {balance && (
        <div className="card">
          <h3>Account Information</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                ETH Balance
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                {parseFloat(balance.balance_eth).toFixed(6)} ETH
              </div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                USD Value
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                ${parseFloat(balance.balance_usd).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                ETH Price
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                ${parseFloat(balance.price_usd_per_eth).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
