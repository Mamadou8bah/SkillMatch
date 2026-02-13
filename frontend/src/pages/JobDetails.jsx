import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBookmarks } from '../contexts/BookmarksContext'
import '../styles/jobdetails.css'
import Loader from '../components/Loader'
import { apiFetch } from '../utils/api'

export const JobDetails = () => {
    const { isBookmarked, toggleBookmark } = useBookmarks()
    const { id } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isApplied, setIsApplied] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [applicants, setApplicants] = useState([]);
    const [showApplicants, setShowApplicants] = useState(false);
 
    useEffect(() => {
        apiFetch(`/post/${id}`)
        .then(data => {
            setJob(data);
            setIsLoading(false);
        })
        .catch(err => {
            console.error('Error fetching job details:', err);
            setIsLoading(false);
        });
    }, [id]);

    const myId = localStorage.getItem('userId');
    const myRole = localStorage.getItem('userRole');

    // Check if this job belongs to the current employer
    const isOwner = job?.employer?.user?.id?.toString() === myId || (myRole === 'EMPLOYER' && job?.employer?.name === localStorage.getItem('companyName'));

    useEffect(() => {
        if (isOwner && job) {
            apiFetch(`/api/apply/submitted/${id}`)
            .then(data => setApplicants(data))
            .catch(err => console.error('Error fetching applicants:', err));
        }
    }, [id, isOwner, job]);

    if (isLoading) {
        return <Loader fullPage={true} />
    }

    if (!job) {
        return <div className="jd-not-found">Job not found</div>
    }

    const handleApply = async () => {
        if (job.jobUrl && job.source !== 'Own') {
            window.open(job.jobUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        setIsApplying(true);
        try {
            await apiFetch('/api/apply', {
                method: 'POST',
                body: JSON.stringify(job.id) // It takes a Long jobId
            });
            setIsApplied(true);
            alert('Application submitted successfully!');
        } catch (err) {
            console.error('Failed to apply', err);
            if (err.message !== 'Unauthorized' && err.message !== 'Token expired') {
                alert('You have already applied for this job or a system error occurred');
            }
        } finally {
            setIsApplying(false);
        }
    };

    const onBookmarkClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBookmark({
            ...job,
            company: job.employer?.name || job.employer?.companyName || job.companyName || 'Company',
            companyLogo: job.employer?.logo || job.employer?.pictureUrl || job.companyLogo || ''
        })
    }
    
    return (
        <div className='jd-page'>
            <div className="jd-upper">
                <div className="jd-header">
                    <div className="back-btn" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="white" />
                            </g>
                        </svg>
                    </div>
                    <button aria-pressed={isBookmarked(job.id)} className="bookmark-btn" onClick={onBookmarkClick}>
                        {!isBookmarked(job.id) ? (
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path d="M21 16.0909V11.0975C21 6.80891 21 4.6646 19.682 3.3323C18.364 2 16.2426 2 12 2C7.75736 2 5.63604 2 4.31802 3.3323C3 4.6646 3 6.80891 3 11.0975V16.0909C3 19.1875 3 20.7358 3.73411 21.4123C4.08421 21.735 4.52615 21.9377 4.99692 21.9915C5.98402 22.1045 7.13673 21.0849 9.44216 19.0458C10.4612 18.1445 10.9708 17.6938 11.5603 17.5751C11.8506 17.5166 12.1494 17.5166 12.4397 17.5751C13.0292 17.6938 13.5388 18.1445 14.5578 19.0458C16.8633 21.0849 18.016 22.1045 19.0031 21.9915C19.4739 21.9377 19.9158 21.735 20.2659 21.4123C21 20.7358 21 19.1875 21 16.0909Z" strokeWidth="1.5"></path>
                                    <path opacity="0.5" d="M15 6H9" strokeWidth="1.5" strokeLinecap="round"></path>
                                </g>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true">
                                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                <g id="SVGRepo_iconCarrier">
                                    <path fillRule="evenodd" stroke='gold' fill='gold' clipRule="evenodd" d="M21 11.0975V16.0909C21 19.1875 21 20.7358 20.2659 21.4123C19.9158 21.735 19.4739 21.9377 19.0031 21.9915C18.016 22.1045 16.8633 21.0849 14.5578 19.0458C13.5388 18.1445 13.0292 17.6938 12.4397 17.5751C12.1494 17.5166 11.8506 17.5166 11.5603 17.5751C10.9708 17.6938 10.4612 18.1445 9.44216 19.0458C7.13673 21.0849 5.98402 22.1045 4.99692 21.9915C4.52615 21.9377 4.08421 21.735 3.73411 21.4123C3 20.7358 3 19.1875 3 16.0909V11.0975C3 6.80891 3 4.6646 4.31802 3.3323C5.63604 2 7.75736 2 12 2C16.2426 2 18.364 2 19.682 3.3323C21 4.6646 21 6.80891 21 11.0975ZM8.25 6C8.25 5.58579 8.58579 5.25 9 5.25H15C15.4142 5.25 15.75 5.58579 15.75 6C15.75 6.41421 15.4142 6.75 15 6.75H9C8.58579 6.75 8.25 6.41421 8.25 6Z"></path>
                                </g>
                            </svg>
                        )}
                    </button>
                </div>
                <div className="jd-info">
                    <div className="jd-logo">
                        <img src={job.employer?.logo || job.employer?.pictureUrl || job.companyLogo || ''} alt="" />
                    </div>
                    <h1 className="jd-title">{job.title}</h1>
                    <div className="jd-company">{job.employer?.name || job.employer?.companyName || job.companyName || job.company || 'Company'} • <span>{job.source}</span></div>
                </div>
                <div className="md-tags-container">
                    <div className="jd-md">
                        <div className="jd-md-dalary jd-tag">
                            <div className="jd-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                        <path d="M15 9.94728C14.5 9.3 13.8 8.5 12 8.5C10.2 8.5 9 9.51393 9 9.94728C9 10.3806 9.06786 10.9277 10 11.5C10.7522 11.9618 12.6684 12.0439 13.5 12.5C14.679 13.1467 14.8497 13.8202 14.8497 14.0522C14.8497 14.6837 13.4175 15.4852 12 15.5C10.536 15.5153 9.5 14.7 9 14.0522" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                                        <path d="M12 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    </g>
                                </svg>
                            </div>
                            <div className="jd-tag-other">
                                <p>Salaries</p>
                                <p>{job.salary || 'Salary Not Disclosed'}</p>
                            </div>
                        </div>
                        <div className="jd-md-shift-type jd-tag">
                            <div className="jd-icon">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#d76925">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <defs>
                                            <style>{'.cls-1 { fill: #d29f32; fill-rule: evenodd; }'}</style>
                                        </defs>
                                        <path id="clock2" className="cls-1" d="M1233.72,196.978a11.987,11.987,0,0,0-2.7-2.7A2.494,2.494,0,1,1,1233.72,196.978ZM1234,204a9.961,9.961,0,0,1-3.86,7.882l1.73,2.751a0.885,0.885,0,0,1-.37,1.256,1.055,1.055,0,0,1-1.37-.336l-1.64-2.625a9.939,9.939,0,0,1-8.98,0l-1.64,2.625a1.055,1.055,0,0,1-1.37.336,0.885,0.885,0,0,1-.37-1.256l1.73-2.751A10,10,0,1,1,1234,204Zm-10-8a8,8,0,1,0,8,8A8,8,0,0,0,1224,196Zm0.48,9.753-0.81-.82A0.989,0.989,0,0,1,1223,204v-3a1,1,0,0,1,2,0v2.761l0.73,0.733a0.89,0.89,0,0,1-.01,1.255A0.87,0.87,0,0,1,1224.48,205.753Zm-10.2-8.775a2.494,2.494,0,1,1,2.7-2.7A11.987,11.987,0,0,0,1214.28,196.978Z" transform="translate(-1212 -192)"></path>
                                    </g>
                                </svg>
                            </div>
                            <div className="jd-tag-other">
                                <p>Job-Type</p>
                                <p>{job.type || job.locationType}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="jd-content">
                <div className="jd-description">
                    <h3>Role Overview</h3>
                    <div 
                        className="description-text"
                        dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                </div>

                {job.requirements && job.requirements.length > 0 && (
                    <div className="jd-requirements">
                        <h3>Requirements</h3>
                        <ul className="jd-requirements-list">
                            {job.requirements.map((req, index) => (
                                <li key={index}>{req}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {job.skills && job.skills.length > 0 && (
                    <div className="jd-skills">
                        <h3>Required Skills</h3>
                        <div className="jd-skills-list">
                            {job.skills.map((skill, index) => (
                                <span key={index} className="jd-skill-tag">{skill}</span>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="jd-apply">
                    {isOwner ? (
                        <div className="applicants-section">
                            <button className="apply-btn" onClick={() => setShowApplicants(!showApplicants)}>
                                {showApplicants ? 'Hide Applicants' : `View Applicants (${applicants.length})`}
                            </button>
                            {showApplicants && (
                                <div className="applicants-list">
                                    {applicants.length === 0 ? (
                                        <p>No applications yet</p>
                                    ) : (
                                        applicants.map(app => (
                                            <div key={app.id} className="applicant-item">
                                                <div className="applicant-info">
                                                    <img src={app.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user.fullName)}&background=random`} alt="" />
                                                    <div>
                                                        <p className="applicant-name">{app.user.fullName}</p>
                                                        <p className="applicant-email">{app.user.email}</p>
                                                    </div>
                                                </div>
                                                <Link to={`/messages/${app.user.id}`} className="message-btn">Message</Link>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            className={`apply-btn ${isApplied ? 'applied' : ''}`} 
                            onClick={handleApply} 
                            disabled={(isApplied || isApplying) && job.source === 'Own'}
                        >
                            {isApplying ? 'Applying...' : isApplied ? 'Applied' : (job.source !== 'Own' && job.url ? `Apply on ${job.source}` : 'Apply Now')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
