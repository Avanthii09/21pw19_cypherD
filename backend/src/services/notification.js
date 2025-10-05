const nodemailer = require('nodemailer');
const axios = require('axios');

class NotificationService {
  constructor() {
    this.smtpTransporter = null;
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.setupSmtp();
  }

  setupSmtp() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.smtpTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  }

  async sendEmailNotification(address, txData) {
    if (!this.smtpTransporter) {
      console.log('SMTP not configured, skipping email notification');
      return { status: 'skipped', reason: 'SMTP not configured' };
    }

    try {
      const mailOptions = {
        from: process.env.NOTIFY_FROM || 'mock-wallet@example.com',
        to: txData.email || 'user@example.com', // In real app, get from settings
        subject: 'Mock Wallet Transfer Success',
        html: `
          <h2>Transfer Successful!</h2>
          <p>Your transaction has been completed successfully.</p>
          <ul>
            <li><strong>Transaction ID:</strong> ${txData.tx_id}</li>
            <li><strong>From:</strong> ${txData.sender}</li>
            <li><strong>To:</strong> ${txData.recipient}</li>
            <li><strong>Amount:</strong> ${txData.amount_eth} ETH</li>
            ${txData.amount_usd ? `<li><strong>USD Value:</strong> $${txData.amount_usd}</li>` : ''}
            <li><strong>New Balance:</strong> ${txData.new_balance_eth} ETH</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Thank you for using Mock Web3 Wallet!</p>
        `
      };

      const info = await this.smtpTransporter.sendMail(mailOptions);
      return { status: 'sent', messageId: info.messageId };
    } catch (error) {
      console.error('Email notification error:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async sendTelegramNotification(chatId, txData) {
    if (!this.telegramBotToken) {
      console.log('Telegram bot token not configured, skipping Telegram notification');
      return { status: 'skipped', reason: 'Telegram not configured' };
    }

    try {
      const message = `
🚀 *Transfer Successful!*

Transaction ID: \`${txData.tx_id}\`
From: \`${txData.sender}\`
To: \`${txData.recipient}\`
Amount: *${txData.amount_eth} ETH*
${txData.amount_usd ? `USD Value: *$${txData.amount_usd}*` : ''}
New Balance: *${txData.new_balance_eth} ETH*

Thank you for using Mock Web3 Wallet! 🎉
      `;

      const response = await axios.post(
        `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        }
      );

      return { status: 'sent', messageId: response.data.result.message_id };
    } catch (error) {
      console.error('Telegram notification error:', error);
      return { status: 'failed', error: error.message };
    }
  }

  async sendNotification(address, txData, method = 'email', target = null) {
    try {
      let result;
      
      if (method === 'email') {
        result = await this.sendEmailNotification(address, { ...txData, email: target });
      } else if (method === 'telegram') {
        result = await this.sendTelegramNotification(target, txData);
      } else {
        throw new Error(`Unsupported notification method: ${method}`);
      }

      return result;
    } catch (error) {
      console.error('Notification error:', error);
      return { status: 'failed', error: error.message };
    }
  }
}

module.exports = new NotificationService();
