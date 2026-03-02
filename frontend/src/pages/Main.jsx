import React, { useEffect } from 'react'
import '../styles/Main.css'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { apiFetch } from '../utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export const Main = () => {
  const location = useLocation()
  const userRole = localStorage.getItem('userRole')
  const isAdmin = userRole === 'ADMIN'

  const isJobDetails = location.pathname.startsWith('/jobs/') && 
                      !['/jobs/discover', '/jobs/bookmarks'].includes(location.pathname)
  const isProfile = location.pathname === '/profile'
  const shouldHideNavbar = isJobDetails || isProfile

  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }

    // If we don't have the role in localStorage, fetch it from profile
    if (!userRole) {
      const fetchProfile = async () => {
        try {
          const data = await apiFetch('/api/users/profile')
          if (data.success) {
            localStorage.setItem('userRole', data.data.role)
            localStorage.setItem('userId', data.data.id)
            // Reload to apply layout changes if role was missing
            window.location.reload()
          }
        } catch (err) {
          console.error("Failed to fetch profile", err)
        }
      }
      fetchProfile()
    }
  }, [userRole])

  return (
    <div className={`main-container ${isAdmin ? 'admin-layout' : ''} ${shouldHideNavbar ? 'hide-navbar' : ''}`}>
      <div className="element">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ width: '100%', height: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      {!isAdmin && !shouldHideNavbar && (
        <div className="nav-bar">
          <NavLink to='/' end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              <path d="M15 18H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            </g>
          </svg>
          <p>Home</p>
        </NavLink>

        <NavLink to='/jobs' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.948 1.25H12.052C12.9505 1.24997 13.6997 1.24995 14.2945 1.32991C14.9223 1.41432 15.4891 1.59999 15.9445 2.05546C16.4 2.51093 16.5857 3.07773 16.6701 3.70552C16.7292 4.14512 16.7446 4.66909 16.7486 5.27533C17.3971 5.29614 17.9752 5.33406 18.489 5.40314C19.6614 5.56076 20.6104 5.89288 21.3588 6.64124C22.1071 7.38961 22.4392 8.33856 22.5969 9.51098C22.75 10.6502 22.75 12.1058 22.75 13.9436V14.0564C22.75 15.8942 22.75 17.3498 22.5969 18.489C22.4392 19.6614 22.1071 20.6104 21.3588 21.3588C20.6104 22.1071 19.6614 22.4392 18.489 22.5969C17.3498 22.75 15.8942 22.75 14.0564 22.75H9.94359C8.10583 22.75 6.65019 22.75 5.51098 22.5969C4.33856 22.4392 3.38961 22.1071 2.64124 21.3588C1.89288 20.6104 1.56076 19.6614 1.40314 18.489C1.24997 17.3498 1.24998 15.8942 1.25 14.0564V13.9436C1.24998 12.1058 1.24997 10.6502 1.40314 9.51098C1.56076 8.33856 1.89288 7.38961 2.64124 6.64124C3.38961 5.89288 4.33856 5.56076 5.51098 5.40314C6.02475 5.33406 6.60288 5.29614 7.2514 5.27533C7.2554 4.66909 7.27081 4.14512 7.32991 3.70552C7.41432 3.07773 7.59999 2.51093 8.05546 2.05546C8.51093 1.59999 9.07773 1.41432 9.70552 1.32991C10.3003 1.24995 11.0495 1.24997 11.948 1.25ZM8.7518 5.25178C9.12993 5.24999 9.52694 5.25 9.94358 5.25H14.0564C14.4731 5.25 14.8701 5.24999 15.2482 5.25178C15.244 4.68146 15.23 4.25125 15.1835 3.90539C15.1214 3.44393 15.0142 3.24644 14.8839 3.11612C14.7536 2.9858 14.5561 2.87858 14.0946 2.81654C13.6116 2.7516 12.964 2.75 12 2.75C11.036 2.75 10.3884 2.7516 9.90539 2.81654C9.44393 2.87858 9.24643 2.9858 9.11612 3.11612C8.9858 3.24644 8.87858 3.44393 8.81654 3.90539C8.77004 4.25125 8.75601 4.68146 8.7518 5.25178ZM5.71085 6.88976C4.70476 7.02503 4.12511 7.2787 3.7019 7.70191C3.27869 8.12511 3.02502 8.70476 2.88976 9.71085C2.75159 10.7385 2.75 12.0932 2.75 14C2.75 15.9068 2.75159 17.2615 2.88976 18.2892C3.02502 19.2952 3.27869 19.8749 3.7019 20.2981C4.12511 20.7213 4.70476 20.975 5.71085 21.1102C6.73851 21.2484 8.09318 21.25 10 21.25H14C15.9068 21.25 17.2615 21.2484 18.2892 21.1102C19.2952 20.975 19.8749 20.7213 20.2981 20.2981C20.7213 19.8749 20.975 19.2952 21.1102 18.2892C21.2484 17.2615 21.25 15.9068 21.25 14C21.25 12.0932 21.2484 10.7385 21.1102 9.71085C20.975 8.70476 20.7213 8.12511 20.2981 7.70191C19.8749 7.2787 19.2952 7.02503 18.2892 6.88976C17.2615 6.7516 15.9068 6.75 14 6.75H10C8.09318 6.75 6.73851 6.7516 5.71085 6.88976Z" fill="currentColor"></path>
              <path d="M17 9C17 9.55229 16.5523 10 16 10C15.4477 10 15 9.55229 15 9C15 8.44772 15.4477 8 16 8C16.5523 8 17 8.44772 17 9Z" fill="currentColor"></path>
              <path d="M9 9C9 9.55229 8.55229 10 8 10C7.44772 10 7 9.55229 7 9C7 8.44772 7.44772 8 8 8C8.55229 8 9 8.44772 9 9Z" fill="currentColor"></path>
            </g>
          </svg>
          <p>Jobs</p>
        </NavLink>

        <NavLink to='/explore' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M379.989 106.622L340.602 132.89L382.358 237.223L429.955 223.248L379.989 106.622ZM299.548 160.363L61.2853 319.205L66.832 330.299L335.836 251.11L299.548 160.363ZM401.573 34.6667L495.616 254.037L318.84 306.018L389.978 495.282L345.014 512.141L272.63 319.827L240.08 329.38L172.951 512.157L128.822 493.244L182.827 345.94L42.4533 387.263L0 302.34L401.573 34.6667Z" fill="currentColor"/>
          </svg>
          <p>Explore</p>
        </NavLink>

        <NavLink to='/profile' className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40003 22.0001 7.04003 21.0101 5.26003 19.3801C5.36003 18.4401 5.96003 17.5201 7.03003 16.8001C9.77003 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </g>
          </svg>
          <p>Profile</p>
        </NavLink>
      </div>
      )}
    </div>
  )
}

