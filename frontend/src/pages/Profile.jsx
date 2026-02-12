import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Profile.css';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  LogOut,
  ChevronRight,
  Bell,
  Briefcase,
  Award,
  Plus,
  X,
  Trash2,
  Camera
} from 'lucide-react';
import Loader from '../components/Loader';
import { commonSkills } from '../data/skills';
import { apiFetch, redirectToLogin, isTokenExpired } from '../utils/api';

export const Profile = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('main'); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Auto-clear error messages after 5 seconds
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

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [experiences, setExperiences] = useState([]);
  const [newExperience, setNewExperience] = useState({
    companyName: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const userId = localStorage.getItem('userId');

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
    try {
      const data = await apiFetch(`/api/users/${userId}`);
      if (data.success) {
        setProfileData({
          fullName: data.data.fullName || '',
          email: data.data.email || '',
          role: data.data.role || '',
          location: data.data.location || '',
          profession: data.data.profession || '',
          mobile: data.data.mobile || '',
          photoUrl: data.data.photo?.url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const fetchSkills = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/skill/user/${userId}`);
      if (data.success) {
        setSkills(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  const fetchExperiences = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/experience/user/${userId}`);
      if (data.success) {
        setExperiences(data.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchSkills();
      fetchExperiences();
    }
  }, [userId, fetchUserProfile, fetchSkills, fetchExperiences]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);
      const data = await apiFetch(`/api/users/${userId}/photo`, {
        method: 'POST',
        body: formData
      });
      if (data.success) {
        fetchUserProfile();
      } else {
        setError(data.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Error uploading photo:', err);
      if (err.message !== 'Unauthorized' && err.message !== 'Token expired') {
        setError('Error uploading photo');
      }
    } finally {
      setIsLoading(false);
    }
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

    // Check if duplicate locally first
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

  const handleAddExperience = async () => {
    setError('');
    if (!newExperience.companyName.trim()) return setError('Company Name is required');
    if (!newExperience.jobTitle.trim()) return setError('Job Title is required');
    if (!newExperience.startDate.trim()) return setError('Start Date is required');
    if (!newExperience.description.trim()) return setError('Description is required');

    try {
      const data = await apiFetch('/api/experience', {
        method: 'POST',
        body: JSON.stringify(newExperience)
      });
      if (data.success) {
        setExperiences([...experiences, data.data]);
        setNewExperience({
          companyName: '',
          jobTitle: '',
          startDate: '',
          endDate: '',
          description: ''
        });
        setShowAddForm(false);
      }
    } catch (e) {
      console.error(e);
      if (e.message !== 'Unauthorized' && e.message !== 'Token expired') {
        setError('Failed to add experience');
      }
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      const data = await apiFetch(`/api/experience/${id}`, {
        method: 'DELETE'
      });
      if (data.success) {
        setExperiences(experiences.filter(exp => exp.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    redirectToLogin();
  };

  const renderBackBtn = () => (
    <button className="back-btn" onClick={() => { setActiveView('main'); setShowAddForm(false); }}>
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24px" height="24px">
        <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
        <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path>
      </svg>
    </button>
  );

  if (isLoading) return <Loader fullPage={true} />;

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
              {profileData.photoUrl ? (
                <img src={profileData.photoUrl} alt="Profile" className="profile-image-large" />
              ) : (
                <img 
                  src="https://www.shutterstock.com/image-vector/default-avatar-social-media-display-600nw-2632690107.jpg" 
                  alt="Default Avatar" 
                  className="profile-image-large" 
                />
              )}
              <label className="photo-upload-label">
                <Camera size={20} />
                <input type="file" onChange={handlePhotoChange} hidden accept="image/*" />
              </label>
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

  if (activeView === 'experience') {
    return (
      <div className="profile-container sub-view">
        <div className="edit-header">
          {renderBackBtn()}
          <h2>Experience</h2>
          <button className="add-btn" onClick={() => setShowAddForm(true)}><Plus size={20} /></button>
        </div>
        {showAddForm && (
          <div className="add-experience-form">
            <h3>Add New Experience</h3>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
            <div className="exp-row">
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" placeholder="e.g. Google" value={newExperience.companyName} onChange={(e) => setNewExperience({...newExperience, companyName: e.target.value})} className="form-input" />
              </div>
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" placeholder="e.g. Senior Developer" value={newExperience.jobTitle} onChange={(e) => setNewExperience({...newExperience, jobTitle: e.target.value})} className="form-input" />
              </div>
            </div>
            <div className="exp-row">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={newExperience.startDate} onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})} className="form-input" />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={newExperience.endDate} onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})} className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Describe your roles and achievements..." value={newExperience.description} onChange={(e) => setNewExperience({...newExperience, description: e.target.value})} className="form-input experience-textarea" rows={4} />
            </div>
            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="save-experience-btn" onClick={handleAddExperience}>Add Experience</button>
            </div>
          </div>
        )}
        <div className="experience-list-container">
          {experiences.map(exp => (
            <div key={exp.id} className="experience-card">
              <div className="exp-card-header">
                <h3>{exp.jobTitle}</h3>
                <button onClick={() => handleDeleteExperience(exp.id)} className="remove-exp-btn"><Trash2 size={18} /></button>
              </div>
              <p className="exp-company">{exp.companyName}</p>
              <p className="exp-dates">{exp.startDate} - {exp.endDate || 'Present'}</p>
              {exp.description && <p className="exp-desc">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="edit-header" style={{ width: '100%', marginBottom: '1rem', padding: '0' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24px" height="24px">
              <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
              <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path>
            </svg>
          </button>
          <div className="spacer"></div>
        </div>
        <div className="profile-avatar-container">
          {profileData.photoUrl ? (
            <img src={profileData.photoUrl} alt="Profile" className="profile-image-large" />
          ) : (
            <img 
              src="https://www.shutterstock.com/image-vector/default-avatar-social-media-display-600nw-2632690107.jpg" 
              alt="Default Avatar" 
              className="profile-image-large" 
            />
          )}
          <label className="photo-upload-label">
            <Camera size={20} />
            <input type="file" onChange={handlePhotoChange} hidden accept="image/*" />
          </label>
        </div>
        <h1 className="profile-name">{profileData.fullName}</h1>
        <p className="profile-role">{profileData.profession || profileData.role}</p>
        <button className="edit-profile-btn" onClick={() => setActiveView('edit')}>Edit Profile</button>
      </div>

      <div className="profile-menu">
        <div className="menu-item" onClick={() => setActiveView('edit')}>
          <div className="menu-icon-wrapper"><UserIcon size={20} /></div>
          <div className="menu-content">
            <span className="menu-label">Personal Information</span>
            <span className="menu-value">{profileData.email}</span>
          </div>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item" onClick={() => setActiveView('skills')}>
          <div className="menu-icon-wrapper"><Award size={20} /></div>
          <div className="menu-content">
            <span className="menu-label">Skills</span>
            <span className="menu-value">{skills.slice(0, 3).map(s => s.title).join(', ')}{skills.length > 3 ? '...' : ''}</span>
          </div>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item" onClick={() => setActiveView('experience')}>
          <div className="menu-icon-wrapper"><Briefcase size={20} /></div>
          <div className="menu-content">
            <span className="menu-label">Experience</span>
            <span className="menu-value">{experiences.length} {experiences.length === 1 ? 'entry' : 'entries'}</span>
          </div>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-divider"></div>

        <div className="menu-item" onClick={() => navigate('/notifications')}>
          <div className="menu-icon-wrapper"><Bell size={20} /></div>
          <span className="menu-label">Notifications</span>
          <ChevronRight className="chevron" size={20} />
        </div>

        <div className="menu-item logout" onClick={handleLogout}>
          <div className="menu-icon-wrapper"><LogOut size={20} /></div>
          <span className="menu-label">Log out</span>
          <ChevronRight className="chevron" size={20} />
        </div>
      </div>
    </div>
  );
};

