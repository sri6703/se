const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const User = require('../models/login');
const Order = require('../models/order');
const bodyParser = require('body-parser');

const cors = require('cors');
const app = express();
app.use(cors());
app.set('view engine', 'ejs');
router.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// router.get('/:regno', async (req, res) => {
//   try {
//     const { regno } = req.params;

//     const user = await User.findOne({ regno });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found.' });
//     }

//     const cartItems = await Cart.find({ user: regno }).populate('item');
//     const formattedItems = cartItems.map((cartItem) => {
//       return {
//         name: user.name,
//         itemName: cartItem.item.name,
//         price: cartItem.item.price,
//         quantity: cartItem.quantity
//       };
// //     });

//     res.json(formattedItems);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error.' });
//   }
// });

router.get('/:regno', async (req, res) => {
  try {
    const user = await User.findOne({ regno: req.params.regno });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cartItems = await Cart.find({ user: req.params.regno }).populate('item');
    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


router.get('/:regno/:itemid', async (req, res) => {
  try {
    const { regno, itemid } = req.params;

    const user = await User.findOne({ regno });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cartItem = await Cart.findOne({ user: regno, item: itemid });
    const quantity = cartItem ? cartItem.quantity : 0;

    res.json({ quantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const deletedItem = await Cart.findOneAndDelete({ _id: itemId });
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.json({ message: 'Item deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.json({ message: 'All items deleted successfully.' });
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
    const { userid, itemId, quantity, date } = req.body;

    const existingCartItem = await Cart.findOne({ user: userid, item: itemId });

    if (existingCartItem) {
      // If the item already exists in the cart, update the quantity
      existingCartItem.quantity = quantity;
      existingCartItem.date = date;
      await existingCartItem.save();
    } else { 
      // If the item doesn't exist in the cart, create a new cart item
      const newCartItem = new Cart({ user: userid, item: itemId, quantity, date });
      await newCartItem.save();
    }

    res.status(201).json({ message: 'Added to cart successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


router.patch('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { existing_quantity } = req.body;

    const existingCartItem = await Cart.findById(itemId);

    if (!existingCartItem) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    existingCartItem.quantity = existing_quantity;
    await existingCartItem.save();

    res.json({ message: 'Item updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const cartItem = await Cart.findOne({ _id: itemId }).populate('item');

    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in the cart.' });
    }

    const existingQuantity = cartItem.item.exist_quantity;
    res.json({ existingQuantity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Assuming you have the necessary HTML template to display the items in the billing page

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const cartItems = await Cart.find({ user: userId }).populate('item');

    if (!cartItems.length) {
      return res.status(404).json({ message: 'No items found for the user.' });
    }

    const items = cartItems.map((cartItem) => ({
      itemName: cartItem.item.name,
      price: cartItem.item.price,
      quantity: cartItem.quantity,
      date: cartItem.date,
    }));

    res.render('billing', { user, items }); // Render the billing page with user and items data
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.post('/place-order', async (req, res) => {
  try {
    const { userid} = req.body;

    const existingUser = await User.findOne({ regno:userid });
    if (!existingUser) {
      return res.status(404).json({ message: `User '${userid}' not found.` });
    }

    const cartItems = await Cart.find({ user : userid }).populate('item');
    if (!cartItems.length) {
      return res.status(400).json({ message: 'No items found in the cart.' });
    }

    // Create an order for each item in the cart
    const orders = cartItems.map((cartItem) => {
      return {
        userid,
        item: cartItem.item._id,
        quantity: cartItem.quantity,
        date: new Date()
      };
    });

    // Store the orders in the database
    await Order.insertMany(orders);

    // Clear the cart after placing the order
    await Cart.deleteMany({ userid });

    res.status(200).json({ message: 'Order placed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/orders/:user', async (req, res) => {
  try{
  const { user  } = req.params;

    // Check if the user exists
    const userExists = await User.findOne({  });
    if (!userExists) {
      return res.status(404).json({ message: 'Users not found ${user}.' });
    }

    // Retrieve the feedback for the user
    const orders = await Order.find({ user });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No feedback found for the user.' });
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/orders',async (req,res) => {
  try {
      const allorder = await Order.find()
      res.json(allorder)
  } catch (err) {
      res.status(500).json({message: err.message})
  }
})








module.exports = router;
