const express = require('express')
const router = express.Router()
const Cart = require('../models/cart')
const User = require('../models/login');

router.get('/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cartItems = await Cart.find({ user: user._id }).populate('user').populate('item');
    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/:name', async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cartItems = await Cart.aggregate([
      {
        $match: { user: user._id } // filter by user
      },
      {
        $lookup: {
          from: 'foods', // collection name for items
          localField: 'item',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      },
      {
        $group: {
          _id: '$user', // group by user id
          user: { $first: '$user' }, // keep the user details
          items: { // create an array of item details
            $push: {
              item: '$itemDetails',
              quantity: '$quantity'
            }
          }
        }
      }
    ]);

    if (!cartItems.length) {
      return res.status(404).json({ message: 'No items found for the user.' });
    }

    res.json(cartItems[0]); // return the first element since we are grouping by user id
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});




router.post('/', async (req, res) => {
  try {
    const { user, item, quantity } = req.body;

    const cartItem = await Cart.findOneAndUpdate(
      { user, item },
      { $inc: { quantity } },
      { upsert: true }
    );

    res.status(201).json({ message: 'Added to cart successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


  module.exports = router

