const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  regno: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  subtype: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
