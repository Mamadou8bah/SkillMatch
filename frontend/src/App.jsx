import './App.css';
import { Welcome } from './pages/Welcome';
import { Onboarding } from './pages/Onboarding';
import { Login } from './pages/Login';
import { LandingIntro } from './pages/LandingIntro';
import { Routes, Route, Navigate } from 'react-router-dom';
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

import { ManageJobs } from './components/ManageJobs';

function App() {
  const role = localStorage.getItem('userRole') || 'CANDIDATE';

  return (
    <div className="App">
      <Routes>
        <Route path="/intro" element={<LandingIntro />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />


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
