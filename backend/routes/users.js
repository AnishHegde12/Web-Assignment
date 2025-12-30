const express = require('express');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// Get all users (managers only) - only returns regular users, not managers
router.get('/', auth, isManager, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }, 'name email role _id').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

