import React, { useState, useEffect } from 'react'
import '../styles/Main.css'
import { NavLink, Outlet } from 'react-router-dom'
import { Users } from 'lucide-react'

export const Main = () => {
  const [role, setRole] = useState(localStorage.getItem('userRole') || 'CANDIDATE')

  useEffect(() => {
    // If we don't have the role in localStorage, fetch it from profile
    if (!localStorage.getItem('userRole')) {
      const fetchProfile = async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        try {
          const response = await fetch('/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success) {
            localStorage.setItem('userRole', data.data.role)
            localStorage.setItem('userId', data.data.id)
            setRole(data.data.role)
          }
        } catch (err) {
          console.error("Failed to fetch profile", err)
        }
      }
      fetchProfile()
    }
  }, [])

  return (
    <div className="main-container">
      <div className="element">
        <Outlet />
      </div>
      <div className="nav-bar">
        <NavLink to='/' end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.5" d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z" stroke-width="1.5"></path> <path d="M15 18H9" stroke-width="1.5" stroke-linecap="round"></path></svg>
          <p>Home</p>
        </NavLink>

        <NavLink to='/jobs' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 14V12M12 14V16M12 14H18C19.1046 14 20 13.1046 20 12M12 14H6C4.89543 14 4 13.1046 4 12M20 12V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V12M20 12V8C20 6.89543 19.1046 6 18 6H6C4.89543 6 4 6.89543 4 8V12M15 6V5C15 3.89543 14.1046 3 13 3H11C9.89543 3 9 3.89543 9 5V6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          <p>Jobs</p>
        </NavLink>

        {role === 'EMPLOYER' && (
          <NavLink to='/candidates' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Users size={24} />
            <p>Candidates</p>
          </NavLink>
        )}

        <NavLink to='/messages' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 18L10.29 20.29C10.514 20.5156 10.7804 20.6946 11.0739 20.8168C11.3674 20.9389 11.6821 21.0018 12 21.0018C12.3179 21.0018 12.6326 20.9389 12.9261 20.8168C13.2196 20.6946 13.486 20.5156 13.71 20.29L16 18H18C19.0609 18 20.0783 17.5786 20.8284 16.8285C21.5786 16.0783 22 15.0609 22 14V7C22 5.93913 21.5786 4.92178 20.8284 4.17163C20.0783 3.42149 19.0609 3 18 3H6C4.93913 3 3.92172 3.42149 3.17157 4.17163C2.42142 4.92178 2 5.93913 2 7V14C2 15.0609 2.42142 16.0783 3.17157 16.8285C3.92172 17.5786 4.93913 18 6 18H8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          <p>Messages</p>
        </NavLink>

        <NavLink to='/profile' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M20.5901 22C20.5901 18.13 16.7401 15 12.0001 15C7.2601 15 3.4101 18.13 3.4101 22" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          <p>Profile</p>
        </NavLink>
      </div>
    </div>
  )
}
          <p>Messages</p>

        </NavLink>
        <NavLink to='/profile' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>

          <svg viewBox="0 0 32 32" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit={2} version="1.1" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <g id="Icon">
                <path d="M4.96,27.999l0.051,0.001l0.043,-0.004c0.191,-0.024 0.957,-0.171 0.957,-0.996c-0,-4.971 4.029,-9 9,-9c0.661,-0 1.327,-0 1.988,-0c4.97,-0 9,4.029 9,9l-0,0c-0,0.021 0,0.041 0.002,0.061c0.015,0.325 0.153,0.537 0.323,0.676c0.178,0.164 0.415,0.263 0.675,0.263c-0,0 1,-0.057 1,-1c-0,-6.075 -4.925,-11 -11,-11c-0.661,-0 -1.327,-0 -1.988,-0c-6.075,-0 -11,4.925 -11,11c-0,-0.05 0.003,-0.092 0.008,-0.127c-0.005,0.041 -0.008,0.084 -0.008,0.127c-0,0.535 0.42,0.972 0.949,0.999Z"></path>
                <path d="M15.994,3.988c-2.763,-0 -5.006,2.243 -5.006,5.006c-0,2.763 2.243,5.006 5.006,5.006c2.763,0 5.006,-2.243 5.006,-5.006c0,-2.763 -2.243,-5.006 -5.006,-5.006Zm-0,2c1.659,-0 3.006,1.347 3.006,3.006c0,1.659 -1.347,3.006 -3.006,3.006c-1.659,0 -3.006,-1.347 -3.006,-3.006c-0,-1.659 1.347,-3.006 3.006,-3.006Z"></path>
              </g>
            </g>
          </svg>
          <p>Profile</p>

        </NavLink>
      </div>
    </div>
  )
}
