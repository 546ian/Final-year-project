import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import './styles/BusinessLogs.css';

export default function BusinessLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBusinessLogs();
  }, [user?.id]);

  const loadBusinessLogs = async () => {
    try {
      // TODO: Add API call to fetch business logs
      setLogs([]);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  return (
    <div className="business-logs-page">
      <h1>Business Logs & Ads</h1>

      <div className="filter-options">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
          All
        </button>
        <button onClick={() => setFilter('tournament')} className={filter === 'tournament' ? 'active' : ''}>
          Tournaments
        </button>
        <button onClick={() => setFilter('activity')} className={filter === 'activity' ? 'active' : ''}>
          Activities
        </button>
        <button onClick={() => setFilter('payment')} className={filter === 'payment' ? 'active' : ''}>
          Payments
        </button>
      </div>

      <div className="logs-container">
        {logs.length === 0 ? (
          <p>No logs available</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="log-item">
              <p><strong>{log.type}:</strong> {log.description}</p>
              <p className="log-date">{new Date(log.created_at).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>

      <div className="ads-section">
        <h2>Posts & Media</h2>
        <button>Post New Ad</button>
        {/* Media posts will display here */}
      </div>
    </div>
  );
}
