import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import GamerRegisterPage from './pages/GamerRegisterPage';
import BusinessRegisterPage from './pages/BusinessRegisterPage';
import BusinessHomePage from './pages/BusinessHomePage';
import GamerHomePage from './pages/GamerHomePage';
import HostTournamentPage from './pages/HostTournamentPage';
import GamerHostTournamentPage from './pages/GamerHostTournamentPage';
import BusinessHostTournamentPage from './pages/BusinessHostTournamentPage';
import TeamRosterPage from './pages/TeamRosterPage';
import GamerProfilePage from './pages/GamerProfilePage';
import GamerActivitiesPage from './pages/GamerActivitiesPage';
import BusinessLogsPage from './pages/BusinessLogsPage';
import TournamentViewPage from './pages/TournamentViewPage';

import './App.css';


const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/gamer" element={<GamerRegisterPage />} />
        <Route path="/register/business" element={<BusinessRegisterPage />} />

        {/* Business Routes */}
        <Route path="/business-home" element={<PrivateRoute><BusinessHomePage /></PrivateRoute>} />
        <Route path="/host-tournament" element={<PrivateRoute><HostTournamentPage /></PrivateRoute>} />
        <Route path="/host-tournament/gamer" element={<PrivateRoute><GamerHostTournamentPage /></PrivateRoute>} />
        <Route path="/host-tournament/business" element={<PrivateRoute><BusinessHostTournamentPage /></PrivateRoute>} />
        <Route path="/tournament/:id" element={<PrivateRoute><TournamentViewPage /></PrivateRoute>} />
        <Route path="/team-roster" element={<PrivateRoute><TeamRosterPage /></PrivateRoute>} />

        <Route path="/business-logs" element={<PrivateRoute><BusinessLogsPage /></PrivateRoute>} />

        {/* Gamer Routes */}
        <Route path="/gamer-home" element={<PrivateRoute><GamerHomePage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><GamerProfilePage /></PrivateRoute>} />
        <Route path="/activities" element={<PrivateRoute><GamerActivitiesPage /></PrivateRoute>} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
