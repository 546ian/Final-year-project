import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export default function HostTournamentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.account_type === 'business') {
      navigate('/host-tournament/business');
    } else {
      navigate('/host-tournament/gamer');
    }
  }, [user, navigate]);

  return null;
}
