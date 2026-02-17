import './App.css';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { LandingIntro } from './pages/LandingIntro';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Main } from './pages/Main';
import { Home } from './components/Home';
import { Jobs } from './pages/Jobs';
import { Discover } from './components/Discover';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmarks } from './components/Bookmarks';
import { JobDetails } from './pages/JobDetails';
import { Profile } from './pages/Profile';
import { Messages } from './pages/Messages';
import { Conversation } from './components/Conversation';
import { Candidates } from './components/Candidates';
import { Notifications } from './pages/Notifications';
import { AdminDashboard } from './pages/AdminDashboard';

import { ManageJobs } from './components/ManageJobs';
import InstallPrompt from './components/InstallPrompt';
import SplashScreen from './components/SplashScreen';
import { useState, useEffect } from 'react';
import { isTokenExpired, apiFetch } from './utils/api';
import { chatCache } from './utils/cache';

function App() {
  const location = useLocation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    chatCache.cleanup();
    
    // UI Hard Refresh logic - every 3 days
    const lastUIRefresh = localStorage.getItem('last_ui_hard_refresh');
    const now = Date.now();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    if (!lastUIRefresh || now - parseInt(lastUIRefresh) > THREE_DAYS) {
      localStorage.setItem('last_ui_hard_refresh', now.toString());
      // Clear all caches before reloading to ensure absolute freshness
      if ('caches' in window) {
        caches.keys().then(names => {
          for (let name of names) caches.delete(name);
        });
      }
      window.location.reload(true);
      return;
    }

    apiFetch('/').catch(err => console.log('Backend wake-up initiated'));

    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
    }, 3000);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // System theme listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      const savedSettings = localStorage.getItem('userSettings');
      const settings = savedSettings ? JSON.parse(savedSettings) : null;
      
      // Only auto-switch if user hasn't manually set a preference or if we want to follow system
      // For now, let's follow the request "adopt system mood automatically"
      // If user has manual setting, we might respect it, but the request implies automation.
      // Let's check if the user has explicitly set darkMode in settings.
      if (!settings || settings.darkMode === undefined) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      mediaQuery.removeEventListener('change', handleThemeChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const role = localStorage.getItem('userRole') || 'CANDIDATE';

  return (
    <>
      {showSplash && <SplashScreen fade={fadeSplash} />}
      <div className="App" style={{ opacity: showSplash && !fadeSplash ? 0 : 1, transition: 'opacity 0.5s' }}>
        {isOffline && (
        <div style={{
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999
        }}>
          You are currently offline. Some features may be limited.
        </div>
      )}
      <InstallPrompt />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname.split('/')[1] || '/'}>
          <Route path="/intro" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <LandingIntro />
            </motion.div>
          } />
          <Route path="/onboarding" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Onboarding />
            </motion.div>
          } />
          <Route path="/login" element={
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Login />
            </motion.div>
          } />


          <Route path="/" element={<AuthGuard />} >
            <Route index element={<Home />} />
            <Route path="about" element={<div>About</div>} />
            <Route path="profile" element={<Profile />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:id" element={<Conversation />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="jobs" element={<Jobs />}>
              <Route index element={role === 'EMPLOYER' ? <ManageJobs /> : <Discover />} />
              <Route path="discover" element={<Discover />} />
              <Route path="bookmarks" element={<Bookmarks />} />
            </Route>
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="admin/*" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </AnimatePresence>
      </div>
    </>
  );
}

const AuthGuard = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const hasVisited = localStorage.getItem('hasVisited');
  const isAuthenticated = !!token && !isTokenExpired(token);

  if (!isAuthenticated) {
    if (token) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('registrationStage');
    }
    
    if (!hasVisited) {
      return <Navigate to="/intro" replace />;
    }
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole === 'ADMIN' && location.pathname === '/') {
    return <Navigate to="/admin" replace />;
  }

  return <Main />;
}

export default App;

