import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: REDIS_URL });

export async function connectRedis() {
  if (!client.isOpen) await client.connect();
}

const USERS_KEY = 'eth:users';
const CONTRACTS_KEY = 'eth:contracts';
const ADMIN_KEY = 'eth:admin';

export async function addUserAddress(address: string) {
  await client.sAdd(USERS_KEY, address.toLowerCase());
}

export async function removeUserAddress(address: string) {
  await client.sRem(USERS_KEY, address.toLowerCase());
}

export async function listUserAddresses(): Promise<string[]> {
  return client.sMembers(USERS_KEY);
}

export async function addContractAddress(address: string) {
  await client.sAdd(CONTRACTS_KEY, address.toLowerCase());
}

export async function removeContractAddress(address: string) {
  await client.sRem(CONTRACTS_KEY, address.toLowerCase());
}

export async function listContractAddresses(): Promise<string[]> {
  return client.sMembers(CONTRACTS_KEY);
}

export async function setAdminInfo(address: string, privateKey: string) {
  await client.set(ADMIN_KEY, JSON.stringify({ address: address.toLowerCase(), privateKey }));
}

export async function getAdminInfo(): Promise<{ address: string; privateKey: string } | null> {
  const data = await client.get(ADMIN_KEY);
  return data ? JSON.parse(data) : null;
} 