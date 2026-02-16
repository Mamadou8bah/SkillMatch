import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, MessageSquare, Plus } from 'lucide-react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import '../styles/messages.css'
import Loader from '../components/Loader'
import { apiFetch, BASE_URL } from '../utils/api'
import { chatCache } from '../utils/cache'
import { motion, AnimatePresence } from 'framer-motion'

export const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inbox, setInbox] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const stompClient = useRef(null);
  
  const MAX_PREVIEW = 80;
  const truncate = (s, n) => (typeof s === 'string' && s.length > n ? s.slice(0, n - 3) + '...' : s || '');

  useEffect(() => {
    const fetchInbox = async () => {
      // 1. Try to load from cache first
      const cachedInbox = chatCache.get('inbox_list');
      if (cachedInbox) {
        setInbox(cachedInbox);
        setIsLoading(false); // Hide loader if we have cached data
      }

      try {
        const data = await apiFetch('/api/messages/inbox');
        if (data.success) {
          setInbox(data.data);
          // 2. Update cache with fresh data
          chatCache.set('inbox_list', data.data);
        }
      } catch (err) {
        console.error("Failed to fetch inbox", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInbox();
  }, []);

  useEffect(() => {
    const socket = new SockJS(`${BASE_URL}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (message) => {
          const receivedMessage = JSON.parse(message.body);
          
          setInbox(prevInbox => {
            const currentUserId = localStorage.getItem('userId');
            const otherUserInMsg = receivedMessage.sender.id.toString() === currentUserId ? receivedMessage.recipient : receivedMessage.sender;
            
            // Check if we already have a conversation with this person
            const conversationIndex = prevInbox.findIndex(msg => {
              const otherUserInInbox = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
              return otherUserInInbox.id === otherUserInMsg.id;
            });

            let newInbox;
            if (conversationIndex !== -1) {
              // Move existing conversation to top and update the message
              const updatedInbox = [...prevInbox];
              updatedInbox[conversationIndex] = {
                ...receivedMessage,
                sender: receivedMessage.sender,
                recipient: receivedMessage.recipient
              };
              const [movedItem] = updatedInbox.splice(conversationIndex, 1);
              newInbox = [movedItem, ...updatedInbox];
            } else {
              // Prepend new conversation
              newInbox = [receivedMessage, ...prevInbox];
            }
            
            chatCache.set('inbox_list', newInbox);
            return newInbox;
          });
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error in Messages", frame);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, []);

  const formatMessageDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diff = now - date;
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const currentUserId = localStorage.getItem('userId');

  const filteredInbox = inbox.filter(msg => {
    const otherUser = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
    return otherUser.fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) return <Loader />

  return (
    <div className="messages-page">
      <header className="messages-header-nav">
        <div className="header-top">
          <h1 className="messages-title">Messages</h1>
          <button className="new-message-btn"><Plus size={24} /></button>
        </div>
        <div className="messages-search-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="messages-search-input"
          />
        </div>
      </header>

      <main className="messages-list-section">
        <div className="inbox-list-container">
          <AnimatePresence>
            {filteredInbox.length > 0 ? (
              filteredInbox.map((msg, index) => {
                const otherUser = msg.sender.id.toString() === currentUserId ? msg.recipient : msg.sender;
                const isSentByMe = msg.sender.id.toString() === currentUserId;
                const isUnread = !msg.read && !isSentByMe;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    key={msg.id}
                  >
                    <Link to={`/messages/${otherUser.id}`} className={`message-item ${isUnread ? 'unread-item' : ''}`}>
                      <div className="message-avatar-container">
                        <img 
                          src={otherUser.profileImageUrl || otherUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.fullName)}&background=random`} 
                          alt="" 
                          className="message-avatar"
                        />
                        {isUnread && <span className="online-indicator"></span>}
                      </div>
                      <div className="message-info-col">
                        <div className="message-top-row">
                          <span className="user-name-text">{otherUser.fullName}</span>
                          <span className="message-time-text">{formatMessageDate(msg.timestamp || msg.sentAt)}</span>
                        </div> 
                        <div className="message-bottom-row">
                          <p className={`message-preview-text ${isUnread ? 'unread-msg' : ''}`}>
                            {truncate(msg.content, MAX_PREVIEW)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <div className="empty-messages-state">
                <div className="empty-icon-circle">
                  <MessageSquare size={40} />
                </div>
                <h3>No messages yet</h3>
                <p>Build your network and start a conversation!</p>
                <Link to="/candidates" className="find-people-btn">Find People</Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
