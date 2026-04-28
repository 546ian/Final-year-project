// Tournament preview data
export const demoTournaments = {
  preview1: {
    id: 'preview1',
    tournament_name: 'Your Tournament',
    game_name: 'Selected Game',
    tournament_format: 'single_elimination',
    max_players: 8,
    status: 'registration',
    entry_fee: 0,
    start_date: new Date().toISOString(),
    description: ''
  }
};

export const demoParticipants = {
  preview1: []
};

export const demoMatches = {
  preview1: [
    { id: 1, round_number: 1, match_number: 1, player1_name: 'Player 1', player2_name: 'Player 2', status: 'pending' },
    { id: 2, round_number: 1, match_number: 2, player1_name: 'Player 3', player2_name: 'Player 4', status: 'pending' },
    { id: 3, round_number: 1, match_number: 3, player1_name: 'Player 5', player2_name: 'Player 6', status: 'pending' },
    { id: 4, round_number: 1, match_number: 4, player1_name: 'Player 7', player2_name: 'Player 8', status: 'pending' },
    { id: 5, round_number: 2, match_number: 1, player1_name: 'Winner R1 M1', player2_name: 'Winner R1 M2', status: 'pending' },
    { id: 6, round_number: 2, match_number: 2, player1_name: 'Winner R1 M3', player2_name: 'Winner R1 M4', status: 'pending' },
    { id: 7, round_number: 3, match_number: 1, player1_name: 'SF Winner 1', player2_name: 'SF Winner 2', status: 'pending' }
  ]
};

