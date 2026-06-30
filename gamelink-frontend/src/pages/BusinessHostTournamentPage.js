import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { tournamentAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/Tournament.css';

export default function BusinessHostTournamentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [url, setUrl] = useState('');
  const [feeType, setFeeType] = useState('free');
  const [priceMoney, setPriceMoney] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [stageType, setStageType] = useState('single');
  const [groupStage, setGroupStage] = useState('Group A');
  const [finalStage, setFinalStage] = useState('Final');
  const [gamersFace, setGamersFace] = useState('Face 1');
  const [rankBy, setRankBy] = useState('Points');
  const [groupParticipants, setGroupParticipants] = useState('');
  const [advancedParticipants, setAdvancedParticipants] = useState('');
  const [formatOption, setFormatOption] = useState('single_elimination');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [registrationType, setRegistrationType] = useState('manual');
  const [gamerTag, setGamerTag] = useState('');
  const [registeredParticipants, setRegisteredParticipants] = useState([]);

  const handleSubmit = async () => {
    try {
      const tournamentData = {
        tournament_name: tournamentName || 'New Tournament',
        description: description || 'No description provided.',
        game_id: null,
        tournament_format: formatOption,
        max_players: maxParticipants ? Number(maxParticipants) : 16,
        entry_fee: feeType === 'paid' ? 100 : 0,
        start_date: scheduledDate && scheduledTime ? `${scheduledDate}T${scheduledTime}:00Z` : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        host_type: 'business',
        registration_type: registrationType,
        host_name: user?.business_name || user?.username || 'Business Host',
        tournament_url: url,
      };
      const response = await tournamentAPI.create(tournamentData);
      navigate(`/tournament/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create tournament:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to create tournament: ${errorMsg}`);
    }
  };

  const handleAddParticipant = () => {
    if (!gamerTag.trim()) return;
    setRegisteredParticipants((prev) => [...prev, gamerTag.trim()]);
    setGamerTag('');
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
        <h1>Host tournament</h1>
        <div className="host-badge">Event details</div>
      </div>

      <div className="host-grid">
        <section className="host-panel">
          <div className="panel-title">Primary info</div>
          <div className="panel-section">
            <div className="subsection-title">Host: {user?.business_name || user?.username || 'Business'}</div>
            <input
              type="text"
              placeholder="Tournament name"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
            <div className="two-column-row">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="subsection-title">Tournament fee</div>
            <div className="fee-toggle">
              <button
                type="button"
                className={feeType === 'free' ? 'active-toggle' : ''}
                onClick={() => setFeeType('free')}
              >
                Free
              </button>
              <button
                type="button"
                className={feeType === 'paid' ? 'active-toggle' : ''}
                onClick={() => setFeeType('paid')}
              >
                Paid
              </button>
            </div>
            <input
              type="text"
              placeholder="Price money"
              value={priceMoney}
              onChange={(e) => setPriceMoney(e.target.value)}
            />
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Game info</div>
          <div className="panel-section">
            <div className="game-search">
              <input
                type="text"
                placeholder="Search game"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
              />
              <div className="game-search-hint">Tip: type a game name, then choose the format below.</div>
            </div>

            <div className="subsection-title">Stage type</div>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="stageType"
                  checked={stageType === 'single'}
                  onChange={() => setStageType('single')}
                />
                <span>Single</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="stageType"
                  checked={stageType === 'double'}
                  onChange={() => setStageType('double')}
                />
                <span>Double (groups compete separately)</span>
              </label>
            </div>

            {stageType === 'double' && (
              <div className="stage-subcard">
                <div className="subsection-title">Double setup</div>
                <div className="two-column-row">
                  <select value={groupStage} onChange={(e) => setGroupStage(e.target.value)}>
                    <option>Group A</option>
                    <option>Group B</option>
                    <option>Group C</option>
                  </select>
                  <select value={finalStage} onChange={(e) => setFinalStage(e.target.value)}>
                    <option>Final</option>
                    <option>Semi Final</option>
                    <option>Quarter Final</option>
                  </select>
                </div>

                <div className="two-column-row">
                  <select value={gamersFace} onChange={(e) => setGamersFace(e.target.value)}>
                    <option>Face 1</option>
                    <option>Face 2</option>
                    <option>Face 3</option>
                  </select>
                  <select value={rankBy} onChange={(e) => setRankBy(e.target.value)}>
                    <option>Points</option>
                    <option>Wins</option>
                    <option>Time</option>
                  </select>
                </div>

                <div className="two-column-row">
                  <input
                    type="number"
                    placeholder="Group participants"
                    value={groupParticipants}
                    onChange={(e) => setGroupParticipants(e.target.value)}
                  />
                  <select value={advancedParticipants} onChange={(e) => setAdvancedParticipants(e.target.value)}>
                    <option>Advanced participants</option>
                    <option>Top 1</option>
                    <option>Top 2</option>
                    <option>Top 4</option>
                  </select>
                </div>
              </div>
            )}

            <div className="subsection-title">Format</div>
            <div className="format-options">
              <label>
                <input
                  type="radio"
                  name="formatOption"
                  checked={formatOption === 'single_elimination'}
                  onChange={() => setFormatOption('single_elimination')}
                />
                <span>Single Elimination</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="formatOption"
                  checked={formatOption === 'round_robin'}
                  onChange={() => setFormatOption('round_robin')}
                />
                <span>Round Robin</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="formatOption"
                  checked={formatOption === 'double_elimination'}
                  onChange={() => setFormatOption('double_elimination')}
                />
                <span>Double Elimination</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="formatOption"
                  checked={formatOption === 'leaderboard'}
                  onChange={() => setFormatOption('leaderboard')}
                />
                <span>Leaderboard</span>
              </label>
            </div>
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Registration</div>
          <div className="panel-section">
            <input
              type="text"
              placeholder="Max number of participants"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="registrationType"
                  checked={registrationType === 'manual'}
                  onChange={() => setRegistrationType('manual')}
                />
                <span>Manual</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="registrationType"
                  checked={registrationType === 'signup'}
                  onChange={() => setRegistrationType('signup')}
                />
                <span>Sign-up</span>
              </label>
            </div>
            <button className="add-participants-button" type="button" onClick={handleAddParticipant}>
              + Add Participants
            </button>
            <div className="gamer-tag-row">
              <input
                type="text"
                placeholder="Gamer tag"
                value={gamerTag}
                onChange={(e) => setGamerTag(e.target.value)}
              />
              <button className="submit-tag-button" type="button" onClick={handleAddParticipant}>
                Submit
              </button>
            </div>
            <div className="registered-list">
              <p className="registered-title">Registered participants:</p>
              {registeredParticipants.length === 0 ? (
                <div className="registered-placeholder">No registered participants yet.</div>
              ) : (
                <ul className="registered-items">
                  {registeredParticipants.map((participant, index) => (
                    <li key={index}>{participant}</li>
                  ))}
                </ul>
              )}
            </div>
            <button className="start-tournament-button" type="button" onClick={handleSubmit}>
              Start tournament
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

