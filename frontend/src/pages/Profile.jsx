import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  LogOut,
  ChevronRight,
  Bell,
  Award,
  Plus,
  X,
  Settings,
  Globe,
  Lock,
  Moon,
  Shield,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { commonSkills } from '../data/skills';
import { apiFetch, redirectToLogin } from '../utils/api';
import { chatCache } from '../utils/cache';
import { AVATAR_STYLES, AVATAR_VARIANTS, buildAvatarUrl, getAvatarConfig, saveAvatarConfig } from '../utils/avatar';

const ProfileSkeleton = () => (
  <div className="profile-container">
    <div className="profile-skeleton profile-skel-top" />
    <div className="profile-skeleton profile-skel-block" />
    <div className="profile-skeleton profile-skel-row" />
    <div className="profile-skeleton profile-skel-row" />
    <div className="profile-skeleton profile-skel-row" />
  </div>
);

export const Profile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [activeView, setActiveView] = useState('main'); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    role: "",
    location: "",
    profession: "",
    mobile: "",
    photoUrl: ""
  });
  const currentAvatar = getAvatarConfig(userId);
  const [avatarStyle, setAvatarStyle] = useState(currentAvatar.style);
  const [avatarVariant, setAvatarVariant] = useState(currentAvatar.variant);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings');
    if (saved) return JSON.parse(saved);
    
    // Default to system preference if no saved settings
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      pushNotifications: true,
      emailNotifications: true,
      darkMode: prefersDark,
      language: 'English'
    };
  });

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const generatedAvatarUrl = buildAvatarUrl(
    avatarStyle,
    `${profileData.fullName || profileData.email || 'SkillMatchUser'}-${avatarVariant}`
  );

  useEffect(() => {
    saveAvatarConfig(userId, avatarStyle, avatarVariant);
  }, [avatarStyle, avatarVariant, userId]);

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.skill-input-wrapper')) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    // Try cache first
    const cachedProfile = chatCache.get(`profile_${userId}`);
    if (cachedProfile) {
      setProfileData(cachedProfile);
      setIsLoading(false);
    }

    try {
      const data = await apiFetch(`/api/users/${userId}`);
      if (data.success) {
        const firstName = data.data.fullName?.split(' ')[0] || '';
        if (firstName) {
          localStorage.setItem('firstName', firstName);
        }
        const profileInfo = {
          fullName: data.data.fullName || '',
          email: data.data.email || '',
          role: data.data.role || '',
          location: data.data.location || '',
          profession: data.data.profession || '',
          mobile: data.data.mobile || '',
          photoUrl: data.data.photo?.url || ''
        };
        setProfileData(profileInfo);
        chatCache.set(`profile_${userId}`, profileInfo);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchSkills = useCallback(async () => {
    const cachedSkills = chatCache.get(`skills_${userId}`);
    if (cachedSkills) {
      setSkills(cachedSkills);
      setIsLoading(false);
    }

    try {
      const data = await apiFetch(`/api/skill/user/${userId}`);
      if (data.success) {
        setSkills(data.data || []);
        chatCache.set(`skills_${userId}`, data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchSkills();
    }
  }, [userId, fetchUserProfile, fetchSkills]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setError('');
    if (!profileData.fullName.trim()) return setError('Full Name is required');
    if (!profileData.location.trim()) return setError('Location is required');
    if (!profileData.profession.trim()) return setError('Profession is required');
    if (!profileData.mobile.trim()) return setError('Mobile number is required');

    try {
      const data = await apiFetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      if (data.success) {
        setActiveView('main');
        fetchUserProfile();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      if (error.message !== 'Unauthorized' && error.message !== 'Token expired') {
        setError('Failed to update profile');
      }
    }
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setNewSkill(value);
    
    if (value.trim()) {
      const searchTerm = value.toLowerCase();
      const filtered = commonSkills.filter(skill => {
        const skillName = skill.toLowerCase();
        return skillName.includes(searchTerm) && 
               !skills.some(s => s.title && s.title.toLowerCase() === skillName);
      }).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleAddSkill = async (skillTitle) => {
    setError('');
    const titleToAdd = skillTitle || newSkill.trim();
    if (!titleToAdd) {
      setError('Please enter or select a skill');
      return;
    }

    if (skills.some(s => s.title.toLowerCase() === titleToAdd.toLowerCase())) {
      setError('Skill already added');
      setNewSkill('');
      setSuggestions([]);
      return;
    }

    try {
      const data = await apiFetch('/api/skill', {
        method: 'POST',
        body: JSON.stringify({ title: titleToAdd })
      });
      if (data.success) {
        setSkills(prev => [...prev, data.data]);
        setNewSkill('');
        setSuggestions([]);
      }
    } catch (e) {
      console.error('Failed to add skill:', e);
    }
  };

  const handleRemoveSkill = async (id) => {
    if (!id) return;
    try {
      const data = await apiFetch(`/api/skill/${id}`, {
        method: 'DELETE'
      });
      if (data.success) {
        setSkills(prev => prev.filter(s => s.id !== id));
      }
    } catch (e) {
      console.error('Failed to remove skill:', e);
    }
  };

  const handleLogout = () => {
    const shouldLogout = window.confirm('Are you sure you wanna lock out?');
    if (!shouldLogout) return;
    redirectToLogin();
  };

  const renderBackBtn = () => (
    <button className="back-btn" onClick={() => { setActiveView('main'); }}>
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24px" height="24px">
        <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
        <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path>
      </svg>
    </button>
  );

  if (isLoading) return <ProfileSkeleton />;

  if (activeView === 'edit') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          {renderBackBtn()}
          <h2>Edit Profile</h2>
          <div className="spacer"></div>
        </div>
        <div className="edit-form">
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
          
          <div className="edit-photo-section" style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <div className="profile-avatar-container">
              <img src={generatedAvatarUrl} alt="Profile" className="profile-image-large" />
            </div>
          </div>
          <div className="form-group">
            <label>Avatar Style</label>
            <select
              value={avatarStyle}
              onChange={(e) => setAvatarStyle(e.target.value)}
              className="form-input"
            >
              {AVATAR_STYLES.map((style) => (
                <option key={style} value={style}>{style[0].toUpperCase() + style.slice(1)}</option>
              ))}
            </select>
            <small style={{ color: '#777' }}>Choose from multiple avatar styles and looks.</small>
          </div>
          <div className="form-group">
            <label>Avatar Variant</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {AVATAR_VARIANTS.map((variant) => {
                const src = buildAvatarUrl(
                  avatarStyle,
                  `${profileData.fullName || profileData.email || 'SkillMatchUser'}-${variant}`
                );
                const active = avatarVariant === variant;
                return (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setAvatarVariant(variant)}
                    style={{
                      border: active ? '2px solid #ff8c00' : '1px solid #ddd',
                      borderRadius: '12px',
                      padding: '2px',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <img src={src} alt={`Avatar ${variant}`} style={{ width: '100%', display: 'block' }} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={profileData.fullName} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={profileData.location} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Profession</label>
            <input type="text" name="profession" value={profileData.profession} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input type="text" name="mobile" value={profileData.mobile} onChange={handleInputChange} className="form-input" />
          </div>
          <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
        </div>
      </div>
    );
  }

  if (activeView === 'skills') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          {renderBackBtn()}
          <h2>Skills</h2>
          <div className="spacer"></div>
        </div>
        <div className="skills-view-container">
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
          <div className="add-skill-box">
            <div className="skill-input-wrapper">
              <input 
                type="text" 
                value={newSkill} 
                onChange={handleSkillInputChange} 
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()} 
                className="form-input" 
                placeholder="Add a skill (e.g. JavaScript)"
              />
              {suggestions.length > 0 && (
                <div className="skills-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddSkill(suggestion);
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="add-skill-btn" onClick={() => handleAddSkill()}><Plus size={20} /></button>
          </div>
          <div className="skills-list-full">
            {skills.map((skill) => (
              <div key={skill.id} className="skill-chip">
                <span>{skill.title}</span>
                <button onClick={() => handleRemoveSkill(skill.id)} className="remove-skill-btn"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          {renderBackBtn()}
          <h2>Settings</h2>
          <div className="spacer"></div>
        </div>
        
        <div className="settings-list">
          <div className="settings-section">
            <h3>Preferences</h3>
            <div className="setting-row">
              <div className="setting-info">
                <Moon size={20} />
                <span>Dark Mode</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.darkMode} 
                  onChange={() => toggleSetting('darkMode')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <Globe size={20} />
                <span>Language</span>
              </div>
              <select 
                value={settings.language} 
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="language-select"
              >
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
                <option>German</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Notifications</h3>
            <div className="setting-row">
              <div className="setting-info">
                <Smartphone size={20} />
                <span>Push Notifications</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.pushNotifications} 
                  onChange={() => toggleSetting('pushNotifications')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="setting-row">
              <div className="setting-info">
                <Bell size={20} />
                <span>Email Notifications</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications} 
                  onChange={() => toggleSetting('emailNotifications')} 
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Account & Security</h3>
            <div className="setting-item-link" onClick={() => {}}>
              <div className="setting-info">
                <Lock size={20} />
                <span>Change Password</span>
              </div>
              <ChevronRight size={18} />
            </div>
            <div className="setting-item-link" onClick={() => {}}>
              <div className="setting-info">
                <Shield size={20} />
                <span>Privacy Settings</span>
              </div>
              <ChevronRight size={18} />
            </div>
          </div>

          <div className="settings-section">
            <h3>Support</h3>
            <div className="setting-item-link" onClick={() => {}}>
              <div className="setting-info">
                <HelpCircle size={20} />
                <span>Help Center</span>
              </div>
              <ChevronRight size={18} />
            </div>
          </div>
          
          <div className="version-info">
            SkillMatch v1.0.2
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="edit-header" style={{ width: '100%', marginBottom: '1rem', padding: '0' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24px" height="24px">
            <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
            <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path>
          </svg>
        </button>
        <h2>Profile</h2>
        <div className="spacer"></div>
      </div>

      <div className="settings-list profile-main-settings">
        <div className="settings-section">
          <h3>Account</h3>
          <div className="setting-row profile-summary-row">
            <div className="setting-info">
              <div className="profile-avatar-container">
                <img src={generatedAvatarUrl} alt="Profile" className="profile-image-large" />
              </div>
              <div className="menu-content">
                <span className="menu-label">{profileData.fullName || 'Your Name'}</span>
                <span className="menu-value">{profileData.profession || profileData.role || 'Profession not set'}</span>
                <span className="menu-value">{profileData.location || 'Location not set'}</span>
              </div>
            </div>
          </div>
          <div className="setting-item-link" onClick={() => setActiveView('edit')}>
            <div className="setting-info">
              <UserIcon size={20} />
              <span>Personal Information</span>
            </div>
            <ChevronRight size={18} />
          </div>
          <div className="setting-item-link" onClick={() => setActiveView('skills')}>
            <div className="setting-info">
              <Award size={20} />
              <span>Skills</span>
            </div>
            <span className="menu-value">{skills.length}</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>General</h3>
          <div className="setting-item-link" onClick={() => navigate('/notifications')}>
            <div className="setting-info">
              <Bell size={20} />
              <span>Notifications</span>
            </div>
            <ChevronRight size={18} />
          </div>
          <div className="setting-item-link" onClick={() => setActiveView('settings')}>
            <div className="setting-info">
              <Settings size={20} />
              <span>Settings</span>
            </div>
            <ChevronRight size={18} />
          </div>
        </div>

        <div className="settings-section">
          <h3>Session</h3>
          <div className="setting-item-link logout-link" onClick={handleLogout}>
            <div className="setting-info">
              <LogOut size={20} />
              <span>Log out</span>
            </div>
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

