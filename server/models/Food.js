const mongoose = require('mongoose');

const foodNutrientSchema = new mongoose.Schema({
  nutrientId: Number,
  nutrientName: String,
  unitName: String,
  amount: Number,
});

const foodItemSchema = new mongoose.Schema({
  fdcId: { type: Number, required: true, unique: true },
  description: { type: String, required: true },
  dataType: String,
  brandOwner: String,
  ingredients: String,
  servingSize: Number,
  servingSizeUnit: String,
  foodNutrients: [foodNutrientSchema],
});

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

module.exports = FoodItem;
