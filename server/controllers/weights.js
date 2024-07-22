const WeightLog = require('../models/WeightLog');

/* ADD WEIGHT */
const addWeight = async (req, res) => {
  try {
    const { id, date, weight, unit } = req.body;
    const newWeightLog = new WeightLog({
      user: id,
      date,
      weight,
      unit,
    });
    const savedWeightLog = await newWeightLog.save();
    res.status(201).json(savedWeightLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET WEIGHTS */
const getWeights = async (req, res) => {
    try {
        const { id } = req.query;
        const weightLogs = await WeightLog.find({ user: id }).sort({ date: -1 });
        res.status(200).json(weightLogs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* UPDATE WEIGHT */
const updateWeight = async (req, res) => {
    try {
      const { id, date, weight, unit } = req.body;
      const updatedWeightLog = await WeightLog.findOneAndUpdate(
        { user: id, date: date },
        { weight: weight, unit: unit },
      );
      if (!updatedWeightLog) return res.status(404).json({ msg: "Weight log not found." });
      res.status(200).json(updatedWeightLog);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


/* DELETE WEIGHT */
const deleteWeight = async (req, res) => {
    try {
      const { id, date } = req.body;
      const deletedWeightLog = await WeightLog.findOneAndDelete({ user: id, date: date });
      if (!deletedWeightLog) return res.status(404).json({ msg: "Weight log not found." });
      res.status(200).json({ msg: "Weight log deleted." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
/* DELETE WEIGHT RANGE */
const deleteWeightRange = async (req, res) => {
  try {
    const { id, startDate, endDate } = req.body;

    const deletedWeightLogs = await WeightLog.deleteMany({
      user: id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    if (deletedWeightLogs.deletedCount === 0) {
      return res.status(404).json({ msg: "No weight logs found in the specified date range." });
    }

    res.status(200).json({ msg: "Weight logs deleted.", deletedCount: deletedWeightLogs.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  module.exports = { addWeight, getWeights, updateWeight, deleteWeight, deleteWeightRange };