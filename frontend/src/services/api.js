import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Wallet operations
  async createWallet(address) {
    const response = await this.client.post('/api/wallets', { address });
    return response.data;
  }

  async getBalance(address) {
    const response = await this.client.get('/api/balance', {
      params: { address }
    });
    return response.data;
  }

  // Transfer operations
  async initiateTransfer(transferData) {
    const response = await this.client.post('/api/transfer/initiate', transferData);
    return response.data;
  }

  async approveTransfer(approvalData) {
    const response = await this.client.post('/api/transfer/approve', approvalData);
    return response.data;
  }

  async getTransactions(address) {
    const response = await this.client.get('/api/transactions', {
      params: { address }
    });
    return response.data;
  }

  // Price operations
  async getPriceQuote(amountUsd) {
    const response = await this.client.post('/api/price/quote', {
      amount_usd: amountUsd
    });
    return response.data;
  }

  // Notification operations
  async sendNotification(notificationData) {
    const response = await this.client.post('/api/notify', notificationData);
    return response.data;
  }
}

const apiService = new ApiService();
export default apiService;
