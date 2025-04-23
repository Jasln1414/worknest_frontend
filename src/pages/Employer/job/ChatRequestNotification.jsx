// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Modal, Button, Spinner } from 'react-bootstrap';
// import { FaBell } from 'react-icons/fa';
// import './EmployerApprovals.css';

// const ChatRequestNotification = () => {
//   const [pendingCount, setPendingCount] = useState(0);
//   const [showModal, setShowModal] = useState(false);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [actionLoading, setActionLoading] = useState({});
//   const [error, setError] = useState(null);
  
//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');

//   // Check for pending requests initially and set up interval
//   useEffect(() => {
//     checkPendingCount();
    
//     // Poll for new requests every 2 minutes
//     const interval = setInterval(checkPendingCount, 120000);
    
//     return () => clearInterval(interval);
//   }, []);

//   // Check pending count
//   const checkPendingCount = async () => {
//     try {
//       const response = await axios.get(`${baseURL}/api/empjob/employer_approvals/count/`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         },
//       });
      
//       setPendingCount(response.data.count || 0);
//     } catch (error) {
//       console.error('Error checking pending count:', error);
//     }
//   };

//   // Fetch requests when modal opens
//   const handleOpenModal = async () => {
//     setShowModal(true);
//     fetchRequests();
//   };

//   // Close modal
//   const handleCloseModal = () => {
//     setShowModal(false);
//   };

//   // Fetch requests
//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${baseURL}/api/empjob/employer_approvals/`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         },
//       });
      
//       // Format the data for display
//       const formattedRequests = response.data.map(request => ({
//         ...request,
//         candidate_name: request.candidate.user.get_full_name() || request.candidate.user.username,
//         job_title: request.job.title,
//       }));
      
//       setRequests(formattedRequests);
//       setError(null);
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//       setError('Failed to load requests. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle approval/rejection of chat request
//   const handleRequestAction = async (approvalId, action) => {
//     try {
//       setActionLoading(prev => ({ ...prev, [approvalId]: true }));
      
//       await axios.post(
//         `${baseURL}/api/empjob/manage_chat_request/${approvalId}/`,
//         { action },
//         {
//           headers: { 
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           },
//         }
//       );
      
//       // Update local state to remove the handled request
//       setRequests(prev => prev.filter(req => req.id !== approvalId));
//       setPendingCount(prev => prev - 1);
//     } catch (error) {
//       console.error(`Error ${action}ing request:`, error);
//       setError(`Failed to ${action} request. Please try again.`);
//     } finally {
//       setActionLoading(prev => ({ ...prev, [approvalId]: false }));
//     }
//   };

//   // Check chat status for a specific job
//   const checkChatStatus = async (jobId) => {
//     try {
//       const response = await axios.get(`${baseURL}/api/empjob/check_chat_status/${jobId}/`, {
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json'
//         },
//       });
      
//       return response.data.status;
//     } catch (error) {
//       console.error('Error checking chat status:', error);
//       return null;
//     }
//   };

//   return (
//     <div className="chat-request-notification">
//       <button 
//         className="notification-bell" 
//         onClick={handleOpenModal}
//         aria-label="Chat requests"
//       >
//         <FaBell size={20} />
//         {pendingCount > 0 && (
//           <span className="badge">{pendingCount}</span>
//         )}
//       </button>

//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Chat Requests ({pendingCount})</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {loading ? (
//             <div className="text-center">
//               <Spinner animation="border" />
//               <p>Loading requests...</p>
//             </div>
//           ) : error ? (
//             <div className="alert alert-danger">{error}</div>
//           ) : requests.length === 0 ? (
//             <p className="text-center">No pending chat requests</p>
//           ) : (
//             <ul className="request-list">
//               {requests.map(request => (
//                 <li key={request.id} className="request-item">
//                   <div className="request-info">
//                     <h5>{request.candidate_name}</h5>
//                     <p>Job: {request.job_title}</p>
//                     <p>Requested: {new Date(request.created_at).toLocaleString()}</p>
//                   </div>
//                   <div className="request-actions">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleRequestAction(request.id, 'approve')}
//                       disabled={actionLoading[request.id]}
//                     >
//                       {actionLoading[request.id] ? (
//                         <Spinner animation="border" size="sm" />
//                       ) : (
//                         'Approve'
//                       )}
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => handleRequestAction(request.id, 'reject')}
//                       disabled={actionLoading[request.id]}
//                     >
//                       {actionLoading[request.id] ? (
//                         <Spinner animation="border" size="sm" />
//                       ) : (
//                         'Reject'
//                       )}
//                     </Button>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ChatRequestNotification;