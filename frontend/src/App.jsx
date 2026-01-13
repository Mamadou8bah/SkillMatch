import './App.css';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
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
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/we" element={<Welcome />} />
        <Route path="/login" element={<Login />} />


        <Route path="/" element={<Main />}>
          <Route index element={<Home />} />
          <Route path="about" element={<div>About</div>} />
          <Route path="profile" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="jobs" element={<Jobs />}>
            <Route index element={<Discover />} />
            <Route path="bookmarks" element={<Bookmarks />} />
          </Route>
        </Route>
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/messages/:id" element={<Conversation />} />
      </Routes>
    </div>
  );
}

export default App;
