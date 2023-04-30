const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Login'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  },
  quantity: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('Cart', cartSchema);
