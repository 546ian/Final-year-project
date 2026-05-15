import React, { useState, useEffect } from 'react';
import { tournamentAPI } from '../utils/api';
import { demoMatches } from '../pages/tournament-data.js';



import '../pages/styles/Tournament.css';


const TournamentBracket = ({ tournamentId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tournamentId === 'preview1') {

      setMatches(demoMatches.demo1);
      setLoading(false);
      return;
    }
    
    const fetchBracket = async () => {
      try {
        const response = await tournamentAPI.getBracket(tournamentId);
        setMatches(response.data || []);
      } catch (error) {
        console.error('Failed to fetch bracket:', error);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    if (tournamentId) fetchBracket();
  }, [tournamentId]);


  if (loading) return <div className="bracket-loading">Loading bracket...</div>;

  // Group matches by round
  const rounds = {};
  matches.forEach(match => {
    if (!rounds[match.round_number]) rounds[match.round_number] = [];
    rounds[match.round_number].push(match);
  });

  const roundNumbers = Object.keys(rounds).sort((a, b) => a - b);

  return (
    <div className="tournament-bracket">
      <h3>Tournament Bracket</h3>
      {roundNumbers.length === 0 ? (
        <div className="bracket-loading">No bracket data available yet.</div>
      ) : (
        <div className="bracket-container">
          {roundNumbers.map(roundNum => (
            <div key={roundNum} className="bracket-round">
              <div className="round-header">Round {roundNum}</div>
              <div className="matches-column">
                {rounds[roundNum].map(match => (
                  <div key={match.id} className="match">
                    <div className="match-card">
                      <div className="match-title">Match {match.match_number || match.id}</div>
                      <div className={`match-player ${match.player1_id ? '' : 'bye'}`}>
                        <span>{match.player1_name || 'TBD'}</span>
                        <span className="player-status">{match.player1_score !== null ? match.player1_score : ''}</span>
                      </div>
                      <div className="vs">vs</div>
                      <div className={`match-player ${match.player2_id ? '' : 'bye'}`}>
                        <span>{match.player2_name || 'TBD'}</span>
                        <span className="player-status">{match.player2_score !== null ? match.player2_score : ''}</span>
                      </div>
                      {match.winner_name && (
                        <div className="player-status">Winner: {match.winner_name}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;

