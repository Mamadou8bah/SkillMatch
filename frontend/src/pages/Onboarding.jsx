import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Camera, User as UserIcon, Code, Palette, Wind, Wrench, Droplet, Sprout, Sparkles, Truck, Zap, Paintbrush, Hammer, Cpu, TrendingUp, Edit3 } from 'lucide-react';
import { commonSkills } from '../data/skills';
import { apiFetch } from '../utils/api';
import '../styles/onboarding.css';

export const Onboarding = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [skillInput, setSkillInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const [formData, setFormData] = useState({
        role: localStorage.getItem('userRole') || 'CANDIDATE',
        skills: [],
        experience: '',
        location: '',
        profession: '',
        photo: null
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Photo size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.skill-input-wrapper')) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSkillInputChange = (e) => {
        const value = e.target.value;
        setSkillInput(value);
        
        if (value.trim()) {
            const filtered = commonSkills.filter(skill => 
                skill.toLowerCase().includes(value.toLowerCase()) && 
                !formData.skills.includes(skill)
            ).slice(0, 5);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const addSkill = (skillTitle) => {
        const titleToAdd = skillTitle || skillInput.trim();
        if (titleToAdd) {
            setFormData(prev => {
                if (prev.skills.some(s => s.toLowerCase() === titleToAdd.toLowerCase())) {
                    return prev;
                }
                return {
                    ...prev,
                    skills: [...prev.skills, titleToAdd]
                };
            });
            setSkillInput('');
            setSuggestions([]);
            setError('');
        }
    };

    const toggleSkill = (skill) => {
        setFormData(prev => {
            const isSelected = prev.skills.some(s => s.toLowerCase() === skill.toLowerCase());
            if (isSelected) {
                return {
                    ...prev,
                    skills: prev.skills.filter(s => s.toLowerCase() !== skill.toLowerCase())
                };
            }
            return {
                ...prev,
                skills: [...prev.skills, skill]
            };
        });
    };

    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skillToRemove)
        });
    };

    const handleNext = async () => {
        setError('');

        if (step === 1 && formData.skills.length < 3) {
            setError('Please add at least 3 skills to help us find better matches.');
            return;
        }

        if (step === 2) {
            if (!formData.location.trim()) {
                setError('Please specify your preferred work location.');
                return;
            }
            if (!formData.profession.trim()) {
                setError('Please specify your profession.');
                return;
            }
        }

        if (step === 3 && !formData.experience) {
            setError('Please select your experience level.');
            return;
        }

        if (step < 4) {
            setStep(step + 1);
        } else {
            try {
                const response = await apiFetch(`/api/users/${localStorage.getItem('userId')}/onboarding`, {
                    method: 'POST',
                    body: JSON.stringify({...formData, role: 'CANDIDATE'})
                });
                if (response) {
                    localStorage.setItem('registrationStage', '4');
                    navigate('/');
                }
            } catch (err) {
                console.error("Failed to save onboarding", err);
                navigate('/');
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const diverseSkills = [
        { title: "Home Repairs", icon: <Hammer size={18} /> },
        { title: "AC Repair", icon: <Wind size={18} /> },
        { title: "Mechanic", icon: <Wrench size={18} /> },
        { title: "Smart Home", icon: <Cpu size={18} /> },
        { title: "Plumbing", icon: <Droplet size={18} /> },
        { title: "Gardening", icon: <Sprout size={18} /> },
        { title: "Cleaning", icon: <Sparkles size={18} /> },
        { title: "Moving", icon: <Truck size={18} /> },
        { title: "Electrical", icon: <Zap size={18} /> },
        { title: "Carpentry", icon: <Hammer size={18} /> },
        { title: "Painting", icon: <Paintbrush size={18} /> },
        { title: "Coding", icon: <Code size={18} /> },
        { title: "Design", icon: <Palette size={18} /> },
        { title: "Marketing", icon: <TrendingUp size={18} /> },
        { title: "Writing", icon: <Edit3 size={18} /> }
    ];

    const steps = [
        {
            title: "What are your skills?",
            subtitle: "Add your top skills to help our AI recommend better matches.",
            content: (
                <div className="onboarding-skills-wrapper">
                    <div className="skills-input-container">
                        <div className="skill-input-wrapper">
                            <input 
                                type="text" 
                                placeholder="Add a skill (e.g. React)"
                                value={skillInput}
                                onChange={handleSkillInputChange}
                                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            />
                            {suggestions.length > 0 && (
                                <div className="skills-suggestions">
                                    {suggestions.map((suggestion, index) => (
                                        <div 
                                            key={index} 
                                            className="suggestion-item"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                addSkill(suggestion);
                                            }}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="add-skill-btn" onClick={() => addSkill()}>
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="skills-tags-container">
                        {formData.skills.map(skill => (
                            <div key={skill} className="skill-tag">
                                {skill}
                                <span onClick={() => removeSkill(skill)}><X size={14} /></span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        },
        {
            title: "Your details",
            subtitle: "Tell us about yourself to complete your profile.",
            content: (
                <div className="onboarding-input-group">
                    <div style={{ marginBottom: '20px' }}>
                        <p className="section-label">Your Profession</p>
                        <input 
                            type="text" 
                            placeholder="e.g. Graphic Designer, Web Developer"
                            value={formData.profession}
                            onChange={(e) => setFormData({...formData, profession: e.target.value})}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <p className="section-label">Preferred Work Location</p>
                        <input 
                            type="text" 
                            placeholder="e.g. Lagos, Nigeria / Remote"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>
            )
        },
        {
            title: "Almost there!",
            subtitle: "Tell us about your experience level and profile photo.",
            content: (
                <div className="onboarding-step3-container">
                    <p className="section-label">What is your experience level?</p>
                    <div className="onboarding-options horizontal">
                        {['Entry', 'Intermediate', 'Senior', 'Lead'].map(lvl => (
                            <div 
                                key={lvl}
                                className={`mini-option ${formData.experience === lvl ? 'active' : ''}`}
                                onClick={() => setFormData({...formData, experience: lvl})}
                            >
                                {lvl}
                            </div>
                        ))}
                    </div>
                    
                    <div className="photo-upload-section">
                        <p className="section-label">Profile Picture (Optional)</p>
                        <div className="photo-upload-wrapper">
                            <div className="photo-preview-circle" onClick={() => document.getElementById('photo-upload').click()}>
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" />
                                ) : (
                                    <UserIcon size={40} color="#cbd5e0" />
                                )}
                                <div className="camera-icon-badge">
                                    <Camera size={14} />
                                </div>
                            </div>
                            <input 
                                type="file" 
                                id="photo-upload" 
                                hidden 
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            <p className="photo-hint">Click circle to upload photo</p>
                            <button 
                                className="skip-photo-btn"
                                onClick={() => {
                                    setFormData(prev => ({ ...prev, photo: null }));
                                    setStep(step + 1);
                                }}
                                style={{
                                    marginTop: '10px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#667eea',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    textDecoration: 'underline'
                                }}
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Customize your experience",
            subtitle: "Tell us the types of services you prefer — we'll show the best options first.",
            content: (
                <div className="diverse-skills-wrapper">
                    <div className="diverse-skills-grid">
                        {diverseSkills.map(skill => (
                            <div 
                                key={skill.title} 
                                className={`skill-pill ${formData.skills.some(s => s.toLowerCase() === skill.title.toLowerCase()) ? 'active' : ''}`}
                                onClick={() => toggleSkill(skill.title)}
                            >
                                <span className="pill-icon">{skill.icon}</span>
                                <span className="pill-text">{skill.title}</span>
                            </div>
                        ))}
                        <div className="skill-pill others-pill" onClick={() => setStep(1)}>
                            <span className="pill-icon"><Plus size={18} /></span>
                            <span className="pill-text">Others</span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch" style={{ height: '60px' }} />
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>
                
                <div key={step} className="onboarding-content-wrapper">
                    {error && (
                        <div className="onboarding-error" style={{ 
                            color: '#e53e3e', 
                            background: '#fff5f5', 
                            padding: '10px 15px', 
                            borderRadius: '8px', 
                            marginBottom: '15px',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            border: '1px solid #feb2b2'
                        }}>
                            {error}
                        </div>
                    )}
                    <div className="onboarding-header">
                        <h1>{currentStep.title}</h1>
                        <p>{currentStep.subtitle}</p>
                    </div>

                    <div className="onboarding-content">
                        {currentStep.content}
                    </div>
                </div>

                <div className="onboarding-footer">
                    {step > 1 ? (
                        <button className="btn-secondary" onClick={handleBack}>Back</button>
                    ) : <div />}
                    <button 
                        className="btn-primary" 
                        onClick={handleNext}
                    >
                        {step === 4 ? "Complete Profile" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};


