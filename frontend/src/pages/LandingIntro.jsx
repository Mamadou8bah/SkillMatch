import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/onboarding.css';
import { isTokenExpired } from '../utils/api';
import introImg1 from '../assets/ChatGPT Image Oct 19, 2025, 05_08_56 PM.png';
import introImg2 from '../assets/stage2.png';
import introImg3 from '../assets/stage3.png';
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
            localStorage.setItem('hasVisited', 'true');
            navigate('/login');
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasVisited', 'true');
        navigate('/login');
    };

    const steps = [
        {
            image: introImg1,
            title: <>Find a job, and <span className="highlight">start building</span> your career from now on</>,
            description: "Explore multiple available job roles and upgrade your career now.",
        },
        {
            image: introImg2,
            title: <>Hundreds of jobs are waiting for you to <span className="highlight">join together</span></>,
            description: "Immediately join us and start applying for the job you are interested in.",
        },
        {
            image: introImg3,
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
                <AnimatePresence mode="wait">
                    <motion.img 
                        key={step}
                        src={currentStep.image} 
                        alt="Intro" 
                        className="intro-image"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                </AnimatePresence>
                <div className="image-overlay"></div>
            </div>

            <div className="intro-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        style={{ width: '100%' }}
                    >
                        <h1 className="intro-title">{currentStep.title}</h1>
                        <p className="intro-description">{currentStep.description}</p>
                    </motion.div>
                </AnimatePresence>
                
                <div className="pagination-dots">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`dot ${step === i ? 'active' : ''}`}></div>
                    ))}
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cta-btn ${step === 3 ? 'get-started' : ''}`} 
                    onClick={handleNext}
                >
                    {step === 3 ? "Get started" : "Next"}
                </motion.button>
            </div>
        </div>
    );
};
