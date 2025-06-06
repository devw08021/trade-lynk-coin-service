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
  // const users = await fetchFromWalletService('/api/eth/users');
  const users = ["0x326DF86a7e9b6210C5908A4F1ba0AA23cB03F418"]
  if (Array.isArray(users)) {
    for (const address of users) {
      await redisStore.addUserAddress(address);
    }
  }
  // const contracts = await fetchFromWalletService('/api/eth/contracts');
  const contracts = ["0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0"]
  if (Array.isArray(contracts)) {
    for (const address of contracts) {
      await redisStore.addContractAddress(address);
    }
  }
  // const admin = await fetchFromWalletService('/api/eth/admin');
  const admin = {
    address: "0x02895caf85B54F0F796449e799f60bEA0816B002",
    privateKey: "7aa8d3a84838e4158a8fcda68f421f901fd22d9480aadca6b783c90a252bf211"
  }
  if (admin && admin.address && admin.privateKey) {
    await redisStore.setAdminInfo(admin.address, admin.privateKey);
  }
} 