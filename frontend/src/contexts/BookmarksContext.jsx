import React, { createContext, useContext, useEffect, useState } from 'react'

const BookmarksContext = createContext(null)

export const BookmarksProvider = ({ children }) => {
  const [bookmarkedJobs, setBookmarkedJobs] = useState(() => {
    try {
      const raw = localStorage.getItem('bookmarkedJobs')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('bookmarkedJobs', JSON.stringify(bookmarkedJobs))
    } catch (e) {
      
    }
  }, [bookmarkedJobs])

  const isBookmarked = (id) => bookmarkedJobs.some(j => j.id === id)

  const toggleBookmark = (job) => {
    setBookmarkedJobs((prev) => {
        const exists = prev.some(j => j.id === job.id);
        if (exists) {
            return prev.filter(j => j.id !== job.id);
        } else {
            return [...prev, job];
        }
    });
  }

  return (
    <BookmarksContext.Provider value={{ isBookmarked, toggleBookmark, bookmarkedJobs }}>
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
