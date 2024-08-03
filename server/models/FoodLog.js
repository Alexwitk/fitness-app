const mongoose = require('mongoose');

const foodLogEntrySchema = new mongoose.Schema({
  foodItem: {
    fdcId: { type: Number, required: true },
    description: { type: String, required: true },
    nutrients: {
      protein: { type: Number, required: true },
      fat: { type: Number, required: true },
      calories: { type: Number, required: true },
      carbohydrates: { type: Number, required: true },
    },
    servings: { type: Number, required: true },
    servingSizeUnit: { type: String, required: true },
  },
  quantity: { type: Number, required: true },
  meal: { type: String, required: true, enum: ['breakfast', 'lunch', 'dinner', 'snacks'] }
});

const foodLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  foods: [foodLogEntrySchema]
});

const FoodLog = mongoose.model('FoodLog', foodLogSchema);

module.exports = FoodLog;
