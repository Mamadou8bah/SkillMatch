import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = false, size = 'medium' }) => {
  return (
    <div className={`loader-container ${fullPage ? 'full-page' : ''}`}>
      <div className={`spinner ${size}`}></div>
    </div>
  );
};

export default Loader;
