import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { businessAPI, paymentAPI } from '../utils/api';
import LoadingScreen from '../components/LoadingScreen';
import logo from '../Assets/logo.png';
import LinkedDevicePopupContainer from '../components/LinkedDevicePopupContainer';
import './styles/BusinessHome.css';

export default function BusinessHomePage() {

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [promptPhone, setPromptPhone] = useState('');
  const [promptAmount, setPromptAmount] = useState('');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignPlayer, setAssignPlayer] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activityForm, setActivityForm] = useState({
    game: '',
    device: 'Device 1',
    mode: 'single',
    entryAction: 'timer',
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
  const [activityItems, setActivityItems] = useState([]);
  const [activeResultMenu, setActiveResultMenu] = useState(null);
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
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [playerSearchResults, setPlayerSearchResults] = useState([]);
  const [playerSearchError, setPlayerSearchError] = useState('');
  const [signedPlayers, setSignedPlayers] = useState([]);
  const [playerSearchLoading, setPlayerSearchLoading] = useState(false);

  const loadBusinessData = useCallback(async () => {
    try {
      if (user?.id) {
        const response = await businessAPI.getProfile(user.id);
        setBusinessInfo(response.data);

        const rosterResponse = await businessAPI.getTeamRoster(user.id, 'team');
        setSignedPlayers(rosterResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load business data:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    if (!playerSearchTerm.trim()) {
      setPlayerSearchResults([]);
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      try {
        setPlayerSearchLoading(true);
        setPlayerSearchError('');
        const response = await businessAPI.searchPlayers(user.id, playerSearchTerm, null, 'all');
        // debug: log search response for troubleshooting
        // eslint-disable-next-line no-console
        console.debug('player search', { term: playerSearchTerm, results: response.data });
        if (active) {
          setPlayerSearchResults(response.data || []);
        }
      } catch (error) {
        // surface error to UI for easier debugging
        // eslint-disable-next-line no-console
        console.error('Failed to search gamers:', error);
        if (active) setPlayerSearchError(error?.response?.data?.error || error.message || 'Search failed');
      } finally {
        if (active) {
          setPlayerSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [user?.id, playerSearchTerm]);

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
        paybill: businessInfo.mpesa_paybill || '',
        account_number: businessInfo.mpesa_phone || '',
        till_number: businessInfo.mpesa_till || ''
      });
    }
  }, [businessInfo]);

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      const response = await businessAPI.updateProfile(user.id, {
        business_name: editForm.business_name,
        owner_name: editForm.admin_name,
        phone_number: editForm.admin_contact,
        email: editForm.email,
        location: editForm.location,
        address: editForm.contact,
        mpesa_paybill: editForm.paybill,
        mpesa_phone: editForm.account_number,
        mpesa_till: editForm.till_number
      });
      setBusinessInfo(response.data);
      setShowEditModal(false);
      showToast('Profile saved successfully.', 'success');
    } catch (error) {
      console.error('Failed to save profile:', error);
      showToast('Unable to save profile. Please try again.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleEnrollPaymentSettings = async () => {
    if (!editForm.paybill.trim() || !editForm.account_number.trim() || !editForm.till_number.trim()) {
      showToast('Please enter paybill, account number, and till number to enroll Daraja payments.', 'warning');
      return;
    }

    try {
      const response = await businessAPI.updateProfile(user.id, {
        mpesa_paybill: editForm.paybill,
        mpesa_phone: editForm.account_number,
        mpesa_till: editForm.till_number
      });
      setBusinessInfo(response.data);
      showToast('Daraja payment settings enrolled successfully.', 'success');
    } catch (error) {
      console.error('Failed to enroll payment settings:', error);
      showToast('Unable to enroll payment settings. Please try again.', 'error');
    }
  };

  const handleDeleteAccount = () => {
    setShowEditModal(false);
  };

  const handleSendPrompt = async () => {
    const amount = Number(promptAmount);
    if (!promptPhone.trim()) {
      showToast('Please enter a client phone number.', 'warning');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Please enter a valid amount.', 'warning');
      return;
    }

    try {
      const response = await paymentAPI.initiateMPesa({
        amount,
        phone_number: promptPhone,
        description: `Payment request from ${businessInfo.business_name || 'business'}`
      });
      setShowPromptModal(false);
      setPromptPhone('');
      setPromptAmount('');
      showToast(response.data?.message || 'Payment prompt sent successfully.', 'success');
    } catch (error) {
      console.error('Failed to send payment prompt:', error);
      showToast(error?.response?.data?.error || 'Failed to send payment prompt.', 'error');
    }
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
      showToast('Please select a tournament.', 'warning');
      return;
    }
    setShowAssignModal(false);
    showToast(`${assignPlayer} assigned to tournament.`, 'success');
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

  const handleAddActivity = () => {
    const game = activityForm.game?.trim();
    if (!game || game === 'Choose game') {
      showToast('Please enter a game name.', 'warning');
      return;
    }

    const deviceId = activityForm.device.replace('Device ', 'D');
    const mode = activityForm.mode;
    const entryAction = activityForm.entryAction;
    const now = Date.now();
    let newItem = {
      id: now,
      deviceId,
      label: mode === 'single' ? 'S' : 'M',
      mode,
      entryAction,
      game,
      createdAt: now
    };

    if (mode === 'single') {
      if (entryAction === 'timer') {
        const duration = Number(activityForm.single_timer);
        if (!duration || duration <= 0) {
          showToast('Please enter a valid timer in minutes.', 'warning');
          return;
        }
        newItem = {
          ...newItem,
          playerName: activityForm.single_player,
          timerMinutes: duration,
          endTime: now + duration * 60000,
        };
      } else {
        if (!activityForm.single_player.trim()) {
          showToast('Please enter a player name.', 'warning');
          return;
        }
        newItem = {
          ...newItem,
          playerName: activityForm.single_player,
          team1: activityForm.single_team1,
          team2: activityForm.single_team2,
          counts: { wins: 0, losses: 0, draws: 0 },
        };
      }
    } else {
      if (entryAction === 'timer') {
        const duration = Number(activityForm.multi_timer);
        if (!duration || duration <= 0) {
          showToast('Please enter a valid timer in minutes.', 'warning');
          return;
        }
        newItem = {
          ...newItem,
          playerOneName: activityForm.multi_player1,
          playerTwoName: activityForm.multi_player2,
          timerMinutes: duration,
          endTime: now + duration * 60000,
        };
      } else {
        if (!activityForm.multi_player1.trim() || !activityForm.multi_player2.trim()) {
          showToast('Please enter both player names.', 'warning');
          return;
        }
        newItem = {
          ...newItem,
          playerOneName: activityForm.multi_player1,
          playerTwoName: activityForm.multi_player2,
          team1: activityForm.multi_team1,
          team2: activityForm.multi_team2,
          playerStats: {
            playerOne: { wins: 0, losses: 0, draws: 0 },
            playerTwo: { wins: 0, losses: 0, draws: 0 },
          },
        };
      }
    }

    setActivityItems((prev) => [newItem, ...prev]);
    setShowActivityModal(false);
    setActiveResultMenu(null);
  };

  const handleSaveActivity = () => {
    handleAddActivity();
  };

  const updateResultCount = (itemId, type, delta) => {
    setActivityItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      if (!item.counts) return item;
      return {
        ...item,
        counts: {
          ...item.counts,
          [type]: Math.max(0, item.counts[type] + delta),
        },
      };
    }));
  };

  const updateMatchResultForPlayer = (itemId, playerKey, resultType, delta) => {
    setActivityItems((prev) => prev.map((item) => {
      if (item.id !== itemId) return item;
      if (!item.playerStats || !item.playerStats[playerKey]) return item;
      const previous = item.playerStats[playerKey][resultType];
      return {
        ...item,
        playerStats: {
          ...item.playerStats,
          [playerKey]: {
            ...item.playerStats[playerKey],
            [resultType]: Math.max(0, previous + delta),
          },
        },
      };
    }));
  };

  const handleClearAllActivities = () => {
    setActivityItems([]);
    setActiveResultMenu(null);
  };

  const handleClearActivity = (itemId) => {
    setActivityItems((prev) => prev.filter((item) => item.id !== itemId));
    setActiveResultMenu((prev) => (prev?.itemId === itemId ? null : prev));
  };

  const handleToggleResultMenu = (itemId, resultType) => {
    setActiveResultMenu((prev) => (
      prev?.itemId === itemId && prev?.resultType === resultType ? null : { itemId, resultType }
    ));
  };

  const handleCancelActivity = () => {
    setShowActivityModal(false);
    setActiveResultMenu(null);
  };

  const formatRemainingTime = (endTime) => {
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityItems((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedDate = new Date().toLocaleDateString('en-GB');

  if (!businessInfo) return <LoadingScreen />;

  return (
    <div className="business-home">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <div className="toast-message">{toast.message}</div>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

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
          <button
            type="button"
            className="topbar-avatar-wrapper"
            onClick={() => setShowAvatarMenu((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={showAvatarMenu}
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
          </button>
          {showAvatarMenu && (
            <div className="topbar-avatar-menu">
              <button type="button" onClick={() => { setShowAvatarMenu(false); navigate('/profile'); }}>
                Profile
              </button>
              <button type="button" onClick={() => { setShowAvatarMenu(false); logout(); navigate('/login'); }}>
                Logout
              </button>
            </div>
          )}
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
                <div><strong>Linked devices:</strong> {businessInfo.linked_devices || 'None'}</div>
                <div><strong>Signed players:</strong> {businessInfo.signed_players || '0'}</div>
                <div><strong>Weekly income:</strong> {businessInfo.weekly_income || ''}</div>
                <div><strong>Payment details:</strong> {businessInfo.payment_details || ''}</div>
              </div>
            </div>
            <button type="button" className="prompt-button" onClick={() => setShowPromptModal(true)}>Prompt payment</button>
            <div style={{ height: 12 }} />
            <LinkedDevicePopupContainer />
          </section>


          <section className="dashboard-panel ">
            <div className="tournament-card">
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
            <div className="activity-panel-actions">
              <button type="button" className="panel-button" onClick={() => setShowActivityModal(true)}>Add</button>
              <button type="button" className="clear-all-button" onClick={handleClearAllActivities}>Clear all</button>
            </div>
          </div>
          <div className="activity-date">{formattedDate}</div>
          {activityItems.length === 0 ? (
            <div className="activity-empty">
              No activity yet. Add a timer or match entry to start tracking business performance.
            </div>
          ) : (
            <div className="activity-list">
              {activityItems.map((item) => {
                const totalGames = item.playerStats
                  ? Math.floor((item.playerStats.playerOne.wins + item.playerStats.playerOne.losses + item.playerStats.playerOne.draws + item.playerStats.playerTwo.wins + item.playerStats.playerTwo.losses + item.playerStats.playerTwo.draws) / 2)
                  : (item.counts?.wins || 0) + (item.counts?.losses || 0) + (item.counts?.draws || 0);

                return (
                  <div key={item.id} className="activity-item">
                    <div className="activity-item-header">
                      <div>
                        <div className="activity-item-title">{item.game}</div>
                        <div className="activity-item-meta">
                          {item.mode === 'single'
                            ? item.playerName
                            : `${item.playerOneName || 'Player 1'} vs ${item.playerTwoName || 'Player 2'}`}
                          {item.entryAction === 'timer' && item.endTime && (
                            <span className="activity-timer"> - {formatRemainingTime(item.endTime)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="clear-activity-button"
                        onClick={() => handleClearActivity(item.id)}
                      >
                        Clear
                      </button>
                    </div>

                    {item.mode === 'multi' && item.playerStats ? (
                      <>
                        <div className="player-score-grid">
                          <div className="player-score-row">
                            <span>{item.playerOneName}</span>
                            <span>W: {item.playerStats.playerOne.wins} / L: {item.playerStats.playerOne.losses} / D: {item.playerStats.playerOne.draws}</span>
                          </div>
                          <div className="player-score-row">
                            <span>{item.playerTwoName}</span>
                            <span>W: {item.playerStats.playerTwo.wins} / L: {item.playerStats.playerTwo.losses} / D: {item.playerStats.playerTwo.draws}</span>
                          </div>
                        </div>

                        <div className="result-pill-row">
                          <div className="result-block">
                            <button
                              type="button"
                              className="result-pill-button win"
                              onClick={() => handleToggleResultMenu(item.id, 'wins')}
                            >
                              W
                            </button>
                            <div className="result-count">
                              {item.playerStats.playerOne.wins + item.playerStats.playerTwo.wins}
                            </div>
                            {activeResultMenu?.itemId === item.id && activeResultMenu?.resultType === 'wins' && (
                              <div className="result-menu">
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerOne', 'wins', 1)}>Add win to {item.playerOneName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerOne', 'wins', -1)}>Remove win from {item.playerOneName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerTwo', 'wins', 1)}>Add win to {item.playerTwoName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerTwo', 'wins', -1)}>Remove win from {item.playerTwoName}</button>
                              </div>
                            )}
                          </div>

                          <div className="result-block">
                            <button
                              type="button"
                              className="result-pill-button loss"
                              onClick={() => handleToggleResultMenu(item.id, 'losses')}
                            >
                              L
                            </button>
                            <div className="result-count">
                              {item.playerStats.playerOne.losses + item.playerStats.playerTwo.losses}
                            </div>
                            {activeResultMenu?.itemId === item.id && activeResultMenu?.resultType === 'losses' && (
                              <div className="result-menu">
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerOne', 'losses', 1)}>Add loss to {item.playerOneName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerOne', 'losses', -1)}>Remove loss from {item.playerOneName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerTwo', 'losses', 1)}>Add loss to {item.playerTwoName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerTwo', 'losses', -1)}>Remove loss from {item.playerTwoName}</button>
                              </div>
                            )}
                          </div>

                          <div className="result-block">
                            <button
                              type="button"
                              className="result-pill-button draw"
                              onClick={() => handleToggleResultMenu(item.id, 'draws')}
                            >
                              D
                            </button>
                            <div className="result-count">
                              {item.playerStats.playerOne.draws + item.playerStats.playerTwo.draws}
                            </div>
                            {activeResultMenu?.itemId === item.id && activeResultMenu?.resultType === 'draws' && (
                              <div className="result-menu">
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerOne', 'draws', 1)}>Add draw to {item.playerOneName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerOne', 'draws', -1)}>Remove draw from {item.playerOneName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerTwo', 'draws', 1)}>Add draw to {item.playerTwoName}</button>
                                <button type="button" onClick={() => updateMatchResultForPlayer(item.id, 'playerTwo', 'draws', -1)}>Remove draw from {item.playerTwoName}</button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="activity-total">Total games: {totalGames}</div>
                      </>
                    ) : (
                      <>
                        {(item.counts || item.entryAction === 'timer') && (
                          <div className="result-pill-row">
                            {item.entryAction !== 'timer' && (
                              <>
                                <div className="result-block">
                                  <button
                                    type="button"
                                    className="result-pill-button win"
                                    onClick={() => handleToggleResultMenu(item.id, 'wins')}
                                  >
                                    W
                                  </button>
                                  <div className="result-count">{item.counts?.wins || 0}</div>
                                  {activeResultMenu?.itemId === item.id && activeResultMenu?.resultType === 'wins' && (
                                    <div className="result-menu">
                                      <button type="button" onClick={() => updateResultCount(item.id, 'wins', 1)}>Add win</button>
                                      <button type="button" onClick={() => updateResultCount(item.id, 'wins', -1)}>Remove win</button>
                                    </div>
                                  )}
                                </div>

                                <div className="result-block">
                                  <button
                                    type="button"
                                    className="result-pill-button loss"
                                    onClick={() => handleToggleResultMenu(item.id, 'losses')}
                                  >
                                    L
                                  </button>
                                  <div className="result-count">{item.counts?.losses || 0}</div>
                                  {activeResultMenu?.itemId === item.id && activeResultMenu?.resultType === 'losses' && (
                                    <div className="result-menu">
                                      <button type="button" onClick={() => updateResultCount(item.id, 'losses', 1)}>Add loss</button>
                                      <button type="button" onClick={() => updateResultCount(item.id, 'losses', -1)}>Remove loss</button>
                                    </div>
                                  )}
                                </div>

                                <div className="result-block">
                                  <button
                                    type="button"
                                    className="result-pill-button draw"
                                    onClick={() => handleToggleResultMenu(item.id, 'draws')}
                                  >
                                    D
                                  </button>
                                  <div className="result-count">{item.counts?.draws || 0}</div>
                                  {activeResultMenu?.itemId === item.id && activeResultMenu?.resultType === 'draws' && (
                                    <div className="result-menu">
                                      <button type="button" onClick={() => updateResultCount(item.id, 'draws', 1)}>Add draw</button>
                                      <button type="button" onClick={() => updateResultCount(item.id, 'draws', -1)}>Remove draw</button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                            {item.entryAction === 'timer' && item.endTime && (
                              <div className="activity-timer">Remaining: {formatRemainingTime(item.endTime)}</div>
                            )}
                          </div>
                        )}
                        <div className="activity-total">Total games: {totalGames}</div>
                      </>
                    )}
                  </div>
                );
              })}

            </div>
          )}
        </section>

        <section className="dashboard-panel manage-panel">
          <div className="panel-header">
            <span>Manage team</span>
          </div>
          <div className="home-search-section">
            <label htmlFor="business-player-search">Search player</label>
            <input
              id="business-player-search"
              className="search-player"
              type="text"
              placeholder="Search player by gamer tag or name"
              value={playerSearchTerm}
              onChange={(e) => setPlayerSearchTerm(e.target.value)}
            />
            {playerSearchTerm.trim().length > 0 && !playerSearchLoading && (
              <div className="search-count">Found {playerSearchResults.length} player{playerSearchResults.length !== 1 ? 's' : ''}</div>
            )}
            {playerSearchError && (
              <div className="search-error">{playerSearchError}</div>
            )}
            {playerSearchTerm.trim().length > 0 && (
              <div className="search-results">
                {playerSearchLoading ? (
                  <div className="search-status">Searching...</div>
                ) : playerSearchResults.length === 0 ? (
                  <div className="search-status">No players found.</div>
                ) : (
                  playerSearchResults.map((player) => (
                    <button
                      key={player.gamer_profile_id}
                      type="button"
                      className="search-result-item"
                      onClick={() => navigate(`/team-roster?gamerId=${player.gamer_profile_id}`)}
                    >
                      <div className="search-result-title">{player.username || `${player.first_name} ${player.last_name || ''}`}</div>
                      <div className="search-result-meta">{player.contract_status || 'Not signed'}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {signedPlayers.length > 0 && (
            <div className="signed-players-section">
              <div className="signed-players-header">Signed players</div>
              <div className="signed-player-list">
                {signedPlayers.slice(0, 5).map((player) => (
                  <div key={player.gamer_profile_id} className="signed-player-item">
                    <span>{player.username || `${player.first_name} ${player.last_name || ''}`}</span>
                    <span className="signed-player-role">{player.role || 'Team player'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {signedPlayers.length > 0 ? (
            signedPlayers.slice(0, 4).map((player) => {
              const playerName = player.username || `${player.first_name} ${player.last_name || ''}`;
              return (
                <div key={player.gamer_profile_id} className="player-entry">
                  <span>{playerName}</span>
                  <button type="button" onClick={() => handleOpenAssignModal(playerName)}>
                    Assign to tournament
                  </button>
                </div>
              );
            })
          ) : (
            <div className="player-entry no-player-entry">
              <span>No signed player</span>
            </div>
          )}

          <div className="analysis-section">
            <div className="analysis-title">Business Analysis</div>
            <div className="analysis-item">Daily income: {businessInfo.daily_income || ''}</div>
            <div className="analysis-item">Weekly income: {businessInfo.weekly_income || ''}</div>
            <div className="analysis-item">Monthly income: {businessInfo.monthly_income || ''}</div>
            <div className="analysis-item">Yearly income: {businessInfo.yearly_income || ''}</div>
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {showActivityModal && (
        <div className="modal">
          <div className="modal-content activity-modal-content">
            <div className="prompt-modal-header">
              <h2>ADD ACTIVITY</h2>
            </div>
            <div className="modal-field">
              <label>Game</label>
              <input
                type="text"
                value={activityForm.game}
                onChange={(e) => handleActivityChange('game', e.target.value)}
                placeholder="Enter game name"
              />
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
            <div className="activity-action-tabs">
              <button
                type="button"
                className={activityForm.mode === 'single' ? 'device-tab active' : 'device-tab'}
                onClick={() => handleActivityChange('mode', 'single')}
              >
                Single player
              </button>
              <button
                type="button"
                className={activityForm.mode === 'multi' ? 'device-tab active' : 'device-tab'}
                onClick={() => handleActivityChange('mode', 'multi')}
              >
                Multiplayer
              </button>
            </div>
            <div className="activity-action-tabs">
              <button
                type="button"
                className={activityForm.entryAction === 'timer' ? 'device-tab active' : 'device-tab'}
                onClick={() => handleActivityChange('entryAction', 'timer')}
              >
                Set timer
              </button>
              <button
                type="button"
                className={activityForm.entryAction === 'match' ? 'device-tab active' : 'device-tab'}
                onClick={() => handleActivityChange('entryAction', 'match')}
              >
                Set match
              </button>
            </div>
            <div className="activity-section-divider" />
            {activityForm.mode === 'single' ? (
              <div className="activity-group">
                <h3>Single player</h3>
                <div className="activity-row-modal">
                  <span>Player name:</span>
                  <input
                    type="text"
                    value={activityForm.single_player}
                    onChange={(e) => handleActivityChange('single_player', e.target.value)}
                    placeholder="P1"
                  />
                  {activityForm.entryAction === 'timer' ? (
                    <>
                      <span>Timer (min):</span>
                      <input
                        type="text"
                        value={activityForm.single_timer}
                        onChange={(e) => handleActivityChange('single_timer', e.target.value)}
                        placeholder="minutes"
                      />
                    </>
                  ) : (
                    <>
                      <span>Team 1:</span>
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
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="activity-group">
                <h3>Multiplayer</h3>
                <div className="activity-row-modal">
                  <span>Player 1:</span>
                  <input
                    type="text"
                    value={activityForm.multi_player1}
                    onChange={(e) => handleActivityChange('multi_player1', e.target.value)}
                    placeholder="P1"
                  />
                  <span>Player 2:</span>
                  <input
                    type="text"
                    value={activityForm.multi_player2}
                    onChange={(e) => handleActivityChange('multi_player2', e.target.value)}
                    placeholder="P2"
                  />
                </div>
                <div className="activity-row-modal">
                  {activityForm.entryAction === 'timer' ? (
                    <>
                      <span>Timer (min):</span>
                      <input
                        type="text"
                        value={activityForm.multi_timer}
                        onChange={(e) => handleActivityChange('multi_timer', e.target.value)}
                        placeholder="minutes"
                      />
                    </>
                  ) : (
                    <>
                      <span>Team 1:</span>
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
                    </>
                  )}
                </div>
              </div>
            )}
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
                <div className="payment-label">Mpesa</div>
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
                <label>Buy Goods and Services</label>
                <input
                  value={editForm.till_number}
                  onChange={(e) => handleEditChange('till_number', e.target.value)}
                  placeholder="Till number"
                />
                <button type="button" className="enroll-button" onClick={handleEnrollPaymentSettings}>Enrol</button>
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
              <p>Enter client phone number and amount</p>
            </div>
            <div className="prompt-modal-body">
              <label>Phone number</label>
              <input
                type="tel"
                value={promptPhone}
                onChange={(e) => setPromptPhone(e.target.value)}
                placeholder="0712345678"
                className="prompt-input"
              />
              <label>Amount</label>
              <input
                type="number"
                value={promptAmount}
                onChange={(e) => setPromptAmount(e.target.value)}
                placeholder="e.g. 500"
                className="prompt-input"
                min="1"
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
