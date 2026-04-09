import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/Auth.css';

export default function GamerRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gamerTag: '',
    email: '',
    dob: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await authAPI.register({
        username: formData.gamerTag,
        email: formData.email,
        password: formData.password,
        account_type: 'gamer',
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone
      });
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="gamer-register-shell">
        <div className="page-topbar">
          <div className="topbar-brand">
            <img src={logo} alt="Gamelink logo" />
          </div>
          <button className="back-button" type="button" onClick={() => navigate('/register')}>
            ← Back to accounts
          </button>
        </div>

        <div className="auth-card gamer-register-card">
          <div className="section-heading">
            <h1>Gamer Account</h1>
          </div>
          <div className="section-divider" />

          {error && <div className="error-message">{error}</div>}

          <form className="gamer-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="lastName">Second name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="gamerTag">Gamer Tag</label>
                <input
                  id="gamerTag"
                  type="text"
                  name="gamerTag"
                  value={formData.gamerTag}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="section-heading section-heading--sub">
              <h2>Create Password</h2>
            </div>
            <div className="section-divider" />

            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="password">Input Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              Create account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
