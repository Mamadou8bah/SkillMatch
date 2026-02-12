import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/notifications.css';
import { 
  Bell, 
  MessageSquare, 
  Briefcase, 
  Calendar, 
  Info,
  Trash2
} from 'lucide-react';
import Loader from '../components/Loader';
import { apiFetch } from '../utils/api';

export const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await apiFetch(`/api/notifications/user/${userId}`);
        if (data.success) {
          setNotifications(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'JOB_ALERT':
        return <Briefcase className="nt-icon job" size={20} />;
      case 'MESSAGE':
        return <MessageSquare className="nt-icon message" size={20} />;
      case 'EVENT':
        return <Calendar className="nt-icon event" size={20} />;
      default:
        return <Info className="nt-icon info" size={20} />;
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://skillmatch-1-6nn0.onrender.com/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://skillmatch-1-6nn0.onrender.com/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://skillmatch-1-6nn0.onrender.com/api/notifications/user/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="24px" height="24px">
            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
            <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
              <path fill="currentColor" d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path>
            </g>
          </svg>
        </button>
        <h1>Notifications</h1>
        <button className="mark-all-btn" onClick={markAllRead}>Mark all read</button>
      </div>

      <div className="notifications-list">
        {isLoading ? (
          <Loader />
        ) : notifications.length > 0 ? (
          notifications.map((nt) => (
            <div 
              key={nt.id} 
              className={`notification-item ${!nt.isRead ? 'unread' : ''}`}
              onClick={() => markAsRead(nt.id)}
            >
              <div className="nt-icon-wrapper">
                {getTypeIcon(nt.type)}
                {!nt.isRead && <div className="unread-dot"></div>}
              </div>
              <div className="nt-content">
                <div className="nt-title-row">
                  <h3>{nt.title}</h3>
                  <span className="nt-date">{formatDate(nt.createdAt)}</span>
                </div>
                <p>{nt.message}</p>
              </div>
              <div className="nt-actions">
                <button className="nt-more-btn" onClick={(e) => deleteNotification(e, nt.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <Bell size={64} opacity={0.2} />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

