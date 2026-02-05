import React from 'react';
import './SplashScreen.css';

const SplashScreen = ({ fade = false }) => {
  return (
    <div className={`splash-screen ${fade ? 'fade-out' : ''}`}>
      <div className="logo-container">
        <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" className="splash-logo" />
      </div>
    </div>
  );
};

export default SplashScreen;
