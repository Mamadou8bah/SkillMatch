import React from 'react'
import '../styles/messages.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import messages from '../data/messages'
import { timeAgo } from '../data/messages'
export const Messages = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const MAX_PREVIEW = 80;
  const truncate = (s, n) => (typeof s === 'string' && s.length > n ? s.slice(0, n - 3) + '...' : s || '');

  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(searchTerm.trim()), 220);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  return (

    <div className='messages-page'>
      <div className="messages-header">
        <Link to={'/'}>
          <div className="back-button">
            <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <g id="SVGRepo_bgCarrier" ></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="currentColor" />
              </g>
            </svg>
          </div>
        </Link>
        <h2>Messages</h2>
      </div>
      <div className="search-input messages-search">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        <input
          type="text"
          placeholder='Search...'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      <div className="highlights">
        <div className="add-btn highlight">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title></title> <g id="Complete"> <g data-name="add" id="add-2"> <g> <line fill="none" stroke="#d76925" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="19" y2="5"></line> <line fill="none" stroke="#d76925" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="5" x2="19" y1="12" y2="12"></line> </g> </g> </g> </g></svg>
        </div>
        {messages.map((message) => (


          <Link to={`/messages/${message.id}`} key={message.id} className='highlight'>
            <img src={message.contactAvatar} alt={message.contactName} />
          </Link>

        ))}
      </div>
      <div className="recent-messages">
        <div className="recent-messages-header">
          <p className="rm-title">
            Recent Messages
          </p>
        </div>
        <div className="messages-container">
          {messages.map((message) => (
            <div className="message" key={message.id}>
              <div className="profile-img">
                <img src={message.contactAvatar} alt={message.contactName} />
              </div>
              <div className="details">
                <Link to={`/messages/${message.id}`} className="dm-link">
                  <div className="dm-header">
                    <p className="contact-name">{message.contactName}</p>
                    <p className="timestamp">{timeAgo(message.lastUpdated)}</p>
                  </div>
                  <div className="dm-last-message">
                    <p className={message.unreadCount > 0 ? "last-message unread" : "last-message"}>{truncate(message.lastMessage, MAX_PREVIEW)}</p>
                    {message.unreadCount > 0 ? (<div className="unread-badge">{message.unreadCount}</div>) :
                      <div className="delivered-status">
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path stroke="#8d8d8fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 17l5 5 12-12M16 20l2 2 12-12"></path> </g></svg>
                      </div>
                    }
                  </div>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
