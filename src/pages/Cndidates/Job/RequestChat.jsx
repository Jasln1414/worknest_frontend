// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import './request.css';

// const RequestModal = ({ jobId, employerName, jobTitle, onClose, onChatApproved }) => {
//   const [requestSent, setRequestSent] = useState(false);
//   const [chatApproved, setChatApproved] = useState(false);
//   const [chatRejected, setChatRejected] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [statusCheckError, setStatusCheckError] = useState(null);
//   const [error, setError] = useState('');
//   const isMounted = useRef(true);
//   const pollingIntervalRef = useRef(null);

//   const baseURL = "http://127.0.0.1:8000";
//   const token = localStorage.getItem('access');

//   const getCSRFToken = () => {
//     return document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
//   };

//   useEffect(() => {
//     checkInitialStatus();

//     // Start polling if request is sent
//     if (requestSent && !chatApproved && !chatRejected) {
//       startPolling();
//     }

//     return () => {
//       isMounted.current = false;
//       stopPolling();
//     };
//   }, [jobId, requestSent, chatApproved, chatRejected]);

//   const startPolling = () => {
//     if (pollingIntervalRef.current) return; // Avoid multiple intervals
//     pollingIntervalRef.current = setInterval(() => {
//       checkChatStatus(true); // Silent polling
//     }, 15000); // Check every 15 seconds
//   };

//   const stopPolling = () => {
//     if (pollingIntervalRef.current) {
//       clearInterval(pollingIntervalRef.current);
//       pollingIntervalRef.current = null;
//     }
//   };

//   const checkInitialStatus = async () => {
//     const storedRequestStatus = localStorage.getItem(`chat_request_${jobId}`);
//     if (storedRequestStatus) {
//       setRequestSent(storedRequestStatus === 'sent');
//       setChatApproved(storedRequestStatus === 'approved');
//       setChatRejected(storedRequestStatus === 'rejected');
//       if (storedRequestStatus === 'approved' && onChatApproved) onChatApproved();
//     }
//     await checkChatStatus(true); // Silent check on mount
//   };

//   const handleRequest = async () => {
//     setError('');
//     try {
//       setIsLoading(true);
//       const response = await axios.post(
//         `${baseURL}/api/empjob/request_chat/${jobId}/`,
//         {},
//         { 
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//             'X-CSRFToken': getCSRFToken(),
//           },
//           withCredentials: true,
//         }
//       );

//       if (response.data?.detail === 'Chat already approved.') {
//         handleApproval();
//         return;
//       }

//       setRequestSent(true);
//       setChatApproved(false);
//       setChatRejected(false);
//       localStorage.setItem(`chat_request_${jobId}`, 'sent');
//       Swal.fire('Request Sent', 'Your chat request has been sent to the employer.', 'success');
//       startPolling();
//     } catch (error) {
//       handleRequestError(error);
//     } finally {
//       if (isMounted.current) setIsLoading(false);
//     }
//   };

//   const handleApproval = () => {
//     setChatApproved(true);
//     setRequestSent(false);
//     setChatRejected(false);
//     localStorage.setItem(`chat_request_${jobId}`, 'approved');
//     Swal.fire('Approved', 'Your chat request has been approved by the employer!', 'success');
//     if (onChatApproved) onChatApproved();
//     stopPolling();
//   };

//   const handleRequestError = (error) => {
//     if (error.response?.data?.detail?.includes('already approved')) {
//       handleApproval();
//     } else {
//       const errorMsg = error.response?.data?.detail || 'Failed to send request.';
//       setError(errorMsg);
//       Swal.fire('Error', errorMsg, 'error');
//     }
//   };

//   const checkChatStatus = async (silent = false) => {
//     if (!isMounted.current || isLoading) return;

//     try {
//       setIsLoading(true);
//       setStatusCheckError(null);
//       const response = await axios.get(
//         `${baseURL}/api/empjob/check_chat_status/${jobId}/`,
//         { 
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'X-CSRFToken': getCSRFToken(),
//           },
//           withCredentials: true,
//         }
//       );

//       const chatData = response.data.chat || response.data;
//       handleStatusResponse(chatData, silent);
//     } catch (error) {
//       console.error('Error checking chat status:', error);
//       setStatusCheckError('Unable to check status. Please try again later.');
//       if (!silent) Swal.fire('Error', 'Unable to check status. Please try again later.', 'error');
//     } finally {
//       if (isMounted.current) setIsLoading(false);
//     }
//   };

//   const handleStatusResponse = (chatData, silent) => {
//     if (chatData.approved) {
//       setChatApproved(true);
//       setRequestSent(false);
//       setChatRejected(false);
//       localStorage.setItem(`chat_request_${jobId}`, 'approved');
//       if (!silent) Swal.fire('Approved', 'Your chat request has been approved by the employer!', 'success');
//       if (onChatApproved) onChatApproved();
//       stopPolling();
//     } else if (chatData.rejected) {
//       setChatRejected(true);
//       setRequestSent(false);
//       setChatApproved(false);
//       localStorage.setItem(`chat_request_${jobId}`, 'rejected');
//       if (!silent) Swal.fire('Rejected', 'Your chat request has been rejected by the employer.', 'info');
//       stopPolling();
//     } else if (chatData.requested) {
//       setRequestSent(true);
//       setChatApproved(false);
//       setChatRejected(false);
//       localStorage.setItem(`chat_request_${jobId}`, 'sent');
//       if (!silent) Swal.fire('Pending', 'Your chat request is still pending approval.', 'info');
//     } else {
//       setRequestSent(false);
//       setChatApproved(false);
//       setChatRejected(false);
//       localStorage.removeItem(`chat_request_${jobId}`);
//       if (!silent) Swal.fire('No Request', 'No active chat request found.', 'info');
//       stopPolling();
//     }
//   };

//   const resetRequest = () => {
//     localStorage.removeItem(`chat_request_${jobId}`);
//     setRequestSent(false);
//     setChatApproved(false);
//     setChatRejected(false);
//     setStatusCheckError(null);
//     Swal.fire('Reset', 'Chat request has been reset. You can send a new request.', 'info');
//     stopPolling();
//   };

//   return (
//     <div className="request-modal-overlay" onClick={(e) => e.target.className === 'request-modal-overlay' && onClose()}>
//       <div className="request-modal-container">
//         <button className="request-modal-close" onClick={onClose}>×</button>
        
//         <div className="request-modal-header">
//           <h2>Connect with Employer</h2>
//           <div className="request-modal-job-info">
//             <h3>{jobTitle}</h3>
//             <p>{employerName}</p>
//           </div>
//         </div>
        
//         <div className="request-modal-content">
//           {error && <div className="request-error">{error}</div>}
          
//           {chatApproved ? (
//             <div className="request-status approved">
//               <div className="status-icon">
//                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M7.75 12L10.58 14.83L16.25 9.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//               <h3>Your chat request is approved!</h3>
//               <p>You can now communicate directly with the employer.</p>
//               <button 
//                 className="request-modal-btn primary" 
//                 onClick={() => {
//                   if (onChatApproved) onChatApproved();
//                   else onClose();
//                 }}
//               >
//                 Start Chatting
//               </button>
//             </div>
//           ) : chatRejected ? (
//             <div className="request-status rejected">
//               <div className="status-icon">
//                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M15 9L9 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M15 15L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//               <h3>Request Rejected</h3>
//               <p>Unfortunately, your chat request has been declined by the employer.</p>
//               <div className="request-modal-actions">
//                 <button 
//                   className="request-modal-btn secondary" 
//                   onClick={resetRequest}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? <span className="loading-spinner-small"></span> : 'Create New Request'}
//                 </button>
//                 <button 
//                   className="request-modal-btn outline" 
//                   onClick={onClose}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           ) : requestSent ? (
//             <div className="request-status pending">
//               <div className="status-icon">
//                 <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M12 6V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M16 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//               </div>
//               <h3>Request Pending</h3>
//               <p>Your chat request has been sent to the employer and is awaiting approval.</p>
              
//               {statusCheckError && <div className="request-warning">{statusCheckError}</div>}
              
//               <div className="request-modal-actions">
//                 <button 
//                   className="request-modal-btn secondary" 
//                   onClick={() => checkChatStatus(false)} 
//                   disabled={isLoading}
//                 >
//                   {isLoading ? <span className="loading-spinner-small"></span> : 'Check Status'}
//                 </button>
//                 <button 
//                   className="request-modal-btn outline" 
//                   onClick={onClose}
//                 >
//                   Close
//                 </button>
//               </div>
//               <div className="request-secondary-actions">
//                 <button 
//                   className="request-text-btn"
//                   onClick={resetRequest}
//                   disabled={isLoading}
//                 >
//                   Cancel Request
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="request-new">
//               <div className="request-info">
//                 <div className="info-icon">
//                   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                     <path d="M12 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                     <path d="M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </div>
//                 <div>
//                   <h3>Request Chat</h3>
//                   <p>Connect directly with the employer to discuss the job opportunity.</p>
//                 </div>
//               </div>
              
//               <div className="request-modal-actions">
//                 <button 
//                   className="request-modal-btn primary" 
//                   onClick={handleRequest}
//                   disabled={isLoading}
//                 >
//                   {isLoading ? <span className="loading-spinner-small"></span> : 'Send Request'}
//                 </button>
//                 <button 
//                   className="request-modal-btn outline" 
//                   onClick={onClose}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RequestModal;