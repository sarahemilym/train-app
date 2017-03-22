const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  trainId: { type: String, trim: true, required: true },
  startingAt: { type: String, trim: true, required: true },
  destination: { type: String, trim: true, required: true },
  stops: [{type: mongoose.Schema.ObjectId, ref: 'Stop'}],
  announcemnets: [{ type: mongoose.Schema.ObjectId, ref: 'Announcement'}]
}, {
  timestamps: true
});

module.exports = mongoose.model('Train', trainSchema);
