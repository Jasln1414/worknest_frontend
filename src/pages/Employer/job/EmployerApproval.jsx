// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faComments, faCheckCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons'; // Replaced faBell with faComments
// import Swal from 'sweetalert2';
// import './EmployerApprovals.css';

// const CustomModal = ({ show, onClose, title, children, footer, size = 'md' }) => {
//   const modalRef = useRef(null);
//   useEffect(() => {
//     const handleEscape = (e) => e.key === 'Escape' && onClose();
//     const handleClickOutside = (e) => modalRef.current && !modalRef.current.contains(e.target) && onClose();
//     if (show) {
//       document.addEventListener('keydown', handleEscape);
//       document.addEventListener('mousedown', handleClickOutside);
//       document.body.style.overflow = 'hidden';
//     }
//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.body.style.overflow = 'unset';
//     };
//   }, [show, onClose]);
//   if (!show) return null;
//   return (
//     <div className="custom-modal-overlay">
//       <div ref={modalRef} className={`custom-modal custom-modal-${size}`}>
//         <div className="custom-modal-header">
//           <h3 className="custom-modal-title">{title}</h3>
//           <button className="custom-modal-close" onClick={onClose}>
//             <FontAwesomeIcon icon={faTimes} />
//           </button>
//         </div>
//         <div className="custom-modal-body">{children}</div>
//         <div className="custom-modal-footer">{footer}</div>
//       </div>
//     </div>
//   );
// };

// const Alert = ({ variant, children, onClose, dismissible }) => (
//   <div className={`custom-alert custom-alert-${variant}`}>
//     {children}
//     {dismissible && (
//       <button className="custom-alert-close" onClick={onClose}>
//         <FontAwesomeIcon icon={faTimes} />
//       </button>
//     )}
//   </div>
// );

// const Badge = ({ children }) => <span className="custom-badge">{children}</span>;
// const Button = ({ variant, onClick, disabled, className, children }) => (
//   <button className={`custom-btn custom-btn-${variant} ${className || ''}`} onClick={onClick} disabled={disabled}>
//     {children}
//   </button>
// );
// const Spinner = ({ size = 'md' }) => <div className={`custom-spinner custom-spinner-${size}`}></div>;
// const Table = ({ children }) => <table className="custom-table">{children}</table>;

// const EmployerApprovals = ({ jobId, jobTitle, isEmployer = true }) => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [actionLoading, setActionLoading] = useState({});
//   const [showModal, setShowModal] = useState(false);
//   const [unreadCount, setUnreadCount] = useState(0);

//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');
//   const userId = localStorage.getItem('user_id');

//   const getCSRFToken = () => document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];

//   const checkChatStatus = async () => {
//     if (!isEmployer) return;
//     try {
//       const url = jobId ? `${baseURL}/api/empjob/check_chat_status/${jobId}/` : `${baseURL}/api/empjob/check_chat_status/`;
//       const response = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}`, 'X-CSRFToken': getCSRFToken() },
//         withCredentials: true,
//       });
//       if (response.data?.unread_count !== undefined) setUnreadCount(response.data.unread_count);
//     } catch (error) {
//       console.error('Error checking chat status:', error);
//     }
//   };

//   useEffect(() => {
//     if (showModal) fetchRequests();
//     if (isEmployer) {
//       const interval = setInterval(checkChatStatus, 30000);
//       checkChatStatus();
//       return () => clearInterval(interval);
//     }
//   }, [showModal, jobId, isEmployer]);

//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const url = jobId ? `${baseURL}/api/empjob/employer_approvals/?job=${jobId}` : `${baseURL}/api/empjob/employer_approvals/`;
//       const response = await axios.get(url, {
//         headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'X-CSRFToken': getCSRFToken() },
//         withCredentials: true,
//       });
//       const formattedRequests = response.data.map((req) => ({
//         ...req,
//         formattedDate: new Date(req.requested_at).toLocaleString(),
//       }));
//       setRequests(formattedRequests);
//     } catch (error) {
//       setError(error.response?.data?.detail || 'Failed to fetch chat requests.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAction = async (approvalId, action) => {
//     setActionLoading((prev) => ({ ...prev, [approvalId]: true }));
//     try {
//       await axios.post(
//         `${baseURL}/api/empjob/manage_chat_request/${approvalId}/`,
//         { action },
//         {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
//           withCredentials: true,
//         }
//       );
//       setRequests(requests.filter((req) => req.id !== approvalId));
//       setUnreadCount((prev) => Math.max(0, prev - 1));
//       Swal.fire('Success', `Chat request ${action}d successfully!`, 'success');
//     } catch (error) {
//       setError(error.response?.data?.detail || `Failed to ${action} the request.`);
//       Swal.fire('Error', `Failed to ${action} the request.`, 'error');
//     } finally {
//       setActionLoading((prev) => ({ ...prev, [approvalId]: false }));
//     }
//   };

//   const requestChat = async (jobId) => {
//     try {
//       setLoading(true);
//       await axios.post(
//         `${baseURL}/api/empjob/request_chat/${jobId}/`, // Updated to match your backend endpoint
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
//           withCredentials: true,
//         }
//       );
//       setError({ type: 'success', message: 'Chat request sent successfully!' });
//       Swal.fire('Success', 'Chat request sent successfully!', 'success');
//       setTimeout(() => setShowModal(false), 2000);
//     } catch (error) {
//       setError({ type: 'error', message: error.response?.data?.detail || 'Failed to send chat request.' });
//       Swal.fire('Error', error.response?.data?.detail || 'Failed to send chat request.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleShowModal = () => {
//     setShowModal(true);
//     if (isEmployer) setUnreadCount(0);
//   };

//   const renderModalTitle = () => (
//     <div className="modal-title-container">
//       <FontAwesomeIcon icon={isEmployer ? faComments : faCheckCircle} className="modal-title-icon" /> {/* Changed faBell to faComments */}
//       <span>{isEmployer ? `Chat Requests for: ${jobTitle || 'All Jobs'}` : `Request Chat for: ${jobTitle || 'Job'}`}</span>
//       {isEmployer && requests.length > 0 && <Badge>{requests.length}</Badge>}
//     </div>
//   );

//   const renderModalFooter = () => (
//     <>
//       {isEmployer && (
//         <Button variant="outline" onClick={fetchRequests} disabled={loading}>
//           {loading ? <Spinner size="sm" /> : 'Refresh'}
//         </Button>
//       )}
//       <Button variant="secondary" onClick={() => setShowModal(false)}>
//         Close
//       </Button>
//     </>
//   );

//   return (
//     <div className="employer-approvals">
//       {isEmployer && (
//         <div className="notification-bell" onClick={handleShowModal}>
//           <FontAwesomeIcon icon={faComments} size="lg" className="bell-icon" /> {/* Changed faBell to faComments */}
//           {(requests.length > 0 || unreadCount > 0) && <Badge>{requests.length + unreadCount}</Badge>}
//         </div>
//       )}
//       {!isEmployer && jobId && (
//         <div className="chat-request-btn" onClick={handleShowModal}>
//           <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
//           Request Chat
//         </div>
//       )}
//       <CustomModal
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         title={renderModalTitle()}
//         footer={renderModalFooter()}
//         size={isEmployer ? 'lg' : 'md'}
//       >
//         {error && (
//           <Alert variant={error.type === 'success' ? 'success' : 'danger'} onClose={() => setError(null)} dismissible>
//             {error.message}
//           </Alert>
//         )}
//         {isEmployer ? (
//           loading && requests.length === 0 ? (
//             <div className="loading-container">
//               <Spinner />
//               <p>Loading requests...</p>
//             </div>
//           ) : requests.length === 0 ? (
//             <Alert variant="info">No pending chat requests {jobId ? 'for this job' : 'at this time'}.</Alert>
//           ) : (
//             <div className="table-responsive">
//               <Table>
//                 <thead>
//                   <tr>
//                     <th>Candidate</th>
//                     <th>Job</th>
//                     <th>Requested</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((req) => (
//                     <tr key={req.id}>
//                       <td>
//                         <div className="candidate-info">
//                           <div className="candidate-avatar">{req.candidate_name?.charAt(0).toUpperCase()}</div>
//                           <div>{req.candidate_name}</div>
//                         </div>
//                       </td>
//                       <td>{req.job_title || `Job #${req.job}`}</td>
//                       <td>{req.formattedDate}</td>
//                       <td>
//                         <div className="action-buttons">
//                           <Button
//                             variant="success"
//                             onClick={() => handleAction(req.id, 'approve')}
//                             disabled={actionLoading[req.id]}
//                           >
//                             {actionLoading[req.id] ? (
//                               <Spinner size="sm" />
//                             ) : (
//                               <>
//                                 <FontAwesomeIcon icon={faCheckCircle} className="btn-icon" /> Approve
//                               </>
//                             )}
//                           </Button>
//                           <Button
//                             variant="danger"
//                             onClick={() => handleAction(req.id, 'reject')}
//                             disabled={actionLoading[req.id]}
//                           >
//                             {actionLoading[req.id] ? (
//                               <Spinner size="sm" />
//                             ) : (
//                               <>
//                                 <FontAwesomeIcon icon={faTimesCircle} className="btn-icon" /> Reject
//                               </>
//                             )}
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           )
//         ) : (
//           <div className="request-chat-container">
//             <p>Would you like to request to chat with the employer about this job?</p>
//             <Button variant="primary" onClick={() => requestChat(jobId)} disabled={loading}>
//               {loading ? <Spinner size="sm" /> : 'Send Chat Request'}
//             </Button>
//           </div>
//         )}
//       </CustomModal>
//     </div>
//   );
// };

// export default EmployerApprovals;