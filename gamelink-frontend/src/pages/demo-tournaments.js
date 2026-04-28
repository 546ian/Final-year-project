// Tournament data for immediate bracket preview
const tournamentData = {

  preview1: {
    id: 'preview1',
    tournament_name: 'My Tournament',

    game_name: 'Valorant',
    tournament_format: 'single_elimination',
    max_players: 8,
    status: 'active',
    start_date: '2024-12-01T10:00:00Z',
    host_name: 'Demo Host',
    description: 'Test single-elim bracket'
  }
};

const demoParticipants = {
  'demo1': [
    { username: 'Player1' },
    { username: 'Player2' },
    { username: 'Player3' },
    { username: 'Player4' },
    { username: 'Player5' },
    { username: 'Player6' },
    { username: 'Player7' },
    { username: 'Player8' }
  ]
};

const demoMatches = {
  'demo1': [
    { id: 1, round_number: 1, match_number: 1, player1_name: 'Player1', player2_name: 'Player2', status: 'pending' },
    { id: 2, round_number: 1, match_number: 2, player1_name: 'Player3', player2_name: 'Player4', status: 'pending' },
    { id: 3, round_number: 1, match_number: 3, player1_name: 'Player5', player2_name: 'Player6', status: 'pending' },
    { id: 4, round_number: 1, match_number: 4, player1_name: 'Player7', player2_name: 'Player8', status: 'pending' },
    { id: 5, round_number: 2, match_number: 1, player1_name: 'TBD', player2_name: 'TBD', status: 'pending' },
    { id: 6, round_number: 2, match_number: 2, player1_name: 'TBD', player2_name: 'TBD', status: 'pending' },
    { id: 7, round_number: 3, match_number: 1, player1_name: 'TBD', player2_name: 'TBD', status: 'pending' }
  ]
};

const demoTournaments = tournamentData;

export { demoTournaments, demoParticipants, demoMatches };


