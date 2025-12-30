const express = require('express');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get activity logs for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ task: req.params.taskId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all activity logs (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const activities = await Activity.find()
      .populate('user', 'name email')
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments();

    res.json({
      activities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalActivities: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

