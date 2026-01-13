import { Bookmark,BookMarkedIcon } from "lucide-react";
import React from 'react'
import { useState } from "react";
import '../styles/popularjobcard.css'

export const PopularJobCard = ({ job }) => {
    const [bookmarked, setBookmarked] = useState(false);
     const getLightColor = () => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.1)`; 
  };

    const handleBookmarkClick = () => {
        setBookmarked(!bookmarked);
    };
  return (
    <div className="popular-job-card" style={{ backgroundColor: getLightColor(), border: `2px solid ${getLightColor()}` }}>
        <div className="pjc-header">
            <div className="pjc-company-info">
                <div className="pjc-ci-logo">
                    <img src={job.companyLogo} alt={`${job.company_name} logo`} />
                </div>
                <div className="pjc-ci-text">
                    <h3>{job.company}</h3>
                    <p>{job.location}</p>
                </div>
            </div>
            <div className="pjc-bookmark">
                {bookmarked ? (
                    <BookMarkedIcon size={20} color="#1C274C" onClick={handleBookmarkClick} style={{ cursor: 'pointer' }} className="bookmark-icon bookmarked" />
                ) : (
                    <Bookmark size={20} color="#1C274C" onClick={handleBookmarkClick} style={{ cursor: 'pointer' }} className="bookmark-icon" />
                )}
            </div>
        </div>
        <div className="pjc-body">
            <h3>{job.title}</h3>
            <p className="pjc-salary">{job.salary}</p>
            <div className="tags">
                {job.tags.map((tag, index) => (
                    <span key={index} className="pjc-tag">{tag}</span>
                ))}
            </div>
        </div>
    </div>
  )
}
