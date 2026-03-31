import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Auth.css';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState(null);
  const navigate = useNavigate();

  const selectAccountType = (type) => {
    navigate(`/register/${type}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="gamelink-logo">
          <h1>Gamelink</h1>
        </div>
        <h2>Create Your Account</h2>
        <p>Select Account Type</p>
        
        <div className="account-type-selector">
          <div
            className="account-tile gamer-tile"
            onMouseEnter={() => setAccountType('gamer')}
            onMouseLeave={() => setAccountType(null)}
            onClick={() => selectAccountType('gamer')}
          >
            <div className="tile-icon">👾</div>
            <h3>Gamer</h3>
            <p>Play, compete & track progress</p>
          </div>

          <div
            className="account-tile business-tile"
            onMouseEnter={() => setAccountType('business')}
            onMouseLeave={() => setAccountType(null)}
            onClick={() => selectAccountType('business')}
          >
            <div className="tile-icon">🏢</div>
            <h3>Business</h3>
            <p>Host tournaments & manage venue</p>
          </div>
        </div>

        <p className="login-link">Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}
