import { ethers } from 'ethers';

class WalletService {
  constructor() {
    this.wallet = null;
    this.mnemonic = null;
  }

  // Generate a new wallet
  generateWallet() {
    const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16));
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    this.mnemonic = mnemonic;
    this.wallet = wallet;
    
    return {
      address: wallet.address,
      mnemonic: mnemonic,
      privateKey: wallet.privateKey
    };
  }

  // Import wallet from mnemonic
  importWallet(mnemonic) {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      this.mnemonic = mnemonic;
      this.wallet = wallet;
      
      return {
        address: wallet.address,
        mnemonic: mnemonic,
        privateKey: wallet.privateKey
      };
    } catch (error) {
      throw new Error('Invalid mnemonic phrase');
    }
  }

  // Sign a message
  async signMessage(message) {
    if (!this.wallet) {
      throw new Error('No wallet loaded');
    }
    
    try {
      const signature = await this.wallet.signMessage(message);
      return signature;
    } catch (error) {
      throw new Error('Failed to sign message');
    }
  }

  // Get current wallet info
  getWalletInfo() {
    if (!this.wallet) {
      return null;
    }
    
    return {
      address: this.wallet.address,
      mnemonic: this.mnemonic
    };
  }

  // Save wallet to localStorage
  saveWallet() {
    if (!this.wallet || !this.mnemonic) {
      throw new Error('No wallet to save');
    }
    
    const walletData = {
      address: this.wallet.address,
      mnemonic: this.mnemonic
    };
    
    localStorage.setItem('mockWallet', JSON.stringify(walletData));
  }

  // Load wallet from localStorage
  loadWallet() {
    try {
      const walletData = localStorage.getItem('mockWallet');
      if (!walletData) {
        return null;
      }
      
      const parsed = JSON.parse(walletData);
      return this.importWallet(parsed.mnemonic);
    } catch (error) {
      console.error('Failed to load wallet:', error);
      return null;
    }
  }

  // Clear wallet from localStorage
  clearWallet() {
    localStorage.removeItem('mockWallet');
    this.wallet = null;
    this.mnemonic = null;
  }

  // Validate Ethereum address
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  // Format ETH amount
  formatEth(weiAmount) {
    return ethers.formatEther(weiAmount);
  }

  // Parse ETH amount to wei
  parseEth(ethAmount) {
    return ethers.parseEther(ethAmount.toString());
  }
}

const walletService = new WalletService();
export default walletService;
