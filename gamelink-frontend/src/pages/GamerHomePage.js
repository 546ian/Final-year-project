import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { gamerAPI, pvpAPI, tournamentAPI, postAPI } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './styles/GamerHome.css';

export default function GamerHomePage() {
  const { user } = useAuth();
  const [gamerInfo, setGamerInfo] = useState(null);
  const [pvpTakeons, setPvpTakeons] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [showPVPModal, setShowPVPModal] = useState(false);

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

  if (!gamerInfo) return <div>Loading...</div>;

  return (
    <div className="gamer-home">
      <div className="header">
        <h1>Welcome, {gamerInfo.first_name}!</h1>
        <div className="stats">
          <span>Wins: {gamerInfo.total_wins}</span>
          <span>Losses: {gamerInfo.total_losses}</span>
          <span>Rating: {gamerInfo.rating}</span>
        </div>
      </div>

      <div className="sections">
        {/* PVP Takeons Section */}
        <section className="pvp-section">
          <h2>PVP Takeons</h2>
          <button onClick={() => setShowPVPModal(true)}>Initiate Takeon</button>
          <div className="takeons-list">
            {pvpTakeons.map(takeon => (
              <div key={takeon.id} className="takeon-card">
                <p>vs {takeon.opponent_display_name}</p>
                <p>Game: {takeon.game_name}</p>
                <p>Status: {takeon.status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="tournaments-section">
          <h2>Tournaments</h2>
          <div className="tournament-actions">
            <button>Host Tournament</button>
            <button>Register</button>
          </div>
          <div className="tournaments-list">
            {tournaments.slice(0, 5).map(tournament => (
              <div key={tournament.id} className="tournament-card">
                <h3>{tournament.tournament_name}</h3>
                <p>Players: {tournament.max_players}</p>
                <p>Format: {tournament.tournament_format}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Posts Section */}
        <section className="posts-section">
          <h2>Activity Feed</h2>
          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                <h4>{post.username}</h4>
                <p>{post.content}</p>
                <span>👍 {post.likes_count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Graph */}
        <section className="progress-section">
          <h2>Your Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="wins" stroke="#00ff00" />
              <Line type="monotone" dataKey="losses" stroke="#ff0000" />
            </LineChart>
          </ResponsiveContainer>
        </section>
      </div>

      {showPVPModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Initiate PVP Takeon</h2>
            {/* PVP form */}
            <button onClick={() => setShowPVPModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
