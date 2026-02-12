import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/onboarding.css';
import { isTokenExpired } from '../utils/api';
import introImg1 from '../assets/ChatGPT Image Oct 19, 2025, 05_08_56 PM.png';
import introImg2 from '../assets/Gemini_Generated_Image_1k8ta1k8ta1k8ta1.png';

export const LandingIntro = () => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            const role = localStorage.getItem('userRole');
            navigate(role === 'ADMIN' ? '/admin' : '/', { replace: true });
        }
    }, [navigate]);

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            navigate('/login');
        }
    };

    const handleSkip = () => {
        navigate('/login');
    };

    const steps = [
        {
            image: introImg1,
            title: <>Find a job, and <span className="highlight">start building</span> your career from now on</>,
            description: "Explore over 25,924 available job roles and upgrade your career now.",
        },
        {
            image: introImg2,
            title: <>Hundreds of jobs are waiting for you to <span className="highlight">join together</span></>,
            description: "Immediately join us and start applying for the job you are interested in.",
        },
        {
            image: introImg1, // Reusing for now
            title: <>Get the best <span className="highlight">choice for the job</span> you've always dreamed of</>,
            description: "The better the skills you have, the greater the good job opportunities for you.",
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <div className="intro-page">
            <div className="intro-header">
                <div className="logo">
                 <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" />
                </div>
                {step < 3 && <button className="skip-btn" onClick={handleSkip}>Skip</button>}
            </div>

            <div className="intro-image-container">
                <img src={currentStep.image} alt="Intro" className="intro-image" />
                <div className="image-overlay"></div>
            </div>

            <div className="intro-content">
                <h1 className="intro-title">{currentStep.title}</h1>
                <p className="intro-description">{currentStep.description}</p>
                
                <div className="pagination-dots">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`dot ${step === i ? 'active' : ''}`}></div>
                    ))}
                </div>

                <button className={`cta-btn ${step === 3 ? 'get-started' : ''}`} onClick={handleNext}>
                    {step === 3 ? "Get started" : "Next"}
                </button>
            </div>
        </div>
    );
};
