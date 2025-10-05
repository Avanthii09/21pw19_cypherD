import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';

function History({ wallet }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const txList = await apiService.getTransactions(wallet.address);
      setTransactions(txList);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  }, [wallet.address]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTransactionType = (tx) => {
    return tx.sender.toLowerCase() === wallet.address.toLowerCase() ? 'Sent' : 'Received';
  };


  if (loading) {
    return (
      <div className="card">
        <h2>Transaction History</h2>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Transaction History</h2>
          <button 
            className="btn btn-secondary"
            onClick={loadTransactions}
            style={{ fontSize: '0.875rem' }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {transactions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#666'
          }}>
            <p>No transactions found.</p>
            <Link to="/send" className="btn">
              Send Your First Transaction
            </Link>
          </div>
        ) : (
          <div className="transaction-list">
            {transactions.map((tx) => (
              <div key={tx.tx_id} className="transaction-item">
                <div className="transaction-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: getTransactionType(tx) === 'Sent' ? '#dc3545' : '#28a745'
                    }}>
                      {getTransactionType(tx)}
                    </span>
                    <span className="transaction-status">
                      {tx.status}
                    </span>
                  </div>
                  <span className="transaction-id">
                    {tx.tx_id.slice(0, 8)}...{tx.tx_id.slice(-8)}
                  </span>
                </div>

                <div className="transaction-details">
                  <div className="transaction-detail">
                    <div className="transaction-detail-label">Amount</div>
                    <div className="transaction-detail-value" style={{
                      color: getTransactionType(tx) === 'Sent' ? '#dc3545' : '#28a745',
                      fontWeight: '600'
                    }}>
                      {getTransactionType(tx) === 'Sent' ? '-' : '+'}{parseFloat(tx.amount_eth).toFixed(6)} ETH
                    </div>
                  </div>

                  <div className="transaction-detail">
                    <div className="transaction-detail-label">Counterparty</div>
                    <div className="transaction-detail-value">
                      {getTransactionType(tx) === 'Sent' ? tx.recipient : tx.sender}
                    </div>
                  </div>

                  <div className="transaction-detail">
                    <div className="transaction-detail-label">USD Value</div>
                    <div className="transaction-detail-value">
                      {tx.amount_usd ? `$${parseFloat(tx.amount_usd).toFixed(2)}` : 'N/A'}
                    </div>
                  </div>

                  <div className="transaction-detail">
                    <div className="transaction-detail-label">Time</div>
                    <div className="transaction-detail-value">
                      {formatTimestamp(tx.timestamp)}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#666',
                  fontFamily: 'Courier New, monospace'
                }}>
                  TX ID: {tx.tx_id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <Link to="/send" className="btn">
            Send Funds
          </Link>
        </div>
      </div>
    </div>
  );
}

export default History;
