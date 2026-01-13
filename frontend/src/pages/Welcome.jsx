import React from 'react'
import  '../styles/welcome.css'
import image from '../assets/ChatGPT Image Oct 19, 2025, 05_08_56 PM.png'

export const Welcome = () => {
  return (
    <div className='welcome-page'>
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
                <button className='btn btn-login'>Login</button>
                <button className='btn btn-signup'>Sign Up</button>
            </div>

    </div>
  )
}
