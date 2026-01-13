import React from 'react'
import '../styles/discover.css'
import { useState, useMemo, useEffect } from 'react'
import { jobs } from '../data/jobs'
import { JobCard } from './JobCard'
import { Link } from 'react-router-dom'

export const Discover = () => {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const tags = useMemo(() => {
    const s = new Set()
    jobs.forEach(j => (j.tags || []).forEach(t => s.add(t)))
    return Array.from(s)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter(j => {
      if (activeTag && !(j.tags || []).includes(activeTag)) return false
      if (!q) return true
      const inTitle = j.title && j.title.toLowerCase().includes(q)
      const inCompany = j.company && j.company.toLowerCase().includes(q)
      const inSkills = Array.isArray(j.skills) && j.skills.some(s => s.toLowerCase().includes(q))
      const inTags = (j.tags || []).some(t => t.toLowerCase().includes(q))
      return inTitle || inCompany || inSkills || inTags
    })
  }, [search, activeTag])

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

      <div className="discover-list">
        {paginated.map(job => (
          <Link key={job.id} to={`${job.id}`}><JobCard job={job} /></Link>
        ))}
      </div>

      <div className="pagination">
        <div className="pagination-info">
          {filtered.length === 0 ? 'No jobs' : `Showing ${(filtered.length ? (page - 1) * pageSize + 1 : 0)} - ${Math.min(page * pageSize, filtered.length)} of ${filtered.length}`}
        </div>
        <div className="pagination-controls">
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
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
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
