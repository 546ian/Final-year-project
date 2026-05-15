import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import logo from '../Assets/logo.png';
import './styles/BusinessLogs.css';

export default function BusinessLogsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: 'Uploaded new gaming center highlights',
      description: 'A quick recap of the weekend tournament and player moments.',
      timestamp: '2 hrs ago',
    },
    {
      id: 2,
      title: 'New event promotion live',
      description: 'Advertised upcoming double elimination play day.',
      timestamp: '1 day ago',
    },
  ]);

  useEffect(() => {
    loadBusinessLogs();
  }, [user?.id]);

  const loadBusinessLogs = async () => {
    try {
      // TODO: Add API call to fetch business logs
      setLogs([
        { id: 1, label: 'Registered games', value: '7' },
        { id: 2, label: 'Matches recorded', value: '18' },
        { id: 3, label: 'Elapsed Minutes recorded', value: '450' },
        { id: 4, label: 'Payments initiated', value: '23' },
        { id: 5, label: 'Amount of payment prompted', value: 'Ksh 120,000' },
        { id: 6, label: 'Players visited', value: '64' },
        { id: 7, label: 'Tournaments hosted', value: '4' },
        { id: 8, label: 'Avg players registered for tournament', value: '14' },
        { id: 9, label: 'Players Monitoring', value: '12' },
        { id: 10, label: 'Signed players', value: '8' },
        { id: 11, label: 'Tournaments won by signed players', value: '3' },
        { id: 12, label: 'Tournaments lost by signed players', value: '1' },
        { id: 13, label: 'Items posted', value: '18' },
        { id: 14, label: 'View Activities', value: 'See log details' },
      ]);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const handleAddPost = () => {
    if (!commentText.trim()) return;
    setPosts((prev) => [
      {
        id: Date.now(),
        title: 'New post',
        description: commentText.trim(),
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    setCommentText('');
  };

  const handleCancelPost = () => {
    setCommentText('');
  };

  return (
    <div className="business-logs-page">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="Gamelink logo" className="topbar-logo" />
        </div>
        <div className="topbar-center">
          <button className="top-tab" type="button" onClick={() => navigate('/team-roster')}>Team Roster</button>
          <button className="top-tab" type="button" onClick={() => navigate('/business-home')}>Home</button>
          <button className="top-tab active" type="button">Business logs & Ads</button>
        </div>
        <div className="topbar-right">
          <div className="topbar-avatar-placeholder">{user?.username?.charAt(0).toUpperCase() || 'B'}</div>
        </div>
      </div>

      <div className="logs-inner">
        <section className="posts-panel">
          <div className="posts-header">
            <div className="posts-icon">+</div>
            <div className="posts-title">POSTS</div>
          </div>

          <div className="post-form">
            <div className="upload-box">Upload media</div>
            <textarea
              className="comment-input"
              placeholder="Comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="post-actions">
              <button type="button" className="add-button" onClick={handleAddPost}>Add</button>
              <button type="button" className="cancel-button" onClick={handleCancelPost}>Cancel</button>
            </div>
          </div>

          <div className="divider" />

          <div className="posts-feed">
            {posts.map((post) => (
              <div key={post.id} className="feed-card">
                <div className="feed-visual" />
                <div className="feed-text">
                  <h4>{post.title}</h4>
                  <p>{post.description}</p>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="logs-panel">
          <div className="logs-title-row">
            <div />
            <div className="logs-title">LOGS</div>
          </div>
          <div className="logs-list">
            {logs.map((item) => (
              <div key={item.id} className="log-row">
                <span>{item.label}:</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
