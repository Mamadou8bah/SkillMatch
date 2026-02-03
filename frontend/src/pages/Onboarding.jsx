import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import '../styles/onboarding.css';

export const Onboarding = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [skillInput, setSkillInput] = useState('');
    const [formData, setFormData] = useState({
        role: localStorage.getItem('userRole') || 'CANDIDATE',
        skills: [],
        experience: '',
        location: ''
    });

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, skillInput.trim()]
            });
            setSkillInput('');
        }
    };

    const removeSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skillToRemove)
        });
    };

    const handleNext = async () => {
        if (step < 4) {
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
                    body: JSON.stringify(formData)
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
            title: "Choose your role",
            subtitle: "Are you looking for a job or hiring talent?",
            content: (
                <div className="onboarding-options">
                    <div 
                        className={`option-card ${formData.role === 'CANDIDATE' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, role: 'CANDIDATE'})}
                    >
                        <div className="icon">👨‍💻</div>
                        <h3>Candidate</h3>
                        <p>I want to find my dream job</p>
                    </div>
                    <div 
                        className={`option-card ${formData.role === 'EMPLOYER' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, role: 'EMPLOYER'})}
                    >
                        <div className="icon">🏢</div>
                        <h3>Employer</h3>
                        <p>I want to hire top talent</p>
                    </div>
                </div>
            )
        },
        {
            title: "What are your skills?",
            subtitle: "Add your top skills to help our AI recommend better matches.",
            content: (
                <div className="onboarding-skills-wrapper">
                    <div className="skills-input-container">
                        <input 
                            type="text" 
                            placeholder="Add a skill (e.g. React)"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <button className="add-skill-btn" onClick={addSkill}>
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
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>
                
                <div key={step} className="onboarding-content-wrapper">
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
                        disabled={step === 1 && !formData.role}
                    >
                        {step === 4 ? "Complete Profile" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};


