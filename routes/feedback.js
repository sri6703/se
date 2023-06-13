const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');

router.get('/:regno', async (req, res) => {
  try {
    const { regno } = req.params;

    // Check if the user exists
    const userExists = await User.findOne({ regno });
    if (!userExists) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Retrieve the feedback for the user
    const feedback = await Feedback.find({ regno });

    if (feedback.length === 0) {
      return res.status(404).json({ message: 'No feedback found for the user.' });
    }

    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
