const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
