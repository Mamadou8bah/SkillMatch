import React, { createContext, useContext, useEffect, useState } from 'react'
import { jobs } from '../data/jobs'

const BookmarksContext = createContext(null)

export const BookmarksProvider = ({ children }) => {
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem('bookmarkedJobIds')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bookmarkedJobIds', JSON.stringify(ids))
    } catch (e) {
      
    }
  }, [ids])

  const isBookmarked = (id) => ids.includes(id)

  const toggleBookmark = (job) => {
    setIds((prev) => (prev.includes(job.id) ? prev.filter((i) => i !== job.id) : [...prev, job.id]))
  }

  const bookmarkedJobs = ids.map((id) => jobs.find((j) => j.id === id)).filter(Boolean)

  return (
    <BookmarksContext.Provider value={{ ids, isBookmarked, toggleBookmark, bookmarkedJobs }}>
      {children}
    </BookmarksContext.Provider>
  )
}

export const useBookmarks = () => {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error('useBookmarks must be used within a BookmarksProvider')
  return ctx
}

export default BookmarksContext
