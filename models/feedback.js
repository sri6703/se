const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  regno: {
    type: String,
    required: true
  },
  canteen: {
    type: String,
    required: true
  },
  foodItem: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
