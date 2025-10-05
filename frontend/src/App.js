import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import History from './pages/History';
import Settings from './pages/Settings';
import walletService from './services/wallet';
import apiService from './services/api';
import './App.css';

function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Try to load existing wallet
        const loadedWallet = walletService.loadWallet();
        if (loadedWallet) {
          setWallet(loadedWallet);
          await loadBalance(loadedWallet.address);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  const loadBalance = async (address) => {
    try {
      const balanceData = await apiService.getBalance(address);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load balance:', error);
      // Set a default balance structure if API fails
      setBalance({
        balance_eth: '0',
        balance_usd: '0',
        price_usd_per_eth: '2000'
      });
    }
  };

  const createWallet = async () => {
    try {
      const newWallet = walletService.generateWallet();
      walletService.saveWallet();
      
      // Register with backend
      await apiService.createWallet(newWallet.address);
      
      setWallet(newWallet);
      await loadBalance(newWallet.address);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet. Please try again.');
    }
  };

  const importWallet = async (mnemonic) => {
    try {
      const importedWallet = walletService.importWallet(mnemonic);
      walletService.saveWallet();
      
      // Register with backend
      await apiService.createWallet(importedWallet.address);
      
      setWallet(importedWallet);
      await loadBalance(importedWallet.address);
    } catch (error) {
      console.error('Failed to import wallet:', error);
      alert('Failed to import wallet. Please check your mnemonic phrase.');
    }
  };

  const logout = () => {
    walletService.clearWallet();
    setWallet(null);
    setBalance(null);
  };

  const refreshBalance = () => {
    if (wallet) {
      loadBalance(wallet.address);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading wallet...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>Mock Web3 Wallet</h1>
          {wallet && (
            <div className="wallet-info">
              <span className="wallet-address">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
              {balance && (
                <span className="wallet-balance">
                  {parseFloat(balance.balance_eth).toFixed(4)} ETH
                </span>
              )}
            </div>
          )}
        </header>

        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                wallet ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Home onCreateWallet={createWallet} onImportWallet={importWallet} />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                wallet ? (
                  <Dashboard 
                    wallet={wallet} 
                    balance={balance} 
                    onLogout={logout}
                    onRefreshBalance={refreshBalance}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/send" 
              element={
                wallet ? (
                  <Send 
                    wallet={wallet} 
                    balance={balance}
                    onTransactionComplete={refreshBalance}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/history" 
              element={
                wallet ? (
                  <History wallet={wallet} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/settings" 
              element={
                wallet ? (
                  <Settings wallet={wallet} onLogout={logout} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
