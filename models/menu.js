const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  foodid : {
    type: Number,
    required: true
},
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  canteenname :{
    type : String,
    required:true
  }
})


module.exports = mongoose.model('Menu', MenuItemSchema)
