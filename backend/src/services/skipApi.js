const axios = require('axios');
const { parseUnits, formatUnits } = require('ethers');

class SkipApiService {
  constructor() {
    this.apiUrl = process.env.SKIP_API_URL || 'https://api.skip.build/v2/fungible/msgs_direct';
    this.apiKey = process.env.SKIP_API_KEY;
  }

  async getEthFromUsd(usdAmount) {
    try {
      // Mock implementation for demo - in production you'd call the real Skip API
      const mockEthPrice = 2000; // Mock ETH price in USD
      const ethAmount = (parseFloat(usdAmount) / mockEthPrice).toFixed(6);
      
      return {
        amount_eth: ethAmount,
        amount_wei: parseUnits(ethAmount, 18).toString(),
        quote_meta: {
          mock: true,
          eth_price_usd: mockEthPrice,
          amount_in_usd: usdAmount
        }
      };
    } catch (error) {
      console.error('Skip API mock error:', error.message);
      throw new Error('Failed to get ETH quote');
    }
  }

  parseSkipResponse(responseData) {
    // Mock implementation - adjust based on actual Skip API response structure
    // For now, we'll simulate a reasonable ETH amount based on USD input
    const mockEthPrice = 2000; // Mock ETH price in USD
    const ethAmount = responseData.amount_in / mockEthPrice;
    
    return ethAmount.toFixed(6);
  }

  async getCurrentEthPrice() {
    try {
      // Mock implementation - in real scenario, you'd call a price API
      return 2000; // Mock ETH price in USD
    } catch (error) {
      console.error('Price API error:', error.message);
      return 2000; // Fallback price
    }
  }
}

module.exports = new SkipApiService();
