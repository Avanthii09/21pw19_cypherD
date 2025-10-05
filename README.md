**Cypher Wallet**

A simple demo Web3 wallet built with React and Node.js.
It lets you create or import a wallet using a 12-word phrase, view your ETH balance, send ETH or USD (converted to ETH in real time), sign and verify transactions, and view your transaction history.

**✨ Features**
🪪 Create or import wallet — 12-word mnemonic phrase


💰 ETH balance — get a random starting balance


💸 Send ETH or USD — USD auto-converted to ETH with live price check


✍️ Secure approvals — sign transactions in your browser (private keys never leave)


📜 History — see all past sends and receives


🔔 Notifications — optional email or Telegram alerts



**🛠️ Tech Stack**
Frontend: React + ethers.js
 Backend: Node.js + Express + SQLite
 APIs: Skip API for USD → ETH price, optional SMTP/Telegram for notifications

** Quick Start**
1. Clone & install
git clone <your-repo-url>
cd mock-web3-wallet

2. Backend setup
cd backend
npm install
npm run migrate    # if you have a migrate script (or `npx prisma migrate dev`)
npm run dev

Backend runs at http://localhost:8080 (or the port you set in .env).

3. Frontend setup
cd ../frontend
npm install
npm start

Frontend runs at http://localhost:3000.

🔑** How to Use**
Open the app in your browser.


Create a new wallet — app will show you a 12-word secret phrase (write it down!).


Or import an existing 12-word phrase.


See your mock ETH balance.


To send:


Pick ETH or USD.


Enter recipient address & amount.


Click Prepare → you’ll see a message to approve.


Click Confirm → the app signs the message and sends it to the backend.


View your updated balance and transaction history.


(Optional) Configure email or Telegram notifications in .env.



