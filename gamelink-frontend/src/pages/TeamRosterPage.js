import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { businessAPI } from '../utils/api';
import './styles/TeamRoster.css';

export default function TeamRosterPage() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadTeamRoster();
    }
  }, [user?.id]);

  const loadTeamRoster = async () => {
    try {
      const response = await businessAPI.getTeamRoster(user.id);
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Failed to load team roster:', error);
    }
  };

  return (
    <div className="team-roster-page">
      <h1>Team Roster</h1>
      
      <table className="roster-table">
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map(member => (
            <tr key={member.id}>
              <td>{member.first_name} {member.last_name}</td>
              <td>{member.email}</td>
              <td>{member.role}</td>
              <td>{member.contract_status}</td>
              <td>
                <button>View Profile</button>
                <button>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
