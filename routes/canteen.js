const express = require('express');
const router = express.Router();
const Menu = require('../models/menu');
const cors = require('cors');

// Enable CORS for all routes
router.use(cors());
// Get the menu for a canteen
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find();
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); 

// Get the menu for a canteen by canteen name and category
router.get('/:category/:canteenname', async (req, res) => {
  const { canteenname, category } = req.params;
  try {
    const result = await Menu.find({ canteenname, category });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new menu
router.post('/', async (req, res) => {
  try {
    const { foodid, name, price, description, category, canteenname,exist_quantity } = req.body;

    // Check if food already exists based on foodid
    const existingFood = await Menu.findOne({ foodid });
    if (existingFood) {
      if (existingFood.name !== name) {
        return res.status(400).json({ message: "Mismatched item name and id" });
      }

      if (existingFood.category === category && existingFood.canteenname === canteenname) {
        return res.status(400).json({ message: "Food already exists" });
      }
    }

    // Check if the item with the same name exists in the same canteen
    const existingItem = await Menu.findOne({ name, canteenname });
    if (existingItem && existingItem.foodid !== foodid) {
      return res.status(400).json({ message: "Mismatched item name and id" });
    }

    const menu = new Menu({
      foodid,
      name,
      price,
      description,
      category,
      canteenname,
      exist_quantity
    });

    await menu.save();
    res.status(201).json({ message: "Food added to menu successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete the menu based on canteen name, category, and food id
router.delete('/:canteenname/:category/:foodid', async (req, res) => {
  try {
    const { canteenname, category, foodid } = req.params;
    const result = await Menu.deleteOne({ canteenname, category, foodid });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    res.json({ message: 'Menu deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
}); 

// Update based on the food id
router.patch('/', async (req, res) => {
  try {
    const { canteenname, category, foodid } = req.params;
    const foodItem = await Menu.findOne({ canteenname, category, foodid });
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (req.body.name != null) {
      foodItem.name = req.body.name;
    }

    if (req.body.description != null) {
      foodItem.description = req.body.description;
    }

    if (req.body.price != null) {
      foodItem.price = req.body.price;
    }

    const updatedFoodItem = await foodItem.save();
    res.json({ message: `Food item updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//patch for all
router.patch('/:_id/:quantity', async (req, res) => {
  try {
    const { _id ,quantity} = req.params;
    const foodItem = await Menu.findOne({ _id });
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    if (quantity != null) {
      foodItem.exist_quantity = quantity;
    }

    const updatedFoodItem = await foodItem.save();
    res.json({ message: `Food item updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//patch for specific canteen and category
router.patch('/:_id/:exist_quantity', async (req, res) => {
  try {
    const { _id, exist_quantity } = req.params;
    const foodItem = await Menu.findById(_id);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    foodItem.exist_quantity = exist_quantity;

    const updatedFoodItem = await foodItem.save();
    res.json({ message: 'Food item updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
