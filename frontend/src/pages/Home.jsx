import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';
import { PopularJobCard } from './PopularJobCard';
import { JobCard } from './JobCard';
import { apiFetch } from '../utils/api';
import Loader from './Loader';

export const Home = () => {
    const storedFirstName = localStorage.getItem('firstName');
    const [userData, setUserData] = useState({ 
        firstName: storedFirstName || 'User', 
        photoUrl: null 
    });
    const [jobsList, setJobsList] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const userId = localStorage.getItem('userId');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (userId) {
            apiFetch(`/api/users/${userId}`)
            .then(data => {
                if (data.success) {
                    setUserData({ 
                        firstName: data.data.fullName?.split(' ')[0] || 'User',
                        photoUrl: data.data.photo?.url 
                    });
                }
            })
            .catch(err => console.error(err));

            apiFetch(`/api/notifications/user/${userId}`)
            .then(data => {
                if (data.success) {
                    const unread = data.data.filter(n => !n.isRead).length;
                    setNotificationCount(unread);
                }
            })
            .catch(err => console.error(err));
        }

        const recentPromise = apiFetch('/post?page=0&size=10');
        const recsPromise = apiFetch('/api/recommendations/jobs');

        Promise.all([recentPromise, recsPromise])
            .then(([recentData, recData]) => {
                if (Array.isArray(recentData)) {
                    setJobsList(recentData);
                } else if (recentData && recentData.content) {
                    setJobsList(recentData.content);
                }

                if (recData && recData.success && Array.isArray(recData.data)) {
                    setRecommendedJobs(recData.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, [userId]);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const id = setTimeout(() => setSearchQuery(searchTerm.trim()), 220);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const popularJobs = recommendedJobs.length > 0 ? recommendedJobs.slice(0, 5) : jobsList.slice(0, 5);

    useEffect(() => {
        let interval;
        const startScroll = () => {
            if (!isLoading && popularJobs.length > 1) {
                interval = setInterval(() => {
                    if (scrollRef.current && window.innerWidth <= 768) {
                        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                        if (Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 15) {
                            scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                        } else {
                            scrollRef.current.scrollBy({ left: clientWidth * 0.85, behavior: 'smooth' });
                        }
                    }
                }, 4000);
            }
        };

        const stopScroll = () => clearInterval(interval);

        startScroll();

        const el = scrollRef.current;
        if (el) {
            el.addEventListener('mouseenter', stopScroll);
            el.addEventListener('mouseleave', startScroll);
            el.addEventListener('touchstart', stopScroll, { passive: true });
            el.addEventListener('touchend', startScroll, { passive: true });
        }

        return () => {
            stopScroll();
            if (el) {
                el.removeEventListener('mouseenter', stopScroll);
                el.removeEventListener('mouseleave', startScroll);
                el.removeEventListener('touchstart', stopScroll);
                el.removeEventListener('touchend', startScroll);
            }
        };
    }, [isLoading, popularJobs.length]);

    const searchedJobs = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return jobsList.filter(job => {
            const titleMatch = job.title && job.title.toLowerCase().includes(q);
            const companyMatch = job.employer?.name && job.employer.name.toLowerCase().includes(q);
            const skillsMatch = Array.isArray(job.requiredSkills) && job.requiredSkills.some(s => s.title?.toLowerCase().includes(q));
            return titleMatch || companyMatch || skillsMatch;
        });
    }, [searchQuery, jobsList]);

    const isSearching = searchTerm.length > 0;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning.";
        if (hour < 17) return "Good Afternoon.";
        return "Good Evening.";
    };

    return (
        <div className='home-page'>
            <div className="home-header">
                <div className={isSearching ? "header-text searching" : "header-text"}>
                    <p>{getGreeting()}</p>
                    <h2>{userData.firstName}</h2>
                </div>
                <div className={isSearching ? "notification searching" : 'notification'}>
                    <Link to='/profile' className="profile-mini-link">
                        <div className="profile-mini-avatar">
                            {userData.photoUrl ? (
                                <img src={userData.photoUrl} alt="Profile" />
                            ) : (
                                <img src="https://www.shutterstock.com/image-vector/default-avatar-social-media-display-600nw-2632690107.jpg" alt="Default Avatar" />
                            )}
                        </div>
                    </Link>
                    <Link to='/notifications'>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15 19.25C15 20.0456 14.6839 20.8087 14.1213 21.3713C13.5587 21.9339 12.7956 22.25 12 22.25C11.2044 22.25 10.4413 21.9339 9.87869 21.3713C9.31608 20.8087 9 20.0456 9 19.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M5.58096 18.25C5.09151 18.1461 4.65878 17.8626 4.36813 17.4553C4.07748 17.048 3.95005 16.5466 4.01098 16.05L5.01098 7.93998C5.2663 6.27263 6.11508 4.75352 7.40121 3.66215C8.68734 2.57077 10.3243 1.98054 12.011 1.99998V1.99998C13.6977 1.98054 15.3346 2.57077 16.6207 3.66215C17.9069 4.75352 18.7557 6.27263 19.011 7.93998L20.011 16.05C20.0723 16.5452 19.9462 17.0454 19.6576 17.4525C19.369 17.8595 18.9386 18.144 18.451 18.25C14.2186 19.2445 9.81332 19.2445 5.58096 18.25V18.25Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                        {notificationCount > 0 && <div className="notification-badge">{notificationCount}</div>}
                    </Link>
                </div>


            </div>
            <div className="home-content">
                <div className="search-input">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                    <input
                        type="text"
                        placeholder='Search for jobs, skills, companies...'
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            {isLoading ? (
                <div className="home-content">
                    <Loader />
                </div>
            ) : jobsList.length === 0 ? (
                <div className="no-jobs-container">
                    <p className="no-jobs-title">No jobs found</p>
                    <p className="no-jobs-text">Check back later for new opportunities!</p>
                </div>
            ) : (
                <div className={isSearching ? "popular-jobs searching" : "popular-jobs"}>
                    <div className="popular-jobs-header">
                        <h3>{recommendedJobs.length > 0 ? "Recommended for You" : "Popular Jobs"}</h3>
                        <div className="see-all">
                            <Link to='/jobs'>View All</Link>
                        </div>
                    </div>
                    <div ref={scrollRef} className={isSearching ? "job-list searching" : "job-list"}>
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
                            {jobsList.slice(5, 10).map((job) => (
                                <Link key={job.id} to={`jobs/${job.id}`}><JobCard job={job} /></Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {isSearching && (
                <div className="seaeched-post">
                    {searchedJobs.length > 0 ? (
                        <>
                            <p className="jobs-found">{searchedJobs.length} Jobs found</p>
                            <div className="searched-jobs">
                                {searchedJobs.map((job) => (
                                    <Link key={job.id} to={`jobs/${job.id}`}><JobCard job={job} /></Link>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-jobs-container">
                            <p className="no-jobs-title">No matches found</p>
                            <p className="no-jobs-text">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
