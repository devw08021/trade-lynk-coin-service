import axios from 'axios';
import * as redisStore from './redisStore';

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:3001';
const WALLET_SERVICE_API_KEY = process.env.WALLET_SERVICE_API_KEY || '';

async function fetchFromWalletService(path: string) {
  const headers: any = {};
  if (WALLET_SERVICE_API_KEY) headers['Authorization'] = `Bearer ${WALLET_SERVICE_API_KEY}`;
  const res = await axios.get(`${WALLET_SERVICE_URL}${path}`, { headers });
  return res.data;
}

export async function syncFromWalletService() {
  // Fetch user addresses
  const users = await fetchFromWalletService('/api/eth/users');
  if (Array.isArray(users)) {
    for (const address of users) {
      await redisStore.addUserAddress(address);
    }
  }
  // Fetch contract addresses
  const contracts = await fetchFromWalletService('/api/eth/contracts');
  if (Array.isArray(contracts)) {
    for (const address of contracts) {
      await redisStore.addContractAddress(address);
    }
  }
  // Fetch admin info
  const admin = await fetchFromWalletService('/api/eth/admin');
  if (admin && admin.address && admin.privateKey) {
    await redisStore.setAdminInfo(admin.address, admin.privateKey);
  }
} 