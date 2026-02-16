import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useBookmarks } from '../contexts/BookmarksContext'
import '../styles/jobdetails.css'
import Loader from '../components/Loader'
import ShareModal from '../components/ShareModal'
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
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
 
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

    const isOwner = job?.employer?.user?.id?.toString() === myId || (myRole === 'EMPLOYER' && job?.employer?.name === localStorage.getItem('companyName'));

    useEffect(() => {
        if (isOwner && job) {
            apiFetch(`/api/apply/submitted/${id}`)
            .then(data => setApplicants(data))
            .catch(err => console.error('Error fetching applicants:', err));
        }
    }, [id, isOwner, job]);

    useEffect(() => {
        const checkApplicationStatus = async () => {
            if (job && !isOwner && myRole === 'CANDIDATE') {
                try {
                    const myApplications = await apiFetch('/api/apply/myapplications');
                    const alreadyApplied = myApplications.some(app => app.jobPost?.id === job.id);
                    setIsApplied(alreadyApplied);
                } catch (err) {
                    console.error('Error checking application status:', err);
                }
            }
        };
        checkApplicationStatus();
    }, [job, isOwner, myRole]);

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
                body: JSON.stringify(job.id)
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
                    <button className="bookmark-btn" onClick={() => setIsShareModalOpen(true)}>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                            <g id="SVGRepo_iconCarrier">
                                <path fillRule="evenodd" clipRule="evenodd" d="M16.5 2.25C14.7051 2.25 13.25 3.70507 13.25 5.5C13.25 5.69591 13.2673 5.88776 13.3006 6.07412L8.56991 9.38558C8.54587 9.4024 8.52312 9.42038 8.50168 9.43939C7.94993 9.00747 7.25503 8.75 6.5 8.75C4.70507 8.75 3.25 10.2051 3.25 12C3.25 13.7949 4.70507 15.25 6.5 15.25C7.25503 15.25 7.94993 14.9925 8.50168 14.5606C8.52312 14.5796 8.54587 14.5976 8.56991 14.6144L13.3006 17.9259C13.2673 18.1122 13.25 18.3041 13.25 18.5C13.25 20.2949 14.7051 21.75 16.5 21.75C18.2949 21.75 19.75 20.2949 19.75 18.5C19.75 16.7051 18.2949 15.25 16.5 15.25C15.4472 15.25 14.5113 15.7506 13.9174 16.5267L9.43806 13.3911C9.63809 12.9694 9.75 12.4978 9.75 12C9.75 11.5022 9.63809 11.0306 9.43806 10.6089L13.9174 7.4733C14.5113 8.24942 15.4472 8.75 16.5 8.75C18.2949 8.75 19.75 7.29493 19.75 5.5C19.75 3.70507 18.2949 2.25 16.5 2.25ZM14.75 5.5C14.75 4.5335 15.5335 3.75 16.5 3.75C17.4665 3.75 18.25 4.5335 18.25 5.5C18.25 6.4665 17.4665 7.25 16.5 7.25C15.5335 7.25 14.75 6.4665 14.75 5.5ZM6.5 10.25C5.5335 10.25 4.75 11.0335 4.75 12C4.75 12.9665 5.5335 13.75 6.5 13.75C7.4665 13.75 8.25 12.9665 8.25 12C8.25 11.0335 7.4665 10.25 6.5 10.25ZM16.5 16.75C15.5335 16.75 14.75 17.5335 14.75 18.5C14.75 19.4665 15.5335 20.25 16.5 20.25C17.4665 20.25 18.25 19.4665 18.25 18.5C18.25 17.5335 17.4665 16.75 16.5 16.75Z" fill="white"></path>
                            </g>
                        </svg>
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
                
                {isOwner && showApplicants && (
                    <div className="applicants-list">
                        <h3 className="applicants-title">Applicants</h3>
                        {applicants.length === 0 ? (
                            <p className="no-applicants">No applications yet</p>
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
                
                <div className="jd-apply">
                    {isOwner ? (
                        <div className="applicants-section">
                            <button className="apply-btn" onClick={() => setShowApplicants(!showApplicants)}>
                                {showApplicants ? 'Hide Applicants' : `View Applicants (${applicants.length})`}
                            </button>
                        </div>
                    ) : (
                        <button 
                            className={`apply-btn ${isApplied ? 'applied' : ''}`} 
                            onClick={handleApply} 
                            disabled={(isApplied || isApplying) && job.source === 'Own'}
                        >
                            {isApplying ? 'Applying...' : isApplied ? 'Applied' : (job.source && job.source !== 'Own' && job.jobUrl ? `Apply on ${job.source}` : 'Apply Now')}
                        </button>
                    )}
                </div>
            </div>

            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                job={job}
                isBookmarked={isBookmarked(job.id)}
                onToggleBookmark={() => toggleBookmark({
                    ...job,
                    company: job.employer?.name || job.employer?.companyName || job.companyName || 'Company',
                    companyLogo: job.employer?.logo || job.employer?.pictureUrl || job.companyLogo || ''
                })}
            />
        </div>
    );
};
