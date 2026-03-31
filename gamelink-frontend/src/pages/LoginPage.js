import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../utils/api';
import gamelinkLogo from '../Assets/GL login.jpg';
import './styles/Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(email, password);
      login(response.data.user, response.data.token);
      navigate(response.data.user.account_type === 'business' ? '/business-home' : '/gamer-home');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="gamelink-logo">
          <img src={gamelinkLogo} alt="Gamelink" />
        </div>
        <h1 className="welcome-heading">WELCOME TO GAMELINK</h1>
        <h2 className="login-subheading">Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Username or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p className="register-link">Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
}
