import React from 'react';
import './Loader.css';

const Loader = ({ fullPage = false, size = 'medium', inline = false }) => {
  return (
    <div className={`loader-container ${fullPage ? 'full-page' : ''} ${inline || size === 'small' ? 'inline' : ''}`}>
      {size === 'small' ? (
        <div className="spinner small"></div>
      ) : (
        <div className={`loader-bars ${size}`}></div>
      )}
    </div>
  );
};

export default Loader;
