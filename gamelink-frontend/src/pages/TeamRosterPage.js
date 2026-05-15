import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { businessAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/TeamRoster.css';

export default function TeamRosterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedView, setSelectedView] = useState('team');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const loadTeamRoster = async () => {
      try {
        const response = await businessAPI.getTeamRoster(user.id);
        setTeamMembers(response.data || []);
        setSelectedMember(response.data?.[0] || null);
      } catch (error) {
        console.error('Failed to load team roster:', error);
      }
    };

    if (user?.id) {
      loadTeamRoster();
    }
  }, [user?.id]);

  const filteredMembers = teamMembers.filter((member) => {
    const name = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const stats = selectedMember?.stats || {
    played: 12,
    won: 7,
    lost: 3,
    quarter: '4/8',
    money: 'Ksh 18,000',
  };

  return (
    <div className="team-roster-page">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="Gamelink logo" className="topbar-logo" />
        </div>
        <div className="topbar-center">
          <button className="top-tab active" type="button">Team Roster</button>
          <button className="top-tab" type="button" onClick={() => navigate('/business-home')}>Home</button>
          <button className="top-tab" type="button" onClick={() => navigate('/business-logs')}>Business logs & Ads</button>
        </div>
        <div className="topbar-right">
          <div className="topbar-avatar-placeholder">{user?.username?.charAt(0).toUpperCase() || 'B'}</div>
        </div>
      </div>

      <div className="roster-inner">
        <div className="roster-panel roster-list-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">eSports Club Management</p>
              <h2>Team roster</h2>
            </div>
            <div className="header-line" />
          </div>

          <div className="search-row">
            <label>Search player to monitor:</label>
            <input
              type="text"
              placeholder="Search player"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="toggle-row">
            <button
              type="button"
              className={selectedView === 'monitor' ? 'toggle-button active orange' : 'toggle-button'}
              onClick={() => setSelectedView('monitor')}
            >
              Players monitoring
            </button>
            <button
              type="button"
              className={selectedView === 'team' ? 'toggle-button active orange' : 'toggle-button'}
              onClick={() => setSelectedView('team')}
            >
              Team players
            </button>
          </div>

          <div className="player-list">
            {(filteredMembers.length > 0 ? filteredMembers : [
              { id: 'empty-1', first_name: 'Team player' },
              { id: 'empty-2', first_name: 'Team player' },
              { id: 'empty-3', first_name: 'Team player' },
              { id: 'empty-4', first_name: 'Team player' },
              { id: 'empty-5', first_name: 'Team player' },
              { id: 'empty-6', first_name: 'Team player' },
              { id: 'empty-7', first_name: 'Team player' },
            ]).map((member) => (
              <button
                key={member.id}
                type="button"
                className={`player-item ${selectedMember?.id === member.id ? 'selected' : ''}`}
                onClick={() => setSelectedMember(member)}
              >
                {member.first_name} {member.last_name || ''}
              </button>
            ))}
          </div>
        </div>

        <div className="roster-panel roster-detail-panel">
          <div className="detail-header">
            <div className="detail-text">
              <div className="detail-row"><span>Name:</span> <strong>{selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name || ''}` : 'Select player'}</strong></div>
              <div className="detail-row"><span>esports team:</span> <strong>{selectedMember?.role || 'Main team'}</strong></div>
              <div className="detail-row"><span>Monitored by:</span> <strong>{user?.business_name || user?.username || 'Business'}</strong></div>
              <div className="detail-row"><span>Accolades:</span> <strong>{selectedMember?.contract_status || 'None yet'}</strong></div>
            </div>

            <div className="detail-avatar-block">
              <div className="avatar-large" />
            </div>
          </div>

          <div className="detail-actions-row">
            <button type="button" className="action-button monitor">Monitor</button>
            <button type="button" className="action-button assign">Assign tournament</button>
            <button type="button" className="action-button sign">Sign player</button>
            <button type="button" className="action-button release">Release player</button>
          </div>

          <div className="stats-section">
            <div className="stats-title">Stats</div>
            <div className="stats-card">
              <div className="stats-row"><span>Tournaments played:</span> <strong>{stats.played}</strong></div>
              <div className="stats-row"><span>Tournaments won:</span> <strong>{stats.won}</strong></div>
              <div className="stats-row"><span>Tournaments lost:</span> <strong>{stats.lost}</strong></div>
              <div className="stats-row"><span>Advance from quarters:</span> <strong>{stats.quarter}</strong></div>
              <div className="stats-row"><span>Money won:</span> <strong>{stats.money}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
