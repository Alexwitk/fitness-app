import React from 'react';
import Navbar from '../Navbar/NavBar';  
import fitnessImage from '../../assets/homepage-image.jpeg';
import '../../HomePage.css'; 

const HomePage = () => {
    return (
        <div className="homepage">
            <Navbar />
            <div className="image-container">
                <img src={fitnessImage} alt="Fitness" className="homepage-image" />
                <div className="welcome-message">
                    Welcome to the Fitness App! <br />
                    Track your calories, monitor your weight, and stay motivated.
                </div>
            </div>
        </div>
    );
};

export default HomePage;
