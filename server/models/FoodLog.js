const mongoose = require('mongoose');

const foodLogEntrySchema = new mongoose.Schema({
  foodItem: { type: String, required: true },
  quantity: { type: Number, required: true },
});

const foodLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  foods: [foodLogEntrySchema],
});

const FoodLog = mongoose.model('FoodLog', foodLogSchema);

module.exports = FoodLog;
