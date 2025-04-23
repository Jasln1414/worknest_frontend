// // Chat.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import SideBar from '../../SideBar';
// import axios from 'axios';
// import Drawer from 'react-modern-drawer';
// import 'react-modern-drawer/dist/index.css';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import Message from '../../../../Components/Employer/utilities/Message';
// import { IoSend } from "react-icons/io5";
// import { FaArrowLeft } from "react-icons/fa6";
// import './chat.css';

// const extractMediaUrl = (text) => {
//   const urlMatch = text?.match(/(https?:\/\/[^\s]+)/);
//   return urlMatch ? urlMatch[0] : null;
// };

// const renderMediaPreview = (url, baseURL) => {
//   if (!url) return null;
  
//   const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  
//   if (url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
//     return (
//       <div className="message-media-preview">
//         <img src={fullUrl} alt="Message attachment" className="message-image" />
//       </div>
//     );
//   } else if (url.match(/\.(mp4|webm|mov)$/i)) {
//     return (
//       <div className="message-media-preview">
//         <video src={fullUrl} controls className="message-video" />
//       </div>
//     );
//   }
//   return null;
// };

// function Chat() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [chatDrawer, setChatDrawer] = useState(false);
//   const [isSmallScreen, setIsSmallScreen] = useState(false);
//   const [message, setMessage] = useState("");
//   const messagesEndRef = useRef(null);
  
//   const token = localStorage.getItem('access');
//   const [chatRooms, setChatRooms] = useState([]);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [client, setClient] = useState(null);
//   const [selectedChat, setSelectedChat] = useState(null);
//   const [empName, setEmpName] = useState(null);
//   const baseURL = 'http://127.0.0.1:8000';

//   const toggleDrawer = () => setIsOpen((prev) => !prev);
//   const handleResize = () => setIsSmallScreen(window.innerWidth < 640);

//   useEffect(() => {
//     window.addEventListener('resize', handleResize);
//     handleResize();
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchMessageData = async () => {
//       try {
//         const response = await axios.get(`${baseURL}/chat/chats/`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'Content-Type': 'multipart/form-data'
//           }
//         });

//         if (response.status === 200 && response.data.length > 0) {
//           setChatRooms(response.data);
//           setEmpName(response.data[0].employer_name);
//           setSelectedChat(response.data[0]);
//           setChatMessages([]);
//           connectToWebSocket(response.data[0].candidate, response.data[0].employer, response.data[0].employer);
//         }
//       } catch (error) {
//         console.error("Error fetching chat data:", error);
//       }
//     };
//     fetchMessageData();
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const connectToWebSocket = (candidate_id, employer_id, user_id) => {
//     if (!candidate_id || !employer_id) return;
//     if (client) client.close();

//     const newClient = new W3CWebSocket(`${baseURL}/ws/chat/${candidate_id}/${employer_id}/${user_id}/`);
//     setClient(newClient);

//     newClient.onopen = () => console.log("WebSocket Client Connected");
//     newClient.onmessage = (message) => {
//       const data = JSON.parse(message.data);
//       setChatMessages((prev) => [...prev, {
//         ...data,
//         mediaUrl: extractMediaUrl(data.message)
//       }]);
//     };
//     newClient.onerror = (error) => console.error("WebSocket error:", error);
//     return () => newClient.close();
//   };

//   const handleChat = (room) => {
//     setChatMessages([]);
//     connectToWebSocket(room.candidate, room.employer, room.employer);
//     setSelectedChat(room);
//     if (isSmallScreen) setChatDrawer(true);
//   };

//   const sendMessage = () => {
//     if (!message.trim() || !client || client.readyState !== client.OPEN) return;
//     const messageData = { message, sendername: empName };
//     try {
//       client.send(JSON.stringify(messageData));
//       setMessage("");
//     } catch (error) {
//       console.error("Failed to send message:", error);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <div className="chat-messenger-container">
//       {isSmallScreen && (
//         <>
//           <button onClick={toggleDrawer} title="Menu" className="chat-toggle-button">
//             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
//               <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#818cf8" strokeWidth="1.5" fill="none"/>
//               <path d="M8 12H16" stroke="#818cf8" strokeWidth="1.5"/>
//               <path d="M12 16V8" stroke="#818cf8" strokeWidth="1.5"/>
//             </svg>
//           </button>
//           <Drawer open={isOpen} onClose={toggleDrawer} direction='left' className='sidebar-drawer'>
//             <div className='bg-gray-50'><SideBar /></div>
//           </Drawer>
//         </>
//       )}

//       <div className="w-full">
//         <div className="w-full chat-container">
//           <div className="grid min-h-full w-full lg:grid-cols-[280px_1fr]">
//             <div className="chat-rooms-panel bg-white shadow-sm rounded-lg mx-4 mt-4 p-4">
//               <nav className="flex flex-col gap-2 overflow-auto py-2">
//                 {chatRooms.map((room, index) => (
//                   <div 
//                     onClick={() => handleChat(room)} 
//                     className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-100 ${
//                       selectedChat?.id === room.id ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white'
//                     }`}
//                     key={index}
//                   >
//                     <div className="h-12 w-12 flex-shrink-0">
//                       <img 
//                         className="w-full h-full rounded-full object-cover" 
//                         src={baseURL + room.candidate_pic} 
//                         alt={`${room.candidate_name} avatar`}
//                         onError={(e) => { e.target.src = ''; }}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <div className="font-medium text-gray-800">{room.candidate_name}</div>
//                       <div className="text-sm text-gray-500">Last message...</div>
//                     </div>
//                   </div>
//                 ))}
//               </nav>
//             </div>

//             <div className="chat-messages-container">
//               {isSmallScreen ? (
//                 <Drawer
//                   open={chatDrawer}
//                   onClose={() => setChatDrawer(false)}
//                   direction='right'
//                   size={440}
//                   className='chat-drawer'
//                 >
//                   <ChatInterface 
//                     empName={empName}
//                     selectedChat={selectedChat}
//                     chatMessages={chatMessages}
//                     setMessage={setMessage}
//                     sendMessage={sendMessage}
//                     message={message}
//                     setChatDrawer={setChatDrawer}
//                     chatDrawer={chatDrawer}
//                     baseURL={baseURL}
//                     handleKeyPress={handleKeyPress}
//                   />
//                 </Drawer>
//               ) : (
//                 <ChatInterface 
//                   empName={empName}
//                   selectedChat={selectedChat}
//                   chatMessages={chatMessages}
//                   setMessage={setMessage}
//                   sendMessage={sendMessage}
//                   message={message}
//                   setChatDrawer={setChatDrawer}
//                   chatDrawer={chatDrawer}
//                   baseURL={baseURL}
//                   handleKeyPress={handleKeyPress}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ChatInterface({ empName, selectedChat, chatMessages, setMessage, sendMessage, message, setChatDrawer, chatDrawer, baseURL, handleKeyPress }) {
//   return (
//     <div className="chat-interface">
//       <header className="chat-header">
//         <div onClick={() => setChatDrawer(!chatDrawer)} className="mobile-back-button">
//           <FaArrowLeft size={27} />
//         </div>
//         <div className="header-content">
//           {selectedChat && (
//             <div className="user-info">
//               <div className="avatar-container">
//                 <img 
//                   className="user-avatar" 
//                   src={baseURL + selectedChat.candidate_pic} 
//                   alt="User avatar"
//                   onError={(e) => { e.target.src = ''; }}
//                 />
//               </div>
//               <div className="user-name">
//                 <div>{selectedChat.candidate_name}</div>
//               </div>
//             </div>
//           )}
//         </div>
//       </header>
      
//       <main className="chat-main">
//         <div className="messages-container">
//           {chatMessages.map((msg, index) => (
//             <div key={index} className="message-wrapper">
//               {msg.sendername === empName ? (
//                 <div className="message-sent">
//                   <Message text={msg.message?.replace(/(https?:\/\/[^\s]+)/, '')} send />
//                   {msg.mediaUrl && renderMediaPreview(msg.mediaUrl, baseURL)}
//                   <div className="message-time">
//                     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="message-received">
//                   <Message text={msg.message?.replace(/(https?:\/\/[^\s]+)/, '')} received />
//                   {msg.mediaUrl && renderMediaPreview(msg.mediaUrl, baseURL)}
//                   <div className="message-time">
//                     {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//           <div ref={useRef(null)} />
//         </div>
//       </main>
      
//       <div className="message-input-container">
//         <div className="input-wrapper">
//           <textarea
//             placeholder="Type your message..."
//             name="message"
//             id="message"
//             rows={1}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             value={message}
//             className="message-input"
//           />
//           <button onClick={sendMessage} type="submit" className="send-button" disabled={!message.trim()}>
//             <IoSend size={25} />
//             <span className="sr-only">Send</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Chat;