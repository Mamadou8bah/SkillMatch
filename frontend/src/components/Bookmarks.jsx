import React from 'react'

import '../styles/discover.css'
import { JobCard } from './JobCard'
import { Link } from 'react-router-dom'
import { useBookmarks } from '../contexts/BookmarksContext'

export const Bookmarks = () => {
  const { bookmarkedJobs } = useBookmarks()

  return (
    <div className='bookmarks-page'>
      <div className="discover-list">
        {bookmarkedJobs.length === 0 ? (
          <div className="discover-count">No bookmarked jobs</div>
        ) : (
          bookmarkedJobs.map(job => (
            <Link key={job.id} to={`/jobs/${job.id}`}><JobCard job={job} /></Link>
          ))
        )}
      </div>
    </div>
  )
}
