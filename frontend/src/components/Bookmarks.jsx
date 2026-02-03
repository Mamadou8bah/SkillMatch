import React from 'react'

import '../styles/discover.css'
import { JobCard } from './JobCard'
import { Link } from 'react-router-dom'
import { useBookmarks } from '../contexts/BookmarksContext'
import { Bookmark } from 'lucide-react'

export const Bookmarks = () => {
  const { bookmarkedJobs } = useBookmarks()

  return (
    <div className='bookmarks-page'>
      <div className="discover-list">
        {bookmarkedJobs.length === 0 ? (
          <div className="no-jobs-container" style={{ width: 'calc(100% - 2rem)', marginTop: '2rem' }}>
            <Bookmark size={48} className="empty-icon" style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p className="no-jobs-title">No bookmarked jobs</p>
            <p className="no-jobs-text">Jobs you save will appear here.</p>
          </div>
        ) : (
          bookmarkedJobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`}><JobCard job={job} /></Link>
          ))
        )}
      </div>
    </div>
  )
}
