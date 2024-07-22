const express = require('express');
const { addWeight, getWeights, updateWeight, deleteWeight, deleteWeightRange} = require('../controllers/weights');

const router = express.Router();

router.post("/addWeight", addWeight);
router.get("/getWeights", getWeights);
router.put('/updateWeight', updateWeight); // Add this line
router.delete('/deleteWeight', deleteWeight);
router.delete('/deleteWeightRange', deleteWeightRange)
module.exports = router;
