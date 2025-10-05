import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import walletService from '../services/wallet';

function Settings({ wallet, onLogout }) {
  const [settings, setSettings] = useState({
    email: '',
    telegramChatId: ''
  });
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // In a real app, you'd save these to the backend
      localStorage.setItem('walletSettings', JSON.stringify(settings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const exportMnemonic = () => {
    const walletInfo = walletService.getWalletInfo();
    if (walletInfo && walletInfo.mnemonic) {
      navigator.clipboard.writeText(walletInfo.mnemonic);
      alert('Mnemonic phrase copied to clipboard!');
    }
  };

  const downloadMnemonic = () => {
    const walletInfo = walletService.getWalletInfo();
    if (walletInfo && walletInfo.mnemonic) {
      const data = {
        address: walletInfo.address,
        mnemonic: walletInfo.mnemonic,
        exportedAt: new Date().toISOString(),
        note: 'Keep this information secure and never share it with anyone.'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wallet-backup-${wallet.address.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Settings</h2>
        
        <form onSubmit={handleSaveSettings}>
          <div className="form-group">
            <label htmlFor="email">Notification Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={settings.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              disabled={saving}
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Email address for transaction notifications
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="telegramChatId">Telegram Chat ID:</label>
            <input
              type="text"
              id="telegramChatId"
              name="telegramChatId"
              className="form-control"
              value={settings.telegramChatId}
              onChange={handleInputChange}
              placeholder="@username or chat ID"
              disabled={saving}
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Telegram chat ID for notifications (optional)
            </small>
          </div>

          <button 
            type="submit" 
            className="btn"
            disabled={saving}
            style={{ marginBottom: '2rem' }}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Wallet Information</h3>
        
        <div className="form-group">
          <label>Wallet Address:</label>
          <div style={{ 
            background: '#f8f9fa',
            padding: '0.75rem',
            borderRadius: '0px',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.9rem',
            wordBreak: 'break-all'
          }}>
            {wallet.address}
          </div>
        </div>

        <div className="form-group">
          <label>Mnemonic Phrase:</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowMnemonic(!showMnemonic)}
              style={{ fontSize: '0.875rem' }}
            >
              {showMnemonic ? 'Hide' : 'Show'} Mnemonic
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={exportMnemonic}
              style={{ fontSize: '0.875rem' }}
            >
              Copy to Clipboard
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={downloadMnemonic}
              style={{ fontSize: '0.875rem' }}
            >
              Download Backup
            </button>
          </div>
          
          {showMnemonic && (
            <div style={{ 
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '0px',
              padding: '1rem',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.9rem',
              wordBreak: 'break-all',
              marginBottom: '1rem'
            }}>
              {wallet.mnemonic}
            </div>
          )}
          
          <div style={{ 
            background: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '0px',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#721c24'
          }}>
            <strong>⚠️ Security Warning:</strong> Never share your mnemonic phrase with anyone. 
            Anyone with access to this phrase can control your wallet.
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Account Actions</h3>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <button 
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout? You will need to re-import your wallet.')) {
                onLogout();
              }
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <h3>About</h3>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <p><strong>Mock Web3 Wallet</strong> - Version 1.0.0</p>
          <p>This is a demonstration wallet for educational purposes.</p>
          <p>Built with React, Express, and ethers.js</p>
          <p style={{ marginBottom: 0 }}>
            <strong>Note:</strong> This wallet is for demo purposes only. 
            Do not use with real funds or sensitive information.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
