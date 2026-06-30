import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { businessAPI, gamerAPI } from '../utils/api';
import logo from '../Assets/logo.png';
import './styles/TeamRoster.css';

export default function TeamRosterPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedView, setSelectedView] = useState('team');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialGamerId = queryParams.get('gamerId');

  const loadTeamRoster = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await businessAPI.getTeamRoster(user.id, selectedView);
      const roster = response.data || [];
      setTeamMembers(roster);
      if (initialGamerId) {
        let selected = roster.find((member) => String(member.gamer_profile_id) === String(initialGamerId));
        if (!selected) {
          // fetch single player via business search by gamer id
          try {
            const r = await businessAPI.searchPlayers(user.id, '', initialGamerId, selectedView);
            if (r.data && r.data.length > 0) {
              selected = r.data[0];
            }
          } catch (err) {
            console.error('Failed to load selected gamer via search:', err);
          }
        }

        if (selected) {
          // try to fetch stats if we have a user_id returned
          try {
            if (selected.user_id) {
              const statsRes = await gamerAPI.getStats(selected.user_id);
              selected.stats = statsRes.data || {};
              try {
                const profileRes = await gamerAPI.getProfile(selected.user_id);
                selected.profile = profileRes.data || {};
                // prefer profile username when available
                if (!selected.username && selected.profile.username) selected.username = selected.profile.username;
              } catch (pfErr) {
                console.error('Failed to load gamer profile:', pfErr);
              }
            }
          } catch (err) {
            console.error('Failed to load gamer stats:', err);
          }
        }

        setSelectedMember(selected || roster[0] || null);
      } else {
        setSelectedMember(roster[0] || null);
      }
    } catch (error) {
      console.error('Failed to load team roster:', error);
    }
  }, [user?.id, selectedView, initialGamerId]);

  useEffect(() => {
    loadTeamRoster();
  }, [loadTeamRoster]);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!user?.id) return;
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await businessAPI.searchPlayers(user.id, searchTerm, null, 'all');
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Failed to search gamers:', error);
      }
    };

    const timeout = setTimeout(loadSearchResults, 250);
    return () => clearTimeout(timeout);
  }, [user?.id, searchTerm, selectedView]);

  const filteredMembers = searchTerm.trim() ? searchResults : teamMembers;

  const stats = selectedMember?.stats || {
    played: '',
    won: '',
    lost: '',
    quarter: '',
    money: '',
  };

  const handlePlayerAction = async (action) => {
    if (!selectedMember?.gamer_profile_id || !user?.id) return;
    try {
      setActionLoading(true);
      setActionError('');
      const response = await businessAPI.addTeamMember(user.id, selectedMember.gamer_profile_id, action);
      const updated = response.data;
      setSelectedMember((prev) => ({
        ...prev,
        ...updated,
        is_team_player: action === 'team',
        is_monitored: action === 'monitor',
      }));
      await loadTeamRoster();
    } catch (error) {
      console.error('Failed to update player status:', error);
      setActionError(error?.response?.data?.error || error.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMonitorPlayer = () => handlePlayerAction('monitor');
  const handleSignPlayer = () => handlePlayerAction('team');

  const handleReleasePlayer = async () => {
    if (!selectedMember?.gamer_profile_id || !user?.id) return;
    try {
      setActionLoading(true);
      setActionError('');
      await businessAPI.releaseTeamMember(user.id, selectedMember.gamer_profile_id);
      await loadTeamRoster();
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to release player:', error);
      setActionError(error?.response?.data?.error || error.message || 'Release failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectMember = async (member) => {
    try {
      let selected = { ...member };

      if (member.user_id) {
        const statsRes = await gamerAPI.getStats(member.user_id);
        selected.stats = statsRes.data || {};
        try {
          const profileRes = await gamerAPI.getProfile(member.user_id);
          selected.profile = profileRes.data || {};
          if (!selected.username && selected.profile.username) selected.username = selected.profile.username;
        } catch (pfErr) {
          console.error('Failed to load gamer profile:', pfErr);
        }
      } else if (member.gamer_profile_id) {
        // Try to enrich member by querying the business search for this gamer_profile_id
        try {
          const r = await businessAPI.searchPlayers(user.id, '', member.gamer_profile_id, 'all');
          if (r.data && r.data.length > 0) {
            selected = { ...selected, ...r.data[0] };
            if (selected.user_id) {
              const statsRes = await gamerAPI.getStats(selected.user_id);
              selected.stats = statsRes.data || {};
              try {
                const profileRes = await gamerAPI.getProfile(selected.user_id);
                selected.profile = profileRes.data || {};
                if (!selected.username && selected.profile.username) selected.username = selected.profile.username;
              } catch (pfErr) {
                console.error('Failed to load gamer profile after enrich:', pfErr);
              }
            }
          }
        } catch (err) {
          console.error('Failed to enrich member via search:', err);
        }
      }

      setSelectedMember(selected);
    } catch (err) {
      console.error('Failed selecting member:', err);
    }
  };

  return (
    <div className="team-roster-page">
      <div className="topbar">
        <div className="topbar-left">
          <img src={logo} alt="Gamelink logo" className="topbar-logo" />
        </div>
        <div className="topbar-center">
          <button className="top-tab active" type="button">Team Roster</button>
          <button className="top-tab" type="button" onClick={() => navigate('/business-home')}>Home</button>
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
            <div className="topbar-avatar-placeholder">{user?.username?.charAt(0).toUpperCase() || 'B'}</div>
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

      <div className="roster-inner">
        <div className="roster-panel roster-list-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">eSports Club Management</p>
              <h2>Team roster</h2>
            </div>
            <div className="header-line" />
          </div>

          <div className="search-row">
            <label>Search player to monitor:</label>
            <input
              type="search"
              placeholder="Search player"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="roster-search-actions">
              <button
                type="button"
                className={`search-action-button orange ${selectedView === 'team' ? 'active' : ''}`}
                onClick={() => setSelectedView('team')}
              >
                Team players
              </button>
              <button
                type="button"
                className={`search-action-button orange ${selectedView === 'monitor' ? 'active' : ''}`}
                onClick={() => setSelectedView('monitor')}
              >
                View monitor list
              </button>
            </div>
          </div>

          <div className="player-list">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <button
                  key={member.team_member_id || member.id}
                  type="button"
                  className={`player-item ${selectedMember?.gamer_profile_id === member.gamer_profile_id ? 'selected' : ''}`}
                  onClick={() => handleSelectMember(member)}
                >
                  {member.username ? member.username : `${member.first_name} ${member.last_name || ''}`}
                </button>
              ))
            ) : selectedView === 'monitor' ? (
              <div className="empty-state">No players monitored.</div>
            ) : selectedView === 'team' ? (
              <div className="empty-state">No signed players.</div>
            ) : (
              [
                { id: 'empty-1', first_name: 'Team player' },
                { id: 'empty-2', first_name: 'Team player' },
                { id: 'empty-3', first_name: 'Team player' },
                { id: 'empty-4', first_name: 'Team player' },
                { id: 'empty-5', first_name: 'Team player' },
                { id: 'empty-6', first_name: 'Team player' },
                { id: 'empty-7', first_name: 'Team player' },
              ].map((member) => (
                <button
                  key={member.id}
                  type="button"
                  className="player-item"
                >
                  {member.first_name}
                </button>
              ))
            )}
          </div>

        </div>

        <div className="roster-panel roster-detail-panel">
          <div className="detail-header">
            <div className="detail-text">
              <div className="detail-row"><span>Name:</span> <strong>{selectedMember ? (selectedMember.username ? selectedMember.username : `${selectedMember.first_name} ${selectedMember.last_name || ''}`) : ''}</strong></div>
              <div className="detail-row"><span>esports team:</span> <strong>{selectedMember ? (selectedMember.role || '') : ''}</strong></div>
              <div className="detail-row"><span>Monitored by:</span> <strong>{selectedMember ? (user?.business_name || user?.username || 'Business') : ''}</strong></div>
              <div className="detail-row"><span>Contract Status:</span> <strong>{selectedMember ? (selectedMember?.contract_status || '') : ''}</strong></div>
            </div>

            <div className="detail-avatar-block">
              <div className="avatar-large" />
            </div>
          </div>

          <div className="detail-actions-row">
            {selectedMember && selectedMember.is_monitored ? null : (
              <button
                type="button"
                className="action-button monitor"
                disabled={!selectedMember || selectedMember?.is_team_player || selectedMember?.is_monitored || actionLoading}
                onClick={handleMonitorPlayer}
              >
                Monitor player
              </button>
            )}
            <button
              type="button"
              className="action-button assign"
              disabled={!selectedMember || !selectedMember.is_team_player || actionLoading}
              onClick={() => alert('Assign tournament for ' + selectedMember?.first_name)}
            >
              Assign tournament
            </button>
            {selectedMember && selectedMember.is_monitored ? null : (
              <button
                type="button"
                className="action-button sign"
                disabled={!selectedMember || selectedMember?.is_team_player || selectedMember?.is_monitored || actionLoading}
                onClick={handleSignPlayer}
              >
                Sign player
              </button>
            )}
            <button
              type="button"
              className="action-button release"
              disabled={!selectedMember || actionLoading}
              onClick={handleReleasePlayer}
            >
              Release player
            </button>
          </div>
          {actionError && (
            <div className="action-error">{actionError}</div>
          )}

          <div className="stats-section">
            <div className="stats-title">Stats</div>
            <div className="stats-card">
              <div className="stats-row"><span>Tournaments played:</span> <strong>{stats.played}</strong></div>
              <div className="stats-row"><span>Tournaments won:</span> <strong>{stats.won}</strong></div>
              <div className="stats-row"><span>Tournaments lost:</span> <strong>{stats.lost}</strong></div>
              <div className="stats-row"><span>Advance from quarters:</span> <strong>{stats.quarter}</strong></div>
              <div className="stats-row"><span>Money won:</span> <strong>{stats.money}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
