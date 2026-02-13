import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import  '../styles/welcome.css'
import image from '../assets/ChatGPT Image Oct 19, 2025, 05_08_56 PM.png'
import { isTokenExpired } from '../utils/api'

export const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
     const token = localStorage.getItem('token');
     if (token && !isTokenExpired(token)) {
         const role = localStorage.getItem('userRole');
         navigate(role === 'ADMIN' ? '/admin' : '/', { replace: true });
         return;
     }

     const hasVisited = localStorage.getItem('hasVisited');
     if (!hasVisited) {
         navigate('/intro', { replace: true });
     }
  }, [navigate]);

  return (
    <div className='welcome-page'>
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
            <img src="/assets/logos/skillmatch-logo.png" alt="SkillMatch Logo" style={{ height: '60px' }} />
        </div>
        <div className="welcome-image-container">
            <div className="welcome-image">
               <img src={image} alt="Happy Girl" />
            </div>
            <div className="circle-1"></div>
            <div className="circle-2"></div>
            <div className="circle-3"></div>

            <div className="bubble1"></div>
            <div className="bubble2"></div>
            <div className="bubble3"></div>
            <div className="bubble4"></div>
            <div className="bubble5"></div>

            <div className="mask"></div>
            </div>
            <div className="tag1 tag">Software Engineer</div>
            <div className="tag2 tag">Data Scientist</div>
            <div className="tag3 tag">DevOps Engineer</div>
            <div className="tag4 tag">Investment Analyst</div>
            <div className="tag5 tag">Management Consultant</div>
            <div className="tag6 tag">Business Analyst</div>

            <div className="welcom-text">
                <p className='wt-heading'>Find a perfect job for your career</p>
                <p className='wt-subheading'>Explore thousands of job opportunities with all the information you need.</p>
            </div>

            <div className="auth-buttons">
                <button className='btn btn-login' onClick={() => navigate('/login', { state: { mode: 'login' } })}>Login</button>
                <button className='btn btn-signup' onClick={() => navigate('/login', { state: { mode: 'signup' } })}>Sign Up</button>
            </div>

    </div>
  )
}
