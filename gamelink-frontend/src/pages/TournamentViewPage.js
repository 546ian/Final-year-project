import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { tournamentAPI } from '../utils/api';
import TournamentBracket from '../components/TournamentBracket';
import { demoTournaments, demoParticipants } from './tournament-data.js';


import logo from '../Assets/logo.png';

import './styles/Tournament.css';

export default function TournamentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === 'preview1') {

      // Demo mode
      setTournament(demoTournaments.demo1);
      setParticipants(demoParticipants.demo1);
      setLoading(false);
      return;
    }
    
    const fetchTournament = async () => {
      try {
        const [tourneyResponse, partsResponse] = await Promise.all([
          tournamentAPI.getDetails(id),
          tournamentAPI.getParticipants(id)
        ]);
        setTournament(tourneyResponse.data);
        setParticipants(partsResponse.data || []);
      } catch (error) {
        console.error('Failed to fetch tournament:', error.response?.data || error.message || error);
        setTournament(null);
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
  }, [id]);



  if (loading) return <div className="loading">Loading tournament...</div>;
  if (!tournament) return <div>Tournament not found</div>;

  return (
    <div className="tournament-view-page host-tournament-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="avatar-circle" style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="welcome-block">
            <p className="welcome-label">{user.account_type === 'business' ? 'Business' : 'Gamer'}</p>
            <p className="welcome-name">{user?.business_name || user?.username || 'Host'}</p>
          </div>
        </div>
        <div className="topbar-center">
          <button className="top-tab" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="top-tab" onClick={() => navigate(user.account_type === 'business' ? '/business-home' : '/gamer-home')}>
            Home
          </button>
          <button className="top-tab active">Tournament</button>
        </div>
        <div className="topbar-right">
          <Link to={user.account_type === 'business' ? '/business-home' : '/gamer-home'}>
            <img src={logo} alt="Gamelink logo" />
          </Link>
        </div>
      </div>

      <div className="host-heading-row">
        <h1>{tournament.tournament_name}</h1>
        <div className="host-badge">{tournament.status.toUpperCase()}</div>
      </div>

      <div className="tournament-details-grid">
        <section className="host-panel">
          <div className="panel-title">Details</div>
          <div className="panel-section">
            <p><strong>Game:</strong> {tournament.game_name || 'TBD'}</p>
            <p><strong>Format:</strong> {tournament.tournament_format}</p>
            <p><strong>Max Players:</strong> {tournament.max_players}</p>
            <p><strong>Entry Fee:</strong> ${tournament.entry_fee}</p>
            <p><strong>Start:</strong> {new Date(tournament.start_date).toLocaleString()}</p>
            {tournament.description && <p><strong>Description:</strong> {tournament.description}</p>}
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Participants ({participants.length}/{tournament.max_players})</div>
          <div className="panel-section">
            <div className="participants-list">
              {participants.map((p, idx) => (
                <div key={idx} className="participant-item">
                  {p.username}
                </div>
              ))}
              {participants.length === 0 && <div className="registered-placeholder">No participants yet</div>}
            </div>
          </div>
        </section>
      </div>

      <TournamentBracket tournamentId={id} />

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button 
          className="start-tournament-button" 
          style={{ maxWidth: '300px' }}
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}

