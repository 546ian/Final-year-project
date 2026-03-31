import React, { useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import { tournamentAPI } from '../utils/api';
import './styles/Tournament.css';

export default function HostTournamentPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    tournament_name: '',
    description: '',
    game_id: null,
    tournament_format: 'single_elimination',
    max_players: 8,
    entry_fee: 0,
    start_date: ''
  });
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [matches, setMatches] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTournament = async () => {
    try {
      const response = await tournamentAPI.create(formData);
      alert('Tournament created successfully!');
      setFormData({
        tournament_name: '',
        description: '',
        game_id: null,
        tournament_format: 'single_elimination',
        max_players: 8,
        entry_fee: 0,
        start_date: ''
      });
    } catch (error) {
      console.error('Failed to create tournament:', error);
    }
  };

  const handleStartTournament = () => {
    setTournamentStarted(true);
    // Generate bracket/matches
    generateMatches();
  };

  const generateMatches = () => {
    // Simple bracket generation logic
    const m = [];
    for (let i = 0; i < formData.max_players / 2; i++) {
      m.push({
        id: i,
        player1: `Player ${i * 2 + 1}`,
        player2: `Player ${i * 2 + 2}`,
        winner: null
      });
    }
    setMatches(m);
  };

  return (
    <div className="host-tournament-page">
      <h1>Host Tournament</h1>

      {!tournamentStarted ? (
        <div className="tournament-form">
          <input
            type="text"
            name="tournament_name"
            placeholder="Tournament Name"
            value={formData.tournament_name}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <select name="tournament_format" value={formData.tournament_format} onChange={handleChange}>
            <option value="single_elimination">Single Elimination</option>
            <option value="double_elimination">Double Elimination</option>
            <option value="round_robin">Round Robin</option>
          </select>
          <input
            type="number"
            name="max_players"
            placeholder="Max Players"
            value={formData.max_players}
            onChange={handleChange}
          />
          <input
            type="number"
            name="entry_fee"
            placeholder="Entry Fee"
            value={formData.entry_fee}
            onChange={handleChange}
          />
          <input
            type="datetime-local"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
          <button onClick={handleCreateTournament}>Create Tournament</button>
          <button onClick={handleStartTournament}>Begin Tournament</button>
        </div>
      ) : (
        <div className="tournament-bracket">
          <h2>Tournament Bracket</h2>
          <div className="bracket-container">
            {matches.map(match => (
              <div key={match.id} className="match">
                <div className="player">{match.player1}</div>
                <div className="vs">VS</div>
                <div className="player">{match.player2}</div>
              </div>
            ))}
          </div>
          <button>Shuffle Players</button>
          <button>Commence Tournament</button>
        </div>
      )}
    </div>
  );
}
