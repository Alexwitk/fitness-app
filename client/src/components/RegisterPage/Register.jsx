import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../AuthForm.css';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const { email, password } = formData;
    const navigate = useNavigate();

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/auth/register', { email, password });
            navigate('/login');
        } catch (err) {
            setError('User already exists');
            console.error(err.response?.data || err.message);
        }
    };

    return (
        <div className="auth-form">
            <h2>Sign Up</h2>
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
                <button type="submit">Sign Up</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p className="auth-link">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;
