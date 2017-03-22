const mongoose = require('mongoose');
const statuses = ['coming', 'passed'];

const stopSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  usersLeaving: [{ type: mongoose.Schema.ObjectId, ref: 'User'}],
  status: {type: String, enum: statuses, default: 'coming'}
});

module.exports = mongoose.model('Stop', stopSchema);
