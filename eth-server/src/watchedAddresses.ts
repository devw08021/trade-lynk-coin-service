// In-memory stores (replace with DB in production)
const userAddresses = new Set<string>();
const contractAddresses = new Set<string>();
let adminInfo: { address: string; privateKey: string } | null = null;

export function addUserAddress(address: string) {
  userAddresses.add(address.toLowerCase());
}

export function removeUserAddress(address: string) {
  userAddresses.delete(address.toLowerCase());
}

export function listUserAddresses() {
  return Array.from(userAddresses);
}

export function addContractAddress(address: string) {
  contractAddresses.add(address.toLowerCase());
}

export function removeContractAddress(address: string) {
  contractAddresses.delete(address.toLowerCase());
}

export function listContractAddresses() {
  return Array.from(contractAddresses);
}

export function setAdminInfo(address: string, privateKey: string) {
  adminInfo = { address: address.toLowerCase(), privateKey };
}

export function getAdminInfo() {
  return adminInfo;
} 