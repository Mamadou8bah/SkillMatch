import React, { useState, useMemo, useEffect } from 'react'
import '../styles/discover.css'
import { JobCard } from './JobCard'
import { Link } from 'react-router-dom'
import Loader from './Loader'
import { apiFetch } from '../utils/api'
import { chatCache } from '../utils/cache'

export const Discover = () => {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [jobsList, setJobsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    
    const fetchJobs = async () => {
      // Try to load from cache first
      const cachedJobs = chatCache.get(`jobs_${role}`);
      if (cachedJobs) {
        setJobsList(cachedJobs);
        setIsLoading(false);
      }

      try {
        let allJobs;
        if (role !== 'EMPLOYER') {
          // Candidates get all jobs ranked by relevance (ML score or skill match)
          const response = await apiFetch('/api/recommendations/jobs/all');
          allJobs = response?.data || [];
        } else {
          // Employers get all jobs normally (often by date)
          const response = await apiFetch('/post/all');
          allJobs = response?.content || response || [];
        }
        setJobsList(allJobs);
        chatCache.set(`jobs_${role}`, allJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const tags = useMemo(() => {
    const s = new Set()
    jobsList.forEach(j => {
      if (j.locationType) s.add(j.locationType)
    })
    return Array.from(s)
  }, [jobsList])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    
    return jobsList.filter(j => {
      const locationMatch = !activeTag || (j.locationType === activeTag);
      if (!locationMatch) return false;
      
      if (!q) return true;

      const inTitle = j.title && j.title.toLowerCase().includes(q)
      const inEmployer = j.employer && j.employer.name && j.employer.name.toLowerCase().includes(q)
      const inSkills = (Array.isArray(j.requiredSkills) && j.requiredSkills.some(s => {
        const title = typeof s === 'string' ? s : s?.title;
        return title?.toLowerCase().includes(q);
      })) || (Array.isArray(j.skills) && j.skills.some(s => s?.toLowerCase().includes(q)))
      const inIndustry = j.industry && j.industry.toLowerCase().includes(q)
      
      return inTitle || inEmployer || inSkills || inIndustry
    })
  }, [search, activeTag, jobsList])

  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    setPage(1)
  }, [search, activeTag])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (page > 3) pages.push('...');
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (page < totalPages - 2) pages.push('...');
      
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  return (
    <div className='discover-container'>
      <div className="d-search-bar"> 
         <div className="d-search-input">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for jobs..." />
          </div>
      </div>

        <div className="tag-list">
          {tags.map(t => (
            <button key={t} className={"tag" + (t === activeTag ? ' active' : '')} onClick={() => setActiveTag(t === activeTag ? null : t)}>{t}</button>
          ))}
        </div>
      <div className="discover-meta">
        <div className="discover-count">{filtered.length} Jobs</div>
        
      </div>

      {isLoading ? (
          <Loader />
      ) : paginated.length === 0 ? (
          <div className="no-jobs-container" style={{ marginTop: '2rem' }}>
            <p className="no-jobs-title">
              {search.trim() ? "No jobs match your search" : "No jobs available"}
            </p>
            <p className="no-jobs-text">
              {search.trim() ? "Try different keywords or filters." : "Check back later for new job postings."}
            </p>
          </div>
      ) : (
          <div className="discover-list">
            {paginated.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`}><JobCard job={job} /></Link>
            ))}
          </div>
      )}

      <div className="pagination">
        <div className="pagination-info">
          {filtered.length === 0 ? 'No jobs' : `Showing ${(filtered.length ? (page - 1) * pageSize + 1 : 0)} - ${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
        </div>
        <div className="pagination-controls">
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || totalPages <= 1}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="currentColor" />
            </svg>
          </button>
          {getPageNumbers().map((p, i) => (
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
            ) : (
              <button 
                key={p} 
                className={"page-btn" + (page === p ? ' active' : '')} 
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            )
          ))}
          <button
            className="page-btn next-btn" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages <= 1}
            aria-label="Next page"
          >
            <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M354.4 174.4c-8.8-8-22.4-7.2-30.4 1.6s-7.2 22.4 1.6 30.4l309.6 280c8 7.2 8 17.6 0 24.8l-309.6 270.4c-8.8 8-9.6 21.6-2.4 30.4 8 8.8 21.6 9.6 30.4 2.4L663.2 543.2c27.2-24 28-64 0.8-88.8l-309.6-280z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
