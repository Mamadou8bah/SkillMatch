import React from 'react'
import '../styles/messages.css'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inbox, setInbox] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const MAX_PREVIEW = 80;
  const truncate = (s, n) => (typeof s === 'string' && s.length > n ? s.slice(0, n - 3) + '...' : s || '');

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/messages/inbox', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setInbox(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch inbox", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInbox();
  }, []);

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 84600)}d`;
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const filteredInbox = inbox.filter(msg => {
    const currentUserId = localStorage.getItem('userId');
    const otherUser = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
    return otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className='messages-page'>
      <div className="messages-header">
        <Link to={'/'}>
          <div className="back-button">
            <svg viewBox="0 0 1024 1024" fill="currentColor" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M669.6 849.6c8.8 8 22.4 7.2 30.4-1.6s7.2-22.4-1.6-30.4l-309.6-280c-8-7.2-8-17.6 0-24.8l309.6-270.4c8.8-8 9.6-21.6 2.4-30.4-8-8.8-21.6-9.6-30.4-2.4L360.8 480.8c-27.2 24-28 64-0.8 88.8l309.6 280z" fill="currentColor" />
            </svg>
          </div>
        </Link>
        <h2>Messages</h2>
      </div>
      
      <div className="search-input messages-search">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
        <input
          type="text"
          placeholder='Search...'
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="recent-messages">
        <div className="recent-messages-header">
          <p className="rm-title">Recent Messages</p>
        </div>
        <div className="messages-container">
          {isLoading ? <p style={{textAlign: 'center', padding: '20px'}}>Loading conversations...</p> : 
           filteredInbox.length === 0 ? <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>No messages yet.</p> :
           filteredInbox.map((msg) => {
            const currentUserId = localStorage.getItem('userId');
            const otherUser = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
            
            return (
              <div className="message" key={msg.id}>
                <div className="profile-img">
                  <img src={otherUser.avatar || 'https://via.placeholder.com/50'} alt={otherUser.fullName} />
                </div>
                <div className="details">
                  <Link to={`/messages/${otherUser.id}`} className="dm-link">
                    <div className="dm-header">
                      <p className="contact-name">{otherUser.fullName}</p>
                      <p className="timestamp">{timeAgo(msg.sentAt)}</p>
                    </div>
                    <div className="dm-last-message">
                      <p className={!msg.read && msg.recipient.id.toString() === currentUserId ? "last-message unread" : "last-message"}>
                        {truncate(msg.content, MAX_PREVIEW)}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
