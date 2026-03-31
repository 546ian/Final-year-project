import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { businessAPI } from '../utils/api';
import './styles/Profile.css';

export default function GamerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      if (user?.id) {
        const response = await businessAPI.getProfile(user.id);
        setProfile(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await businessAPI.updateProfile(user.id, formData);
      setProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      {!isEditing ? (
        <div className="profile-view">
          <p><strong>Name:</strong> {profile.first_name} {profile.last_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone_number}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      ) : (
        <div className="profile-edit">
          <input
            type="text"
            value={formData.first_name || ''}
            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            placeholder="First Name"
          />
          <input
            type="text"
            value={formData.last_name || ''}
            onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            placeholder="Last Name"
          />
          <input
            type="tel"
            value={formData.phone_number || ''}
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            placeholder="Phone"
          />
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            placeholder="Location"
          />
          <button onClick={handleSaveProfile}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
