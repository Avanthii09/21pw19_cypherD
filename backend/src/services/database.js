const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/mockwallet.db');
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  // Wallet operations
  async createWallet(address, balanceWei) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO wallets (address, balance_wei)
        VALUES (?, ?)
      `);
      
      stmt.run([address, balanceWei], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
      
      stmt.finalize();
    });
  }

  async getWallet(address) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM wallets WHERE address = ?',
        [address],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async updateBalance(address, newBalanceWei) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE wallets SET balance_wei = ? WHERE address = ?',
        [newBalanceWei, address],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Approval operations
  async createApproval(approvalData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO approvals (approval_id, sender, recipient, amount_wei, amount_usd, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        approvalData.approval_id,
        approvalData.sender,
        approvalData.recipient,
        approvalData.amount_wei,
        approvalData.amount_usd,
        approvalData.expires_at
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      
      stmt.finalize();
    });
  }

  async getApproval(approvalId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM approvals WHERE approval_id = ?',
        [approvalId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async markApprovalUsed(approvalId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE approvals SET used = 1 WHERE approval_id = ?',
        [approvalId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        }
      );
    });
  }

  // Transaction operations
  async createTransaction(txData) {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT INTO transactions (tx_id, sender, recipient, amount_wei, amount_usd, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        txData.tx_id,
        txData.sender,
        txData.recipient,
        txData.amount_wei,
        txData.amount_usd,
        txData.status
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      
      stmt.finalize();
    });
  }

  async getTransactions(address) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM transactions WHERE sender = ? OR recipient = ? ORDER BY timestamp DESC',
        [address, address],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Atomic transfer operation
  async transferFunds(sender, recipient, amountWei) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Check sender balance
        this.db.get(
          'SELECT balance_wei FROM wallets WHERE address = ?',
          [sender],
          (err, senderWallet) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }

            if (!senderWallet || BigInt(senderWallet.balance_wei) < BigInt(amountWei)) {
              this.db.run('ROLLBACK');
              reject(new Error('Insufficient funds'));
              return;
            }

            // Deduct from sender
            this.db.run(
              'UPDATE wallets SET balance_wei = balance_wei - ? WHERE address = ?',
              [amountWei, sender],
              function(err) {
                if (err) {
                  this.db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                // Add to recipient (create if doesn't exist)
                this.db.run(
                  'INSERT OR IGNORE INTO wallets (address, balance_wei) VALUES (?, 0)',
                  [recipient],
                  function(err) {
                    if (err) {
                      this.db.run('ROLLBACK');
                      reject(err);
                      return;
                    }

                    this.db.run(
                      'UPDATE wallets SET balance_wei = balance_wei + ? WHERE address = ?',
                      [amountWei, recipient],
                      function(err) {
                        if (err) {
                          this.db.run('ROLLBACK');
                          reject(err);
                          return;
                        }

                        this.db.run('COMMIT', (err) => {
                          if (err) {
                            reject(err);
                          } else {
                            resolve({ success: true });
                          }
                        });
                      }
                    );
                  }
                );
              }
            );
          }
        );
      });
    });
  }
}

module.exports = new DatabaseService();
