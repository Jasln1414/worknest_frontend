// import React, { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';

// export const NotificationContext = createContext();

// export const NotificationProvider = ({ children, userId, userType }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     if (!userId) {
//       console.error(`NotificationProvider (${userType}): No userId provided!`);
//       return;
//     }

//     // Correct URL with "notifications" (plural)
//     const wsUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
//     console.log(`[${userType}] Connecting to ${wsUrl}`);
//     const socket = new WebSocket(wsUrl);

//     socket.onopen = () => {
//       console.log(`[${userType}] WebSocket opened for user ${userId}`);
//     };

//     socket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log(`[${userType}] Received for user ${userId}:`, data);
//       if (data.type === 'notify_message') {
//         setNotifications((prev) => [...prev, data.message]);
//         setUnreadCount(data.unread_count);
//       }
//     };

//     socket.onerror = (error) => {
//       console.error(`[${userType}] WebSocket error for user ${userId}:`, error);
//     };

//     socket.onclose = (event) => {
//       console.log(`[${userType}] WebSocket closed for user ${userId}:`, event.code, event.reason);
//     };

//     return () => {
//       console.log(`[${userType}] Closing WebSocket for user ${userId}`);
//       socket.close();
//     };
//   }, [userId, userType]);

//   const markAllAsRead = async () => {
//     try {
//       const token = localStorage.getItem('access');
//       await axios.post(
//         'http://127.0.0.1:8000/api/chat/mark-all-read/',
//         { user_id: userId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//       console.log(`[${userType}] Marked all as read for user ${userId}`);
//     } catch (error) {
//       console.error(`[${userType}] Error marking all as read:`, error);
//     }
//   };

//   const clearNotification = (timestamp) => {
//     setNotifications((prev) => prev.filter((n) => n.timestamp !== timestamp));
//   };

//   return (
//     <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, clearNotification, userType }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => {
//   const context = useContext(NotificationContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within a NotificationProvider');
//   }
//   return context;
// };


// src/contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const userId = localStorage.getItem('userId'); // Or however you get the user ID

  // Connect to notification WebSocket
  useEffect(() => {
    if (!userId) return;
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/notifications/${userId}/`;
    
    const notificationSocket = new WebSocket(wsUrl);
    
    notificationSocket.onopen = () => {
      console.log('Notification WebSocket connected');
    };
    
    notificationSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle new notification
      if (data.type === 'notification' || data.type === 'chat_notification') {
        // Add notification to the state
        setNotifications(prev => {
          // Avoid duplicates
          if (prev.some(n => n.id === data.id)) return prev;
          return [data, ...prev];
        });
        
        // Play notification sound
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.error('Error playing sound:', e));
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.message, {
            icon: '/notification-icon.png'
          });
        }
      }
    };
    
    notificationSocket.onclose = () => {
      console.log('Notification WebSocket disconnected');
      setTimeout(() => {
        if (userId) {
          console.log('Attempting to reconnect...');
          setSocket(null); // This will trigger the effect to run again
        }
      }, 3000);
    };
    
    setSocket(notificationSocket);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'granted' && 
        Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    return () => {
      if (notificationSocket) {
        notificationSocket.close();
      }
    };
  }, [userId]);
  
  // Update unread count whenever notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);
  
  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  // Clear notifications for a specific chat
  const clearChatNotifications = (chatKey) => {
    setNotifications(prev => 
      prev.map(n => n.chat_key === chatKey ? { ...n, read: true } : n)
    );
  };
  
  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearChatNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}