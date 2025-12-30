const express = require('express');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// Helper function to create activity log
const createActivity = async (taskId, userId, action, field = null, oldValue = null, newValue = null, comment = null) => {
  try {
    await Activity.create({
      task: taskId,
      user: userId,
      action,
      field,
      oldValue,
      newValue,
      comment
    });
  } catch (error) {
    console.error('Error creating activity log:', error);
  }
};

// Get all tasks (with pagination)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Users can only see tasks assigned to them
    // Managers can only see tasks they created
    if (req.user.role === 'user') {
      query.assignedTo = req.user._id;
    } else {
      // Managers only see tasks they created
      query.createdBy = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks assigned to user
router.get('/assigned', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments({ assignedTo: req.user._id });

    res.json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTasks: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tasks created by user (managers only)
router.get('/created', auth, isManager, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments({ createdBy: req.user._id });

    res.json({
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTasks: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'user' && task.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task (managers only)
router.post('/', auth, isManager, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate } = req.body;

    // Prevent managers from assigning tasks to themselves
    if (assignedTo && assignedTo.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Managers cannot assign tasks to themselves' });
    }

    // Verify assigned user exists and is a regular user (not a manager)
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }
    if (assignedUser.role === 'manager') {
      return res.status(400).json({ message: 'Cannot assign tasks to managers' });
    }

    // Validate due date is not in the past
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDateObj < today) {
        return res.status(400).json({ message: 'Due date cannot be less than today' });
      }
    }

    const task = new Task({
      title,
      description,
      createdBy: req.user._id,
      assignedTo,
      priority: priority || 'medium',
      dueDate
    });

    await task.save();
    await createActivity(task._id, req.user._id, 'created');

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${assignedTo}`).emit('task-updated', { task, action: 'created' });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldAssignedTo = task.assignedTo.toString();
    
    // Check permissions
    if (req.user.role === 'user') {
      // Users can only update status of their assigned tasks
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Only allow status updates for users
      if (req.body.status) {
        if (req.body.status !== task.status) {
          await createActivity(task._id, req.user._id, 'status_changed', 'status', task.status, req.body.status, req.body.comment);
          task.status = req.body.status;
        }
        // If status is the same, just continue without error
      } else {
        return res.status(403).json({ message: 'Users can only update task status' });
      }
    } else {
      // Managers can update all fields
      const updateFields = ['title', 'description', 'status', 'assignedTo', 'priority', 'dueDate'];
      for (const field of updateFields) {
        if (req.body[field] !== undefined && req.body[field] !== task[field]) {
          // Validate assignedTo - prevent managers from assigning to themselves
          if (field === 'assignedTo' && req.body[field]) {
            const newAssignedToId = req.body[field].toString();
            if (newAssignedToId === req.user._id.toString()) {
              return res.status(400).json({ message: 'Managers cannot assign tasks to themselves' });
            }
            // Verify assigned user exists and is a regular user
            const assignedUser = await User.findById(req.body[field]);
            if (!assignedUser) {
              return res.status(404).json({ message: 'Assigned user not found' });
            }
            if (assignedUser.role === 'manager') {
              return res.status(400).json({ message: 'Cannot assign tasks to managers' });
            }
          }
          
          // Validate due date is not in the past
          if (field === 'dueDate' && req.body[field]) {
            const dueDateObj = new Date(req.body[field]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dueDateObj < today) {
              return res.status(400).json({ message: 'Due date cannot be less than today' });
            }
          }
          
          await createActivity(task._id, req.user._id, 'updated', field, task[field], req.body[field], field === 'status' ? req.body.comment : null);
          task[field] = req.body[field];
        }
      }
    }

    await task.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      const populatedTask = await Task.findById(task._id)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');
      const newAssignedTo = task.assignedTo.toString();
      io.to(`user-${newAssignedTo}`).emit('task-updated', { task: populatedTask, action: 'updated' });
      // If assignedTo changed, also notify the old assignee
      if (oldAssignedTo !== newAssignedTo) {
        io.to(`user-${oldAssignedTo}`).emit('task-updated', { task: populatedTask, action: 'updated' });
      }
      if (task.createdBy.toString() !== newAssignedTo) {
        io.to(`user-${task.createdBy}`).emit('task-updated', { task: populatedTask, action: 'updated' });
      }
    }

    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete task (managers only)
router.delete('/:id', auth, isManager, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow deletion if user created the task
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete tasks you created' });
    }

    await createActivity(task._id, req.user._id, 'deleted');
    await Task.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${task.assignedTo}`).emit('task-deleted', { taskId: req.params.id });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

