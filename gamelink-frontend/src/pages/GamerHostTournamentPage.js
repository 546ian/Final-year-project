import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import logo from '../Assets/logo.png';
import './styles/Tournament.css';

export default function GamerHostTournamentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tournament_name: '',
    description: '',
    game_id: '',
    stage_type: 'double',
    tournament_format: 'single_elimination',
    max_players: 4,
    entry_fee: 0,
    entry_fee_type: 'free',
    prize_money: '',
    start_date: '',
    start_time: '',
    url: '',
    gamer_tag: '',
    registration_type: 'manual',
    group_stage: '',
    final_stage: '',
    gamers_face: '',
    rank_by: '',
    group_participants: 4,
    advanced_participants: 0,
    invited_rivals: [],
    rival_tag: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleToggle = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleAddRival = () => {
    const rival = formData.rival_tag.trim();
    if (!rival) return;

    setFormData({
      ...formData,
      invited_rivals: [...formData.invited_rivals, rival],
      rival_tag: ''
    });
  };

  const handleCreateTournament = () => {
    alert('Gamer tournament preview created.');
  };

  return (
    <div className="host-tournament-page">
      <div className="topbar">
        <div className="topbar-left">
          <div className="avatar-circle" />
          <div className="welcome-block">
            <p className="welcome-label">Host</p>
            <p className="welcome-name">{user?.username || 'Gamer'}</p>
          </div>
        </div>

        <div className="topbar-center">
          <button className="top-tab" type="button" onClick={() => navigate('/profile')}>Profile</button>
          <button className="top-tab active" type="button" onClick={() => navigate('/gamer-home')}>Home</button>
          <button className="top-tab" type="button" onClick={() => navigate('/activities')}>Activities</button>
        </div>

        <div className="topbar-right">
          <img src={logo} alt="Gamelink logo" />
        </div>
      </div>

      <div className="host-heading-row">
        <h1>Gamer Host</h1>
        <div className="host-badge">Match Setup</div>
      </div>

      <div className="host-grid">
        <section className="host-panel">
          <div className="panel-title">Tournament details</div>
          <div className="panel-subtitle">Primary info</div>
          <div className="panel-section">
            <input
              type="text"
              name="tournament_name"
              placeholder="Tournament name"
              value={formData.tournament_name}
              onChange={handleChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
            />
            <div className="two-column-row">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
              />
            </div>
            <input
              type="text"
              name="url"
              placeholder="URL / stream link"
              value={formData.url}
              onChange={handleChange}
            />
            <div className="panel-subtitle">Tournament fee</div>
            <div className="fee-toggle">
              <button
                type="button"
                className={formData.entry_fee_type === 'free' ? 'active-toggle' : ''}
                onClick={() => handleToggle('entry_fee_type', 'free')}
              >
                Free
              </button>
              <button
                type="button"
                className={formData.entry_fee_type === 'paid' ? 'active-toggle' : ''}
                onClick={() => handleToggle('entry_fee_type', 'paid')}
              >
                Paid
              </button>
            </div>
            <input
              type="text"
              name="prize_money"
              placeholder="Prize money"
              value={formData.prize_money}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Game info</div>
          <div className="panel-subtitle">Select game</div>
          <div className="panel-section">
            <input
              type="text"
              name="game_id"
              placeholder="Search game"
              value={formData.game_id}
              onChange={handleChange}
            />
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="stage_type"
                  value="single"
                  checked={formData.stage_type === 'single'}
                  onChange={handleChange}
                />
                <span>Single</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="stage_type"
                  value="double"
                  checked={formData.stage_type === 'double'}
                  onChange={handleChange}
                />
                <span>Double (groups compete separately)</span>
              </label>
            </div>
            <div className="panel-subtitle">Double</div>
            <div className="two-column-row">
              <input
                type="text"
                name="group_stage"
                placeholder="Group stage"
                value={formData.group_stage}
                onChange={handleChange}
              />
              <input
                type="text"
                name="final_stage"
                placeholder="Final stage"
                value={formData.final_stage}
                onChange={handleChange}
              />
            </div>
            <div className="two-column-row">
              <input
                type="text"
                name="gamers_face"
                placeholder="Gamers face"
                value={formData.gamers_face}
                onChange={handleChange}
              />
              <input
                type="text"
                name="rank_by"
                placeholder="Rank by"
                value={formData.rank_by}
                onChange={handleChange}
              />
            </div>
            <div className="two-column-row">
              <input
                type="number"
                name="group_participants"
                placeholder="Group participants"
                value={formData.group_participants}
                onChange={handleChange}
              />
              <input
                type="number"
                name="advanced_participants"
                placeholder="Advanced participants"
                value={formData.advanced_participants}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Registration</div>
          <div className="panel-section">
            <input
              type="number"
              name="max_players"
              placeholder="Max number of participants"
              value={formData.max_players}
              onChange={handleChange}
            />
            <div className="panel-subtitle">Registration type</div>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="registration_type"
                  value="manual"
                  checked={formData.registration_type === 'manual'}
                  onChange={handleChange}
                />
                <span>Manual</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="registration_type"
                  value="signup"
                  checked={formData.registration_type === 'signup'}
                  onChange={handleChange}
                />
                <span>Sign-up</span>
              </label>
            </div>
            <button className="add-participants-button" type="button" onClick={() => alert('Add participants placeholder')}>
              + Add Participants
            </button>
            <div className="gamer-tag-row">
              <input
                type="text"
                name="rival_tag"
                placeholder="Gamer tag"
                value={formData.rival_tag}
                onChange={handleChange}
              />
              <button className="submit-tag-button" type="button" onClick={handleAddRival}>
                Submit
              </button>
            </div>
            <div className="registered-list">
              <p className="registered-title">Registered participants:</p>
              {formData.invited_rivals.length ? (
                <ul className="registered-items">
                  {formData.invited_rivals.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              ) : (
                <div className="registered-placeholder">No rivals added yet</div>
              )}
            </div>
            <button className="start-tournament-button" type="button" onClick={handleCreateTournament}>
              Start tournament
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
