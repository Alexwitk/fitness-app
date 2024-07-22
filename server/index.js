const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const weightRoutes = require('./routes/weights');
const foodRoutes = require('./routes/food');
const foodLogRoutes = require('./routes/foodlog');
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/weights', weightRoutes); 
app.use('/food', foodRoutes);
app.use('/foodlog', foodLogRoutes); 
const port = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URL, {
  })
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
