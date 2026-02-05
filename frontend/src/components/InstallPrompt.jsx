import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
       setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User responded to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="install-prompt" style={{
      position: 'fixed',
      bottom: '80px', // Above the bottom nav
      left: '20px',
      right: '20px',
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      border: '1px solid #f0f0f0',
      animation: 'slideUp 0.4s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
         
          padding: '4px',
          borderRadius: '10px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch" style={{ height: '28px', width: '28px', objectFit: 'contain' }} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Install SkillMatch</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Add to home screen for better experience</p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={handleInstallClick}
          style={{
            backgroundColor: '#ff8c00',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Install
        </button>
        <button 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            padding: '4px',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
