const express = require('express');
const walletController = require('./controllers/walletController');
const transferController = require('./controllers/transferController');

const router = express.Router();

// Wallet routes
router.post('/api/wallets', walletController.createWallet.bind(walletController));
router.get('/api/balance', walletController.getBalance.bind(walletController));
// Transfer routes
router.post('/api/transfer/initiate', transferController.initiateTransfer.bind(transferController));
router.post('/api/transfer/approve', transferController.approveTransfer.bind(transferController));
router.get('/api/transactions', transferController.getTransactions.bind(transferController));

// Price quote route
router.post('/api/price/quote', async (req, res) => {
  try {
    const { amount_usd } = req.body;
    
    if (!amount_usd || isNaN(amount_usd)) {
      return res.status(400).json({ error: 'Invalid USD amount' });
    }

    const skipApi = require('./services/skipApi');
    const quote = await skipApi.getEthFromUsd(parseFloat(amount_usd));
    
    res.json(quote);
  } catch (error) {
    console.error('Price quote error:', error);
    res.status(500).json({ error: 'Failed to get price quote' });
  }
});

// Notification route
router.post('/api/notify', async (req, res) => {
  try {
    const { address, tx_id, method, target } = req.body;
    
    if (!address || !tx_id || !method || !target) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notification = require('./services/notification');
    const result = await notification.sendNotification(address, { tx_id }, method, target);
    
    res.json({ status: 'queued', result });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;
