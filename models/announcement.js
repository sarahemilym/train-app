const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  text: { type: String, trim: true, required: true }
});

module.exports = mongoose.model('announcemnet', announcementSchema);
