import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CssBaseline } from '@mui/material';
import Login from './components/LoginPage/Login';
import Register from './components/RegisterPage/Register';
import HomePage from './components/HomePage/HomePage';
import WeightTracker from './components/WeightPage/WeightTracker';
import FoodTracker from './components/FoodPage/FoodTracker';
import '@fortawesome/fontawesome-free/css/all.min.css';
function App() {
  const isAuth = Boolean(useSelector((state) => state.token));

  return (
    <div className="app">
      <BrowserRouter>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/homepage"
              element={isAuth ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/weight-tracker"
              element={isAuth ? <WeightTracker /> : <Navigate to="/login" />}
            />
            <Route
              path="/food-tracker"
              element={isAuth ? <FoodTracker /> : <Navigate to="/login" />}
            />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
