import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/NavBar';  

const HomePage = () => {
    const navigate = useNavigate();

    const goToWeightTracker = () => {
        navigate('/weight-tracker');
    };
    const goToFoodTracker = () => {
        navigate('/food-tracker');
    };
    return (
        <div className="homepage">
            <Navbar />
            <button onClick={goToWeightTracker}>Go to Weight Tracker</button>
            <button onClick={goToFoodTracker}>Go to Food Tracker</button>
        </div>
    );
};

export default HomePage;
