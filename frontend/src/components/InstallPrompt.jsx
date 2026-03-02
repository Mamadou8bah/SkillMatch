import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  // Only show on homepage ('/') - ensure it's not the /intro path
  const isHomepage = location.pathname === '/';

  useEffect(() => {
    // Only listen if we are on the homepage
    if (!isHomepage) return;

    console.log('InstallPrompt: mounting and listening for beforeinstallprompt');
    const handleBeforeInstallPrompt = (e) => {
      console.log('InstallPrompt: beforeinstallprompt event fired');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if it's been dismissed in the last 24 hours
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      const isDismissedRecently = lastDismissed && (Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000);
      
      if (!isDismissedRecently) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if the app is already in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      console.log('InstallPrompt: App is already running in standalone mode (installed)');
      setIsVisible(false);
    }
    
    return () => {
      console.log('InstallPrompt: unmounting and removing listener');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isHomepage]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      console.log('User dismissed the PWA install prompt');
    }

    // Clear the deferredPrompt for the next time
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember the user dismissed it
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible || !isHomepage) return null;

  return (
    <div 
      className="install-prompt-container"
      style={{
        position: 'fixed',
        bottom: isAdmin ? '24px' : '90px',
        right: '24px',
        maxWidth: '400px',
        zIndex: 2000,
        animation: 'slideUp 0.5s ease-out'
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .install-prompt-card {
           background-color: var(--card-bg);
           border: 1px solid var(--border-color);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           padding: 20px;
           border-radius: 24px;
           box-shadow: 0 12px 40px rgba(0,0,0,0.15);
           display: flex;
           flex-direction: column;
           gap: 16px;
        }
        .install-prompt-header {
          display: flex;
          gap: 16px;
        }
        .install-prompt-logo-wrapper {
          width: 48px;
          height: 48px;
          background-color: var(--primary-transparent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .install-prompt-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
        .install-prompt-text h3 {
          margin: 0;
          color: var(--text-color);
          font-weight: 700;
          font-size: 1rem;
        }
        .install-prompt-text p {
          margin: 4px 0 0 0;
          color: var(--text-secondary);
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .install-prompt-actions {
          display: flex;
          gap: 12px;
        }
        .btn-dismiss {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-dismiss:hover {
          color: var(--text-color);
          background-color: var(--hover-color);
        }
        .btn-install {
          flex: 2;
          padding: 10px;
          border-radius: 12px;
          border: none;
          background-color: var(--primary-color);
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px var(--primary-transparent);
        }
        .btn-install:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }
        
        @media (min-width: 1024px) {
          .install-prompt-container {
            left: auto;
            right: 40px;
            width: 320px;
          }
        }
      `}</style>
      <div className="install-prompt-card">
        <div className="install-prompt-header">
          <div className="install-prompt-logo-wrapper">
            <img src="/assets/logos/skillmatch-logo.png" alt="Logo" className="install-prompt-logo" />
          </div>
          <div className="install-prompt-text">
            <h3>Install SkillMatch</h3>
            <p>Add to your home screen for a better experience and faster access.</p>
          </div>
        </div>
        
        <div className="install-prompt-actions">
          <button 
            onClick={handleDismiss}
            className="btn-dismiss"
          >
            Not now
          </button>
          <button 
            onClick={handleInstallClick}
            className="btn-install"
          >
            Install App
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
