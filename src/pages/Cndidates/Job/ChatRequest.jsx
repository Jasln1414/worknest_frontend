// // // ChatRequestButton.jsx
// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';

// // const ChatRequestButton = ({ jobId, onChatApproved }) => {
// //   const [chatStatus, setChatStatus] = useState({});
// //   const [loading, setLoading] = useState(false);
// //   const baseURL = "http://127.0.0.1:8000";

// //   useEffect(() => {
// //     console.log('ChatRequestButton mounted, jobId:', jobId); // Debug log
// //     checkChatStatus();
// //   }, [jobId]);

// //   const checkChatStatus = async () => {
// //     try {
// //       console.log('Checking chat status for jobId:', jobId); // Debug log
// //       const response = await axios.get(`${baseURL}/api/empjob/status/${jobId}/`, {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
// //       });
// //       console.log('Chat status response:', response.data); // Debug log
// //       setChatStatus(response.data);
// //       if (response.data.is_approved) {
// //         console.log('Chat approved, calling onChatApproved'); // Debug log
// //         onChatApproved();
// //       }
// //     } catch (error) {
// //       console.error('Error checking chat status:', error.response?.data || error.message);
// //     }
// //   };

// //   const requestChat = async () => {
// //     console.log('Chat request button clicked, jobId:', jobId); // Debug log
// //     setLoading(true);
// //     try {
// //       const response = await axios.post(`${baseURL}/api/empjob/request/${jobId}/`, {}, {
// //         headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
// //       });
// //       console.log('Chat request response:', response.data); // Debug log
// //       setChatStatus(response.data);
// //       if (response.data.is_approved) {
// //         console.log('Chat approved after request, calling onChatApproved'); // Debug log
// //         onChatApproved();
// //       }
// //     } catch (error) {
// //       console.error('Chat request failed:', error.response?.data || error.message);
// //     }
// //     setLoading(false);
// //   };

// //   if (chatStatus.is_approved) {
// //     return <button onClick={onChatApproved}>Open Chat</button>;
// //   }

// //   return (
// //     <button 
// //       onClick={requestChat} 
// //       disabled={loading || chatStatus.is_requested}
// //     >
// //       {loading ? 'Requesting...' : 
// //        chatStatus.is_requested ? 'Chat Requested' : 
// //        'Request Chat'}
// //     </button>
// //   );
// // };

// // export default ChatRequestButton;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ChatRequestButton = ({ jobId, onChatApproved }) => {
//   const [chatStatus, setChatStatus] = useState({});
//   const [loading, setLoading] = useState(false);
//   const baseURL = "http://127.0.0.1:8000";

//   useEffect(() => {
//     let isMounted = true;
//     console.log('ChatRequestButton mounted, jobId:', jobId);

//     const checkChatStatus = async () => {
//       if (!jobId) {
//         console.error('No jobId provided');
//         return;
//       }
//       try {
//         console.log('Checking chat status for jobId:', jobId);
//         const response = await axios.get(`${baseURL}/api/empjob/status/${jobId}/`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
//         });
//         console.log('Chat status response:', response.data);
//         if (isMounted) {
//           setChatStatus(response.data);
//         }
//       } catch (error) {
//         console.error('Error checking chat status:', error.response?.data || error.message);
//       }
//     };

//     checkChatStatus();

//     return () => {
//       isMounted = false;
//     };
//   }, [jobId]);

//   const requestChat = async () => {
//     if (!jobId) {
//       console.error('No jobId provided');
//       return;
//     }
    
//     console.log('Chat request button clicked, jobId:', jobId);
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `${baseURL}/api/empjob/request/${jobId}/`, 
//         {},
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('access')}` }
//         }
//       );
//       console.log('Chat request response:', response.data);
//       setChatStatus(response.data);
//     } catch (error) {
//       console.error('Chat request failed:', error.response?.data || error.message);
//     }
//     setLoading(false);
//   };

//   if (chatStatus.is_approved) {
//     return <button onClick={onChatApproved}>Open Chat</button>;
//   }

//   return (
//     <button 
//       onClick={requestChat} 
//       disabled={loading || chatStatus.is_requested}
//     >
//       {loading ? 'Requesting...' : 
//        chatStatus.is_requested ? 'Chat Requested' : 
//        'Request Chat'}
//     </button>
//   );
// };

// export default ChatRequestButton;