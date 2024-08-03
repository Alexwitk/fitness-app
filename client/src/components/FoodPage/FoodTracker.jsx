import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/NavBar';
import { useSelector } from 'react-redux';
import '../../FoodTracker.css';

const FoodTracker = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodDetails, setFoodDetails] = useState(null);
  const [servingSizeUnit, setServingSizeUnit] = useState('serving'); // 'serving' or 'gram'
  const [servings, setServings] = useState(1);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [foodLog, setFoodLog] = useState({});
  const [activeMeal, setActiveMeal] = useState('');
  const [showMacros, setShowMacros] = useState({});
  const userId = useSelector((state) => state.user._id);
  const searchBoxRef = useRef(null);

  // Debounce hook
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        searchFood();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setActiveMeal('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchBoxRef]);

  const isNextDayEnabled = () => {
    const today = new Date();
    return currentDate.toDateString() !== today.toDateString();
  };
  
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

  // Effect to fetch food details when selectedFood changes
  useEffect(() => {
    if (selectedFood) {
      fetchFoodDetails(selectedFood.fdcId);
    }
  }, [selectedFood]);

  // Fetch the food log for the current date
  const fetchFoodLog = async (date) => {
    try {
      const response = await axios.get('http://localhost:5000/foodlog/get', {
        params: { userId, date: date.toISOString().split('T')[0] }
      });
      setFoodLog(response.data || {});
    } catch (error) {
      console.error('Error fetching food log', error);
    }
  };

  useEffect(() => {
    fetchFoodLog(currentDate);
  }, [currentDate]);

  // Calculate the nutrient value based on the selected serving size and number of servings
  const getNutrientValue = (value, servingSizeInGrams) => {
    if (servingSizeUnit === 'gram') {
      return (value / servingSizeInGrams) * servings;
    } else {
      return value * servings;
    }
  };

  // Determine the serving size in grams
  const getServingSizeInGrams = () => {
    if (foodDetails) {
      if (foodDetails.servingSize) {
        return foodDetails.servingSize;
      }
      if (foodDetails.foodPortions && foodDetails.foodPortions.length > 0) {
        return 100;
      }
    }
    return null;
  };

  // Get the serving size unit
  const getServingSizeUnit = () => {
    if (foodDetails) {
      if (foodDetails.servingSizeUnit) {
        return foodDetails.servingSizeUnit;
      }
      if (foodDetails.foodPortions && foodDetails.foodPortions.length > 0) {
        return 'g'; // default to grams if using foodPortions
      }
    }
    return null;
  };

  const servingSizeInGrams = getServingSizeInGrams();
  const servingSizeUnitDisplay = getServingSizeUnit() || 'N/A';

  const getNutrientValueSafe = (nutrients, key, servingSizeInGrams) => {
    if (nutrients && key in nutrients) {
      return getNutrientValue(nutrients[key].value, servingSizeInGrams);
    }
    return 0;
  };

  const getFoodNutrientValue = (nutrients, nutrientNumber, servingSizeInGrams) => {
    const nutrient = nutrients.find(n => n.nutrient.number === nutrientNumber);
    if (nutrient) {
      return getNutrientValue(nutrient.amount, servingSizeInGrams);
    }
    return 0;
  };

  const addFoodToLog = async (meal) => {
    if (!selectedFood || !foodDetails) return;

    const servingSizeInGrams = getServingSizeInGrams();

    const food = {
      fdcId: selectedFood.fdcId,
      description: foodDetails.description,
      nutrients: {
        protein: foodDetails.labelNutrients
          ? getNutrientValueSafe(foodDetails.labelNutrients, 'protein', servingSizeInGrams)
          : getFoodNutrientValue(foodDetails.foodNutrients, '203', servingSizeInGrams),
        fat: foodDetails.labelNutrients
          ? getNutrientValueSafe(foodDetails.labelNutrients, 'fat', servingSizeInGrams)
          : getFoodNutrientValue(foodDetails.foodNutrients, '204', servingSizeInGrams),
        calories: foodDetails.labelNutrients
          ? getNutrientValueSafe(foodDetails.labelNutrients, 'calories', servingSizeInGrams)
          : getFoodNutrientValue(foodDetails.foodNutrients, '208', servingSizeInGrams),
        carbohydrates: foodDetails.labelNutrients
          ? getNutrientValueSafe(foodDetails.labelNutrients, 'carbohydrates', servingSizeInGrams)
          : getFoodNutrientValue(foodDetails.foodNutrients, '205', servingSizeInGrams),
      },
      servings,
      servingSizeUnit
    };

    try {
      const response = await axios.post('http://localhost:5000/foodlog/add', {
        userId,
        date: currentDate.toISOString().split('T')[0],
        meal,
        foodItem: food,
        quantity: servings,
      });
      setFoodLog(response.data);
      setSelectedFood(null);
      setFoodDetails(null);
      setActiveMeal('');
    } catch (error) {
      console.error('Error adding food to log', error);
    }
  };

  const deleteFoodFromLog = async (foodItemId) => {
    try {
      const response = await axios.delete('http://localhost:5000/foodlog/delete', { data: {
        userId,
        date: currentDate.toISOString().split('T')[0],
        foodItemId,
      }
      });
      setFoodLog(response.data);
    } catch (error) {
      console.error('Error deleting food from log', error);
    }
  };

  const getTotalNutrients = () => {
    const total = { protein: 0, fat: 0, calories: 0, carbohydrates: 0 };

    (foodLog.foods || []).forEach(food => {
      total.protein += food.foodItem.nutrients.protein * food.quantity;
      total.fat += food.foodItem.nutrients.fat * food.quantity;
      total.calories += food.foodItem.nutrients.calories * food.quantity;
      total.carbohydrates += food.foodItem.nutrients.carbohydrates * food.quantity;
    });

    return total;
  };

  const totalNutrients = getTotalNutrients();

  const handleMealClick = (meal) => {
    setActiveMeal(meal);
    setQuery('');
    setResults([]);
    setSelectedFood(null);
    setFoodDetails(null);
  };

  const handleFoodClick = (meal, index) => {
    const key = `${meal}-${index}`;
    setShowMacros((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteClick = async (foodItemId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      await deleteFoodFromLog(foodItemId);
    }
  };

  const handleServingsChange = async (foodItemId, newServings) => {
    if (newServings === '' || isNaN(newServings) || Number(newServings) < 0) {
      // Do not update the state if the input is empty or invalid
      return;
    }
    try {
      const response = await axios.put('http://localhost:5000/foodlog/update', {
        userId,
        date: currentDate.toISOString().split('T')[0],
        foodItemId,
        quantity: newServings,
      });
      setFoodLog(response.data);
    } catch (error) {
      console.error('Error updating servings', error);
    }
  };
  const handleToggleDetails = (meal, index) => {
    const key = `${meal}-${index}`;
    setShowMacros((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <div className="food-tracker">
      <Navbar />
      <div className="date-navigation">
        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))}>←</button>
        <span>{currentDate.toDateString()}</span>
        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))} disabled={!isNextDayEnabled()}>→</button>
      </div>
      <div className="total-nutrients">
        <h3>Total Nutrients for the Day</h3>
        <p>Calories: {totalNutrients.calories.toFixed(1)}</p>
        <p>Protein: {totalNutrients.protein.toFixed(1)} g</p>
        <p>Fat: {totalNutrients.fat.toFixed(1)} g</p>
        <p>Carbohydrates: {totalNutrients.carbohydrates.toFixed(1)} g</p>
      </div>
      {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
        <div key={meal}>
          <h3>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h3>
          <button onClick={() => handleMealClick(meal)}>Add Food</button>
          {activeMeal === meal && (
            <div ref={searchBoxRef}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for food..."
              />
              {results.length > 0 && (
                <ul style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                  {results.map((food) => (
                    <li key={food.fdcId} onClick={() => setSelectedFood(food)}>
                      {food.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <ul>
            {(foodLog.foods?.filter(f => f.meal === meal) || []).map((food, index) => (
              <li key={index}>
                <div >
                  {food.foodItem.description} - {food.foodItem.nutrients.calories * food.quantity} calories
                  {showMacros[`${meal}-${index}`] && (
                    <div>
                      <p>Protein: {food.foodItem.nutrients.protein * food.quantity} g</p>
                      <p>Fat: {food.foodItem.nutrients.fat * food.quantity} g</p>
                      <p>Carbohydrates: {food.foodItem.nutrients.carbohydrates * food.quantity} g</p>
                      <label>
                        Servings:
                        <input
                          type="number"
                          value={food.quantity}
                          onChange={(e) => handleServingsChange(food._id, e.target.value)}
                          min = "0"
                          onFocus={(e) => e.target.select()}  
                        />
                      </label>
                    </div>
                  )}
                </div>
                <button onClick={() => handleToggleDetails(meal, index)} className="toggle-button">
                  <i className="fas fa-bars"></i>
                </button>                     
                <button onClick={() => handleDeleteClick(food._id)} className="delete-button">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {selectedFood && foodDetails && (
        <div className="fixed-popup">
          <button onClick={() => setSelectedFood(null)}>Close</button>
          <h3>{foodDetails.description}</h3>
          {foodDetails.brandOwner && <p>Brand: {foodDetails.brandOwner}</p>}
          {foodDetails.ingredients && <p>Ingredients: {foodDetails.ingredients}</p>}
          <div>
            <label>
              Serving Size Unit:
              <select
                value={servingSizeUnit}
                onChange={(e) => setServingSizeUnit(e.target.value)}
              >
                <option value="serving">{servingSizeInGrams ?? 'N/A'} {servingSizeUnitDisplay}</option>
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
          <div>
            <p>Calories: {foodDetails.labelNutrients ? getNutrientValueSafe(foodDetails.labelNutrients, 'calories', servingSizeInGrams).toFixed(1) : getFoodNutrientValue(foodDetails.foodNutrients, '208', servingSizeInGrams).toFixed(1)}</p>
            <p>Protein: {foodDetails.labelNutrients ? getNutrientValueSafe(foodDetails.labelNutrients, 'protein', servingSizeInGrams).toFixed(1) : getFoodNutrientValue(foodDetails.foodNutrients, '203', servingSizeInGrams).toFixed(1)} g</p>
            <p>Fat: {foodDetails.labelNutrients ? getNutrientValueSafe(foodDetails.labelNutrients, 'fat', servingSizeInGrams).toFixed(1) : getFoodNutrientValue(foodDetails.foodNutrients, '204', servingSizeInGrams).toFixed(1)} g</p>
            <p>Carbohydrates: {foodDetails.labelNutrients ? getNutrientValueSafe(foodDetails.labelNutrients, 'carbohydrates', servingSizeInGrams).toFixed(1) : getFoodNutrientValue(foodDetails.foodNutrients, '205', servingSizeInGrams).toFixed(1)} g</p>
          </div>
          <button onClick={() => addFoodToLog(activeMeal)}>Add to {activeMeal.charAt(0).toUpperCase() + activeMeal.slice(1)}</button>
        </div>
      )}
    </div>
  );
};

export default FoodTracker;
