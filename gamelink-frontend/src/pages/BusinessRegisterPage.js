import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/Auth.css';

export default function BusinessRegisterPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    businessNumber: '',
    email: '',
    physicalAddress: '',
    phone: '',
    adminFullName: '',
    adminContact: '',
    adminRole: '',
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
        username: formData.businessName,
        email: formData.email,
        password: formData.password,
        account_type: 'business',
        business_name: formData.businessName,
        phone_number: formData.phone,
        address: formData.physicalAddress,
        owner_name: formData.adminFullName
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

        <div className="auth-card business-register-card">
          <div className="section-heading">
            <h1>Business Account</h1>
          </div>
          <div className="section-divider" />
          {error && <div className="error-message">{error}</div>}

          <form className="business-form" onSubmit={handleSubmit}>
            <div className="business-columns">
              <div className="business-column">
                <div className="section-heading">
                  <h2>Business Details</h2>
                </div>
                <div className="section-divider section-divider--tight" />
                <div className="form-grid">
                  <div className="field-group">
                    <label htmlFor="businessName">Business/eSports team name</label>
                    <input
                      id="businessName"
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="businessType">Business type</label>
                    <input
                      id="businessType"
                      type="text"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="businessNumber">Business Number</label>
                  <input
                    id="businessNumber"
                    type="text"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="section-heading section-heading--sub">
                  <h2>Contact information</h2>
                </div>
                <div className="section-divider section-divider--tight" />
                <div className="form-grid">
                  <div className="field-group">
                    <label htmlFor="email">Email address</label>
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
                    <label htmlFor="physicalAddress">Physical address</label>
                    <input
                      id="physicalAddress"
                      type="text"
                      name="physicalAddress"
                      value={formData.physicalAddress}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="business-column">
                <div className="section-heading">
                  <h2>Admin Details</h2>
                </div>
                <div className="section-divider section-divider--tight" />
                <div className="form-grid">
                  <div className="field-group">
                    <label htmlFor="adminFullName">Full Name</label>
                    <input
                      id="adminFullName"
                      type="text"
                      name="adminFullName"
                      value={formData.adminFullName}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field-group">
                    <label htmlFor="adminContact">Contact information</label>
                    <input
                      id="adminContact"
                      type="text"
                      name="adminContact"
                      placeholder="email or phone number"
                      value={formData.adminContact}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="adminRole">Role/Position</label>
                  <input
                    id="adminRole"
                    type="text"
                    name="adminRole"
                    value={formData.adminRole}
                    onChange={handleChange}
                  />
                </div>

                <div className="section-heading section-heading--sub">
                  <h2>Create Password</h2>
                </div>
                <div className="section-divider section-divider--tight" />
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
