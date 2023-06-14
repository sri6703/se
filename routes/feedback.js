const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');
const cors = require('cors');
const login = require('../models/login');

// Enable CORS for all routes
router.use(cors());
router.post('/', async (req, res) => {
  try {
    const { regno, type, subtype, content } = req.body;

    // Check if the user exists
    const userExists = await login.findOne({ regno });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Create new feedback document
    const newFeedback = new Feedback({ regno, type, subtype, content });

    // Save the feedback to the database
    await newFeedback.save();

    res.json({ message: 'Feedback added successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/', async (req, res) => {
  try {
    // Find all feedback records
    const feedback = await Feedback.find();

    if (feedback.length === 0) {
      return res.status(404).json({ message: 'No feedback found.' });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE feedback by regno
router.delete('/:regno', async (req, res) => {
  try {
    const { regno } = req.params;

    // Check if the user exists
    const userExists = await login.findOne({ regno });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find and delete feedback by regno
    const feedback = await Feedback.findOneAndDelete({ regno });
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found.' });
    }

    res.json({ message: 'Feedback deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


module.exports = router;
