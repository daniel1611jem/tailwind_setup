import express from 'express';
import Proxy from '../models/Proxy.js';
import Account from '../models/Account.js';

const router = express.Router();

// GET all proxies
router.get('/', async (req, res) => {
  try {
    const proxies = await Proxy.find()
      .populate('assignedTo', 'name username')
      .sort({ createdAt: -1 });
    res.json(proxies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proxies', error: error.message });
  }
});

// GET available proxies (not assigned)
router.get('/available', async (req, res) => {
  try {
    const proxies = await Proxy.find({ assignedTo: null, status: 'active' });
    res.json(proxies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available proxies', error: error.message });
  }
});

// GET single proxy
router.get('/:id', async (req, res) => {
  try {
    const proxy = await Proxy.findById(req.params.id).populate('assignedTo', 'name username');
    if (!proxy) {
      return res.status(404).json({ message: 'Proxy not found' });
    }
    res.json(proxy);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching proxy', error: error.message });
  }
});

// CREATE new proxy
router.post('/', async (req, res) => {
  try {
    const proxy = new Proxy(req.body);
    const savedProxy = await proxy.save();
    res.status(201).json(savedProxy);
  } catch (error) {
    res.status(400).json({ message: 'Error creating proxy', error: error.message });
  }
});

// UPDATE proxy
router.put('/:id', async (req, res) => {
  try {
    const proxy = await Proxy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!proxy) {
      return res.status(404).json({ message: 'Proxy not found' });
    }
    res.json(proxy);
  } catch (error) {
    res.status(400).json({ message: 'Error updating proxy', error: error.message });
  }
});

// DELETE proxy
router.delete('/:id', async (req, res) => {
  try {
    const proxy = await Proxy.findById(req.params.id);
    if (!proxy) {
      return res.status(404).json({ message: 'Proxy not found' });
    }
    
    // Unassign from accounts first
    if (proxy.assignedTo) {
      await Account.updateOne(
        { _id: proxy.assignedTo },
        { $set: { proxy: null } }
      );
    }
    
    await Proxy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Proxy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting proxy', error: error.message });
  }
});

// Assign proxy to account
router.post('/:id/assign/:accountId', async (req, res) => {
  try {
    const proxy = await Proxy.findById(req.params.id);
    if (!proxy) {
      return res.status(404).json({ message: 'Proxy not found' });
    }
    
    // Unassign from previous account
    if (proxy.assignedTo) {
      await Account.updateOne(
        { _id: proxy.assignedTo },
        { $set: { proxy: null } }
      );
    }
    
    // Assign to new account
    proxy.assignedTo = req.params.accountId;
    await proxy.save();
    
    await Account.updateOne(
      { _id: req.params.accountId },
      { $set: { proxy: req.params.id } }
    );
    
    res.json(proxy);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning proxy', error: error.message });
  }
});

// Unassign proxy
router.post('/:id/unassign', async (req, res) => {
  try {
    const proxy = await Proxy.findById(req.params.id);
    if (!proxy) {
      return res.status(404).json({ message: 'Proxy not found' });
    }
    
    if (proxy.assignedTo) {
      await Account.updateOne(
        { _id: proxy.assignedTo },
        { $set: { proxy: null } }
      );
    }
    
    proxy.assignedTo = null;
    await proxy.save();
    
    res.json(proxy);
  } catch (error) {
    res.status(400).json({ message: 'Error unassigning proxy', error: error.message });
  }
});

export default router;
