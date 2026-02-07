import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { commonSkills } from '../data/skills';
import '../styles/onboarding.css';

export const Onboarding = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [skillInput, setSkillInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        role: localStorage.getItem('userRole') || 'CANDIDATE',
        skills: [],
        experience: '',
        location: ''
    });

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

        if (step === 2 && !formData.location.trim()) {
            setError('Please specify your preferred work location.');
            return;
        }

        if (step === 3 && !formData.experience) {
            setError('Please select your experience level.');
            return;
        }

        if (step < 3) {
            setStep(step + 1);
        } else {
            // Finally save onboarding data
            try {
                const response = await fetch(`/api/users/${localStorage.getItem('userId')}/onboarding`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({...formData, role: 'CANDIDATE'})
                });
                if (response.ok) {
                    localStorage.setItem('registrationStage', '4');
                    navigate('/');
                }
            } catch (err) {
                console.error("Failed to save onboarding", err);
                navigate('/'); // Fallback
            }
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

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
            title: "Set your location",
            subtitle: "Where would you like to work?",
            content: (
                <div className="onboarding-input-group">
                    <input 
                        type="text"
                        placeholder="e.g. Lagos, Nigeria / Remote"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                </div>
            )
        },
        {
            title: "Almost there!",
            subtitle: "Tell us about your experience level.",
            content: (
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
                    <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }}></div>
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
                        {step === 3 ? "Complete Profile" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};


