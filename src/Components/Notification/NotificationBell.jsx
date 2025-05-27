import React, { useState, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import './Notification.css';
import { useDispatch, useSelector } from 'react-redux';
import { openInterviewModal, setInterviewDetails } from '../../Redux/Interview/interviewCallSlice';
import axios from 'axios';

const notificationSound = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU';

class NotificationService {
  constructor(userId, dispatch) {
    this.userId = userId;
    this.socket = null;
    this.listeners = [];
    this.dispatch = dispatch;
  }

  connect() {
    this.socket = new WebSocket(`ws://localhost:8000/ws/notification/${this.userId}/`);
    this.socket.onopen = () => console.log('WebSocket connected');
    this.socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.message && data.message.text && data.message.text.startsWith('Interview call')) {
          const parts = data.message.text.split(' - ');
          const roomId = parts[1].trim();
          const interviewId = parts[2].trim();
          this.dispatch(setInterviewDetails({ roomId, interviewId }));
          this.dispatch(openInterviewModal());
        }
        console.log('WebSocket message received:', data);
        this.listeners.forEach(listener => listener(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    this.socket.onclose = (e) => {
      console.log('WebSocket disconnected...................................:', e.reason);
      setTimeout(() => this.connect(), 1000); // Reconnect after 1 second 
    };
    this.socket.onerror = (error) => console.error('WebSocket error:', error);
  }

  addListener(listener) { this.listeners.push(listener); }
  removeListener(listener) { this.listeners = this.listeners.filter(l => l !== listener); }
  disconnect() { if (this.socket) this.socket.close(); }
}

const extractMediaUrl = (text) => {
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[0] : null;
};

const renderMediaPreview = (url) => {
  if (!url) return null;
  
  if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
    return (
      <div className="notification-media-preview">
        <img src={url} alt="Notification attachment" className="notification-image" />
      </div>
    );
  } else if (url.match(/\.(mp4|webm|mov)$/i)) {
    return (
      <div className="notification-media-preview">
        <video src={url} controls className="notification-video" />
      </div>
    );
  }
  return null;
};

const NotificationBell = ({ userId, senderName }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user , setUser]= useState(null)
  const audioRef = useRef(null);
  const serviceRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const authentication = useSelector((state) => state.authentication_user);
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  

  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    audioRef.current.volume = 0.3;

    serviceRef.current = new NotificationService(userId, dispatch);
    serviceRef.current.connect();

    
    const handleNotification = (data) => {
      if (data.type === 'notification') {
        // Skip notifications from the current user
        if (data.message.sender === senderName) {
          return;
        }
        setUnreadCount(prev => prev + 1);
        setNotifications(prev => [{
          id: data.message.id || Date.now(),
          text: data.message.text,
          timestamp: data.message.timestamp,
          chat_id: data.message.chat_id,
          read: false,
          mediaUrl: extractMediaUrl(data.message.text)
        }, ...prev.slice(0, 9)]);
        
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      } else if (data.type === 'initial_data') {
        setUnreadCount(data.unread_count);
        // Transform and set initial notifications
        const initialNotifications = data.notifications.map(notif => ({
            id: Date.now() + Math.random(),
            text: notif.message,
            timestamp: notif.created_at,
            chat_id: null,
            read: false,
            mediaUrl: extractMediaUrl(notif.message)
        }));
        setNotifications(initialNotifications);
      }
    };

    serviceRef.current.addListener(handleNotification);
    return () => {
      serviceRef.current.removeListener(handleNotification);
      serviceRef.current.disconnect();
    };
  }, [userId, senderName]);

  useEffect(() => {
    const changeNotificationStatus = async () => {
      try {
        if (showDropdown && userId) { // Add null check for userId
          const response = await axios.post(
            `${baseURL}/chat/notificationStatus/`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          
          if (response.status === 200) {
            console.log("Notification status changed successfully", response.data);
          }
        }
      } catch (error) {
        console.log("Error in changing notification status", error);
      }
    };
  
    if (showDropdown) {
      changeNotificationStatus();
    }
  }, [showDropdown]);
 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    console.log('Notifications cleared locally');
  };

  const handleBellClick = () => {
    setShowDropdown(prev => !prev);
    if (unreadCount > 0) {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    }
  };

  const navigateToChat = (chatId) => {
    window.location.href = `/chat/${chatId}`;
    setShowDropdown(false);
  };

  useEffect(()=>{
    console.log('Notifications updated:', notifications);
  },[notifications])

  return (
    <div className="notification-bell-container" ref={containerRef}>
      {isMobile && showDropdown && (
        <div className="notification-overlay" onClick={() => setShowDropdown(false)} />
      )}

      <div className="notification-bell" onClick={handleBellClick}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </div>

      {showDropdown && (
        <div 
          className="notification-dropdown" 
          ref={dropdownRef}
          style={isMobile ? { 
            position: 'fixed',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '95vw',
            maxWidth: '300px'
          } : {}}
        >
          <div className="notification-header">
            <h3>Notifications</h3>
 
            {notifications.length > 0 && (
              <button className="clear-all-btn" onClick={clearAllNotifications}>
                Clear All
              </button>
            )}
          </div>
          <div className="notification-list">
              {notifications.length > 0 ? (
                  notifications.map(notif => (
                      <div
                          key={notif.id}
                          className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                          onClick={() => navigateToChat(notif.chat_id)}
                      >
                          <div className="notification-content">
                              <div className="notification-text">
                                  {notif.text}
                              </div>
                              <div className="notification-time">
                                  {new Date(notif.timestamp).toLocaleString()}
                              </div>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="no-notifications">No notifications</div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;