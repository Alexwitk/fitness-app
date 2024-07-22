import React from 'react';
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  Box,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { setLogout } from '../../state/index.js';
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <Box display="flex" justifyContent="space-between" padding="1rem 6%">
      <Typography
        fontWeight="bold"
        fontSize="clamp(1rem, 2rem, 2.25rem)"
        color="primary"
        onClick={() => navigate("/homepage")}
        sx={{
          "&:hover": {
            cursor: "pointer",
          },
        }}
      >
        Fitness
      </Typography>

      <FormControl variant="standard" >
        <Select
          value="Fitness App" 
          sx={{
            width: "150px",
            borderRadius: "0.25rem",
            p: "0.25rem 1rem",
            "& .MuiSvgIcon-root": {
              pr: "0.25rem",
              width: "3rem",
            },
            "& .MuiSelect-select:focus": {
            },
          }}
        >
            <MenuItem value="Fitness App" disabled>
            Fitness App
          </MenuItem>
          <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Navbar;
