// // ChatApprovalList.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ChatApprovalList = () => {
//   const [chatRequests, setChatRequests] = useState([]);
//   const baseURL = "http://127.0.0.1:8000";


//   useEffect(() => {
//     fetchPendingChatRequests();
//   }, []);

//   const fetchPendingChatRequests = async () => {
//     try {
//       const response = await axios.get(`${baseURL}/api/empjob/approvals/`, {  // Adjust endpoint as needed
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setChatRequests(response.data.filter(a => a.is_requested && !a.is_approved));
//     } catch (error) {
//       console.error('Error fetching chat requests:', error);
//     }
//   };

//   const approveChat = async (approvalId) => {
//     try {
//       await axios.post(`${baseURL}/api/empjob/approve/${approvalId}/`, {}, {
        
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       setChatRequests(chatRequests.filter(a => a.id !== approvalId));
//     } catch (error) {
//       console.error('Error approving chat:', error);
//     }
//   };

//   return (
//     <div>
//       <h2>Pending Chat Requests</h2>
//       {chatRequests.map(request => (
//         <div key={request.id}>
//           <p>Candidate: {request.candidate.user.full_name} for Job: {request.job.title}</p>
//           <button onClick={() => approveChat(request.id)}>Approve Chat</button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ChatApprovalList;