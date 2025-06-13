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
  const response = await fetchFromWalletService('/api/wallet/eth-service-initialization');
  if (response && response.userAddresses && response.contractAddresses && response.admin) {
    const walletAddresses = response.userAddresses;
    const contractAddresses = response.contractAddresses;
    const admin = response.admin;
    if (Array.isArray(walletAddresses)) {
      for (const address of walletAddresses) {
        await redisStore.addUserAddress(address);
      }
    }
    if (Array.isArray(contractAddresses)) {
      for (const address of contractAddresses) {
        await redisStore.addContractAddress(address);
      }
    }
    if (admin && admin.address && admin.privateKey) {
      await redisStore.setAdminInfo(admin.address, admin.privateKey);
    }
  }
} 