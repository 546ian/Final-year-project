import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gamerBg from '../Assets/gamer.jpg';
import businessBg from '../Assets/busi.jpg';
import logo from '../Assets/logo.png';
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
        <div className="register-header">
          <div className="brand">
            <img src={logo} alt="Gamelink logo" />
            <span>Gamelink</span>
          </div>

          <button className="back-link" type="button" onClick={() => navigate('/login')}>
            ← Back to Login
          </button>
        </div>

        <div className="register-intro">
          <h1>
            Choose account type
          </h1>
          <div className="title-underline" />
        </div>

        <div className="account-type-selector">
          <div
            className={`account-tile gamer-tile ${accountType === 'gamer' ? 'hovered' : ''}`}
            style={{ backgroundImage: `url(${gamerBg})` }}
            onMouseEnter={() => setAccountType('gamer')}
            onMouseLeave={() => setAccountType(null)}
            onClick={() => selectAccountType('gamer')}
          >
            <div className="tile-overlay" />
            <div className="tile-content">
              <div className="tile-title">Gamer Account</div>
              <div className="tile-description">Personal use, tournaments & player analytics</div>
              <ul className="tile-feature-list">
                <li>Personal use</li>
                <li>Sign up for tournaments</li>
                <li>PVP take ons with online transaction emulation</li>
                <li>Get monitored & recognized by eSports teams</li>
                <li>Accolade advertisements</li>
                <li>Gamer data analysis</li>
              </ul>
            </div>
          </div>

          <div
            className={`account-tile business-tile ${accountType === 'business' ? 'hovered' : ''}`}
            style={{ backgroundImage: `url(${businessBg})` }}
            onMouseEnter={() => setAccountType('business')}
            onMouseLeave={() => setAccountType(null)}
            onClick={() => selectAccountType('business')}
          >
            <div className="tile-overlay" />
            <div className="tile-content">
              <div className="tile-title">Business Account</div>
              <div className="tile-description">Business and eSports team account</div>
              <ul className="tile-feature-list">
                <li>Monitor & sign pro players with gamer accounts</li>
                <li>Manage signed-player movements</li>
                <li>Hold and manage tournaments</li>
                <li>Monitor players on-site</li>
                <li>Advertisements</li>
                <li>Business analysis</li>
                <li>Online transaction emulation</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
