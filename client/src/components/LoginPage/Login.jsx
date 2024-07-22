import React, { useState} from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../../AuthForm.css'; 
import { setLogin } from '../../state/index.js';
import { useDispatch} from 'react-redux';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { email, password } = formData;
    const dispatch = useDispatch();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { email, password });
            dispatch(setLogin({
                user: res.data.user,
                token: res.data.token,
            }));
            navigate('/homepage'); 
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            setError('User does not exist or invalid credentials');
        }
    };

    return (
        <div className="auth-form">
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={onChange}
                        placeholder="Email"
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={onChange}
                        placeholder="Password"
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p className="auth-link">
                Don't have an account? <Link to="/register">Sign up here</Link>
            </p>
        </div>
    );
};

export default Login;
