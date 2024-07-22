const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
    user: { type: String, required: true },
    date: { type: Date, required: true },
    weight: { type: Number, required: true }, 
    unit: { type: String, enum: ['lbs', 'kg'], default: 'lbs' }
  });
  
  module.exports = mongoose.model('WeightLog', weightLogSchema);