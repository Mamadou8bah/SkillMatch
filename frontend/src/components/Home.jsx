import React from 'react'
import { user } from '../data/user'
import { Link } from 'react-router-dom'
import '../styles/home.css'
import { PopularJobCard } from './PopularJobCard'
import { JobCard } from './JobCard'
import { useState, useEffect, useMemo } from 'react'

import jobs from '../data/jobs'

export const Home = () => {

    const notifications = user.notifications.filter(notification => !notification.read).length;

    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const id = setTimeout(() => setSearchQuery(searchTerm.trim()), 220);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const popularJobs = jobs.slice(0, 5);

    const searchedJobs = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return jobs.filter(job => {
            const titleMatch = job.title && job.title.toLowerCase().includes(q);
            const companyMatch = job.company && job.company.toLowerCase().includes(q);
            const skillsMatch = Array.isArray(job.skills) && job.skills.some(s => s.toLowerCase().includes(q));
            return titleMatch || companyMatch || skillsMatch;
        });
    }, [searchQuery]);

    const isSearching = searchTerm.length > 0;

    return (
        <div className='home-page'>
            <div className="home-header">
                <div className={isSearching ? "header-text searching" : "header-text"}>
                    <p>Good Morning.</p>
                    <h2>{user.firstName}</h2>
                </div>
                <div className={isSearching ? "notification searching" : 'notification'}>
                    <Link to='/notifications'>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 19.25C15 20.0456 14.6839 20.8087 14.1213 21.3713C13.5587 21.9339 12.7956 22.25 12 22.25C11.2044 22.25 10.4413 21.9339 9.87869 21.3713C9.31608 20.8087 9 20.0456 9 19.25" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M5.58096 18.25C5.09151 18.1461 4.65878 17.8626 4.36813 17.4553C4.07748 17.048 3.95005 16.5466 4.01098 16.05L5.01098 7.93998C5.2663 6.27263 6.11508 4.75352 7.40121 3.66215C8.68734 2.57077 10.3243 1.98054 12.011 1.99998V1.99998C13.6977 1.98054 15.3346 2.57077 16.6207 3.66215C17.9069 4.75352 18.7557 6.27263 19.011 7.93998L20.011 16.05C20.0723 16.5452 19.9462 17.0454 19.6576 17.4525C19.369 17.8595 18.9386 18.144 18.451 18.25C14.2186 19.2445 9.81332 19.2445 5.58096 18.25V18.25Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        {notifications > 0 && <div className="notification-badge">{notifications}</div>}
                    </Link>
                </div>


            </div>
            <div className="home-content">
                <div className="search-input">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    <input
                        type="text"
                        placeholder='Search for jobs, skills, companies...'
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <div className={isSearching ? "popular-jobs searching" : "popular-jobs"}>
                <div className="popular-jobs-header">
                    <h3>Popular Jobs</h3>
                    <div className="see-all">
                        <Link to='/jobs'>View All</Link>
                    </div>
                </div>
                <div className={isSearching ? "job-list searching" : "job-list"}>
                    {popularJobs.map((job) => (
                        <Link key={job.id} to={`jobs/${job.id}`}><PopularJobCard job={job} /></Link>
                    ))}
                </div>
                <div className={isSearching ? "recent-post searching" : "recent-post"}>
                    <div className="recent-post-header">
                        <h3>Recent Posts</h3>
                        <div className="see-all">
                            <Link to='/jobs'>View All</Link>
                        </div>
                    </div>
                    <div className="recent-jobs">
                        {jobs.slice(5, 10).map((job) => (
                            <Link key={job.id} to={`jobs/${job.id}`}><JobCard job={job} /></Link>
                        ))}
                    </div>
                </div>
            </div>
            {isSearching && (
                <div className="seaeched-post">
                    <p className="jobs-found">{searchedJobs.length} Jobs found</p>
                    <div className="searched-jobs">
                        {searchedJobs.map((job) => (
                            <Link key={job.id} to={`job/${job.id}`}><JobCard job={job} /></Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
