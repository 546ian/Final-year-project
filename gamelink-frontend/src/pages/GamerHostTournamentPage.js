import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { gamerAPI, tournamentAPI, gameAPI } from "../utils/api";
import AvatarPicker from "../components/AvatarPicker";
import logo from "../Assets/logo.png";
import "./styles/Tournament.css";

export default function GamerHostTournamentPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    tournament_name: "",
    description: "",
    game: "",
    tournament_format: "single_elimination",
    max_players: 2,
    start_date: "",
    start_time: "",
    stream_url: "",
    prize_pool: "",
    participants: [],
    registration_open: true,
    rival_tag: "",
  });
  const [invited_rivals, setInvitedRivals] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddParticipant = () => {
    const rival = formData.rival_tag.trim();
    if (!rival) return;
    if (formData.participants.length >= formData.max_players) {
      alert("Max players reached");
      return;
    }

    setFormData({
      ...formData,
      participants: [...formData.participants, rival],
      rival_tag: "",
    });
  };

  const handleCreateTournament = async () => {
    // Validation: Check required fields
    if (!formData.tournament_name || !formData.tournament_name.trim()) {
      alert('Tournament name is required');
      return;
    }
    if (!formData.game || formData.game === '') {
      alert('Please select a game');
      return;
    }
    if (!formData.start_date || !formData.start_time) {
      alert('Start date and time are required');
      return;
    }
    if (formData.max_players < 2) {
      alert('Tournament must have at least 2 players');
      return;
    }
    // Validate game_id exists in available games
    const selectedGame = availableGames.find(
      (game) => game.id === parseInt(formData.game)
    );
    if (!selectedGame) {
      alert('Invalid game selection');
      return;
    }
    try {
      const tournamentData = {
        tournament_name: formData.tournament_name.trim(),
        description: formData.description || '',
        game_id: parseInt(formData.game), 
        tournament_format: formData.tournament_format,
        max_players: parseInt(formData.max_players),
        entry_fee: parseFloat(formData.entry_fee) || 0,
        start_date: `${formData.start_date}T${formData.start_time}:00`,
        host_type: "gamer",
      };
      // Validate date is in the future
      const startDateTime = new Date(tournamentData.start_date);
      if (startDateTime <= new Date()) {
        alert('Tournament start date must be in the future');
        return;
      }
      const response = await tournamentAPI.create(tournamentData);
      
      if (response.data && response.data.id) {
        alert('Tournament created successfully!');
        navigate(`/tournament/${response.data.id}`);
      } else {
        alert('Tournament created but response was unexpected');
      }
    } catch (error) {
      console.error("Failed to create tournament:", error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to create tournament: ${errorMsg}`);
    }
  };


  const handleSaveAvatar = async (avatarUrl) => {
    if (!user) return;
    try {
      const response = await gamerAPI.updateAvatar(user.id, {
        avatar_url: avatarUrl,
      });
      updateUser({ avatarUrl: response.data.avatar_url });
    } catch (error) {
      console.error("Failed to save avatar:", error);
      alert("Unable to save avatar. Please try again.");
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;
    try {
      const response = await gamerAPI.updateAvatar(user.id, {
        avatar_url: null,
      });
      updateUser({ avatarUrl: response.data.avatar_url });
    } catch (error) {
      console.error("Failed to delete avatar:", error);
      alert("Unable to delete avatar. Please try again.");
    }
  };

  const [availableGames, setAvailableGames] = useState([]);
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

  return (
    <div className="host-tournament-page">
      <div className="topbar">
        <div className="topbar-left">
          <AvatarPicker
            avatarUrl={user?.avatarUrl}
            onSave={handleSaveAvatar}
            onDelete={handleDeleteAvatar}
          />
          <div className="welcome-block">
            <p className="welcome-label">Host</p>
            <p className="welcome-name">{user?.username || "Gamer"}</p>
          </div>
        </div>

        <div className="topbar-center">
          <button
            className="top-tab"
            type="button"
            onClick={() => navigate("/profile")}
          >
            Profile
          </button>
          <button
            className="top-tab active"
            type="button"
            onClick={() => navigate("/gamer-home")}
          >
            Home
          </button>
          <button
            className="top-tab"
            type="button"
            onClick={() => navigate("/activities")}
          >
            Activities
          </button>
        </div>

        <div className="topbar-right">
          <img src={logo} alt="Gamelink logo" />
        </div>
      </div>

      <div className="host-heading-row">
        <h1>Create Tournament</h1>
        <div className="host-badge">Quick Setup</div>
      </div>

      <div className="host-grid">
        <section className="host-panel">
          <div className="panel-title">Basics</div>
          <div className="panel-section">
            <input
              type="text"
              name="tournament_name"
              placeholder="Tournament Name"
              value={formData.tournament_name}
              onChange={handleChange}
            />
            <select
              name="game"
              value={formData.game}
              onChange={handleChange}
              required
            >
              <option value="">Select a game</option>
              {availableGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows="3"
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
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Format</div>
          <div className="panel-section">
            <select
              name="tournament_format"
              value={formData.tournament_format}
              onChange={handleChange}
            >
              <option value="single_elimination">Single Elimination</option>
              <option value="double_elimination">Double Elimination</option>
              <option value="round_robin">Round Robin</option>
            </select>
            <input
              type="number"
              name="max_players"
              placeholder="Max Players (8, 16, 32)"
              value={formData.max_players}
              onChange={handleChange}
              min="2"
            />
            <div className="fee-toggle">
              <button
                type="button"
                className={!formData.entry_fee ? "active-toggle" : ""}
                onClick={() => setFormData({ ...formData, entry_fee: 0 })}
              >
                Free
              </button>
            </div>
            <input
              type="text"
              name="prize_pool"
              placeholder="Prize Pool"
              value={formData.prize_pool}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="host-panel">
          <div className="panel-title">Players & Registration</div>
          <div className="panel-section">
            <div className="gamer-tag-row">
              <input
                type="text"
                placeholder="Add player username"
                value={formData.rival_tag}
                onChange={(e) =>
                  setFormData({ ...formData, rival_tag: e.target.value })
                }
              />
              <button
                className="submit-tag-button"
                onClick={handleAddParticipant}
                disabled={formData.participants.length >= formData.max_players}
              >
                {formData.participants.length >= formData.max_players
                  ? "Limit Reached"
                  : "Add"}
              </button>
            </div>
            <div className="registered-list">
              <p className="registered-title">
                Seeded Players ({formData.participants.length}/
                {formData.max_players}):
              </p>
              {formData.participants.map((player, index) => (
                <li key={index} className="registered-items">
                  {player}
                </li>
              ))}
              {formData.participants.length === 0 && (
                <div className="registered-placeholder">
                  Add players here or open public registration
                </div>
              )}
            </div>
            <input
              type="url"
              name="stream_url"
              placeholder="Stream URL (optional)"
              value={formData.stream_url}
              onChange={handleChange}
            />
          </div>
        </section>
      </div>

      <div
        className="host-heading-row"
        style={{ justifyContent: "flex-end", marginTop: "2rem" }}
      >
        <button
          className="start-tournament-button"
          style={{ maxWidth: "250px" }}
          onClick={handleCreateTournament}
        >
          Create Tournament & View Bracket
        </button>
      </div>
    </div>
  );
}
