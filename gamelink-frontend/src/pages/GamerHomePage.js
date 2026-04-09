import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { gamerAPI, pvpAPI, tournamentAPI, postAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logo from '../Assets/logo.png';
import LoadingScreen from '../components/LoadingScreen';
import './styles/GamerHome.css';

export default function GamerHomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gamerInfo, setGamerInfo] = useState(null);
  const [pvpTakeons, setPvpTakeons] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [series, setSeries] = useState('3');
  const [rivalName, setRivalName] = useState('');

  useEffect(() => {
    loadGamerData();
  }, [user?.id]);

  const loadGamerData = async () => {
    try {
      if (user?.id) {
        const [gamerRes, pvpRes, tourRes, postsRes, progRes] = await Promise.all([
          gamerAPI.getProfile(user.id),
          pvpAPI.getAll(),
          tournamentAPI.getAll(),
          postAPI.getFeed(),
          gamerAPI.getProgress(user.id)
        ]);

        setGamerInfo(gamerRes.data);
        setPvpTakeons(pvpRes.data);
        setTournaments(tourRes.data);
        setPosts(postsRes.data);
        setProgressData(progRes.data);
      }
    } catch (error) {
      console.error('Failed to load gamer data:', error);
    }
  };

  const handleBeginChallenge = () => {
    console.log('Begin challenge:', rivalName, series);
  };

  if (!gamerInfo) return <LoadingScreen />;

  return (
    <div className="gamer-home">
      <div className="topbar">
        <div className="topbar-left">
          <div className="avatar-circle" />
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
            <button className="secondary-button">Select game</button>
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
            <button className="tournament-item">Ongoing tournament</button>
            <button className="tournament-item">History</button>
            <button className="tournament-item">Register/Assigned tournament</button>
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
