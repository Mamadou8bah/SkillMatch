import React, { useState, useMemo, useEffect } from 'react'
import '../styles/discover.css'
import { JobCard } from './JobCard'
import { Link } from 'react-router-dom'
import Loader from './Loader'

export const Discover = () => {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [jobsList, setJobsList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('https://skillmatch-1-6nn0.onrender.com/post', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setJobsList(data.content || data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setIsLoading(false);
      });
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
      
      if (!q) return true
      
      const inTitle = j.title && j.title.toLowerCase().includes(q)
      const inEmployer = j.employer && j.employer.name && j.employer.name.toLowerCase().includes(q)
      const inSkills = Array.isArray(j.requiredSkills) && j.requiredSkills.some(s => s.name.toLowerCase().includes(q))
      
      return inTitle || inEmployer || inSkills
    })
  }, [search, activeTag, jobsList])

  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    setPage(1)
  }, [search, activeTag])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

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
            <p className="no-jobs-title">No jobs match your search</p>
            <p className="no-jobs-text">Try different keywords or filters.</p>
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
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} className={"page-btn" + (page === i + 1 ? ' active' : '')} onClick={() => setPage(i + 1)}>{i + 1}</button>
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
