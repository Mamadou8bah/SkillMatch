import './App.css';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { LandingIntro } from './pages/LandingIntro';
import { Routes, Route } from 'react-router-dom';
import { Main } from './pages/Main';
import { Home } from './components/Home';
import { Jobs } from './pages/Jobs';
import { Discover } from './components/Discover';
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

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeSplash(true);
    }, 2000); // Start fading after 2s

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2800); // Remove from DOM after fade animation (800ms)

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
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
      <Routes>
        <Route path="/intro" element={<LandingIntro />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />


        <Route path="/" element={<AuthGuard />} >
          <Route index element={<Home />} />
          <Route path="about" element={<div>About</div>} />
          <Route path="profile" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="jobs" element={<Jobs />}>
            <Route index element={role === 'EMPLOYER' ? <ManageJobs /> : <Discover />} />
            <Route path="discover" element={<Discover />} />
            <Route path="bookmarks" element={<Bookmarks />} />
          </Route>
        </Route>
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/messages/:id" element={<Conversation />} />
      </Routes>
      </div>
    </>
  );
}

const AuthGuard = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    return <LandingIntro />;
  }

  return <Main />;
}

export default App;
