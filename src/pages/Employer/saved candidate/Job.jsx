// // import React, { useState, useEffect } from 'react';
// // import { useDispatch } from 'react-redux';
// // import { setCurrentCandidate } from './../../../Redux/Status/StatusSlice';
// // import axios from 'axios';
// // import Swal from 'sweetalert2';
// // import ChatModal from '../job/ChatModal';
// // import Pagination from '../../Cndidates/utilities/Paginations';
// // import { useNavigate } from 'react-router-dom';
// // import '../job/style/Candidateview.css';


// // function ApplyCard({ selectedJob, setChange, fetchJobDetails }) {
// //   const baseURL = 'http://127.0.0.1:8000';
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const [showChatModal, setShowChatModal] = useState(null);
// //   const [isButtonDisabled, setIsButtonDisabled] = useState({});
// //   const [applications, setApplications] = useState(selectedJob?.applications || []);
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const candidatesPerPage = 3;

// //   // Reset currentPage when selectedJob changes
// //   useEffect(() => {
// //     setCurrentPage(1);
// //   }, [selectedJob]);

// //   useEffect(() => {
// //     setApplications(selectedJob?.applications || []);
// //   }, [selectedJob]);

// //   // // Validate and refresh token
// //   // const getToken = async () => {
// //   //   let token = localStorage.getItem('access');
// //   //   if (!token) {
// //   //     Swal.fire({
// //   //       icon: 'error',
// //   //       title: 'Session Expired',
// //   //       text: 'Please log in again.',
// //   //       timer: 1500,
// //   //       willClose: () => navigate('/login'),
// //   //     });
// //   //     return null;
// //   //   }

// //   //   try {
// //   //     await axios.get(`${baseURL}/api/user/`, {
// //   //       headers: { Authorization: `Bearer ${token}` },
// //   //     });
// //   //     return token;
// //   //   } catch (error) {
// //   //     if (error.response?.status === 401 || error.response?.status === 403) {
// //   //       const refresh = localStorage.getItem('refresh');
// //   //       if (refresh) {
// //   //         try {
// //   //           const refreshResponse = await axios.post(`${baseURL}/api/token/refresh/`, { refresh });
// //   //           token = refreshResponse.data.access;
// //   //           localStorage.setItem('access', token);
// //   //           return token;
// //   //         } catch (refreshError) {
// //   //           console.error('Token refresh failed:', refreshError);
// //   //           Swal.fire({
// //   //             icon: 'error',
// //   //             title: 'Session Expired',
// //   //             text: 'Please log in again.',
// //   //             timer: 1500,
// //   //             willClose: () => navigate('/login'),
// //   //           });
// //   //           return null;
// //   //         }
// //   //       } else {
// //   //         Swal.fire({
// //   //           icon: 'error',
// //   //           title: 'Session Expired',
// //   //           text: 'Please log in again.',
// //   //           timer: 1500,
// //   //           willClose: () => navigate('/login'),
// //   //         });
// //   //         return null;
// //   //       }
// //   //     }
// //   //     return token;
// //   //   }
// //   // };

// //   const openChatModal = (data) => {
// //     setShowChatModal(data);
// //   };

// //   const updateApplicationStatus = async (applicationId, jobId, currentStatus) => {
// //     if (currentStatus !== 'Application Send') {
// //       return false;
// //     }

// //     // const token = await getToken();
// //     // if (!token) return false;

// //     setIsButtonDisabled((prev) => ({ ...prev, [applicationId]: true }));

// //     try {
// //       Swal.fire({
// //         title: 'Updating Status...',
// //         text: 'Please wait',
// //         allowOutsideClick: false,
// //         didOpen: () => {
// //           Swal.showLoading();
// //         },
// //       });

// //       const response = await axios.post(
// //         `${baseURL}/api/empjob/applicationStatus/${applicationId}/`,
// //         { action: 'Application Viewed', job_id: jobId },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //             Accept: 'application/json',
// //             'Content-Type': 'application/json',
// //           },
// //         }
// //       );

// //       if (response.status === 200) {
// //         setApplications((prev) =>
// //           prev.map((app) =>
// //             app.id === applicationId ? { ...app, status: 'Application Viewed' } : app
// //           )
// //         );

// //         if (fetchJobDetails) {
// //           fetchJobDetails();
// //         }

// //         Swal.fire({
// //           icon: 'success',
// //           title: 'Status Updated',
// //           text: 'Application status changed to Viewed.',
// //           showConfirmButton: false,
// //           timer: 1500,
// //         });

// //         return true;
// //       }
// //     } catch (error) {
// //       console.error('Error updating status:', error);
// //       let errorMessage = 'Failed to update status.';
// //       if (error.response?.status === 403 || error.response?.status === 401) {
// //         errorMessage = 'You do not have permission to update status. Please log in again.';
// //         Swal.fire({
// //           icon: 'error',
// //           title: 'Permission Denied',
// //           text: errorMessage,
// //           timer: 1500,
// //           willClose: () => navigate('/login'),
// //         });
// //       } else {
// //         Swal.fire({
// //           icon: 'error',
// //           title: 'Error',
// //           text: error.response?.data?.error || errorMessage,
// //           showConfirmButton: false,
// //           timer: 1500,
// //         });
// //       }
// //       return false;
// //     } finally {
// //       setIsButtonDisabled((prev) => ({ ...prev, [applicationId]: false }));
// //     }
// //   };

// //   const handleViewClick = async (data) => {
// //     const updated = await updateApplicationStatus(data.id, selectedJob.id, data.status);
// //     dispatch(setCurrentCandidate(updated ? { ...data, status: 'Application Viewed' } : data));
// //     setChange(false);
// //   };

// //   // Pagination logic
// //   const totalPages = Math.ceil(applications.length / candidatesPerPage);
// //   const indexOfLastCandidate = currentPage * candidatesPerPage;
// //   const indexOfFirstCandidate = indexOfLastCandidate - candidatesPerPage;
// //   const currentCandidates = applications.slice(indexOfFirstCandidate, indexOfLastCandidate);

// //   const handlePageChange = (pageNumber) => {
// //     setCurrentPage(pageNumber);
// //   };

// //   if (!selectedJob || !applications.length) {
// //     return <div className="job-app-no-applications">No applications available</div>;
// //   }

// //   // Normalize status for CSS class
// //   const normalizeStatusClass = (status) => {
// //     return status
// //       ? status.toLowerCase().replace(/\s+/g, '-')
// //       : 'application-send';
// //   };

// //   return (
// //     <div className="job-app-apply-card-container">
// //       {currentCandidates.map((data) => (
// //         <div key={data.id} className="job-app-application-card">
// //           <div className="job-app-application-card-header">
// //             <div className="job-app-candidate-info">
// //               <div className="job-app-profile-pic-container">
// //                 <img
// //                   src={data.candidate?.profile_pic ? `${baseURL}${data.candidate.profile_pic}` : '/default-profile.png'}
// //                   alt="Profile"
// //                   className="job-app-profile-pic"
// //                 />
// //               </div>
// //               <div className="job-app-candidate-details">
// //                 <span className="job-app-candidate-name">{data.candidate?.user_name || 'N/A'}</span>
// //                 <span className="job-app-candidate-education">
// //                   {data.candidate?.education?.[0]?.education || 'N/A'}
// //                 </span>
// //                 <span className="job-app-candidate-status">
// //                   Status:{' '}
// //                   <span className={`job-app-status-${normalizeStatusClass(data.status)}`}>
// //                     {data.status || 'Application Send'}
// //                   </span>
// //                 </span>
// //               </div>
// //             </div>
// //             <div className="job-app-action-container">
// //               <button
// //                 className="job-app-action-button job-app-chat-button"
// //                 onClick={() => openChatModal(data)}
// //                 disabled={isButtonDisabled[data.id]}
// //               >
// //                 Chat
// //               </button>
// //               <button
// //                 className="job-app-action-button job-app-view-button"
// //                 onClick={() => handleViewClick(data)}
// //                 disabled={isButtonDisabled[data.id]}
// //               >
// //                 View
// //               </button>
// //             </div>
// //           </div>
// //           {showChatModal && showChatModal.id === data.id && (
// //             <ChatModal
// //               setChat={setShowChatModal}
// //               profile_pic={
// //                 data.candidate?.profile_pic ? `${baseURL}${data.candidate.profile_pic}` : '/default-profile.png'
// //               }
// //               userName={data.candidate?.user_name || 'N/A'}
// //               emp_name={selectedJob?.employer_name || 'Employer'}
// //               candidate_id={data.candidate?.id}
// //               employer_id={selectedJob?.employer_id || localStorage.getItem('user_id')}
// //               senderName={selectedJob?.employer_name || 'Employer'}
// //               currentUserId={selectedJob?.employer_id || localStorage.getItem('user_id')}
// //               receiverId={data.candidate?.user}
// //             />
// //           )}
// //         </div>
// //       ))}
// //       <div className="job-app-pagination-container">
// //         <span className="job-app-pagination-count">
// //           Showing {indexOfFirstCandidate + 1}-{Math.min(indexOfLastCandidate, applications.length)} of {applications.length} candidates
// //         </span>
// //         <div className="job-app-pagination">
// //           <button
// //             className={`job-app-pagination-button ${currentPage === 1 ? 'job-app-pagination-disabled' : ''}`}
// //             onClick={() => handlePageChange(currentPage - 1)}
// //             disabled={currentPage === 1}
// //           >
// //             Previous
// //           </button>
// //           {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
// //             <button
// //               key={number}
// //               className={`job-app-pagination-button ${currentPage === number ? 'job-app-pagination-active' : ''}`}
// //               onClick={() => handlePageChange(number)}
// //             >
// //               {number}
// //             </button>
// //           ))}
// //           <button
// //             className={`job-app-pagination-button ${currentPage === totalPages ? 'job-app-pagination-disabled' : ''}`}
// //             onClick={() => handlePageChange(currentPage + 1)}
// //             disabled={currentPage === totalPages}
// //           >
// //             Next
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ApplyCard;

















// import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { setCurrentCandidate } from './../../../Redux/Status/StatusSlice';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import ChatModal from '../job/ChatModal';
// import Pagination from '../../Cndidates/utilities/Paginations';
// import { useNavigate } from 'react-router-dom';
// import '../job/style/jobdetail.css';
// import '../job/style/AppliedCandidate.css';
// import PropTypes from 'prop-types';

// function ApplyCard({ selectedJob, setChange, fetchJobDetails }) {
//   const baseURL = 'http://127.0.0.1:8000';
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [showChatModal, setShowChatModal] = useState(null);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(new Set());
//   const [currentPage, setCurrentPage] = useState(1);
//   const candidatesPerPage = 3;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedJob]);

//   const getToken = async () => {
//     let token = localStorage.getItem('access');
//     if (!token) {
//       Swal.fire({
//         icon: 'error',
//         title: 'Session Expired',
//         text: 'Please log in again.',
//         timer: 1500,
//         willClose: () => navigate('/login'),
//       });
//       return null;
//     }

//     try {
//       await axios.get(`${baseURL}/api/user/`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return token;
//     } catch (error) {
//       if (error.response?.status === 401 || error.response?.status === 403) {
//         const refresh = localStorage.getItem('refresh');
//         if (refresh) {
//           try {
//             const refreshResponse = await axios.post(`${baseURL}/api/token/refresh/`, { refresh });
//             token = refreshResponse.data.access;
//             localStorage.setItem('access', token);
//             return token;
//           } catch (refreshError) {
//             console.error('Token refresh failed:', refreshError);
//             Swal.fire({
//               icon: 'error',
//               title: 'Session Expired',
//               text: 'Please log in again.',
//               timer: 1500,
//               willClose: () => navigate('/login'),
//             });
//             return null;
//           }
//         } else {
//           Swal.fire({
//             icon: 'error',
//             title: 'Session Expired',
//             text: 'Please log in again.',
//             timer: 1500,
//             willClose: () => navigate('/login'),
//           });
//           return null;
//         }
//       }
//       return token;
//     }
//   };

//   const openChatModal = (data) => {
//     setShowChatModal(data);
//   };

//   const updateApplicationStatus = async (applicationId, jobId, currentStatus) => {
//     if (!['Application Send', 'Application Viewed'].includes(currentStatus)) {
//       return false;
//     }

//     const token = await getToken();
//     if (!token) return false;

//     setIsButtonDisabled((prev) => new Set(prev).add(applicationId));

//     try {
//       Swal.fire({
//         title: 'Updating Status...',
//         text: 'Please wait',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         },
//       });

//       const response = await axios.post(
//         `${baseURL}/api/empjob/applicationStatus/${applicationId}/`,
//         { action: currentStatus === 'Application Send' ? 'Application Viewed' : 'Resume Viewed', job_id: jobId },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.status >= 200 && response.status < 300) {
//         if (fetchJobDetails) {
//           fetchJobDetails();
//         }

//         Swal.fire({
//           icon: 'success',
//           title: 'Status Updated',
//           text: `Application status changed to ${currentStatus === 'Application Send' ? 'Viewed' : 'Resume Viewed'}.`,
//           showConfirmButton: false,
//           timer: 1500,
//         });

//         return true;
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       let errorMessage = 'Failed to update status.';
//       if (error.response?.status === 403 || error.response?.status === 401) {
//         errorMessage = 'You do not have permission to update status. Please log in again.';
//         Swal.fire({
//           icon: 'error',
//           title: 'Permission Denied',
//           text: errorMessage,
//           timer: 1500,
//           willClose: () => navigate('/login'),
//         });
//       } else {
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: error.response?.data?.error || errorMessage,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//       return false;
//     } finally {
//       setIsButtonDisabled((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(applicationId);
//         return newSet;
//       });
//     }
//   };

//   const handleViewClick = async (data) => {
//     const updated = await updateApplicationStatus(data.id, selectedJob.id, data.status);
//     dispatch(setCurrentCandidate({
//       ...data,
//       candidate: {
//         ...data.candidate,
//         phone: String(data.candidate.phone), // Fix prop type warning
//       },
//       status: updated ? (data.status === 'Application Send' ? 'Application Viewed' : 'Resume Viewed') : data.status,
//     }));
//     setChange(false);
//   };

//   const applications = selectedJob?.applications || [];
//   const totalPages = Math.ceil(applications.length / candidatesPerPage);
//   const indexOfFirstCandidate = (currentPage - 1) * candidatesPerPage + 1;
//   const indexOfLastCandidate = Math.min(currentPage * candidatesPerPage, applications.length);
//   const currentCandidates = applications.slice(indexOfFirstCandidate - 1, indexOfLastCandidate);

//   if (!selectedJob || !applications.length) {
//     return <div className="job-app-no-applications">No applications available</div>;
//   }

//   const normalizeStatusClass = (status) =>
//     status ? status.toLowerCase().replace(/\s+/g, '-') : 'application-send';

//   return (
//     <div className="job-app-apply-card-container">
//       {currentCandidates.map((data) => (
//         <div key={data.id} className="job-app-application-card">
//           <div className="job-app-application-card-header">
//             <div className="job-app-candidate-info">
//               <div className="job-app-profile-pic-container">
//                 <img
//                   src={data.candidate?.profile_pic ? `${baseURL}${data.candidate.profile_pic}` : '/default-profile.png'}
//                   alt={`${data.candidate?.user_name || 'Candidate'}'s profile`}
//                   className="job-app-profile-pic"
//                 />
//               </div>
//               <div className="job-app-candidate-details">
//                 <span className="job-app-candidate-name">{data.candidate?.user_name || 'N/A'}</span>
//                 <span className="job-app-candidate-education">
//                   {data.candidate?.education?.[0]?.education || 'N/A'}
//                 </span>
//                 <span className="job-app-candidate-status" style={{ color: '#1e3a8a', fontWeight: 500, fontSize: '0.9rem' }}>
//                   Status:{' '}
//                   <span
//                     className={`job-app-status-${normalizeStatusClass(data.status)}`}
//                     style={{
//                       color: (
//                         data.status === 'Application Send' ? '#4f46e5' :
//                         data.status === 'Application Viewed' ? '#10b981' :
//                         data.status === 'Resume Viewed' ? '#ec4899' :
//                         data.status === 'ShortListed' ? '#f59e0b' :
//                         data.status === 'Interview Scheduled' ? '#8b5cf6' :
//                         data.status === 'Accepted' ? '#22c55e' :
//                         data.status === 'Rejected' ? '#ef4444' :
//                         '#2dd4bf' // Default teal
//                       ),
//                       fontWeight: 700,
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.8px',
//                       fontSize: '0.85rem',
//                     }}
//                   >
//                     {data.status || 'Application Send'}
//                   </span>
//                 </span>
//               </div>
//             </div>
//             <div className="job-app-action-container">
//               <button
//                 className="job-app-action-button job-app-chat-button"
//                 onClick={() => openChatModal(data)}
//                 disabled={isButtonDisabled.has(data.id)}
//                 aria-label={`Chat with ${data.candidate?.user_name || 'candidate'}`}
//               >
//                 Chat
//               </button>
//               <button
//                 className="job-app-action-button job-app-view-button"
//                 onClick={() => handleViewClick(data)}
//                 disabled={isButtonDisabled.has(data.id)}
//                 aria-label={`View ${data.candidate?.user_name || 'candidate'}'s application`}
//               >
//                 View
//               </button>
//             </div>
//           </div>
//           {showChatModal && showChatModal.id === data.id && (
//             <ChatModal
//               setChat={setShowChatModal}
//               profile_pic={
//                 data.candidate?.profile_pic ? `${baseURL}${data.candidate.profile_pic}` : '/default-profile.png'
//               }
//               userName={data.candidate?.user_name || 'N/A'}
//               emp_name={selectedJob?.employer_name || 'Employer'}
//               candidate_id={data.candidate?.id}
//               employer_id={selectedJob?.employer_id || localStorage.getItem('user_id')}
//               senderName={selectedJob?.employer_name || 'Employer'}
//               currentUserId={selectedJob?.employer_id || localStorage.getItem('user_id')}
//               receiverId={data.candidate?.user}
//             />
//           )}
//         </div>
//       ))}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={setCurrentPage}
//         candidatesPerPage={candidatesPerPage}
//         totalCandidates={applications.length}
//       />
//     </div>
//   );
// }

// ApplyCard.propTypes = {
//   selectedJob: PropTypes.shape({
//     id: PropTypes.number,
//     applications: PropTypes.arrayOf(
//       PropTypes.shape({
//         id: PropTypes.number,
//         status: PropTypes.string,
//         candidate: PropTypes.shape({
//           id: PropTypes.number,
//           user: PropTypes.number,
//           user_name: PropTypes.string,
//           profile_pic: PropTypes.string,
//           education: PropTypes.arrayOf(
//             PropTypes.shape({
//               education: PropTypes.string,
//             })
//           ),
//         }),
//       })
//     ),
//     employer_id: PropTypes.number,
//     employer_name: PropTypes.string,
//   }).isRequired,
//   setChange: PropTypes.func.isRequired,
//   fetchJobDetails: PropTypes.func,
// };

// export default ApplyCard;

















// import React, { useState } from 'react';
// import '../job/style/Candidateview.css';

// function ApplicationData({ jobData, handleJobClick }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 3;

//   const totalPages = Math.ceil(jobData.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentJobs = jobData.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const formatDate = (dateTimeString) => {
//     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//     return new Date(dateTimeString).toLocaleDateString(undefined, options);
//   };

//   const handleJobItemClick = (job) => {
//     handleJobClick(job);
//     if (window.innerWidth <= 768) {
//       setTimeout(() => {
//         const element = document.getElementById(`job-${job.id}`);
//         if (element) {
//           element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//         }
//       }, 100);
//     }
//   };

//   return (
//     <div className="job-app-data-container">
//       <div className="job-app-data-card">
//         <div className="job-app-data-header">
//           <span className="job-app-data-title">Applications</span>
//         </div>
//         <div className="job-app-data-list">
//           {currentJobs.map((job) => (
//             <div
//               key={job.id}
//               id={`job-${job.id}`}
//               onClick={() => handleJobItemClick(job)}
//               className="job-app-data-job-item"
//             >
//               <div className="job-app-data-expiry">
//                 Expiry: {job.applyBefore}
//               </div>
//               <div className="job-app-data-applications-count">
//                 <span className="job-app-data-count-badge">
//                   {job.applications.length}
//                 </span>
//               </div>
//               <div className="job-app-data-job-header">
//                 <div className="job-app-data-job-title-section">
//                   <p className="job-app-data-job-title">{job.title}</p>
//                   <p className="job-app-data-employer">{job.employer_name}</p>
//                 </div>
//               </div>
//               <div className="job-app-data-job-details">
//                 <div className="job-app-data-job-info">
//                   <div className="job-app-data-info-item">
//                     Job Posted:
//                     <span className="job-app-data-badge job-app-data-badge-green">
//                       {formatDate(job.posteDate)}
//                     </span>
//                   </div>
//                   <div className="job-app-data-info-item">
//                     Location:
//                     <span className="job-app-data-badge job-app-data-badge-yellow">
//                       {job.location}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="job-app-data-job-info">
//                   <div className="job-app-data-info-item">
//                     Experience:
//                     <span className="job-app-data-badge job-app-data-badge-pink">
//                       {job.experience}
//                     </span>
//                   </div>
//                   <div className="job-app-data-info-item">
//                     Salary:
//                     <span className="job-app-data-badge job-app-data-badge-blue">
//                       {job.lpa} lpa
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="job-app-pagination-container">
//           <span className="job-app-pagination-count">
//             Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, jobData.length)} of {jobData.length} jobs
//           </span>
//           <div className="job-app-pagination">
//             <button
//               className={`job-app-pagination-button ${currentPage === 1 ? 'job-app-pagination-disabled' : ''}`}
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//             >
//               Previous
//             </button>
            
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//               <button
//                 key={number}
//                 className={`job-app-pagination-button ${currentPage === number ? 'job-app-pagination-active' : ''}`}
//                 onClick={() => handlePageChange(number)}
//               >
//                 {number}
//               </button>
//             ))}
            
//             <button
//               className={`job-app-pagination-button ${currentPage === totalPages ? 'job-app-pagination-disabled' : ''}`}
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ApplicationData;











// // import React, { useEffect, useState } from 'react';
// // import { useSelector } from 'react-redux';
// // import { useNavigate } from 'react-router-dom';
// // import axios from 'axios';
// // import Drawer from 'react-modern-drawer';
// // import Swal from 'sweetalert2';
// // import 'react-modern-drawer/dist/index.css';
// // import StatusJob from './StatusJob';
// // import { useMediaQuery } from 'react-responsive';


// // // Import the Pagination component
// // function Pagination({ currentPage, totalPages, onPageChange }) {
// //   const handlePrevious = () => {
// //     if (currentPage > 1) {
// //       onPageChange(currentPage - 1);
// //     }
// //   };
  
// //   const handleNext = () => {
// //     if (currentPage < totalPages) {
// //       onPageChange(currentPage + 1);
// //     }
// //   };
  
// //   const pageNumbers = [];
// //   for (let i = 1; i <= totalPages; i++) {
// //     pageNumbers.push(i);
// //   }

// //   return (
// //     <div className="pagination">
// //       <button
// //         onClick={handlePrevious}
// //         disabled={currentPage === 1}
// //         className="pagination-button"
// //       >
// //         Previous
// //       </button>
// //       {pageNumbers.map((number) => (
// //         <button
// //           key={number}
// //           onClick={() => onPageChange(number)}
// //           className={`pagination-button ${currentPage === number ? 'active' : ''}`}
// //         >
// //           {number}
// //         </button>
// //       ))}
// //       <button
// //         onClick={handleNext}
// //         disabled={currentPage === totalPages}
// //         className="pagination-button"
// //       >
// //         Next
// //       </button>
// //     </div>
// //   );
// // }

// // function ApplyedJob() {
// //   const baseURL = 'http://127.0.0.1:8000';
// //   const token = localStorage.getItem('access');
// //   const navigate = useNavigate();
// //   const authentication_user = useSelector((state) => state.authentication_user);
// //   const [jobData, setJobData] = useState([]);
// //   const [selectedJob, setSelectedJob] = useState(null);
// //   const [isOpen, setIsOpen] = useState(false);
// //   const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
// //   const [loading, setLoading] = useState(true);
// //   const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this to trigger refreshes

// //   // Add pagination state
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const jobsPerPage = 5;

// //   const toggleDrawer = () => setIsOpen(!isOpen);

// //   const fetchApplyedJobs = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await axios.get(`${baseURL}/api/empjob/getApplyedjobs/`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Accept': 'application/json',
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       });
// //       if (response.status === 200 && response.data.length > 0) {
// //         setJobData(response.data);
// //         // If there's already a selected job, find and update it
// //         if (selectedJob) {
// //           const updatedSelectedJob = response.data.find((job) => job.id === selectedJob.id);
// //           if (updatedSelectedJob) {
// //             setSelectedJob(updatedSelectedJob);
// //           } else {
// //             // If the selected job is no longer in the data, select the first one
// //             setSelectedJob(response.data[0]);
// //           }
// //         } else {
// //           // If no job is selected, select the first one
// //           setSelectedJob(response.data[0]);
// //         }
// //       } else {
// //         setJobData([]);
// //         setSelectedJob(null);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching jobs:", error);
// //       alert("Failed to fetch applied jobs");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchApplyedJobs();
    
// //     // Set up a polling interval to fetch updates (optional)
// //     const interval = setInterval(() => {
// //       setRefreshTrigger(prev => prev + 1);
// //     }, 30000); // Poll every 30 seconds
    
// //     return () => clearInterval(interval);
// //   }, [token, refreshTrigger]); // Add refreshTrigger to dependencies

// //   const formatDate = (dateTimeString) => {
// //     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
// //     return new Date(dateTimeString).toLocaleDateString(undefined, options);
// //   };

// //   const handleJobClick = (job) => {
// //     if (!job.job.active) {
// //       // Show SweetAlert2 for inactive jobs
// //       Swal.fire({
// //         title: 'Job No Longer Active',
// //         text: 'This position has been deactivated by the employer and is no longer accepting applications.',
// //         icon: 'warning',
// //         confirmButtonText: 'Understood',
// //         confirmButtonColor: '#3085d6',
// //         background: '#f8f9fa',
// //         iconColor: '#f1c40f',
// //         customClass: {
// //           popup: 'swal-custom-popup',
// //           title: 'swal-custom-title',
// //           content: 'swal-custom-content'
// //         }
// //       });
// //     }
    
// //     // Set the selected job regardless of status to allow viewing details
// //     setSelectedJob(job);
// //     if (isMobile) toggleDrawer();
// //   };

// //   const updateJobStatus = async (jobId, action) => {
// //     try {
// //       const response = await axios.post(
// //         `${baseURL}/api/empjob/application-status/${jobId}/`,
// //         { action },
// //         {
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //             'Content-Type': 'application/json',
// //           },
// //         }
// //       );
// //       if (response.status === 200) {
// //         await fetchApplyedJobs(); // Refresh job data after status update
// //       }
// //     } catch (error) {
// //       console.error("Error updating status:", error.response ? error.response.data : error);
// //       alert(`Failed to update status: ${error.response ? error.response.data.message : 'Unknown error'}`);
// //     }
// //   };

// //   // Handle page change
// //   const handlePageChange = (pageNumber) => {
// //     setCurrentPage(pageNumber);
// //   };

// //   // Get current jobs for pagination
// //   const indexOfLastJob = currentPage * jobsPerPage;
// //   const indexOfFirstJob = indexOfLastJob - jobsPerPage;
// //   const currentJobs = jobData.slice(indexOfFirstJob, indexOfLastJob);
// //   const totalPages = Math.ceil(jobData.length / jobsPerPage);

// //   if (loading && jobData.length === 0) {
// //     return <div>Loading...</div>;
// //   }

// //   return (
// //     <div className="applyed-jobs-wrapper">
// //       <h1 className="applyed-jobs-heading">Applied Jobs</h1>
// //       {jobData.length > 0 ? (
// //         <div className="applyed-jobs-layout">
// //           <div className="job-list-section">
// //             <h2>Your Applications</h2>
// //             <p>{jobData.length} applications</p>
// //             {currentJobs.map((job) => (
// //               <div
// //                 key={job.id}
// //                 onClick={() => handleJobClick(job)}
// //                 className={`job-list-item ${selectedJob && selectedJob.id === job.id ? 'selected-job' : ''}`}
// //               >
// //                 <div className="job-item-content">
// //                   <div className="job-item-image">
                    
// //                     <img
// //                       src={`${job.job.employer.profile_pic}`}
// //                       alt={job.job.employer.user_full_name}
// //                       onError={(e) => {
// //                         e.target.onerror = null;
// //                         e.target.src = "";
// //                       }}
// //                     />
// //                   </div>
// //                   <div className="job-item-details">
// //                     <h3>{job.job.title}</h3>
// //                     <p>{job.job.employer.user_full_name}</p>
// //                     <p>{job.job.location}</p>
// //                     <div className="job-item-tags">
// //                       <span className="job-experience-tag">{job.job.experience || 'Not specified'} experience</span>
// //                       <span className="job-salary-tag">{job.job.lpa} LPA</span>
// //                     </div>
// //                     <div className="job-item-footer">
// //                       <div className="job-applied-date">
// //                         Applied on {formatDate(job.applyed_on)}
// //                       </div>
// //                       <div className="job-status-tag">
// //                         {!job.job.active ? (
// //                           <span className="status-indicator inactive">Inactive</span>
// //                         ) : (
// //                           <span className={`status-indicator ${job.status === 'Pending' ? 'in-progress' : job.status === 'Accepted' ? 'accepted' : job.status === 'Rejected' ? 'rejected' : 'pending'}`}>
// //                             {job.status || 'Pending'}
// //                           </span>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             ))}
            
// //             {/* Add pagination component */}
// //             {jobData.length > jobsPerPage && (
// //               <Pagination 
// //                 currentPage={currentPage}
// //                 totalPages={totalPages}
// //                 onPageChange={handlePageChange}
// //               />
// //             )}
// //           </div>
// //           <div className="job-details-section">
// //             {selectedJob ? (
// //               <div>
// //                 {!selectedJob.job.active && (
// //                   <div className="job-inactive-notice">
// //                     <div className="warning-icon">⚠️</div>
// //                     <p>This job is no longer active. The employer has deactivated this position.</p>
// //                   </div>
// //                 )}
// //                 <StatusJob
// //                   toggleDrawer={toggleDrawer}
// //                   selectedJob={selectedJob}
// //                   updateJobStatus={updateJobStatus}
// //                   refreshTrigger={refreshTrigger} // Pass the trigger to force refresh
// //                 />
// //               </div>
// //             ) : (
// //               <div className="no-job-selected-message">Select a job to view details</div>
// //             )}
// //           </div>
// //         </div>
// //       ) : (
// //         <div className="no-applications-message">
// //           <div className="no-applications-content">
// //             <div className="no-applications-icon">
// //               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
// //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
// //               </svg>
// //             </div>
// //             <h2>No Applications Yet</h2>
// //             <p>You haven't applied to any jobs yet. Start your job search journey today!</p>
// //             <button onClick={() => navigate('/jobs')} className="find-jobs-button">
// //               Find Jobs
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //       <div className="mobile-drawer-wrapper">
// //         <Drawer
// //           open={isOpen}
// //           onClose={toggleDrawer}
// //           direction="bottom"
// //           size="85vh"
// //           className="mobile-drawer-content"
// //         >
// //           <div className="drawer-handle"></div>
// //           {selectedJob && (
// //             <div>
// //               {!selectedJob.job.active && (
// //                 <div className="job-inactive-notice mobile">
// //                   <div className="warning-icon">⚠️</div>
// //                   <p>This job is no longer active. The employer has deactivated this position.</p>
// //                 </div>
// //               )}
// //               <StatusJob
// //                 toggleDrawer={toggleDrawer}
// //                 selectedJob={selectedJob}
// //                 updateJobStatus={updateJobStatus}
// //                 refreshTrigger={refreshTrigger} // Pass the trigger to force refresh
// //               />
// //             </div>
// //           )}
// //         </Drawer>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ApplyedJob;












// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Drawer from 'react-modern-drawer';
// import Swal from 'sweetalert2';
// import 'react-modern-drawer/dist/index.css';
// import StatusJob from './StatusJob';
// import { useMediaQuery } from 'react-responsive';
// import './detail.css';

// // Pagination Component
// function Pagination({ currentPage, totalPages, onPageChange }) {
//   const handlePrevious = () => {
//     if (currentPage > 1) {
//       onPageChange(currentPage - 1);
//     }
//   };

//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       onPageChange(currentPage + 1);
//     }
//   };

//   const pageNumbers = [];
//   for (let i = 1; i <= totalPages; i++) {
//     pageNumbers.push(i);
//   }

//   return (
//     <div className="unique-pagination">
//       <button
//         onClick={handlePrevious}
//         disabled={currentPage === 1}
//         className="unique-pagination-button"
//       >
//         Previous
//       </button>
//       {pageNumbers.map((number) => (
//         <button
//           key={number}
//           onClick={() => onPageChange(number)}
//           className={`unique-pagination-button ${currentPage === number ? 'unique-active' : ''}`}
//         >
//           {number}
//         </button>
//       ))}
//       <button
//         onClick={handleNext}
//         disabled={currentPage === totalPages}
//         className="unique-pagination-button"
//       >
//         Next
//       </button>
//     </div>
//   );
// }

// function ApplyedJob() {
//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');
//   const navigate = useNavigate();
//   const authentication_user = useSelector((state) => state.authentication_user);
//   const [jobData, setJobData] = useState([]);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
//   const [loading, setLoading] = useState(true);
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const jobsPerPage = 5;

//   const toggleDrawer = () => setIsOpen(!isOpen);

//   const fetchApplyedJobs = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${baseURL}/api/empjob/getApplyedjobs/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       if (response.status === 200 && response.data.length > 0) {
//         setJobData(response.data);
//         if (selectedJob) {
//           const updatedSelectedJob = response.data.find((job) => job.id === selectedJob.id);
//           if (updatedSelectedJob) {
//             setSelectedJob(updatedSelectedJob);
//           } else {
//             setSelectedJob(response.data[0]);
//           }
//         } else {
//           setSelectedJob(response.data[0]);
//         }
//       } else {
//         setJobData([]);
//         setSelectedJob(null);
//       }
//     } catch (error) {
//       console.error("Error fetching jobs:", error);
//       alert("Failed to fetch applied jobs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplyedJobs();
//     const interval = setInterval(() => {
//       setRefreshTrigger(prev => prev + 1);
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [token, refreshTrigger]);

//   const formatDate = (dateTimeString) => {
//     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//     return new Date(dateTimeString).toLocaleDateString(undefined, options);
//   };

//   const handleJobClick = (job) => {
//     if (!job.job.active) {
//       Swal.fire({
//         title: 'Job No Longer Active',
//         text: 'This position has been deactivated by the employer and is no longer accepting applications.',
//         icon: 'warning',
//         confirmButtonText: 'Understood',
//         confirmButtonColor: '#3085d6',
//         background: '#f8f9fa',
//         iconColor: '#f1c40f',
//         customClass: {
//           popup: 'unique-swal-custom-popup',
//           title: 'unique-swal-custom-title',
//           content: 'unique-swal-custom-content'
//         }
//       });
//     }
//     setSelectedJob(job);
//     if (isMobile) toggleDrawer();
//   };

//   const updateJobStatus = async (jobId, action) => {
//     try {
//       const response = await axios.post(
//         `${baseURL}/api/empjob/application-status/${jobId}/`,
//         { action },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       if (response.status === 200) {
//         await fetchApplyedJobs();
//       }
//     } catch (error) {
//       console.error("Error updating status:", error.response ? error.response.data : error);
//       alert(`Failed to update status: ${error.response ? error.response.data.message : 'Unknown error'}`);
//     }
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const indexOfLastJob = currentPage * jobsPerPage;
//   const indexOfFirstJob = indexOfLastJob - jobsPerPage;
//   const currentJobs = jobData.slice(indexOfFirstJob, indexOfLastJob);
//   const totalPages = Math.ceil(jobData.length / jobsPerPage);

//   if (loading && jobData.length === 0) {
//     return <div className="unique-loading">Loading...</div>;
//   }

//   return (
//     <div className="unique-applyed-jobs-wrapper">
//       <h1 className="unique-applyed-jobs-heading">Applied Jobs</h1>
//       {jobData.length > 0 ? (
//         <div className="unique-applyed-jobs-layout">
//           <div className="unique-job-list-section">
//             <h2>Your Applications</h2>
//             <p>{jobData.length} applications</p>
//             {currentJobs.map((job) => (
//               <div
//                 key={job.id}
//                 onClick={() => handleJobClick(job)}
//                 className={`unique-job-list-item ${selectedJob && selectedJob.id === job.id ? 'unique-selected-job' : ''}`}
//               >
//                 <div className="unique-job-item-content">
//                   <div className="unique-job-item-image">
//                     <img
//                       src={`${job.job.employer.profile_pic}`}
//                       alt={job.job.employer.user_full_name}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = "";
//                       }}
//                     />
//                   </div>
//                   <div className="unique-job-item-details">
//                     <h3>{job.job.title}</h3>
//                     <p>{job.job.employer.user_full_name}</p>
//                     <p>{job.job.location}</p>
//                     <div className="unique-job-item-tags">
//                       <span className="unique-job-experience-tag">{job.job.experience || 'Not specified'} experience</span>
//                       <span className="unique-job-salary-tag">{job.job.lpa} LPA</span>
//                     </div>
//                     <div className="unique-job-item-footer">
//                       <div className="unique-job-applied-date">
//                         Applied on {formatDate(job.applyed_on)}
//                       </div>
//                       <div className="unique-job-status-tag">
//                         {!job.job.active ? (
//                           <span className="unique-status-indicator unique-inactive">Inactive</span>
//                         ) : (
//                           <span className={`unique-status-indicator ${job.status === 'Pending' ? 'unique-in-progress' : job.status === 'Accepted' ? 'unique-accepted' : job.status === 'Rejected' ? 'unique-rejected' : 'unique-pending'}`}>
//                             {job.status || 'Pending'}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             {jobData.length > jobsPerPage && (
//               <Pagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={handlePageChange}
//               />
//             )}
//           </div>
//           <div className="unique-job-details-section">
//             {selectedJob ? (
//               <div>
//                 {!selectedJob.job.active && (
//                   <div className="unique-job-inactive-notice">
//                     <div className="unique-warning-icon">⚠️</div>
//                     <p>This job is no longer active. The employer has deactivated this position.</p>
//                   </div>
//                 )}
//                 <StatusJob
//                   toggleDrawer={toggleDrawer}
//                   selectedJob={selectedJob}
//                   updateJobStatus={updateJobStatus}
//                   refreshTrigger={refreshTrigger}
//                 />
//               </div>
//             ) : (
//               <div className="unique-no-job-selected-message">Select a job to view details</div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="unique-no-applications-message">
//           <div className="unique-no-applications-content">
//             <div className="unique-no-applications-icon">
//               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <h2>No Applications Yet</h2>
//             <p>You haven't applied to any jobs yet. Start your job search journey today!</p>
//             <button onClick={() => navigate('/jobs')} className="unique-find-jobs-button">
//               Find Jobs
//             </button>
//           </div>
//         </div>
//       )}
//       <div className="unique-mobile-drawer-wrapper">
//         <Drawer
//           open={isOpen}
//           onClose={toggleDrawer}
//           direction="bottom"
//           size="85vh"
//           className="unique-mobile-drawer-content"
//         >
//           <div className="unique-drawer-handle"></div>
//           {selectedJob && (
//             <div>
//               {!selectedJob.job.active && (
//                 <div className="unique-job-inactive-notice unique-mobile">
//                   <div className="unique-warning-icon">⚠️</div>
//                   <p>This job is no longer active. The employer has deactivated this position.</p>
//                 </div>
//               )}
//               <StatusJob
//                 toggleDrawer={toggleDrawer}
//                 selectedJob={selectedJob}
//                 updateJobStatus={updateJobStatus}
//                 refreshTrigger={refreshTrigger}
//               />
//             </div>
//           )}
//         </Drawer>
//       </div>
//     </div>
//   );
// }

// export default ApplyedJob;



















// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import Swal from 'sweetalert2';
// // import SheduleModal from '../../../Components/Interview/Scheduledmodal';
// // import ChatModal from './ChatModal';
// // import { useNavigate } from 'react-router-dom';
// // import { FaCommentDots } from 'react-icons/fa';
// // import '../job/style/jobdetail.css';
// // import '../job/style/CandidateView.css';

// // const CandidateView = ({ selectedJob, current, questions: initialQuestions = [], fetchJobDetails }) => {
// //   const baseURL = 'http://127.0.0.1:8000';
// //   const navigate = useNavigate();

// //   const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
// //   const [showScheduleModal, setShowScheduleModal] = useState(false);
// //   const [showChatModal, setShowChatModal] = useState(false);
// //   const [interviewData, setInterviewData] = useState(null);
// //   const [questions, setQuestions] = useState(initialQuestions);
// //   const [loadingQuestions, setLoadingQuestions] = useState(false);
// //   const [isButtonDisabled, setIsButtonDisabled] = useState(false);
// //   const [receiverId, setReceiverId] = useState(null);

// //   const STATUS_ACTIONS = {
// //     'Application Send': ['View Application'],
// //     'Application Viewed': ['View Resume', 'Accept', 'Reject'],
// //     'Resume Viewed': ['Schedule Interview', 'ShortList', 'Accept', 'Reject'],
// //     'Interview Scheduled': ['Complete Interview', 'Mark as Missed', 'Cancel Interview'],
// //     'Completed': ['ShortList'],
// //     'You missed': ['Reschedule Interview'],
// //     'Interview Cancelled': ['Reschedule Interview'],
// //     'ShortListed': ['Schedule Interview'],
// //     'Accepted': [],
// //     'Rejected': []
// //   };

// //   const getToken = () => {
// //     const token = localStorage.getItem('access');
// //     if (!token) {
// //       Swal.fire({
// //         icon: 'error',
// //         title: 'Session Expired',
// //         text: 'Please log in again.',
// //         timer: 1500,
// //         willClose: () => navigate('/login'),
// //       });
// //       return null;
// //     }
// //     return token;
// //   };

// //   const getQuestionAnswerPairs = () => {
// //     if (!current?.answers) return [];
// //     return current.answers.map((answer) => {
// //       const question = questions.find(q => q?.id === answer.question) || {
// //         id: answer.question,
// //         text: answer.question_text || `Question ${answer.question}`
// //       };
// //       return {
// //         question,
// //         answer,
// //         key: `${answer.id}-${answer.question}`
// //       };
// //     });
// //   };

// //   useEffect(() => {
// //     if (!current) return;
// //     if (current.status === 'Application Send') {
// //       changeStatus('Application Viewed');
// //     } else {
// //       setAppStatus(current.status);
// //     }
// //     fetchInterviewData();
// //   }, [current, selectedJob]);

// //   const fetchInterviewData = async () => {
// //     const token = getToken();
// //     if (!token || !selectedJob?.id || !current?.candidate?.id) return;

// //     try {
// //       const response = await axios.get(
// //         `${baseURL}/api/interview/schedules/?job_id=${selectedJob.id}&candidate_id=${current.candidate.id}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
// //       const matchingInterview = interviews.find(
// //         (interview) => interview.candidate === current.candidate.id && interview.job === selectedJob.id
// //       );

// //       setInterviewData(matchingInterview || null);
// //       setReceiverId(current.candidate?.user || null);
// //     } catch (error) {
// //       console.error('Error fetching interview data:', error);
// //     }
// //   };

// //   const changeStatus = async (newStatus) => {
// //     if (isButtonDisabled) return;
// //     const token = getToken();
// //     if (!token) return;

// //     setIsButtonDisabled(true);

// //     try {
// //       Swal.fire({
// //         title: 'Updating Status...',
// //         allowOutsideClick: false,
// //         didOpen: () => Swal.showLoading(),
// //       });

// //       await axios.post(
// //         `${baseURL}/api/empjob/applicationStatus/${current.id}/`,
// //         { action: newStatus, job_id: selectedJob.id },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setAppStatus(newStatus);
// //       fetchJobDetails();
      
// //       Swal.fire({
// //         icon: 'success',
// //         title: 'Status Updated',
// //         text: `Status changed to ${newStatus}`,
// //         timer: 1500,
// //       });

// //       if (['Interview Scheduled', 'Completed', 'You missed', 'Interview Cancelled'].includes(newStatus)) {
// //         await fetchInterviewData();
// //       }
// //     } catch (error) {
// //       console.error('Error updating status:', error);
// //       Swal.fire({
// //         icon: 'error',
// //         title: 'Error',
// //         text: error.response?.data?.error || 'Failed to update status.',
// //         timer: 1500,
// //       });
// //     } finally {
// //       setIsButtonDisabled(false);
// //     }
// //   };

// //   const handleResumeClick = () => {
// //     if (appStatus === 'Application Viewed') {
// //       changeStatus('Resume Viewed');
// //     }
// //     window.open(`${baseURL}${current.candidate.resume}`, '_blank');
// //   };

// //   const scheduleInterview = async () => {
// //     const token = getToken();
// //     if (!token) return;

// //     try {
// //       const response = await axios.get(
// //         `${baseURL}/api/interview/schedules/?job_id=${selectedJob.id}&candidate_id=${current.candidate.id}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
// //       const existingInterview = interviews.find(
// //         (interview) => interview.candidate === current.candidate.id && interview.job === selectedJob.id
// //       );

// //       if (existingInterview && appStatus !== 'Interview Cancelled' && appStatus !== 'You missed') {
// //         Swal.fire({
// //           icon: 'warning',
// //           title: 'Interview Exists',
// //           text: 'This candidate already has an interview scheduled.',
// //         });
// //         return;
// //       }

// //       setShowScheduleModal(true);
// //     } catch (error) {
// //       console.error('Error checking schedule:', error);
// //     }
// //   };

// //   const cancelInterview = async () => {
// //     const confirmation = await Swal.fire({
// //       title: 'Cancel Interview?',
// //       text: 'Are you sure you want to cancel this interview?',
// //       icon: 'warning',
// //       showCancelButton: true,
// //       confirmButtonText: 'Yes, cancel',
// //     });

// //     if (!confirmation.isConfirmed) return;

// //     const token = getToken();
// //     if (!token) return;

// //     try {
// //       Swal.fire({
// //         title: 'Canceling...',
// //         allowOutsideClick: false,
// //         didOpen: () => Swal.showLoading(),
// //       });

// //       await axios.post(
// //         `${baseURL}/api/interview/cancelApplication/`,
// //         { candidate_id: current.candidate.id, job_id: selectedJob.id },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       changeStatus('Interview Cancelled');
// //     } catch (error) {
// //       console.error('Error canceling interview:', error);
// //     }
// //   };

// //   const handleAction = (action) => {
// //     switch (action) {
// //       case 'View Application':
// //         changeStatus('Application Viewed');
// //         break;
// //       case 'View Resume':
// //         changeStatus('Resume Viewed');
// //         break;
// //       case 'Schedule Interview':
// //       case 'Reschedule Interview':
// //         scheduleInterview();
// //         break;
// //       case 'Complete Interview':
// //         changeStatus('Completed');
// //         break;
// //       case 'Mark as Missed':
// //         changeStatus('You missed');
// //         break;
// //       case 'Cancel Interview':
// //         cancelInterview();
// //         break;
// //       case 'Accept':
// //       case 'Reject':
// //       case 'ShortList':
// //         changeStatus(action);
// //         break;
// //       default:
// //         break;
// //     }
// //   };

// //   if (!current) {
// //     return <div className="no-selection">Select a candidate to view details</div>;
// //   }

// //   const profilePic = current.candidate?.profile_pic 
// //     ? `${baseURL}${current.candidate.profile_pic}` 
// //     : '/default-profile.png';
  
// //   const userName = current.candidate?.user_name || current.candidate_name || 'N/A';
// //   const employerId = selectedJob?.employer_id || localStorage.getItem('user_id');
// //   const empName = selectedJob?.employer_name || 'Employer';
// //   const availableActions = STATUS_ACTIONS[appStatus] || [];
// //   const isFinalStatus = ['Accepted', 'Rejected'].includes(appStatus);
// //   const questionAnswerPairs = getQuestionAnswerPairs();

// //   return (
// //     <div className="candidate-view-container">
// //       {showScheduleModal && (
// //         <SheduleModal
// //           setModal={setShowScheduleModal}
// //           candidate_id={current.candidate?.id}
// //           job_id={selectedJob?.id}
// //           application_id={current.id}
// //           onScheduleSuccess={() => {
// //             changeStatus('Interview Scheduled');
// //           }}
// //         />
// //       )}

// //       {showChatModal && (
// //         <ChatModal
// //           setChat={setShowChatModal}
// //           profile_pic={profilePic}
// //           userName={userName}
// //           emp_name={empName}
// //           candidate_id={current.candidate?.id}
// //           employer_id={employerId}
// //           senderName={empName}
// //           currentUserId={employerId}
// //           receiverId={receiverId}
// //         />
// //       )}

// //       <div className="candidate-header">
// //         <div className="candidate-profile">
// //           <img src={profilePic} alt="Profile" className="profile-image" />
// //           <div>
// //             <h2>{userName}</h2>
// //             <div className="status-badge">{appStatus}</div>
// //           </div>
// //         </div>

// //         <div className="action-buttons">
// //           {isFinalStatus ? (
// //             <button 
// //               onClick={() => setShowChatModal(true)} 
// //               className="action-btn chat-btn"
// //               title="Chat with candidate"
// //             >
// //               <FaCommentDots className="chat-icon" />
// //               <span className="chat-text">Chat</span>
// //             </button>
// //           ) : (
// //             <>
// //               {availableActions.map((action) => (
// //                 <button
// //                   key={action}
// //                   onClick={() => handleAction(action)}
// //                   disabled={isButtonDisabled}
// //                   className={`action-btn ${action.toLowerCase().replace(' ', '-')}`}
// //                 >
// //                   {action}
// //                 </button>
// //               ))}
// //               <button 
// //                 onClick={() => setShowChatModal(true)} 
// //                 className="action-btn chat-btn"
// //                 title="Chat with candidate"
// //               >
// //                 <FaCommentDots className="chat-icon" />
// //                 <span className="chat-text">Chat</span>
// //               </button>
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       <div className="candidate-details">
// //         {/* Personal Information Section */}
// //         <div className="details-section">
// //           <h3>Personal Information</h3>
// //           <div className="info-grid">
// //             <div className="info-item">
// //               <label>Email:</label>
// //               <p>{current.candidate?.email || 'N/A'}</p>
// //             </div>
// //             <div className="info-item">
// //               <label>Phone:</label>
// //               <p>{current.candidate?.phone || 'N/A'}</p>
// //             </div>
// //             <div className="info-item">
// //               <label>Gender:</label>
// //               <p>{current.candidate?.gender || current.candidate?.Gender || 'N/A'}</p>
// //             </div>
// //             <div className="info-item">
// //               <label>Date of Birth:</label>
// //               <p>{current.candidate?.dob || 'N/A'}</p>
// //             </div>
// //             <div className="info-item">
// //               <label>Applied On:</label>
// //               <p>{new Date(current.applyed_on).toLocaleDateString()}</p>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Education Section */}
// //         {current.candidate?.education?.length > 0 && (
// //           <div className="details-section">
// //             <h3>Education</h3>
// //             <div className="info-grid">
// //               <div className="info-item">
// //                 <label>Qualification:</label>
// //                 <p>{current.candidate.education[0].education || 'N/A'}</p>
// //               </div>
// //               <div className="info-item">
// //                 <label>Specialization:</label>
// //                 <p>{current.candidate.education[0].specilization || 'N/A'}</p>
// //               </div>
// //               <div className="info-item">
// //                 <label>Completed Year:</label>
// //                 <p>{current.candidate.education[0].completed || 'N/A'}</p>
// //               </div>
// //               <div className="info-item">
// //                 <label>College:</label>
// //                 <p>{current.candidate.education[0].college || 'N/A'}</p>
// //               </div>
// //               <div className="info-item">
// //                 <label>Grade:</label>
// //                 <p>{current.candidate.education[0].mark || 'N/A'}</p>
// //               </div>
// //               <div className="info-item">
// //                 <label>Skills:</label>
// //                 <p>{current.candidate.skills || 'N/A'}</p>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Links & Documents Section */}
// //         <div className="details-section">
// //           <h3>Links & Documents</h3>
// //           <div className="info-grid">
// //             <div className="info-item">
// //               <label>LinkedIn:</label>
// //               {current.candidate?.linkedin ? (
// //                 <a href={current.candidate.linkedin} target="_blank" rel="noopener noreferrer">
// //                   View Profile
// //                 </a>
// //               ) : (
// //                 <p>N/A</p>
// //               )}
// //             </div>
// //             <div className="info-item">
// //               <label>GitHub:</label>
// //               {current.candidate?.github ? (
// //                 <a href={current.candidate.github} target="_blank" rel="noopener noreferrer">
// //                   View Profile
// //                 </a>
// //               ) : (
// //                 <p>N/A</p>
// //               )}
// //             </div>
// //             <div className="info-item">
// //               <label>Resume:</label>
// //               {current.candidate?.resume ? (
// //                 <a 
// //                   href={`${baseURL}${current.candidate.resume}`} 
// //                   target="_blank" 
// //                   rel="noopener noreferrer"
// //                   onClick={handleResumeClick}
// //                 >
// //                   View Resume
// //                 </a>
// //               ) : (
// //                 <p>N/A</p>
// //               )}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Interview Questions & Answers Section */}
// //         <div className="details-section">
// //           <h3>Interview Questions & Answers</h3>
// //           {loadingQuestions ? (
// //             <p>Loading questions...</p>
// //           ) : questionAnswerPairs.length > 0 ? (
// //             <div className="qa-list">
// //               {questionAnswerPairs.map(({ question, answer, key }) => (
// //                 <div key={key} className="qa-item">
// //                   <div className="question">{question.text}</div>
// //                   <div className="answer">
// //                     {answer.answer_text || 'No answer provided'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <p>No questions answered</p>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default CandidateView;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import ScheduleModal from '../../../Components/Interview/Scheduledmodal';
// import ChatModal from './ChatModal';
// import { useNavigate } from 'react-router-dom';
// import { FaCommentDots } from 'react-icons/fa';
// import '../job/style/jobdetail.css';
// import '../job/style/CandidateView.css';
// import PropTypes from 'prop-types';

// const CandidateView = ({ selectedJob, current, questions: initialQuestions = [], fetchJobDetails }) => {
//   const baseURL = 'http://127.0.0.1:8000';
//   const navigate = useNavigate();

//   const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
//   const [showScheduleModal, setShowScheduleModal] = useState(false);
//   const [showChatModal, setShowChatModal] = useState(false);
//   const [interviewData, setInterviewData] = useState(null);
//   const [questions, setQuestions] = useState(initialQuestions);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(false);
//   const [receiverId, setReceiverId] = useState(null);

//   const token = localStorage.getItem('access')

//   const STATUS_ACTIONS = {
//     'Application Send': ['View Application'],
//     'Application Viewed': ['View Resume', 'Accept', 'Reject'],
//     'Resume Viewed': ['Schedule Interview', 'ShortList', 'Accept', 'Reject'],
//     'ShortListed': ['Schedule Interview', 'Accept', 'Reject'],
//     'Interview Scheduled': ['Complete Interview', 'Mark as Missed', 'Cancel Interview'],
//     'Completed': ['ShortList'],
//     'You missed': ['Reschedule Interview'],
//     'Interview Cancelled': ['Reschedule Interview'],
//     'Accepted': [],
//     'Rejected': [],
//   };

//   // Map API status to frontend status
//   const STATUS_MAPPING = {
//     ShortList: 'ShortListed',
//     ApplicationViewd: 'Application Viewed',
//   };
//     const openChatModal = useCallback(() => {
//     if (showChatModal) return; 
//   }, [showChatModal]);

//   const openScheduleModal = useCallback(() => {
//     if (showScheduleModal) return; 
//     setShowScheduleModal(true);
//   }, [showScheduleModal]);
 
//   const getQuestionAnswerPairs = () => {
//     if (!current?.answers) return [];
//     return current.answers.map((answer) => {
//       const question = questions.find((q) => q?.id === answer.question) || {
//         id: answer.question,
//         text: answer.question_text || `Question ${answer.question}`,
//       };
//       return {
//         question,
//         answer,
//         key: `${answer.id}-${answer.question}`,
//       };
//     });
//   };

//   useEffect(() => {
//     if (!current) return;
//     const normalizedStatus = STATUS_MAPPING[current.status] || current.status;
//     console.log('useEffect - Current status:', current.status, 'Normalized:', normalizedStatus, 'AppStatus:', appStatus);
//     setAppStatus(normalizedStatus);
//     if (normalizedStatus === 'Application Send') {
//       changeStatus('Application Viewed');
//     }
//     fetchInterviewData();
//   }, [current]);

//   const fetchInterviewData = async () => {
    
//     if (!token || !selectedJob?.id || !current?.candidate?.id) return;

//     try {
//       const response = await axios.get(
//         `${baseURL}/api/interview/schedule/?job_id=${selectedJob.id}&candidate_id=${current.candidate.id}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
//       const matchingInterview = interviews.find(
//         (interview) => interview.candidate === current.candidate.id && interview.job === selectedJob.id
//       );

//       setInterviewData(matchingInterview || null);
//       setReceiverId(current.candidate?.user || null);
//     } catch (error) {
//       console.error('Error fetching interview data:', error);
//     }
//   };

//   const changeStatus = async (newStatus) => {
//     if (isButtonDisabled) return;
   
//     if (!token) return;

//     setIsButtonDisabled(true);

//     try {
//       Swal.fire({
//         title: 'Updating Status...',
//         allowOutsideClick: false,
//         didOpen: () => Swal.showLoading(),
//       });

//       const response = await axios.post(
//         `${baseURL}/api/empjob/applicationStatus/${current.id}/`,
//         { action: newStatus, job_id: selectedJob.id }, // Fixed syntax error
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.status >= 200 && response.status < 300) {
//         console.log('Status updated - NewStatus:', newStatus, 'Response:', response.data);
//         setAppStatus(newStatus);
//         if (fetchJobDetails) {
//           await fetchJobDetails();
//         }

//         Swal.fire({
//           icon: 'success',
//           title: 'Status Updated',
//           text: `Status changed to ${newStatus}`,
//           showConfirmButton: false,
//           timer: 1500,
//         });

//         if (['Interview Scheduled', 'Completed', 'You missed', 'Interview Cancelled'].includes(newStatus)) {
//           await fetchInterviewData();
//         }
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.response?.data?.error || 'Failed to update status.',
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     } finally {
//       setIsButtonDisabled(false);
//       Swal.close();
//     }
//   };

//   const handleResumeClick = () => {
//     if (appStatus === 'Application Viewed') {
//       changeStatus('Resume Viewed');
//     }
//     if (current.candidate?.resume) {
//       window.open(`${baseURL}${current.candidate.resume}`, '_blank'); // Fixed parentheses
//     }
//   };

//   const scheduleInterview = async () => {
   
//     if (!token) return;

//     try {
     
//         // `${baseURL}/api/interview/schedule/?job_id=${selectedJob.id}&candidate_id=${current.candidate.id}`, // Fixed candidate_id
//          const response = await axios.get(`${baseURL}/api/interview/schedules/`, 
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
//       const matchingInterview = interviews.find(
//         (interview) => interview.candidate === current.candidate.id && interview.job === selectedJob.id
//       );

//       if (matchingInterview && appStatus !== 'Interview Cancelled' && appStatus !== 'You missed') {
//         Swal.fire({
//           icon: 'warning',
//           title: 'Interview Exists',
//           text: 'This candidate already has an interview scheduled.',
//           showConfirmButton: false,
//           timer: 1500,
//         });
//         return;
//       }

//       setShowScheduleModal(true);
//     } catch (error) {
//       console.error('Error checking schedule:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to check interview schedule.',
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     }
//   };

//   const cancelInterview = async () => {
//     const confirmation = await Swal.fire({
//       title: 'Cancel Interview?',
//       text: 'Are you sure you want to cancel this interview?',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonText: 'Yes, cancel',
//     });

//     if (!confirmation.isConfirmed) return;

   
//     if (!token) return;

//     try {
//       Swal.fire({
//         title: 'Canceling...',
//         allowOutsideClick: false,
//         didOpen: () => Swal.showLoading(),
//       });

//       await axios.post(
//         `${baseURL}/api/interview/cancelApplication/`,
//         { candidate_id: current.candidate.id, job_id: selectedJob.id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       changeStatus('Interview Cancelled');
//       Swal.fire({
//         icon: 'success',
//         title: 'Interview Cancelled',
//         text: 'The interview has been cancelled.',
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     } catch (error) {
//       console.error('Error canceling interview:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to cancel interview.',
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     }
//   };

//   const handleAction = (action) => {
//     console.log('Handling action:', action, 'AppStatus:', appStatus);
//     switch (action) {
//       case 'View Application':
//         changeStatus('Application Viewed');
//         break;
//       case 'View Resume':
//         handleResumeClick();
//         break;
//       case 'Schedule Interview':
//       case 'Reschedule Interview':
//         scheduleInterview();
//         break;
//       case 'Complete Interview':
//         changeStatus('Completed');
//         break;
//       case 'Mark as Missed':
//         changeStatus('You missed');
//         break;
//       case 'Cancel Interview':
//         cancelInterview();
//         break;
//       case 'Accept':
//       case 'Reject':
//       case 'ShortList':
//         changeStatus(action);
//         break;
//       default:
//         break;
//     }
//   };

//   if (!current) {
//     return <div className="no-selection">Select a candidate to view details</div>;
//   }

//   const profilePic = current.candidate?.profile_pic
//     ? `${baseURL}${current.candidate.profile_pic}`
//     : '/default-profile.png';
//   const userName = current.candidate?.user_name || current.candidate_name || 'N/A';
//   const employerId = selectedJob?.employer_id || localStorage.getItem('user_id');
//   const empName = selectedJob?.employer_name || 'Employer';
//   const normalizedAppStatus = STATUS_MAPPING[appStatus] || appStatus;
//   const availableActions = STATUS_ACTIONS[normalizedAppStatus] || [];
//   const isFinalStatus = ['Accepted', 'Rejected'].includes(normalizedAppStatus);
//   const questionAnswerPairs = getQuestionAnswerPairs();

//   console.log('Rendering - AppStatus:', appStatus, 'Normalized:', normalizedAppStatus, 'AvailableActions:', availableActions, 'isFinalStatus:', isFinalStatus);

//   return (
//     <div className="candidate-view-container">
//       {showScheduleModal && (
//         <ScheduleModal
//           setModal={setShowScheduleModal}
//           candidate_id={current.candidate?.id}
//           job_id={selectedJob?.id}
//           application_id={current.id}
//           onScheduleSuccess={async () => {
//             console.log('Schedule success - Updating to Interview Scheduled');
//             await changeStatus('Interview Scheduled');
//             await fetchInterviewData();
//           }}
//         />
//       )}

//       {showChatModal && (
//         <ChatModal
//           setChat={setShowChatModal}
//           profile_pic={profilePic}
//           userName={userName}
//           emp_name={empName}
//           candidate_id={current.candidate?.id}
//           employer_id={employerId}
//           senderName={empName}
//           currentUserId={employerId}
//           receiverId={receiverId}
//         />
//       )}

//       <div className="candidate-header">
//         <div className="candidate-profile">
//           <img src={profilePic} alt={`${userName}'s profile`} className="profile-image" />
//           <div>
//             <h2>{userName}</h2>
//             <div className={`status-badge status-${normalizedAppStatus.toLowerCase().replace(/\s+/g, '-')}`}>
//               {normalizedAppStatus}
//             </div>
//           </div>
//         </div>

//         <div className="action-buttons">
//           <button
//             onClick={() => setShowChatModal(true)}
//             className="action-btn chat-btn"
//             title="Chat with candidate"
//             disabled={isButtonDisabled}
//             aria-label={`Chat with ${userName}`}
//           >
//             <FaCommentDots className="chat-icon" />
//             <span className="chat-text">Chat</span>
//           </button>
//           {!isFinalStatus &&
//             availableActions.map((action) => (
//               <button
//                 key={action}
//                 onClick={() => handleAction(action)}
//                 disabled={isButtonDisabled}
//                 className={`action-btn ${action.toLowerCase().replace(/\s+/g, '-')}`}
//                 aria-label={`${action} for ${userName}`}
//               >
//                 {action}
//               </button>
//             ))}
//         </div>
//       </div>

//       <div className="candidate-details">
//         <div className="details-section">
//           <h3>Personal Information</h3>
//           <div className="info-grid">
//             <div className="info-item">
//               <label>Email:</label>
//               <p>{current.candidate?.email || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <label>Phone:</label>
//               <p>{current.candidate?.phone || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <label>Gender:</label>
//               <p>{current.candidate?.gender || current.candidate?.Gender || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <label>Date of Birth:</label>
//               <p>{current.candidate?.dob || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <label>Applied On:</label>
//               <p>{new Date(current.applyed_on).toLocaleDateString()}</p>
//             </div>
//           </div>
//         </div>

//         {current.candidate?.education?.length > 0 && (
//           <div className="details-section">
//             <h3>Education</h3>
//             <div className="info-grid">
//               <div className="info-item">
//                 <label>Qualification:</label>
//                 <p>{current.candidate.education[0].education || 'N/A'}</p>
//               </div>
//               <div className="info-item">
//                 <label>Specialization:</label>
//                 <p>{current.candidate.education[0].specilization || 'N/A'}</p>
//               </div>
//               <div className="info-item">
//                 <label>Completed Year:</label>
//                 <p>{current.candidate.education[0].completed || 'N/A'}</p>
//               </div>
//               <div className="info-item">
//                 <label>College:</label>
//                 <p>{current.candidate.education[0].college || 'N/A'}</p>
//               </div>
//               <div className="info-item">
//                 <label>Grade:</label>
//                 <p>{current.candidate.education[0].mark || 'N/A'}</p>
//               </div>
//               <div className="info-item">
//                 <label>Skills:</label>
//                 <p>{current.candidate.skills || 'N/A'}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="details-section">
//           <h3>Links & Documents</h3>
//           <div className="info-grid">
//             <div className="info-item">
//               <label>LinkedIn:</label>
//               {current.candidate?.linkedin ? (
//                 <a href={current.candidate.linkedin} target="_blank" rel="noopener noreferrer">
//                   View Profile
//                 </a>
//               ) : (
//                 <p>N/A</p>
//               )}
//             </div>
//             <div className="info-item">
//               <label>GitHub:</label>
//               {current.candidate?.github ? (
//                 <a href={current.candidate.github} target="_blank" rel="noopener noreferrer">
//                   View Profile
//                 </a>
//               ) : (
//                 <p>N/A</p>
//               )}
//             </div>
//             <div className="info-item">
//               <label>Resume:</label>
//               {current.candidate?.resume ? (
//                 <a
//                   href={`${baseURL}${current.candidate.resume}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   onClick={handleResumeClick}
//                 >
//                   View Resume
//                 </a>
//               ) : (
//                 <p>N/A</p>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="details-section">
//           <h3>Interview Questions & Answers</h3>
//           {loadingQuestions ? (
//             <p>Loading questions...</p>
//           ) : questionAnswerPairs.length > 0 ? (
//             <div className="qa-list">
//               {questionAnswerPairs.map(({ question, answer, key }) => (
//                 <div key={key} className="qa-item">
//                   <div className="question">{question.text}</div>
//                   <div className="answer">{answer.answer_text || 'No answer provided'}</div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p>No questions answered</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// CandidateView.propTypes = {
//   selectedJob: PropTypes.shape({
//     id: PropTypes.number,
//     employer_id: PropTypes.number,
//     employer_name: PropTypes.string,
//   }).isRequired,
//   current: PropTypes.shape({
//     id: PropTypes.number,
//     status: PropTypes.string,
//     applyed_on: PropTypes.string,
//     candidate_name: PropTypes.string,
//     candidate: PropTypes.shape({
//       id: PropTypes.number,
//       user: PropTypes.number,
//       user_name: PropTypes.string,
//       profile_pic: PropTypes.string,
//       email: PropTypes.string,
//       phone: PropTypes.string,
//       gender: PropTypes.string,
//       Gender: PropTypes.string,
//       dob: PropTypes.string,
//       linkedin: PropTypes.string,
//       github: PropTypes.string,
//       resume: PropTypes.string,
//       skills: PropTypes.string,
//       education: PropTypes.arrayOf(
//         PropTypes.shape({
//           education: PropTypes.string,
//           specilization: PropTypes.string,
//           completed: PropTypes.string,
//           college: PropTypes.string,
//           mark: PropTypes.string,
//         })
//       ),
//       answers: PropTypes.arrayOf(
//         PropTypes.shape({
//           id: PropTypes.number,
//           question: PropTypes.number,
//           question_text: PropTypes.string,
//           answer_text: PropTypes.string,
//         })
//       ),
//     }),
//   }).isRequired,
//   questions: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.number,
//       text: PropTypes.string,
//     })
//   ),
//   fetchJobDetails: PropTypes.func,
// };

// export default CandidateView;

























































