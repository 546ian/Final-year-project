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
        const data = await tournamentAPI.getBracket(tournamentId);
        setMatches(data);
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
      <div className="bracket-container">
        {roundNumbers.map(roundNum => (
          <div key={roundNum} className="bracket-round">
            <div className="round-header">Round {roundNum}</div>
            <div className="matches-column">
              {rounds[roundNum].map(match => (
                <div key={match.id} className="match">
                  <div className={`player ${match.player1_id ? '' : 'bye'}`}>
                    {match.player1_name || 'TBD'}
                  </div>
                  <div className="vs">vs</div>
                  <div className={`player ${match.player2_id ? '' : 'bye'}`}>
                    {match.player2_name || 'TBD'}
                  </div>
                  {match.winner_name && (
                    <div className="winner">Winner: {match.winner_name}</div>
                  )}
                  <div className="score">
                    {match.player1_score !== null && match.player2_score !== null 
                      ? `${match.player1_score}-${match.player2_score}`
                      : 'Pending'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentBracket;

