const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'status_changed', 'assigned']
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed
  },
  field: {
    type: String
  },
  comment: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);

