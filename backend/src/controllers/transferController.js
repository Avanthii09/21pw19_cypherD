const { ethers } = require('ethers');
const { v4: uuidv4 } = require('uuid');
const database = require('../services/database');
const notification = require('../services/notification');
const { formatUnits, parseUnits } = require('ethers');
class TransferController {
  async initiateTransfer(req, res) {
    try {
      const { sender, recipient, amount, amount_type } = req.body;

      // Validation
      if (!sender || !recipient || !amount || !amount_type) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!ethers.isAddress(sender) || !ethers.isAddress(recipient)) {
        return res.status(400).json({ error: 'Invalid Ethereum addresses' });
      }

      if (sender === recipient) {
        return res.status(400).json({ error: 'Sender and recipient cannot be the same' });
      }

      let amountWei, amountEth, amountUsd = null;
      const ethPriceUsd = 2000; // Mock ETH price

      if (amount_type === 'ETH') {
        amountEth = parseFloat(amount).toFixed(6);
        amountWei = parseUnits(amountEth, 18).toString();
        amountUsd = (parseFloat(amountEth) * ethPriceUsd).toFixed(2);
      } else if (amount_type === 'USD') {
        amountUsd = parseFloat(amount).toFixed(2);
        amountEth = (parseFloat(amountUsd) / ethPriceUsd).toFixed(6);
        amountWei = parseUnits(amountEth, 18).toString();
      } else {
        return res.status(400).json({ error: 'Invalid amount type. Use ETH or USD' });
      }

      // Check sender balance
      const senderWallet = await database.getWallet(sender);
      if (!senderWallet) {
        return res.status(404).json({ error: 'Sender wallet not found' });
      }

      if (BigInt(senderWallet.balance_wei) < BigInt(amountWei)) {
        return res.status(400).json({ error: 'Insufficient funds' });
      }

      // Create approval
      const approvalId = uuidv4();
      const expiresAt = new Date(Date.now() + (process.env.APP_APPROVAL_EXPIRY_SECONDS || 30) * 1000);

      const approvalData = {
        approval_id: approvalId,
        sender: sender,
        recipient: recipient,
        amount_wei: amountWei,
        amount_usd: amountUsd ? amountUsd.toString() : null,
        expires_at: expiresAt.toISOString()
      };

      await database.createApproval(approvalData);

      // Create canonical message for signing
      const message = this.createApprovalMessage({
        sender,
        recipient,
        amount_wei: amountWei,
        amount_eth: amountEth.toString(),
        amount_usd: amountUsd ? amountUsd.toString() : null,
        nonce: approvalId,
        expires_at: expiresAt.toISOString()
      });

      res.json({
        approval_id: approvalId,
        message: message,
        expires_at: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Initiate transfer error:', error);
      res.status(500).json({ error: 'Failed to initiate transfer' });
    }
  }

  async approveTransfer(req, res) {
    try {
      const { approval_id, message, signature } = req.body;

      if (!approval_id || !message || !signature) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Get approval
      const approval = await database.getApproval(approval_id);
      if (!approval) {
        return res.status(404).json({ error: 'Approval not found' });
      }

      // Check if already used
      if (approval.used) {
        return res.status(400).json({ error: 'Approval already used' });
      }

      // Check if expired
      if (new Date() > new Date(approval.expires_at)) {
        return res.status(408).json({ error: 'Approval expired' });
      }

      // Verify signature
      try {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== approval.sender.toLowerCase()) {
          return res.status(401).json({ error: 'Invalid signature' });
        }
      } catch (error) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // For demo purposes, we skip the USD re-quote check since we use a fixed ETH price
      // In production, you would re-quote here and check price tolerance

      // Execute transfer atomically
      await database.transferFunds(approval.sender, approval.recipient, approval.amount_wei);

      // Mark approval as used
      await database.markApprovalUsed(approval_id);

      // Create transaction record
      const txId = uuidv4();
      const txData = {
        tx_id: txId,
        sender: approval.sender,
        recipient: approval.recipient,
        amount_wei: approval.amount_wei,
        amount_usd: approval.amount_usd,
        status: 'success'
      };

      await database.createTransaction(txData);

      // Get updated balance
      const updatedWallet = await database.getWallet(approval.sender);
      const newBalanceEth = formatUnits(updatedWallet.balance_wei, 18);

      // Send notification (disabled for debugging)
      // notification.sendNotification(approval.sender, {
      //   ...txData,
      //   amount_eth: formatUnits(approval.amount_wei, 18),
      //   new_balance_eth: newBalanceEth
      // }).catch(err => console.error('Notification failed:', err));

      res.json({
        tx_id: txId,
        status: 'success',
        new_balance_eth: newBalanceEth
      });
    } catch (error) {
      console.error('Approve transfer error:', error);
      res.status(500).json({ error: 'Failed to approve transfer' });
    }
  }

  createApprovalMessage(data) {
    // Create canonical message with sorted keys
    const sortedData = {
      action: 'transfer',
      sender: data.sender,
      recipient: data.recipient,
      amount_wei: data.amount_wei,
      amount_eth: data.amount_eth,
      amount_usd: data.amount_usd,
      nonce: data.nonce,
      expires_at: data.expires_at
    };

    return JSON.stringify(sortedData);
  }

  async getTransactions(req, res) {
    try {
      const { address } = req.query;

      if (!address || !ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
      }

      const transactions = await database.getTransactions(address);
      
      // Format transactions for response
      const formattedTransactions = transactions.map(tx => ({
        tx_id: tx.tx_id,
        sender: tx.sender,
        recipient: tx.recipient,
        amount_wei: tx.amount_wei,
        amount_eth: formatUnits(tx.amount_wei, 18),
        amount_usd: tx.amount_usd,
        timestamp: tx.timestamp,
        status: tx.status
      }));

      res.json(formattedTransactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
}

module.exports = new TransferController();
