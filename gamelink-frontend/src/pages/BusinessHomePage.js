import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { businessAPI, activityAPI } from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import './styles/BusinessHome.css';

export default function BusinessHomePage() {
  const { user } = useAuth();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadBusinessData();
  }, [user?.id]);

  const loadBusinessData = async () => {
    try {
      if (user?.id) {
        const response = await businessAPI.getProfile(user.id);
        setBusinessInfo(response.data);
        const activitiesResponse = await activityAPI.getAll();
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load business data:', error);
    }
  };

  if (!businessInfo) return <LoadingScreen />;

  return (
    <div className="business-home">
      <div className="header">
        <h1>{businessInfo.business_name}</h1>
      </div>

      <div className="content">
        {/* Business Info Section */}
        <section className="info-section">
          <div className="section-header">
            <h2>Business Information</h2>
            <button onClick={() => setShowEditModal(true)}>Edit</button>
          </div>
          <div className="info-card">
            <p><strong>Owner:</strong> {businessInfo.owner_name}</p>
            <p><strong>Phone:</strong> {businessInfo.phone_number}</p>
            <p><strong>Location:</strong> {businessInfo.location}</p>
            <p><strong>Address:</strong> {businessInfo.address}</p>
            <button className="mpesa-btn">Pay via M-Pesa</button>
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="tournaments-section">
          <h2>Tournaments</h2>
          <button>Host Tournament</button>
          <div className="tournaments-list">
            {/* Tournament items */}
          </div>
        </section>

        {/* Activities Section */}
        <section className="activities-section">
          <div className="section-split">
            <div className="manual-activities">
              <h3>Manual Activities</h3>
              <button onClick={() => setShowActivityModal(true)}>Add Activity</button>
              {activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <p>{activity.player_names}</p>
                </div>
              ))}
            </div>
            <div className="remote-activities">
              <h3>Remote Activities (Gaming Consoles)</h3>
              {/* Remote activity monitoring */}
            </div>
          </div>
        </section>

        {/* Team Management Section */}
        <section className="team-section">
          <h2>Manage Team</h2>
          <div className="team-split">
            <div className="assign-players">
              <h3>Assign Players to Tournaments</h3>
              <button>Assign</button>
            </div>
            <div className="business-analysis">
              <h3>Business Analysis</h3>
              {/* Analytics graphs */}
            </div>
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Business Info</h2>
            {/* Edit form */}
            <button onClick={() => setShowEditModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
