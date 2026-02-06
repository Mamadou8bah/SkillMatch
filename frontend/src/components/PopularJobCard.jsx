import { Bookmark, BookMarkedIcon } from "lucide-react";
import React from 'react'
import { useBookmarks } from '../contexts/BookmarksContext'
import '../styles/popularjobcard.css'

export const PopularJobCard = ({ job }) => {
    const { isBookmarked, toggleBookmark } = useBookmarks();
    
    const getLightColor = () => {
        // Deterministic color based on job ID to avoid re-render flicker
        const id = job.id || 0;
        const r = (id * 123) % 255;
        const g = (id * 456) % 255;
        const b = (id * 789) % 255;
        return `rgba(${r}, ${g}, ${b}, 0.15)`; 
    };

    const handleBookmarkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(job);
    };

    const tags = [job.locationType, ...(job.requiredSkills?.slice(0, 2).map(s => s.name) || [])].filter(Boolean);

    return (
        <div className="popular-job-card" style={{ backgroundColor: getLightColor(), border: `1px solid rgba(0,0,0,0.1)` }}>
            <div className="pjc-header">
                <div className="pjc-company-info">
                    <div className="pjc-ci-logo">
                        <img src={job.employer?.logo || ''} alt={`${job.employer?.name} logo`} />
                    </div>
                    <div className="pjc-ci-text">
                        <h3>{job.employer?.name || 'Company'}</h3>
                        <p>{job.locationType}</p>
                    </div>
                </div>
                <div className="pjc-bookmark">
                    {isBookmarked(job.id) ? (
                        <BookMarkedIcon size={20} color="var(--primary-color)" onClick={handleBookmarkClick} style={{ cursor: 'pointer' }} className="bookmark-icon bookmarked" />
                    ) : (
                        <Bookmark size={20} color="var(--primary-color)" onClick={handleBookmarkClick} style={{ cursor: 'pointer' }} className="bookmark-icon" />
                    )}
                </div>
            </div>
            <div className="pjc-body">
                <h3>{job.title}</h3>
                <p className="pjc-salary">{job.salary || 'Salary Not Disclosed'}</p>
                <div className="tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="pjc-tag">{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}
