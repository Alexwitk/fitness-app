const express = require('express');
const { addFoodLog, getFoodLog } = require('../controllers/foodlog');

const router = express.Router();

router.post('/add-food-log', addFoodLog);
router.get('/get-food-log', getFoodLog);

module.exports = router;
