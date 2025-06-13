import { Router } from 'express';
import { EthService } from './ethService';
import * as redisStore from './redisStore';

const router = Router();
const ethService = new EthService();

router.post('/wallet', async (req, res) => {
  try {
    const wallet = await ethService.createWallet();
    console.log("wallet", wallet);
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await ethService.getBalance(address);
    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/send', async (req, res) => {
  try {
    const { from, to, amount, privateKey } = req.body;
    const txHash = await ethService.sendTransaction(from, to, amount, privateKey);
    res.json({ txHash });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/tx/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const tx = await ethService.getTransaction(txHash);
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/validate/:address', (req, res) => {
  const { address } = req.params;
  const isValid = ethService.validateAddress(address);
  res.json({ address, isValid });
});

// User address management
router.post('/user', async (req, res) => {
  const { address } = req.body;
  if (!address || !ethService.validateAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  await redisStore.addUserAddress(address);
  res.json({ success: true, address });
});

router.delete('/user', async (req, res) => {
  const { address } = req.body;
  if (!address || !ethService.validateAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  await redisStore.removeUserAddress(address);
  res.json({ success: true, address });
});

router.get('/users', async (req, res) => {
  const addresses = await redisStore.listUserAddresses();
  res.json({ addresses });
});

// Contract address management
router.post('/contract', async (req, res) => {
  const { address } = req.body;
  if (!address || !ethService.validateAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  await redisStore.addContractAddress(address);
  res.json({ success: true, address });
});

router.delete('/contract', async (req, res) => {
  const { address } = req.body;
  if (!address || !ethService.validateAddress(address)) {
    return res.status(400).json({ error: 'Invalid address' });
  }
  await redisStore.removeContractAddress(address);
  res.json({ success: true, address });
});

router.get('/contracts', async (req, res) => {
  const addresses = await redisStore.listContractAddresses();
  res.json({ addresses });
});

// Admin info management
router.post('/admin', async (req, res) => {
  const { address, privateKey } = req.body;
  if (!address || !privateKey || !ethService.validateAddress(address)) {
    return res.status(400).json({ error: 'Invalid admin info' });
  }
  await redisStore.setAdminInfo(address, privateKey);
  res.json({ success: true, address });
});

router.get('/admin', async (req, res) => {
  const info = await redisStore.getAdminInfo();
  if (!info) return res.status(404).json({ error: 'Admin info not set' });
  res.json({ address: info.address }); // Do not expose privateKey
});

export default router; 