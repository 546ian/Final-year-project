import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { businessAPI, activityAPI } from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import logo from '../Assets/logo.png';
import './styles/BusinessHome.css';

export default function BusinessHomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptPhone, setPromptPhone] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPlayer, setAssignPlayer] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activityForm, setActivityForm] = useState({
    game: 'Choose game',
    device: 'Device 2',
    single_timer: '',
    single_player: 'P1',
    single_team1: 'team1',
    single_team2: 'team2',
    multi_timer: '',
    multi_player1: 'P1',
    multi_player2: 'P2',
    multi_team1: 'team1',
    multi_team2: 'team2'
  });
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [activities, setActivities] = useState([]);
  const [editForm, setEditForm] = useState({
    business_name: '',
    profile_photo: '',
    admin_name: '',
    admin_contact: '',
    email: '',
    location: '',
    contact: '',
    paybill: '',
    account_number: '',
    till_number: ''
  });

  useEffect(() => {
    loadBusinessData();
  }, [user?.id]);

  useEffect(() => {
    if (businessInfo) {
      setEditForm({
        business_name: businessInfo.business_name || '',
        profile_photo: '',
        admin_name: businessInfo.owner_name || '',
        admin_contact: businessInfo.phone_number || '',
        email: businessInfo.email || '',
        location: businessInfo.location || '',
        contact: businessInfo.phone_number || '',
        paybill: businessInfo.paybill_number || '',
        account_number: businessInfo.account_number || '',
        till_number: businessInfo.till_number || ''
      });
    }
  }, [businessInfo]);

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = () => {
    setShowEditModal(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleDeleteAccount = () => {
    setShowEditModal(false);
  };

  const handleSendPrompt = () => {
    if (!promptPhone.trim()) {
      alert('Please enter a phone number.');
      return;
    }
    setShowPromptModal(false);
    alert(`Payment prompt sent to ${promptPhone}`);
    setPromptPhone('');
  };

  const handleCancelPrompt = () => {
    setShowPromptModal(false);
    setPromptPhone('');
  };

  const handleOpenAssignModal = (playerName) => {
    setAssignPlayer(playerName);
    setAssignSearch('');
    setSelectedTournament(null);
    setShowAssignModal(true);
  };

  const handleAssignTournament = () => {
    if (!selectedTournament && selectedTournament !== 0) {
      alert('Please select a tournament.');
      return;
    }
    setShowAssignModal(false);
    alert(`${assignPlayer} assigned to tournament.`);
    setAssignPlayer('');
    setAssignSearch('');
    setSelectedTournament(null);
  };

  const handleCancelAssign = () => {
    setShowAssignModal(false);
    setAssignSearch('');
    setSelectedTournament(null);
  };

  const handleActivityChange = (field, value) => {
    setActivityForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveActivity = () => {
    setShowActivityModal(false);
  };

  const handleCancelActivity = () => {
    setShowActivityModal(false);
  };

  const formattedDate = new Date().toLocaleDateString('en-GB');

  const loadBusinessData = async () => {
    try {
      if (user?.id) {
        const response = await businessAPI.getProfile(user.id);
        setBusinessInfo(response.data);
        const activitiesResponse = await activityAPI.getAll();
        setActivities(activitiesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load business data:', error);
    }
  };

  if (!businessInfo) return <LoadingScreen />;

  return (
    <div className="business-home">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="Gamelink logo" className="topbar-logo" />
        </div>
        <div className="topbar-center">
          <button className="top-tab" type="button" onClick={() => navigate('/team-roster')}>Team Roster</button>
          <button className="top-tab active" type="button" onClick={() => navigate('/business-home')}>Home</button>
          <button className="top-tab" type="button" onClick={() => navigate('/business-logs')}>Business logs & Ads</button>
        </div>
        <div className="topbar-right">
          <div
            className="topbar-avatar-wrapper"
            onClick={() => {
              setShowAvatarMenu(false);
              logout();
              navigate('/login');
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user?.username ? `${user.username} avatar` : 'Business avatar'}
                className="topbar-avatar"
              />
            ) : (
              <div className="topbar-avatar-placeholder">
                {user?.username?.charAt(0).toUpperCase() || 'B'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="business-dashboard">
        <div className="dashboard-column left-column">
          <section className="dashboard-panel summary-panel">
            <div className="panel-header">
              <button type="button" className="panel-button" onClick={() => setShowEditModal(true)}>Edit</button>
            </div>
            <div className="summary-overview">
              <div className="summary-avatar" />
              <div className="summary-list">
                <div><strong>Business name:</strong> {businessInfo.business_name}</div>
                <div><strong>Linked devices:</strong> {businessInfo.linked_devices || '3'}</div>
                <div><strong>Signed players:</strong> {businessInfo.signed_players || '12'}</div>
                <div><strong>Weekly income:</strong> {businessInfo.weekly_income || 'Ksh 38,000'}</div>
                <div><strong>Payment details:</strong> {businessInfo.payment_details || 'MPesa Paybill 123456'}</div>
              </div>
            </div>
            <button type="button" className="prompt-button" onClick={() => setShowPromptModal(true)}>Prompt payment</button>
          </section>

          <section className="dashboard-panel tournaments-panel">
            <div className="tournament-card card">
              <div className="card-header">
                <span>Tournament</span>
              </div>
              <div className="card-separator" />
              <button type="button" className="tournament-action" onClick={() => navigate('/host-tournament/business')}>Host a tournament</button>
              <button type="button" className="tournament-item" onClick={() => {}}>
                Ongoing tournament
              </button>
              <button type="button" className="tournament-item" onClick={() => {}}>
                History
              </button>
            </div>
          </section>
        </div>

        <section className="dashboard-panel activity-panel">
          <div className="panel-header">
            <span>Business activity</span>
            <button type="button" className="panel-button" onClick={() => setShowActivityModal(true)}>Add</button>
          </div>
          <div className="activity-date">{formattedDate}</div>
          <div className="activity-row">
            <div><strong>Device 1:</strong> S: (playerName)</div>
            <div><strong>Match:</strong> Team1 vs Team2</div>
            <div className="result-pill win">W</div>
            <div className="result-pill loss">L</div>
            <div className="result-pill draw">D</div>
          </div>
          <div className="activity-row muted">
            <div>Total games: 12</div>
          </div>
          <div className="activity-row">
            <div><strong>Device 2:</strong> S: (playerName)</div>
            <div><strong>Match:</strong> Team1 vs Team2</div>
            <div className="result-pill win">W</div>
            <div className="result-pill loss">L</div>
            <div className="result-pill draw">D</div>
          </div>
          <div className="activity-row muted">
            <div>Total games: 8</div>
          </div>
          <div className="monitor-label">
            <span className="monitor-dot" /> Monitored activity
          </div>
          <div className="monitored-list">
            <div><strong>(Device)</strong> (Game): - vs -</div>
            <div><strong>(Device)</strong> (Game): Game played session</div>
            <div><strong>(Device)</strong> (Game): P1 vs P2</div>
          </div>
        </section>

        <section className="dashboard-panel manage-panel">
          <div className="panel-header">
            <span>Manage team</span>
          </div>
          <input className="search-player" type="text" placeholder="Search player" />
          <div className="player-entry">
            <span>Player 1</span>
            <button type="button" onClick={() => handleOpenAssignModal('Player 1')}>Assign to tournament</button>
          </div>
          <div className="player-entry">
            <span>Player 2</span>
            <button type="button" onClick={() => handleOpenAssignModal('Player 2')}>Assign to tournament</button>
          </div>
          <div className="player-entry">
            <span>Player 3</span>
            <button type="button" onClick={() => handleOpenAssignModal('Player 3')}>Assign to tournament</button>
          </div>
          <div className="analysis-section">
            <div className="analysis-title">Business Analysis</div>
            <div className="analysis-item">Daily income: {businessInfo.daily_income || 'Ksh 6,000'}</div>
            <div className="analysis-item">Weekly income: {businessInfo.weekly_income || 'Ksh 38,000'}</div>
            <div className="analysis-item">Monthly income: {businessInfo.monthly_income || 'Ksh 160,000'}</div>
            <div className="analysis-item">Yearly income: {businessInfo.yearly_income || 'Ksh 1,920,000'}</div>
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {showActivityModal && (
        <div className="modal">
          <div className="modal-content activity-modal-content">
            <div className="prompt-modal-header">
              <h2>ADD</h2>
              <button type="button" className="game-select-button">Choose game ▾</button>
            </div>
            <div className="device-tabs">
              {['Device 1', 'Device 2', 'Device 3', 'Device 4'].map((device) => (
                <button
                  key={device}
                  type="button"
                  className={activityForm.device === device ? 'device-tab active' : 'device-tab'}
                  onClick={() => handleActivityChange('device', device)}
                >
                  {device}
                </button>
              ))}
            </div>
            <div className="activity-section-divider" />
            <div className="activity-group">
              <h3>Single player</h3>
              <div className="activity-row-modal">
                <span>Set timer:</span>
                <input
                  type="text"
                  value={activityForm.single_timer}
                  onChange={(e) => handleActivityChange('single_timer', e.target.value)}
                  placeholder="minutes"
                />
                <span>Set player name:</span>
                <input
                  type="text"
                  value={activityForm.single_player}
                  onChange={(e) => handleActivityChange('single_player', e.target.value)}
                  placeholder="P1"
                />
              </div>
              <div className="activity-row-modal">
                <span>Set match:</span>
                <input
                  type="text"
                  value={activityForm.single_team1}
                  onChange={(e) => handleActivityChange('single_team1', e.target.value)}
                  placeholder="team1"
                />
                <span>vs</span>
                <input
                  type="text"
                  value={activityForm.single_team2}
                  onChange={(e) => handleActivityChange('single_team2', e.target.value)}
                  placeholder="team2"
                />
              </div>
            </div>
            <div className="activity-section-divider" />
            <div className="activity-group">
              <h3>Multiplayer</h3>
              <div className="activity-row-modal">
                <span>Set timer:</span>
                <input
                  type="text"
                  value={activityForm.multi_timer}
                  onChange={(e) => handleActivityChange('multi_timer', e.target.value)}
                  placeholder="minutes"
                />
                <span>Set player name:</span>
                <input
                  type="text"
                  value={activityForm.multi_player1}
                  onChange={(e) => handleActivityChange('multi_player1', e.target.value)}
                  placeholder="P1"
                />
                <input
                  type="text"
                  value={activityForm.multi_player2}
                  onChange={(e) => handleActivityChange('multi_player2', e.target.value)}
                  placeholder="P2"
                />
              </div>
              <div className="activity-row-modal">
                <span>Set match:</span>
                <input
                  type="text"
                  value={activityForm.multi_team1}
                  onChange={(e) => handleActivityChange('multi_team1', e.target.value)}
                  placeholder="team1"
                />
                <span>vs</span>
                <input
                  type="text"
                  value={activityForm.multi_team2}
                  onChange={(e) => handleActivityChange('multi_team2', e.target.value)}
                  placeholder="team2"
                />
              </div>
            </div>
            <div className="prompt-actions">
              <button type="button" className="prompt-send-button" onClick={handleSaveActivity}>Add</button>
              <button type="button" className="prompt-cancel-button" onClick={handleCancelActivity}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal">
          <div className="modal-content edit-modal-content">
            <div className="edit-modal-header">
              <h2>EDIT</h2>
            </div>
            <div className="edit-modal-body">
              <div className="edit-panel left-panel">
                <label>Business name</label>
                <input
                  value={editForm.business_name}
                  onChange={(e) => handleEditChange('business_name', e.target.value)}
                  placeholder="Enter business name"
                />
                <label>Profile photo</label>
                <input
                  value={editForm.profile_photo}
                  onChange={(e) => handleEditChange('profile_photo', e.target.value)}
                  placeholder="Photo URL"
                />
                <label>Admin name</label>
                <input
                  value={editForm.admin_name}
                  onChange={(e) => handleEditChange('admin_name', e.target.value)}
                  placeholder="Admin name"
                />
                <label>Admin Contact info</label>
                <input
                  value={editForm.admin_contact}
                  onChange={(e) => handleEditChange('admin_contact', e.target.value)}
                  placeholder="Admin contact info"
                />
                <label>Business email address</label>
                <input
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  placeholder="Business email"
                />
                <label>Business location address</label>
                <input
                  value={editForm.location}
                  onChange={(e) => handleEditChange('location', e.target.value)}
                  placeholder="Location address"
                />
                <label>Business contact info</label>
                <input
                  value={editForm.contact}
                  onChange={(e) => handleEditChange('contact', e.target.value)}
                  placeholder="Contact info"
                />
                <div className="linked-devices-tag">Linked devices</div>
                <div className="device-list">
                  <span>Device 1</span>
                  <span>Device 2</span>
                </div>
              </div>

              <div className="edit-panel right-panel">
                <div className="payment-heading">Payment</div>
                <div className="payment-label">Mpesa Payments:</div>
                <label>Option 1:</label>
                <label>Paybill number</label>
                <input
                  value={editForm.paybill}
                  onChange={(e) => handleEditChange('paybill', e.target.value)}
                  placeholder="Paybill number"
                />
                <label>Account number</label>
                <input
                  value={editForm.account_number}
                  onChange={(e) => handleEditChange('account_number', e.target.value)}
                  placeholder="Account number"
                />
                <label>Option 2:</label>
                <label>Buy Goods and services:</label>
                <input
                  value={editForm.till_number}
                  onChange={(e) => handleEditChange('till_number', e.target.value)}
                  placeholder="Till no."
                />
                <button type="button" className="enroll-button">Enroll</button>
                <div className="edit-actions">
                  <button type="button" className="save-button" onClick={handleSaveEdit}>Save</button>
                  <button type="button" className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                </div>
                <button type="button" className="delete-button" onClick={handleDeleteAccount}>Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPromptModal && (
        <div className="modal">
          <div className="modal-content prompt-modal-content">
            <div className="prompt-modal-header">
              <h2>PROMPT</h2>
              <p>Enter phone number</p>
            </div>
            <div className="prompt-modal-body">
              <input
                type="tel"
                value={promptPhone}
                onChange={(e) => setPromptPhone(e.target.value)}
                placeholder="0712345678"
                className="prompt-input"
              />
              <div className="prompt-actions">
                <button type="button" className="prompt-send-button" onClick={handleSendPrompt}>Send</button>
                <button type="button" className="prompt-cancel-button" onClick={handleCancelPrompt}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal">
          <div className="modal-content assign-modal-content">
            <div className="assign-modal-header">
              <h2>Assign to tourney</h2>
            </div>
            <div className="assign-modal-body">
              <label>Gamer name tag</label>
              <input
                type="text"
                value={assignPlayer}
                readOnly
                className="assign-player-input"
              />
              <label>Search tournament</label>
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Search tournament"
                className="assign-search-input"
              />
              <div className="available-tournaments">
                {['Tournament A', 'Tournament B'].map((tournament, index) => (
                  <div
                    key={tournament}
                    className={`assign-card ${selectedTournament === index ? 'selected' : ''}`}
                    onClick={() => setSelectedTournament(index)}
                  >
                    <div className="assign-card-left">
                      <div className="assign-card-avatar" />
                      <div>
                        <div className="assign-card-business">Business name</div>
                        <div className="assign-card-title">{tournament}</div>
                        <div className="assign-card-meta">Enrolled gamers: __ / __</div>
                        <div className="assign-card-meta">Assigned gamers: __</div>
                      </div>
                    </div>
                    <div className="assign-card-desc">Description</div>
                  </div>
                ))}
              </div>
              <div className="prompt-actions">
                <button type="button" className="prompt-send-button" onClick={handleAssignTournament}>Assign</button>
                <button type="button" className="prompt-cancel-button" onClick={handleCancelAssign}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
