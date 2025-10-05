const { ethers } = require('ethers');
const database = require('../services/database');
const { formatUnits, parseUnits } = require('ethers');

class WalletController {
  async createWallet(req, res) {
    try {
      const { address } = req.body;
      
      console.log('Received address:', address);
      console.log('Address type:', typeof address);
      console.log('Address length:', address ? address.length : 'undefined');
      console.log('Ethers validation:', address ? ethers.isAddress(address) : 'no address');

      if (!address || !ethers.isAddress(address)) {
        console.log('Address validation failed');
        return res.status(400).json({ error: 'Invalid Ethereum address' });
      }

      // Check if wallet already exists
      const existingWallet = await database.getWallet(address);
      if (existingWallet) {
        // Mock USD price for demo
        const ethPriceUsd = 2000;
        const balanceUsd = parseFloat(formatUnits(existingWallet.balance_wei, 18)) * ethPriceUsd;

        return res.json({
          address: existingWallet.address,
          balance_eth: formatUnits(existingWallet.balance_wei, 18),
          balance_wei: existingWallet.balance_wei.toString(),
          balance_usd: balanceUsd.toFixed(2),
          price_usd_per_eth: ethPriceUsd.toString()
        });
      }

      // Generate random starting balance (1-10 ETH for demo)
      const mockBalance = Math.random() * 9 + 1; // 1-10 ETH
      const balanceWei = parseUnits(mockBalance.toString(), 18).toString();

      // Create wallet in database
      await database.createWallet(address, balanceWei);

      // Mock USD price for demo
      const ethPriceUsd = 2000;
      const balanceUsd = mockBalance * ethPriceUsd;

      res.json({
        address: address,
        balance_eth: mockBalance.toFixed(6),
        balance_wei: balanceWei,
        balance_usd: balanceUsd.toFixed(2),
        price_usd_per_eth: ethPriceUsd.toString()
      });
    } catch (error) {
      console.error('Create wallet error:', error);
      res.status(500).json({ error: 'Failed to create wallet' });
    }
  }

  async getBalance(req, res) {
    try {
      const { address } = req.query;

      if (!address || !ethers.isAddress(address)) {
        return res.status(400).json({ error: 'Invalid Ethereum address' });
      }

      const wallet = await database.getWallet(address);
      if (!wallet) {
        return res.status(404).json({ error: 'Wallet not found' });
      }

      // Mock USD price for demo
      const ethPriceUsd = 2000;
      const balanceUsd = parseFloat(formatUnits(wallet.balance_wei, 18)) * ethPriceUsd;

      res.json({
        balance_wei: wallet.balance_wei.toString(),
        balance_eth: formatUnits(wallet.balance_wei, 18),
        balance_usd: balanceUsd.toFixed(2),
        price_usd_per_eth: ethPriceUsd.toString()
      });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({ error: 'Failed to get balance' });
    }
  }
}

module.exports = new WalletController();
