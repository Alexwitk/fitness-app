const FoodLog = require('../models/FoodLog');

/* ADD FOOD LOG */
const addFoodLog = async (req, res) => {
  try {
    const { userId, date, foods } = req.body;
    if (!userId || !date || !foods) {
      return res.status(400).json({ error: 'User ID, date, and foods are required' });
    }

    const newLog = new FoodLog({ userId, date, foods });
    const savedLog = await newLog.save();

    res.status(201).json(savedLog);
  } catch (error) {
    res.status(500).json({ error: 'Error saving food log' });
  }
};

/* GET FOOD LOG */
const getFoodLog = async (req, res) => {
  try {
    const { userId, date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({ error: 'User ID and date are required' });
    }

    const log = await FoodLog.findOne({ userId, date: new Date(date) }).populate('foods.foodItem');

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching food log' });
  }
};

module.exports = { addFoodLog, getFoodLog };
