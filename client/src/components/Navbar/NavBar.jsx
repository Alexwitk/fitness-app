import React from 'react';
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  Box,
  IconButton,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setLogout } from '../../state/index.js';
import { useNavigate } from "react-router-dom";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import '../../NavBar.css'; 

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const goToWeightTracker = () => {
    navigate('/weight-tracker');
  };

  const goToFoodTracker = () => {
    navigate('/food-tracker');
  };

  return (
    <Box className="navbar">
      <Typography
        className="navbar-title"
        onClick={() => navigate("/homepage")}
      >
        Fitness
      </Typography>

      <Box className="navbar-buttons-container">
        <IconButton
          onClick={goToWeightTracker}
          className="navbar-button"
        >
          <FitnessCenterIcon className="navbar-icon" />
        </IconButton>
        <IconButton
          onClick={goToFoodTracker}
          className="navbar-button"
        >
          <FastfoodIcon className="navbar-icon" />
        </IconButton>
      </Box>

      <Box className="navbar-select-container">
        <FormControl variant="standard" className="navbar-select">
          <Select
            value="Fitness App"
            className="navbar-select-input"
          >
            <MenuItem value="Fitness App" disabled className="navbar-menu-item">
              Fitness App
            </MenuItem>
            <MenuItem onClick={() => dispatch(setLogout())} className="navbar-menu-item">Log Out</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Navbar;
