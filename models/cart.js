const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'Login'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }, 
  quantity: {
    type: Number,
    default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartSchema);
