import React from 'react'
import '../styles/jobs.css'
import { Link, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export const Jobs = () => {
  const [role] = useState(localStorage.getItem('userRole') || 'CANDIDATE')

  return (
    <div className='jobs-page'>
        <div className="jp-header">
           <Link to={'/'}>
                <div className="back-button">
                <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <g id="SVGRepo_bgCarrier" ></g>
                  <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="currentColor" />
                  </g>
                </svg>
            </div>
            </Link>
            <h2>Jobs</h2>
        </div>
        <div className="jp-nav-bar">
            {role === 'EMPLOYER' ? (
              <>
                <NavLink to='/jobs' end className={({ isActive }) => 'jp-nav-link' + (isActive ? ' active' : '')}>
                  <p>My Postings</p>
                </NavLink>
                <NavLink to='discover' className={({ isActive }) => 'jp-nav-link' + (isActive ? ' active' : '')}>
                  <p>Browse All</p>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to='/jobs' end className={({ isActive }) => 'jp-nav-link' + (isActive ? ' active' : '')}>
                  <p>Discover</p>
                </NavLink>
                <NavLink to='bookmarks' className={({ isActive }) => 'jp-nav-link' + (isActive ? ' active' : '')}>
                  <p>Saved</p>
                </NavLink>
              </>
            )}
        </div>

        <Outlet />

    </div>
  )
}
