import React, { useState } from 'react';
import '../styles/Profile.css';
import { user } from '../data/user';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Settings,
  LogOut,
  ChevronRight,
  Globe,
  Bell,
  HelpCircle,
  Briefcase,
  Award,
  Camera,
  Eye,
  EyeOff,
  Plus,
  X,
  Moon,
  Volume2
} from 'lucide-react';

export const Profile = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('main'); // 'main', 'edit', 'skills', 'experience', 'settings', 'language'

  // Profile Data State
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    mobile: "8042849584",
    password: user.password
  });

  // Skills State
  const [skills, setSkills] = useState(user.skills);
  const [newSkill, setNewSkill] = useState('');

  // Experience State
  const [experience, setExperience] = useState(user.experience);

  // Settings State
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    sound: true
  });

  // Language State
  const [language, setLanguage] = useState('English (US)');

  const [showPassword, setShowPassword] = useState(false);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = () => {
    console.log("Saving profile data:", profileData);
    setActiveView('main');
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleLogout = () => {
    // Perform cleanup if needed
    navigate('/we');
  };

  const toggleSetting = (settingKey) => {
    setSettings(prev => ({ ...prev, [settingKey]: !prev[settingKey] }));
  };


  // --- VIEWS ---

  // 1. Edit Profile View
  if (activeView === 'edit') {
    const fullName = `${profileData.firstName} ${profileData.lastName}`;
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          <button className="back-btn" onClick={() => setActiveView('main')}>
            <svg width="24px" height="24px" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z" />
            </svg>
          </button>
          <h2>Edit Profile</h2>
          <div className="spacer"></div>
        </div>

        <div className="profile-avatar-container edit-avatar">
          <img src={user.avatar} alt="Profile" className="profile-avatar" />
          <button className="camera-btn">
            <Camera size={18} color="white" />
          </button>
        </div>

        <form className="edit-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="firstName"
              value={fullName}
              readOnly
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Mobile No</label>
            <input
              type="text"
              name="mobile"
              value={profileData.mobile}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={profileData.password}
                onChange={handleInputChange}
                className="form-input"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="save-btn" onClick={handleSaveProfile}>
            Save
          </button>
        </form>
      </div>
    );
  }

  // 2. Skills View
  if (activeView === 'skills') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          <button className="back-btn" onClick={() => setActiveView('main')}>
            <svg width="24px" height="24px" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z" />
            </svg>
          </button>
          <h2>Skills</h2>
          <div className="spacer"></div>
        </div>

        <div className="skills-view-container">
          <div className="add-skill-box">
            <input
              type="text"
              placeholder="Add a new skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              className="form-input"
            />
            <button className="add-skill-btn" onClick={handleAddSkill}>
              <Plus size={20} />
            </button>
          </div>

          <div className="skills-list-full">
            {skills.map((skill, index) => (
              <div key={index} className="skill-chip">
                <span>{skill}</span>
                <button onClick={() => handleRemoveSkill(skill)} className="remove-skill-btn">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Experience View
  if (activeView === 'experience') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          <button className="back-btn" onClick={() => setActiveView('main')}>
            <svg width="24px" height="24px" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z" />
            </svg>
          </button>
          <h2>Experience</h2>
          <div className="spacer"></div>
        </div>

        <div className="form-group">
          <label>Professional Summary</label>
          <textarea
            className="form-input experience-textarea"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            rows={6}
          />
        </div>
        <button className="save-btn" onClick={() => setActiveView('main')}>Save</button>
      </div>
    );
  }

  // 4. Settings View
  if (activeView === 'settings') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          <button className="back-btn" onClick={() => setActiveView('main')}>
            <svg width="24px" height="24px" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z" />
            </svg>
          </button>
          <h2>Settings</h2>
          <div className="spacer"></div>
        </div>

        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <Bell size={20} className="setting-icon" />
              <span>Push Notifications</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.notifications} onChange={() => toggleSetting('notifications')} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <Moon size={20} className="setting-icon" />
              <span>Dark Mode</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.darkMode} onChange={() => toggleSetting('darkMode')} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <Volume2 size={20} className="setting-icon" />
              <span>Sound Effects</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={settings.sound} onChange={() => toggleSetting('sound')} />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // 5. Language View
  if (activeView === 'language') {
    const languages = ['English (US)', 'English (UK)', 'French', 'Spanish', 'German'];
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          <button className="back-btn" onClick={() => setActiveView('main')}>
            <svg width="24px" height="24px" viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z" />
            </svg>
          </button>
          <h2>Language</h2>
          <div className="spacer"></div>
        </div>

        <div className="language-list">
          {languages.map(lang => (
            <div
              key={lang}
              className={`language-option ${language === lang ? 'selected' : ''}`}
              onClick={() => setLanguage(lang)}
            >
              <span>{lang}</span>
              {language === lang && <div className="check-mark">✓</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }


  // --- MAIN VIEW ---
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="edit-header" style={{ width: '100%', marginBottom: '1rem' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg height="24px" width="24px" fill="#000000" viewBox="0 0 200 200" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title></title><path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z"></path></g></svg>
          </button>
          <div className="spacer"></div>
        </div>
        <div className="profile-avatar-container">
          <img src={user.avatar} alt="Profile" className="profile-avatar" />
        </div>
        <h1 className="profile-name">{profileData.firstName} {profileData.lastName}</h1>
        <p className="profile-role">{profileData.role}</p>
        <button className="edit-profile-btn" onClick={() => setActiveView('edit')}>Edit Profile</button>
      </div>

      <div className="profile-menu">
        <div className="menu-item" onClick={() => setActiveView('edit')}>
          <div className="menu-icon-wrapper">
            <User size={20} />
          </div>
          <div className="menu-content">
            <span className="menu-label">Personal Information</span>
            <span className="menu-value">{profileData.email}</span>
          </div>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item" onClick={() => setActiveView('skills')}>
          <div className="menu-icon-wrapper">
            <Award size={20} />
          </div>
          <div className="menu-content">
            <span className="menu-label">Skills</span>
            <span className="menu-value">{skills.slice(0, 3).join(', ')}{skills.length > 3 ? '...' : ''}</span>
          </div>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item" onClick={() => setActiveView('experience')}>
          <div className="menu-icon-wrapper">
            <Briefcase size={20} />
          </div>
          <div className="menu-content">
            <span className="menu-label">Experience</span>
            <span className="menu-value">{experience}</span>
          </div>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-divider"></div>

        <div className="menu-item" onClick={() => setActiveView('language')}>
          <div className="menu-icon-wrapper">
            <Globe size={20} />
          </div>
          <span className="menu-label">Language</span>
          <div className="menu-right">
            <span className="menu-value-simple">{language}</span>
            <ChevronRight className="chevron" size={20} />
          </div>
        </div>

        <div className="menu-item" onClick={() => setActiveView('settings')}>
          <div className="menu-icon-wrapper">
            <Settings size={20} />
          </div>
          <span className="menu-label">Settings</span>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item">
          <div className="menu-icon-wrapper">
            <HelpCircle size={20} />
          </div>
          <span className="menu-label">Help Center</span>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item logout" onClick={handleLogout}>
          <div className="menu-icon-wrapper">
            <LogOut size={20} />
          </div>
          <span className="menu-label">Log out</span>
          <ChevronRight className="chevron" size={20} />
        </div>
      </div>
    </div>
  );
};
