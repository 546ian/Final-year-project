import React from 'react';
import gamelinkLogo from '../Assets/GL login.jpg';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo-wrapper">
        <img src={gamelinkLogo} alt="Gamelink logo" className="loading-logo" />
      </div>
    </div>
  );
}
