import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { gamerAPI } from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import logo from '../Assets/logo.png';
import './styles/Profile.css';

export default function GamerProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwordFields, setPasswordFields] = useState({ current_password: '', new_password: '' });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.id) {
          const response = await gamerAPI.getProfile(user.id);
          setProfile(response.data);
          setFormData(response.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!passwordFields.current_password) {
      alert('Please enter your current password to save changes.');
      return;
    }

    try {
      const payload = {
        ...formData,
        current_password: passwordFields.current_password
      };

      if (passwordFields.new_password) {
        payload.new_password = passwordFields.new_password;
      }

      const response = await gamerAPI.updateProfile(user.id, payload);
      setProfile(response.data);
      setFormData(response.data);
      setIsEditing(false);
      setPasswordFields({ current_password: '', new_password: '' });
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      const message = error?.response?.data?.error || 'Failed to save profile';
      alert(message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!passwordFields.current_password) {
      alert('Please enter your current password to delete your account.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await gamerAPI.deleteProfile(user.id, { current_password: passwordFields.current_password });
      logout();
      navigate('/login');
      alert('Your account was deleted successfully.');
    } catch (error) {
      console.error('Failed to delete account:', error);
      const message = error?.response?.data?.error || 'Failed to delete account';
      alert(message);
    }
  };

  const gamerTag = profile?.username || user?.username || profile?.email?.split('@')[0] || '';

  if (!profile) {
    return <LoadingScreen />;
  }

  return (
    <div className="profile-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="avatar-circle" />
          <div className="welcome-block">
            <p className="welcome-label">Welcome</p>
            <p className="welcome-name">{gamerTag}</p>
          </div>
        </div>

        <div className="topbar-center">
          <button className="top-tab active" type="button" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="top-tab" type="button" onClick={() => navigate('/gamer-home')}>
            Home
          </button>
          <button className="top-tab" type="button" onClick={() => navigate('/activities')}>
            Activities
          </button>
        </div>

        <div className="topbar-right">
          <Link to="/gamer-home">
            <img src={logo} alt="GameLink logo" />
          </Link>
        </div>
      </div>

      <div className="profile-title-row">
        <h1>Gamer Profile</h1>
        <div className="profile-title-line" />
      </div>

      <div className="profile-card">
        <div className="profile-card-inner">
          <div className="profile-card-content">
            {!isEditing ? (
              <div className="profile-view">
                <div className="profile-grid">
                  <div className="profile-item">
                    <span className="profile-label">First Name</span>
                    <span className="profile-value">{profile.first_name}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Second Name</span>
                    <span className="profile-value">{profile.last_name}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Gamer Tag</span>
                    <span className="profile-value">{gamerTag}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Email</span>
                    <span className="profile-value">{profile.email}</span>
                  </div>
                  <div className="profile-item">
                    <span className="profile-label">Phone</span>
                    <span className="profile-value">{profile.phone_number || '—'}</span>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="button-primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-edit">
                <div className="profile-edit-fields">
                  <div className="edit-field">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="First Name"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone_number || ''}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      placeholder="Phone"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                </div>
                <div className="profile-section" autoComplete="off">
                  <div className="profile-section-title">Change password</div>
                  <input type="text" name="fakeusername" autoComplete="username" style={{ display: 'none' }} />
                  <input type="password" name="fakepassword" autoComplete="new-password" style={{ display: 'none' }} />
                  <div className="password-grid">
                    <div className="edit-field">
                      <label>Current password</label>
                      <input
                        name="current-password"
                        type="password"
                        value={passwordFields.current_password}
                        onChange={(e) => setPasswordFields({ ...passwordFields, current_password: e.target.value })}
                        placeholder="Current password"
                      />
                    </div>
                    <div className="edit-field">
                      <label>New password</label>
                      <input
                        name="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={passwordFields.new_password}
                        onChange={(e) => setPasswordFields({ ...passwordFields, new_password: e.target.value })}
                        placeholder="New password"
                      />
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="button-danger" type="button" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                  <button className="button-primary" onClick={handleSaveProfile}>
                    Save changes
                  </button>
                  <button className="button-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
