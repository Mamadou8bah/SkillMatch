import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
      console.log('beforeinstallprompt event fired and captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If the app is already installed or if we've already shown the prompt this session
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
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
      bottom: isAdmin ? '20px' : '85px',
      left: '10px',
      right: '10px',
      backgroundColor: 'var(--card-bg)',
      padding: '12px 16px',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 2000,
      border: '1px solid var(--border-color)',
      animation: 'slideInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: 'var(--primary-transparent)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <img src="/assets/logos/skillmatch-logo.png" alt="S" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-color)' }}>Add to home screen</h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}></p>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={handleInstallClick}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px var(--primary-transparent)'
          }}
        >
          Add
        </button>
        <button 
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
