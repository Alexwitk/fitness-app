const axios = require('axios');
const FoodItem = require('../models/Food');

/* SEARCH FOODS */
const searchFoods = async (req, res) => {
  try {
    console.log(3);
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    console.log(query);
    const response = await axios.post(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.API_KEY}`,
      {
        query: query,
        pageSize: 10,
      }
    );
    console.log(response);
    res.status(200).json(response.data.foods);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data from FoodData Central' });
  }
};

/* GET FOOD DETAILS */
const getFoodDetails = async (req, res) => {
  try {
    const { fdcId } = req.params;
    if (!fdcId) {
      return res.status(400).json({ error: 'FDC ID is required' });
    }

    const response = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${process.env.API_KEY}`
    );
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching food details' });
  }
};

module.exports = { searchFoods, getFoodDetails };
