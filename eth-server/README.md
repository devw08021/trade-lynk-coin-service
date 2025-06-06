# eth-server

A standalone microservice for Ethereum blockchain operations (wallet creation, balance, transactions, etc.) using Express and web3.js.

## Features
- Create Ethereum wallet
- Get balance
- Send transaction
- Get transaction status
- Validate address

## Usage
- Install dependencies: `npm install`
- Run in dev mode: `npm run dev`
- Build: `npm run build`
- Start: `npm start`

## API Endpoints
- `POST /wallet` - Create a new wallet
- `GET /balance/:address` - Get balance
- `POST /send` - Send transaction
- `GET /tx/:txHash` - Get transaction status
- `GET /validate/:address` - Validate address
- `POST /user` - Add a user address (body: { address })
- `DELETE /user` - Remove a user address (body: { address })
- `GET /users` - List all user addresses
- `POST /contract` - Add a contract address (body: { address })
- `DELETE /contract` - Remove a contract address (body: { address })
- `GET /contracts` - List all contract addresses
- `POST /admin` - Set admin address and private key (body: { address, privateKey })
- `GET /admin` - Get admin address (never exposes private key)

## Kafka Integration
- Produces deposit events to the `deposit-events` topic when a deposit is detected.
- Configure Kafka via `KAFKA_BROKER` and `KAFKA_DEPOSIT_TOPIC` environment variables.

## Redis Storage
- User addresses, contract addresses, and admin info are stored in Redis for persistence.
- Configure Redis via the `REDIS_URL` environment variable (default: redis://localhost:6379).

## Wallet-Service Sync
- On startup, eth-server fetches user addresses, contract addresses, and admin info from wallet-service via REST API.
- Configure wallet-service URL and API key via `WALLET_SERVICE_URL` and `WALLET_SERVICE_API_KEY` environment variables.

## Environment Variables

This project uses [dotenv](https://www.npmjs.com/package/dotenv) to manage environment variables. Create a `.env` file in the `eth-server` directory with the following example content:

```
PORT=3000
ETH_SERVER_API_KEY=your-api-key
KAFKA_BROKER=localhost:9092
KAFKA_DEPOSIT_TOPIC=deposit-events
REDIS_URL=redis://localhost:6379
ETH_NODE_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

Adjust the values as needed for your environment. 