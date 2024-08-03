const FoodLog = require('../models/FoodLog');

/* ADD FOOD LOG */
const addFoodLog = async (req, res) => {
  try {
    const { userId, date, meal, foodItem, quantity} = req.body;
    if (!userId || !date || !meal || !foodItem || !quantity) {
      return res.status(400).json({ error: 'User ID, date, meal, food item, and quantity are required' });
    }
    let log = await FoodLog.findOne({ userId, date: new Date(date) });

    if (!log) {
      log = new FoodLog({ userId, date, foods: [] });
    }

    log.foods.push({ foodItem, quantity, meal });
    const savedLog = await log.save();
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

    const log = await FoodLog.findOne({ userId, date: new Date(date) });

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching food log' });
  }
};

/* DELETE FOOD */
const deleteFood = async (req, res) => {
  try {
    const { userId, date, foodItemId } = req.body; 
    let log = await FoodLog.findOne({ userId, date: new Date(date) });
    if (!log) {
      return res.status(404).json({ error: 'Food log not found.' });
    }
    log.foods = log.foods.filter(food => food._id.toString() !== foodItemId);
    const updatedLog = await log.save();
    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting food item' });
  }
};

/* UPDATE FOOD LOG */
const updateFoodLog = async (req, res) => {
  try {
    const { userId, date, foodItemId, quantity } = req.body;
    if (!userId || !date || !foodItemId || !quantity) {
      return res.status(400).json({ error: 'User ID, date, food item ID, and quantity are required' });
    }

    let log = await FoodLog.findOne({ userId, date: new Date(date) });
    if (!log) {
      return res.status(404).json({ error: 'Food log not found.' });
    }

    const foodItem = log.foods.find(food => food._id.toString() === foodItemId);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    foodItem.quantity = quantity;
    const updatedLog = await log.save();
    res.status(200).json(updatedLog);
  } catch (error) {
    res.status(500).json({ error: 'Error updating food item' });
  }
};

module.exports = { addFoodLog, getFoodLog, deleteFood, updateFoodLog };