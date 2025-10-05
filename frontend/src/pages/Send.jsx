import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApprovalModal from '../components/ApprovalModal';
import apiService from '../services/api';
import walletService from '../services/wallet';

function Send({ wallet, balance, onTransactionComplete }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    recipient: '',
    amount: '',
    amountType: 'ETH'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvalData, setApprovalData] = useState(null);
  const [ethQuote, setEthQuote] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAmountTypeChange = (e) => {
    const amountType = e.target.value;
    setFormData(prev => ({
      ...prev,
      amountType
    }));
    setEthQuote(null);
    setError('');
  };

  const validateForm = () => {
    if (!formData.recipient.trim()) {
      setError('Please enter recipient address');
      return false;
    }

    if (!walletService.isValidAddress(formData.recipient)) {
      setError('Invalid Ethereum address');
      return false;
    }

    if (formData.recipient.toLowerCase() === wallet.address.toLowerCase()) {
      setError('Cannot send to yourself');
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (formData.amountType === 'ETH') {
      const amountEth = parseFloat(formData.amount);
      const balanceEth = parseFloat(balance.balance_eth);
      if (amountEth > balanceEth) {
        setError('Insufficient funds');
        return false;
      }
    }

    return true;
  };

  const getEthQuote = async () => {
    if (formData.amountType === 'USD' && formData.amount) {
      try {
        const quote = await apiService.getPriceQuote(formData.amount);
        setEthQuote(quote);
        return quote;
      } catch (error) {
        console.error('Failed to get quote:', error);
        setError('Failed to get price quote');
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get ETH quote if USD
      let finalAmount = formData.amount;
      if (formData.amountType === 'USD') {
        const quote = await getEthQuote();
        if (!quote) {
          setLoading(false);
          return;
        }
        finalAmount = quote.amount_eth;
      }

      // Initiate transfer
      const transferData = {
        sender: wallet.address,
        recipient: formData.recipient,
        amount: finalAmount,
        amount_type: formData.amountType
      };

      const approval = await apiService.initiateTransfer(transferData);
      setApprovalData(approval);
    } catch (error) {
      console.error('Transfer initiation failed:', error);
      setError(error.response?.data?.error || 'Failed to initiate transfer');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalComplete = async (signature) => {
    try {
      await apiService.approveTransfer({
        approval_id: approvalData.approval_id,
        message: approvalData.message,
        signature: signature
      });

      alert('Transfer completed successfully!');
      onTransactionComplete();
      navigate('/dashboard');
    } catch (error) {
      console.error('Transfer approval failed:', error);
      setError(error.response?.data?.error || 'Failed to approve transfer');
    }
  };

  const handleApprovalCancel = () => {
    setApprovalData(null);
  };

  return (
    <div>
      <div className="card">
        <h2>Send Funds</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipient">Recipient Address:</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              className="form-control"
              value={formData.recipient}
              onChange={handleInputChange}
              placeholder="0xa5433465C587F2B0809CE0D3F51dF8b2A31D9459"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amountType">Amount Type:</label>
            <select
              id="amountType"
              name="amountType"
              className="form-control"
              value={formData.amountType}
              onChange={handleAmountTypeChange}
              disabled={loading}
            >
              <option value="ETH">ETH</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">
              Amount ({formData.amountType}):
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              className="form-control"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder={formData.amountType === 'ETH' ? '0.5' : '1000'}
              step="any"
              min="0"
              disabled={loading}
            />
            {formData.amountType === 'USD' && ethQuote && (
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: '#e3f2fd',
                borderRadius: '0px',
                fontSize: '0.875rem'
              }}>
                ≈ {parseFloat(ethQuote.amount_eth).toFixed(6)} ETH
              </div>
            )}
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Processing...' : 'Request Approval'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Balance Info */}
      {balance && (
        <div className="card">
          <h3>Current Balance</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>ETH</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                {parseFloat(balance.balance_eth).toFixed(6)}
              </div>
            </div>
            <div>
              <div style={{ color: '#666', fontSize: '0.875rem' }}>USD</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                ${parseFloat(balance.balance_usd).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalData && (
        <ApprovalModal
          approvalData={approvalData}
          wallet={wallet}
          onComplete={handleApprovalComplete}
          onCancel={handleApprovalCancel}
        />
      )}
    </div>
  );
}

export default Send;
