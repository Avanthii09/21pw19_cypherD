import React, { useState, useEffect } from 'react';
import walletService from '../services/wallet';

function ApprovalModal({ approvalData, wallet, onComplete, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (!approvalData) return;

    const expiresAt = new Date(approvalData.expires_at);
    const updateCountdown = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [approvalData]);

  const handleSignAndConfirm = async () => {
    if (!approvalData || !wallet) return;

    setSigning(true);
    try {
      const signature = await walletService.signMessage(approvalData.message);
      onComplete(signature);
    } catch (error) {
      console.error('Failed to sign message:', error);
      alert('Failed to sign message. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!approvalData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Approve Transfer</h3>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="approval-countdown">
            {timeLeft > 0 ? (
              <>Expires in: {formatTime(timeLeft)}</>
            ) : (
              <>Approval Expired</>
            )}
          </div>

          <div className="form-group">
            <label>Transfer Details:</label>
            <div style={{ 
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '0px',
              fontSize: '0.9rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>From:</strong> {approvalData.sender}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>To:</strong> {approvalData.recipient}
              </div>
              <div>
                <strong>Amount:</strong> {approvalData.amount_eth} ETH
                {approvalData.amount_usd && (
                  <span> (${approvalData.amount_usd} USD)</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Message to Sign:</label>
            <div className="approval-message">
              {approvalData.message}
            </div>
            <small style={{ color: '#666', fontSize: '0.875rem' }}>
              This message will be signed with your wallet to authorize the transfer.
            </small>
          </div>

          <div style={{ 
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            <strong>⚠️ Security Notice:</strong> Please verify the transfer details above before signing. 
            This action cannot be undone.
          </div>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={signing}
          >
            Cancel
          </button>
          <button 
            className="btn btn-success"
            onClick={handleSignAndConfirm}
            disabled={signing || timeLeft <= 0}
          >
            {signing ? 'Signing...' : 'Sign & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApprovalModal;
