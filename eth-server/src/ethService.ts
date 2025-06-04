import Web3 from 'web3';

const ETH_NODE_URL = process.env.ETH_NODE_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
const web3 = new Web3(ETH_NODE_URL);

export class EthService {
  async createWallet() {
    const account = web3.eth.accounts.create();
    return { address: account.address, privateKey: account.privateKey };
  }

  async getBalance(address: string) {
    const balanceWei = await web3.eth.getBalance(address);
    return Number(web3.utils.fromWei(balanceWei, 'ether'));
  }

  async sendTransaction(from: string, to: string, amount: number, privateKey: string) {
    const value = web3.utils.toWei(amount.toString(), 'ether');
    const tx = {
      from,
      to,
      value,
      gas: 21000,
    };
    const signed = await web3.eth.accounts.signTransaction(tx, privateKey);
    if (!signed.rawTransaction) throw new Error('Signing failed');
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return receipt.transactionHash;
  }

  async getTransaction(txHash: string) {
    const tx = await web3.eth.getTransaction(txHash);
    if (!tx) throw new Error('Transaction not found');
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    let status: 'PENDING' | 'COMPLETED' | 'FAILED' = 'PENDING';
    if (receipt) {
      status = receipt.status ? 'COMPLETED' : 'FAILED';
    }
    return {
      status,
      blockNumber: tx.blockNumber,
      amount: Number(web3.utils.fromWei(tx.value, 'ether')),
      from: tx.from,
      to: tx.to,
    };
  }

  validateAddress(address: string) {
    return web3.utils.isAddress(address);
  }
} 