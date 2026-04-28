import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { tournamentAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/Tournament.css';

export default function BusinessHostTournamentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eventName, setEventName] = useState('');
  const [venue, setVenue] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [audience, setAudience] = useState('');

  const handleSubmit = async () => {
    try {
      const tournamentData = {
        tournament_name: eventName || 'New Event',
        description: `Venue: ${venue}, Audience: ${audience}, Prize: ${prizePool}`,
        game_id: null,
        tournament_format: 'single_elimination',
        max_players: 16,
        entry_fee: 0,
        start_date: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        host_type: 'business'
      };
      const response = await tournamentAPI.create(tournamentData);
      navigate(`/tournament/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create tournament:', error);
const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to create tournament: ${errorMsg}`);
    }
  };


  return (
    <div className="host-tournament-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="avatar-circle business-avatar" />
          <div className="welcome-block">
            <p className="welcome-label">Business</p>
            <p className="welcome-name">{user?.business_name || user?.username || 'Host'}</p>
          </div>
        </div>

        <div className="topbar-center">
          <button className="top-tab" type="button" onClick={() => navigate('/business-home')}>Home</button>
          <button className="top-tab active" type="button">Host</button>
          <button className="top-tab" type="button" onClick={() => navigate('/business-logs')}>Logs</button>
        </div>

        <div className="topbar-right">
          <img src={logo} alt="Gamelink logo" />
        </div>
      </div>

      <div className="host-heading-row">
        <h1>Business Tournament Manager</h1>
        <div className="host-badge">Event details</div>
      </div>

      <div className="host-grid">
        <section className="host-panel">
          <div className="panel-title">Event summary</div>
          <div className="panel-section">
            <input
              type="text"
              placeholder="Event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Venue / platform"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
            <input
              type="text"
              placeholder="Expected audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Rewards & schedule</div>
          <div className="panel-section">
            <input
              type="text"
              placeholder="Prize pool"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
            />
            <textarea placeholder="Describe the event strengths" rows={6} />
            <div className="outline-card">Promotion status: Ready to publish</div>
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Publish controls</div>
          <div className="panel-section">
            <button className="start-tournament-button" type="button" onClick={handleSubmit}>
              Publish event
            </button>
            <div className="registered-list">
              <p className="registered-title">Live preview</p>
              <div className="registered-placeholder">Your event will appear in feeds once published.</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

