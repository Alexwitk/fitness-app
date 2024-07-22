const express = require('express');
const { searchFoods, getFoodDetails } = require('../controllers/food');

const router = express.Router();

router.get('/search', searchFoods);
router.get('/:fdcId', getFoodDetails);

module.exports = router;

