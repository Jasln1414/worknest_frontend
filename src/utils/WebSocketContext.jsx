// import React, { createContext, useState, useEffect, useRef } from 'react';

// const WebSocketContext = createContext(null);

// export function WebSocketProvider({ children }) {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const ws = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const maxReconnectAttempts = 5;

//   const connectWebSocket = () => {
//     const token = localStorage.getItem('access');
//     if (!token) {
//       console.error('No token available for WebSocket connection');
//       return;
//     }

//     const encodedToken = encodeURIComponent(token);
//     const wsScheme = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
//     const wsUrl = `${wsScheme}${window.location.host}/ws/notifications/?token=${encodedToken}`;

//     ws.current = new WebSocket(wsUrl);

//     ws.current.onopen = () => {
//       console.log('WebSocket connected');
//       reconnectAttempts.current = 0;
//       ws.current.send(JSON.stringify({
//         type: 'authenticate',
//         token: token
//       }));
//     };

//     ws.current.onmessage = (e) => {
//       try {
//         const data = JSON.parse(e.data);
//         if (data.type === 'notification') {
//           setNotifications(prev => [data, ...prev]);
//           setUnreadCount(prev => prev + 1);
//         } else if (data.type === 'initial_count') {
//           setUnreadCount(data.count);
//         }
//       } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//       }
//     };

//     ws.current.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     ws.current.onclose = (e) => {
//       console.log(`WebSocket disconnected with code ${e.code}`);
//       if (e.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
//         const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
//         reconnectAttempts.current += 1;
//         setTimeout(connectWebSocket, delay);
//       }
//     };
//   };

//   useEffect(() => {
//     connectWebSocket();
//     return () => {
//       if (ws.current) {
//         ws.current.close(1000, 'Component unmounted');
//       }
//     };
//   }, []);

//   const markAsRead = (notificationId) => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'mark_read',
//         notification_id: notificationId
//       }));
//     }
//     setNotifications(prev => 
//       prev.map(n => n.id === notificationId ? {...n, is_read: true} : n)
//     );
//     setUnreadCount(prev => Math.max(0, prev - 1));
//   };

//   return (
//     <WebSocketContext.Provider value={{ notifications, unreadCount, markAsRead }}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// }

// export { WebSocketContext };