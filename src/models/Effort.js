const mongoose = require('mongoose');
const effortSchema = new mongoose.Schema({
  hours: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
module.exports = mongoose.model('Effort', effortSchema);
