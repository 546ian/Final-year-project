import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { gamerAPI, pvpAPI, tournamentAPI, postAPI, gameAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logo from '../Assets/logo.png';
import LoadingScreen from '../components/LoadingScreen';
import AvatarPicker from '../components/AvatarPicker';
import './styles/GamerHome.css';

export default function GamerHomePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [gamerInfo, setGamerInfo] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [registeredTournaments, setRegisteredTournaments] = useState([]);
  const [hostedTournaments, setHostedTournaments] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showRegisterAssigned, setShowRegisterAssigned] = useState(false);
  const [progressData, setProgressData] = useState([]);  
  const [series, setSeries] = useState('3');
  const [rivalName, setRivalName] = useState('');
  const [availableGames, setAvailableGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');

  const handleSaveAvatar = async (formData) => {
    if (!user) return;
    try {
      const response = await gamerAPI.updateAvatar(user.id, formData);
      const newAvatarUrl = response.data.avatar_url;
      setGamerInfo(response.data);
      updateUser({ avatarUrl: newAvatarUrl });
    } catch (error) {
      console.error('Failed to save avatar:', error);
      alert('Unable to save avatar. Please try again.');
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    try {
      const response = await gamerAPI.updateAvatar(user.id, { avatar_url: null });
      const newAvatarUrl = response.data.avatar_url;
      setGamerInfo(response.data);
      updateUser({ avatarUrl: newAvatarUrl });
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      alert('Unable to delete avatar. Please try again.');
    }
  };

  const loadGamerData = useCallback(async () => {
    try {
      if (user?.id) {
        const [gamerRes, , tourRes, , progRes, regRes, hostRes] = await Promise.all([
          gamerAPI.getProfile(user.id),
          pvpAPI.getAll(),
          tournamentAPI.getAll(),
          postAPI.getFeed(),
          gamerAPI.getProgress(user.id),
          gamerAPI.getTournaments(user.id),
          gamerAPI.getHostedTournaments(user.id)
        ]);

        setGamerInfo(gamerRes.data);
        setTournaments(tourRes.data);
        setProgressData(progRes.data);
        setRegisteredTournaments(regRes.data);
        setHostedTournaments(hostRes.data);
      }
    } catch (error) {
      console.error('Failed to load gamer data:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadGamerData();
  }, [user?.id, loadGamerData]);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const response = await gameAPI.getAll();
        setAvailableGames(response.data);
      } catch (error) {
        console.error('Failed to load games:', error);
      }
    };
    loadGames();
  }, []);

  const handleBeginChallenge = async () => {
    if (!selectedGameId || !rivalName.trim()) {
      alert('Please select a game and enter rival name');
      return;
    }
    try {
      const challengeData = {
        opponent_display_name: rivalName.trim(),
        game_id: parseInt(selectedGameId)
      };
      console.log('Creating PVP challenge:', challengeData, series);
      alert('Challenge sent to ' + rivalName + ' for ' + series + ' series in selected game!');
      setRivalName('');
      setSelectedGameId('');
    } catch (error) {
      console.error('Failed to create challenge:', error);
      alert('Failed to send challenge');
    }
  };

  if (!gamerInfo) return <LoadingScreen />;

  const completedHosted = hostedTournaments.filter(t => t.status === 'completed');
  const completedParticipated = registeredTournaments.filter(t => t.status === 'completed');
  const activeRegistered = registeredTournaments.filter(t => t.status !== 'completed');
  const registeredIds = new Set(registeredTournaments.map(t => t.id));
  const availableTournaments = tournaments.filter(t => t.host_gamer_id !== gamerInfo.id && !registeredIds.has(t.id));

  return (
    <div className="gamer-home">
      <div className="topbar">
        <div className="topbar-left">
          <AvatarPicker
            avatarUrl={gamerInfo?.avatar_url || user?.avatarUrl}
            onSave={handleSaveAvatar}
            onDelete={handleDeleteAvatar}
          />
          <div className="welcome-block">
            <p className="welcome-label">Welcome</p>
            <p className="welcome-name">{user?.username || gamerInfo?.first_name || gamerInfo?.last_name || user?.email?.split('@')[0] || 'Gamer'}</p>
          </div>
        </div>
        <div className="topbar-center">
          <button className="top-tab" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button className="top-tab" onClick={() => navigate('/gamer-home')}>
            Home
          </button>
          <button className="top-tab" onClick={() => navigate('/activities')}>
            Activities
          </button>
        </div>
        <div className="topbar-right">
          <Link to="/gamer-home">
            <img src={logo} alt="Gamelink logo" />
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-column left-column">
          <div className="card pvp-card">
            <div className="card-header">
              <span>PVP TAKE ON</span>
              <span className="badge">Rivalry Invite</span>
            </div>
            <div className="card-separator" />
            <div className="card-section-title">Challenge your rivals</div>
            <div className="series-list">
              {['3', '5', '7', '9'].map(value => (
                <label key={value} className="series-option">
                  <input
                    type="radio"
                    name="series"
                    value={value}
                    checked={series === value}
                    onChange={() => setSeries(value)}
                  />
                  Best of {value}
                </label>
              ))}
            </div>
            <select 
              className="secondary-button" 
              value={selectedGameId} 
              onChange={(e) => setSelectedGameId(e.target.value)}
              style={{width: '100%', marginBottom: '1rem'}}
            >
              <option value="">Select game</option>
              {availableGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            <input
              className="rival-input"
              type="text"
              placeholder="Enter rival's name"
              value={rivalName}
              onChange={(e) => setRivalName(e.target.value)}
            />
            <button className="primary-button" onClick={handleBeginChallenge} type="button">
              Begin
            </button>
          </div>

          <div className="card tournament-card">
            <div className="card-header">
              <span>Tournament</span>
            </div>
            <div className="card-separator" />
            <button className="tournament-action" onClick={() => navigate('/host-tournament')}>Host a tournament</button>
            <div className="tournament-item" style={{cursor: 'default'}}>Ongoing tournament</div>
            {tournaments.filter(t => t.status === 'active').length === 0 ? (
              <div className="tournament-item" style={{opacity: 0.6, cursor: 'default'}}>No ongoing tournaments</div>
            ) : (
              tournaments.filter(t => t.status === 'active').map(t => (
                <button 
                  key={t.id} 
                  className="tournament-item" 
                  onClick={() => navigate('/tournament/' + t.id)}
                  style={{textAlign: 'left'}}
                >
                  {t.tournament_name}
                </button>
              ))
            )}
            <button className="tournament-item" onClick={() => setShowHistory(prev => !prev)}>
              {showHistory ? 'Hide History' : 'History'}
            </button>
            {showHistory && (
              <div className="tournament-sublist">
                <div className="sublist-title">Hosted by you</div>
                {completedHosted.length === 0 ? (
                  <div className="tournament-item" style={{opacity: 0.6, cursor: 'default'}}>No hosted history</div>
                ) : (
                  completedHosted.map(t => (
                    <button 
                      key={t.id} 
                      className="tournament-item" 
                      onClick={() => navigate('/tournament/' + t.id)}
                      style={{textAlign: 'left'}}
                    >
                      {t.tournament_name}
                    </button>
                  ))
                )}
                <div className="sublist-title">Participated in</div>
                {completedParticipated.length === 0 ? (
                  <div className="tournament-item" style={{opacity: 0.6, cursor: 'default'}}>No participation history</div>
                ) : (
                  completedParticipated.map(t => (
                    <button 
                      key={t.id} 
                      className="tournament-item" 
                      onClick={() => navigate('/tournament/' + t.id)}
                      style={{textAlign: 'left'}}
                    >
                      {t.tournament_name}
                    </button>
                  ))
                )}
              </div>
            )}
            <button className="tournament-item" onClick={() => setShowRegisterAssigned(prev => !prev)}>
              {showRegisterAssigned ? 'Hide Register/Assigned' : 'Register/Assigned tournament'}
            </button>
            {showRegisterAssigned && (
              <div className="tournament-sublist">
                <div className="sublist-title">Your assignments</div>
                {activeRegistered.length === 0 ? (
                  <div className="tournament-item" style={{opacity: 0.6, cursor: 'default'}}>No assigned tournaments</div>
                ) : (
                  activeRegistered.map(t => (
                    <button 
                      key={t.id} 
                      className="tournament-item" 
                      onClick={() => navigate('/tournament/' + t.id)}
                      style={{textAlign: 'left'}}
                    >
                      {t.tournament_name}
                    </button>
                  ))
                )}
                <div className="sublist-title">Available tournaments</div>
                {availableTournaments.length === 0 ? (
                  <div className="tournament-item" style={{opacity: 0.6, cursor: 'default'}}>No available tournaments</div>
                ) : (
                  availableTournaments.map(t => (
                    <button 
                      key={t.id} 
                      className="tournament-item" 
                      onClick={() => navigate('/tournament/' + t.id)}
                      style={{textAlign: 'left'}}
                    >
                      {t.tournament_name} <span style={{opacity: 0.7, fontSize: '0.8rem'}}>(Host: {t.host_name || 'Unknown'})</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-column middle-column">
          <div className="card posts-card">
            <div className="card-header center-header">
              <span>POSTS</span>
            </div>
            <div className="posts-preview large" />
            <div className="post-lines">
              <div />
              <div />
              <div />
            </div>
            <div className="posts-preview medium" />
            <div className="post-lines">
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>

        <div className="dashboard-column right-column">
          <div className="card team-card">
            <div className="card-header">
              <span>Team</span>
            </div>
            <div className="card-separator" />
            <div className="team-details">
              <p>Signed team:</p>
              <p>Currently assigned tournament:</p>
              <p>Assigned tournaments:</p>
              <p>Number of teammates:</p>
              <p>Current team accolades:</p>
              <p>Current Team position:</p>
              <p>Teams monitoring you:</p>
            </div>
            <button className="secondary-button outline">Request contract termination</button>
          </div>

          <div className="card progress-card">
            <div className="card-header">
              <span>Your Progress</span>
            </div>
            <div className="progress-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: '#fff', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#fff', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#444' }} />
                  <Line type="monotone" dataKey="wins" stroke="#ff8c00" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="losses" stroke="#ffffff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

