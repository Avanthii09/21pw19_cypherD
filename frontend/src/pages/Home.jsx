import React, { useState } from 'react';

function Home({ onCreateWallet, onImportWallet }) {
  const [showImport, setShowImport] = useState(false);
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      await onCreateWallet();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportWallet = async (e) => {
    e.preventDefault();
    if (!mnemonic.trim()) {
      alert('Please enter a mnemonic phrase');
      return;
    }

    setLoading(true);
    try {
      await onImportWallet(mnemonic.trim());
    } catch (error) {
      console.error('Failed to import wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const demoMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  return (
    <div className="card">
      <h2>Welcome to Mock Web3 Wallet</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Create a new wallet or import an existing one using a 12-word mnemonic phrase.
      </p>

      {!showImport ? (
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <button 
              className="btn" 
              onClick={handleCreateWallet}
              disabled={loading}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Creating...' : 'Create New Wallet'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowImport(true)}
              style={{ width: '100%' }}
            >
              Import Existing Wallet
            </button>
          </div>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '0px',
            border: '1px solid #e9ecef',
            marginTop: '2rem'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#666' }}>
              Demo Mnemonic (for testing):
            </h3>
            <code style={{ 
              display: 'block', 
              wordBreak: 'break-all',
              fontSize: '0.9rem',
              color: '#333'
            }}>
              {demoMnemonic}
            </code>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#666', 
              marginBottom: 0,
              marginTop: '0.5rem'
            }}>
              You can use this mnemonic to test the import functionality.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleImportWallet}>
          <div className="form-group">
            <label htmlFor="mnemonic">Enter your 12-word mnemonic phrase:</label>
            <textarea
              id="mnemonic"
              className="form-control"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"
              rows="3"
              style={{ resize: 'vertical' }}
            />
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              Enter the 12 words separated by spaces
            </small>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Importing...' : 'Import Wallet'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setShowImport(false);
                setMnemonic('');
              }}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        background: '#e3f2fd',
        borderRadius: '0px',
        border: '1px solid #e9ecef',
        fontSize: '0.875rem'
      }}>
      
      </div>
    </div>
  );
}

export default Home;

