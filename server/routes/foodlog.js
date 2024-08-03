const express = require('express');
const { addFoodLog, getFoodLog, deleteFood, updateFoodLog } = require('../controllers/foodlog');

const router = express.Router();

router.post('/add', addFoodLog);
router.get('/get', getFoodLog);
router.delete('/delete', deleteFood);
router.put('/update', updateFoodLog)
module.exports = router;
