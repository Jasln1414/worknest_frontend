// import React, { useState } from 'react';
// import Swal from 'sweetalert2';
// import axios from 'axios';
// import { extractDate, extractTime } from './DateTime';

// const AcceptRejectModal = ({ setModal, modalData, setLoad, load, markInterviewCompleted }) => {
//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const interview = modalData[0];

//   // Debug: Log interview data
//   console.log('Interview data:', interview);

//   const markInterviewRejected = async (interviewId) => {
//     if (isProcessing) return;

//     try {
//       setIsProcessing(true);

//       Swal.fire({
//         title: 'Rejecting...',
//         text: 'Please wait',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         },
//       });

//       await axios.patch(`${baseURL}/api/interview/schedules/${interviewId}/`, 
//         { status: 'Rejected' },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//           }
//         }
//       );
//       setLoad(!load);
//       Swal.fire({
//         icon: 'success',
//         title: 'Interview Rejected',
//         text: 'The candidate has been rejected for this position.',
//         timer: 1500,
//       });
//     } catch (error) {
//       console.error(`Error rejecting interview ${interviewId}:`, error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: `Failed to reject interview. ${error.response?.data?.message || 'Please try again.'}`,
//         timer: 2000,
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const markInterviewCanceled = async (interviewId) => {
//     if (isProcessing) return;

//     // Debug: Log cancel data
//     const cancelData = {
//       interview_id: interview?.id,
//       candidate_id: interview?.candidate || interview?.original?.candidate,
//       job_id: interview?.job || interview?.original?.job,
//     };
//     console.log('Cancel data:', cancelData);

//     // Validate required fields
//     if (!cancelData.interview_id || !cancelData.candidate_id || !cancelData.job_id) {
//       console.error('Missing required fields for cancel:', cancelData);
//       Swal.fire({
//         icon: 'error',
//         title: 'Cancel Failed',
//         text: 'Missing interview, candidate, or job data.',
//         timer: 2000,
//       });
//       setIsProcessing(false);
//       return;
//     }

//     try {
//       setIsProcessing(true);

//       Swal.fire({
//         title: 'Canceling...',
//         text: 'Please wait',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         },
//       });

//       const response = await axios.post(
//         `${baseURL}/api/interview/cancelApplication/`,
//         cancelData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       if (response.status === 200) {
//         setLoad(!load);
//         Swal.fire({
//           icon: 'success',
//           title: 'Application Canceled',
//           text: 'The interview has been canceled successfully.',
//           timer: 1500,
//         });
//       }
//     } catch (error) {
//       console.error('Error canceling interview:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Cancel Failed',
//         text: `Failed to cancel interview. ${error.response?.data?.message || 'Please try again.'}`,
//         timer: 2000,
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleAccept = () => {
//     markInterviewCompleted(interview.id); // Calls markInterviewCompleted from Schedules.js
//     setModal(false);
//   };

//   const handleReject = () => {
//     markInterviewRejected(interview.id);
//     setModal(false);
//   };

//   const handleCancel = () => {
//     markInterviewCanceled(interview.id);
//     setModal(false);
//   };

//   // Only show Cancel button for Upcoming interviews
//   const isCancelable = interview.status === 'Upcoming';

//   return (
//     <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && !isProcessing && setModal(false)}>
//       <div className="modal-container">
//         <h2>Interview Details</h2>
//         <p>Job: {interview.job_title || 'Not available'}</p>
//         <p>Candidate: {interview.candidate_name || 'Not available'}</p>
//         <p>Date: {extractDate(interview.date) || 'Not available'}</p>
//         <p>Time: {extractTime(interview.date) || 'Not available'}</p>
//         <p>Status: {interview.status || 'Unknown'}</p>
//         <div className="modal-actions">
//           <button 
//             onClick={handleAccept} 
//             className="modal-button accept" 
//             disabled={isProcessing}
//           >
//             {isProcessing ? 'Processing...' : 'Accept'}
//           </button>
//           <button 
//             onClick={handleReject} 
//             className="modal-button reject" 
//             disabled={isProcessing}
//           >
//             {isProcessing ? 'Processing...' : 'Reject'}
//           </button>
//           {isCancelable && (
//             <button 
//               onClick={handleCancel} 
//               className="modal-button cancel-button" 
//               disabled={isProcessing}
//             >
//               {isProcessing ? 'Processing...' : 'Cancel'}
//             </button>
//           )}
//           <button 
//             onClick={() => setModal(false)} 
//             className="modal-button cancel" 
//             disabled={isProcessing}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AcceptRejectModal;