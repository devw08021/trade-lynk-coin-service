import Web3 from 'web3';
import { listUserAddresses, listContractAddresses } from './redisStore';
import { depositQueue } from './depositQueue';

const ETH_NODE_URL = process.env.ETH_NODE_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID';
console.log('ETH_NODE_URL', ETH_NODE_URL);
const web3 = new Web3(ETH_NODE_URL);

const POLL_INTERVAL = 3000; // 10 seconds
const CONFIRMATIONS = 3;

let lastScannedBlock: number | null = null;

async function scanBlock(blockNumber: number) {
  const block = await web3.eth.getBlock(blockNumber, true);
  if (!block || !block.transactions) return;
  const userAddresses = (await listUserAddresses()).map(a => a.toLowerCase());
  const contractAddresses = (await listContractAddresses()).map(a => a.toLowerCase());

  for (const tx of block.transactions) {
    // ETH deposit
    // console.log("tx", tx);
    if (tx.to && userAddresses.includes(tx.to.toLowerCase())) {
      console.log("enqueueing deposit event", tx);
      await depositQueue.add('deposit', {
        type: 'ETH',
        to: tx.to,
        from: tx.from,
        amount: Number(web3.utils.fromWei(tx.value, 'ether')),
        txHash: tx.hash,
        blockNumber: tx.blockNumber,
      });
    }
    // ERC20 deposit
    if (tx.to && contractAddresses.includes(tx.to.toLowerCase()) && tx.input && tx.input.length >= 138) {
      // ERC20 transfer method: a9059cbb
      if (tx.input.startsWith('0xa9059cbb')) {
        const to = '0x' + tx.input.slice(34, 74).replace(/^0+/, '');
        const value = web3.utils.toBN('0x' + tx.input.slice(74));
        if (userAddresses.includes(to.toLowerCase())) {
          await depositQueue.add('deposit', {
            type: 'ERC20',
            contract: tx.to,
            to,
            from: tx.from,
            amount: Number(web3.utils.fromWei(value, 'ether')),
            txHash: tx.hash,
            blockNumber: tx.blockNumber,
          });
        }
      }
    }
  }
}

export async function startBlockScanner() {
  const latest = await web3.eth.getBlockNumber();
  console.log('latest block', latest);
  lastScannedBlock = latest - CONFIRMATIONS;
  console.log('lastScannedBlock', lastScannedBlock);
  setInterval(async () => {
    try {
      const current = await web3.eth.getBlockNumber();

      while (lastScannedBlock !== null && lastScannedBlock < current - CONFIRMATIONS + 1) {
        console.log("scanning block", lastScannedBlock);
        await scanBlock(lastScannedBlock);
        lastScannedBlock++;
      }
    } catch (err) {
      console.error('Block scanner error:', (err as Error).message);
    }
  }, POLL_INTERVAL);
} 