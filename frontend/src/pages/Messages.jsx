import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MessageCircle, Check, CheckCheck } from 'lucide-react'
import '../styles/messages.css'
import Loader from '../components/Loader'

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
        const response = await fetch('https://skillmatch-1-6nn0.onrender.com/api/messages/inbox', {
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
        <h2>Messages</h2>
        <p className="messages-subtitle">Stay connected with your professional network</p>
      </div>
      
      <div className="messages-search-container">
        <div className="messages-search">
          <Search size={20} />
          <input
            type="text"
            placeholder='Search conversations...'
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="messages-list">
        {isLoading ? (
          <Loader />
        ) : filteredInbox.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} />
            <p>No conversations yet</p>
            <Link to="/candidates" className="start-conversation-btn">Start a Conversation</Link>
          </div>
        ) : (
          filteredInbox.map((msg) => {
            const currentUserId = localStorage.getItem('userId');
            const otherUser = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
            const isUnread = !msg.read && msg.recipient.id.toString() === currentUserId;
            
            return (
              <Link to={`/messages/${otherUser.id}`} key={msg.id} className="message-item">
                <div className="message-avatar-wrapper">
                  <img 
                    src={otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName)}&background=random`} 
                    alt={otherUser.fullName}
                    className="message-avatar"
                  />
                  {isUnread && <span className="online-indicator"></span>}
                </div>
                <div className="message-content">
                  <div className="message-header">
                    <h4 className="message-name">{otherUser.fullName}</h4>
                    <span className="message-time">{timeAgo(msg.sentAt)}</span>
                  </div>
                  <div className="message-preview">
                    <p className={isUnread ? 'unread' : ''}>
                      {truncate(msg.content, MAX_PREVIEW)}
                    </p>
                    {msg.sender.id.toString() === currentUserId && (
                      <span className="message-status">
                        {msg.read ? <CheckCheck size={16} /> : <Check size={16} />}
                      </span>
                    )}
                  </div>
                </div>
                {isUnread && <div className="unread-indicator"></div>}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
