import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/NavBar';

const FoodTracker = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null);
  const [servingSizeUnit, setServingSizeUnit] = useState('serving'); // 'serving' or 'gram'
  const [servings, setServings] = useState(1);

  // Function to handle the search
  const searchFood = async () => {
    try {
      const response = await axios.get('http://localhost:5000/food/search', { params: { query } });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching data from FoodData Central', error);
    }
  };

  // Function to fetch food details when a food is selected
  const fetchFoodDetails = async (fdcId) => {
    try {
      const response = await axios.get(`http://localhost:5000/food/${fdcId}`);
      setFoodDetails(response.data);
    } catch (error) {
      console.error('Error fetching food details', error);
    }
  };

  // Effect to fetch food details when selectedFoodId changes
  useEffect(() => {
    if (selectedFoodId) {
      fetchFoodDetails(selectedFoodId);
    }
  }, [selectedFoodId]);

  // Calculate the nutrient value based on the selected serving size and number of servings
  const getNutrientValue = (value) => {
    const servingSizeInGrams = foodDetails?.servingSize;
    if (servingSizeUnit === 'gram') {
      return (value / servingSizeInGrams) * servings;
    } else {
      return value * servings;
    }
  };

  return (
    <div className="food-tracker">
      <Navbar />
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for food..."
        />
        <button onClick={searchFood}>Search</button>
        <ul>
          {results.map((food) => (
            <li key={food.fdcId} onClick={() => setSelectedFoodId(food.fdcId)}>
              {food.description}
            </li>
          ))}
        </ul>
      </div>
      {selectedFoodId && foodDetails && (
        <div>
          <h3>{foodDetails.description}</h3>
          <p>Brand: {foodDetails.brandOwner ?? 'N/A'}</p>
          <p>Ingredients: {foodDetails.ingredients ?? 'N/A'}</p>
          <div>
            <label>
              Serving Size Unit:
              <select
                value={servingSizeUnit}
                onChange={(e) => setServingSizeUnit(e.target.value)}
              >
                <option value="serving">{foodDetails.servingSize ?? 'N/A'} {foodDetails.servingSizeUnit ?? 'N/A'}</option>
                <option value="gram">1 g</option>
              </select>
            </label>
            <label>
              Servings:
              <input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                min="1"
              />
            </label>
          </div>
          <ul>
            {foodDetails.labelNutrients
              ? Object.entries(foodDetails.labelNutrients).map(([key, nutrient]) => (
                  <li key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {getNutrientValue(nutrient.value).toFixed(2)}
                    {key === 'calories' ? 'cal' : 'g'}
                  </li>
                ))
              : foodDetails.foodNutrients
              ? foodDetails.foodNutrients.map((nutrient) => (
                  <li key={nutrient.nutrient.id}>
                    {nutrient.nutrient.name}: {getNutrientValue(nutrient.amount).toFixed(2)}
                    {nutrient.nutrient.unitName}
                  </li>
                ))
              : 'No nutrient information available'}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FoodTracker;
