// // import React, { useState, useEffect } from 'react';
// // import { RiMessage2Fill } from 'react-icons/ri';
// // import ChatModal from './ChatModal';
// // import '../job/style/Candidateview.css';

// // function StatusJob({ selectedJob, toggleDrawer }) {
// //   const [step, setStep] = useState(0);
// //   const [chat, setChat] = useState(false);
// //   const baseURL = 'http://127.0.0.1:8000';
// //   const currentUserId = localStorage.getItem('user_id');

// //   useEffect(() => {
// //     setStep(0); // Reset step first
// //     if (selectedJob?.status) {
// //       const statusSteps = {
// //         'Application Send': 1,
// //         'Application Viewed': 2,
// //         'Resume Viewed': 3,
// //         'Pending': 4,
// //         'ShortListed': 5,
// //         'Accepted': 5,
// //         'Rejected': 6,
// //       };
// //       setStep(statusSteps[selectedJob.status] || 0);
// //     }
// //   }, [selectedJob]); // This dependency ensures useEffect runs when selectedJob changes
  
// //   if (!selectedJob) return null;

// //   // Ensure we have valid values for all required properties
// //   const candidateId = selectedJob.candidate || '';
// //   const employerId = selectedJob.job?.employer?.id || '';
// //   const employerPic = selectedJob.job?.employer?.profile_pic 
// //     ? `${baseURL}${selectedJob.job.employer.profile_pic}` 
// //     : '';
// //   const employerName = selectedJob.job?.employer?.user_full_name || 'Employer';
// //   const candidateName = selectedJob.candidate_name || 'Candidate';

// //   const handleChat = () => {
// //     // Only open chat if we have valid IDs
// //     if (candidateId && employerId) {
// //       console.log("Opening chat with:", {
// //         candidate_id: candidateId,
// //         employer_id: employerId,
// //         profile_pic: employerPic,
// //         userName: employerName,
// //         currentUserId: currentUserId,
// //         senderName: candidateName
// //       });
// //       setChat(true);
// //     } else {
// //       console.error("Missing required IDs for chat:", { candidateId, employerId });
// //       alert("Cannot open chat: Missing required information");
// //     }
// //   };

// //   return (
// //     <div className="status-job-container">
// //       <div className="job-card">
// //         {chat && (
// //           <ChatModal
// //             candidate_id={candidateId}
// //             employer_id={employerId}
// //             setChat={setChat}
// //             profile_pic={employerPic}
// //             userName={employerName}
// //             currentUserId={currentUserId}
// //             senderName={candidateName}
// //           />
// //         )}
        
// //         <div className="chat-icon" onClick={handleChat}>
// //           <RiMessage2Fill size={25} />
// //         </div>

// //         <div className="job-header">
// //           <h2>{selectedJob.job?.title || 'Job Title'}</h2>
// //           <p>{employerName}</p>
// //         </div>

// //         <div className="status-tracker">
// //           <h3>Application Status</h3>
// //           <div className="progress-steps">
// //             {[
// //               { label: "Sent", step: 1 },
// //               { label: "Viewed", step: 2 },
// //               { label: "Resume", step: 3 },
// //               { 
// //                 label: step >= 4 ? selectedJob.status : "Review", 
// //                 step: 4,
// //                 status: selectedJob.status
// //               },
// //             ].map(({ label, step: stepValue, status }, index) => {
// //               let stepClass = '';
// //               if (step >= stepValue) {
// //                 if (stepValue === 4) {
// //                   switch (status) {
// //                     case 'Pending':
// //                       stepClass = 'pending';
// //                       break;
// //                     case 'ShortListed':
// //                       stepClass = 'shortlisted';
// //                       break;
// //                     case 'Accepted':
// //                       stepClass = 'completed';
// //                       break;
// //                     case 'Rejected':
// //                       stepClass = 'rejected';
// //                       break;
// //                     default:
// //                       stepClass = '';
// //                   }
// //                 } else {
// //                   stepClass = 'completed';
// //                 }
// //               }
              
// //               return (
// //                 <div key={`step-${index}`} className="step-container">
// //                   <div className={`step-circle ${stepClass}`}>
// //                     {step >= stepValue ? (
// //                       <svg viewBox="0 0 24 24">
// //                         <path d="M5 13l4 4L19 7" />
// //                       </svg>
// //                     ) : (
// //                       <span>{index + 1}</span>
// //                     )}
// //                   </div>
// //                   <p className="step-label">{label}</p>
// //                   {index < 3 && (
// //                     <div className={`connector ${step > stepValue ? 'active' : ''}`}></div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       </div>

// //       <div className="job-details">
// //         <div className="details-section">
// //           <span className="section-title">Job Description</span>
// //           <p className="section-content">{selectedJob.job?.about || 'Not specified'}</p>
// //         </div>
// //         <div className="details-section">
// //           <span className="section-title">Job Type:</span>
// //           <p className="section-content">{selectedJob.job?.jobtype || 'Not specified'}</p>
// //         </div>
// //         <div className="details-section">
// //           <span className="section-title">Job Mode:</span>
// //           <p className="section-content">{selectedJob.job?.jobmode || 'Not specified'}</p>
// //         </div>
// //         <div className="details-section">
// //           <span className="section-title">Responsibilities</span>
// //           <p className="section-content">{selectedJob.job?.responsibility || 'Not specified'}</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default StatusJob;




// // import React, { useState, useEffect } from 'react';
// // import { RiMessage2Fill } from 'react-icons/ri';
// // import ChatModal from './ChatModal';
// // import '../job/style/Candidateview.css';

// // function StatusJob({ selectedJob, toggleDrawer }) {
// //   const [step, setStep] = useState(0);
// //   const [chat, setChat] = useState(false);
// //   const baseURL = 'http://127.0.0.1:8000';
// //   const currentUserId = localStorage.getItem('user_id');
// //   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

// //   // Add resize listener to detect screen size changes
// //   useEffect(() => {
// //     const handleResize = () => {
// //       setIsMobile(window.innerWidth <= 768);
// //     };

// //     window.addEventListener('resize', handleResize);
// //     return () => {
// //       window.removeEventListener('resize', handleResize);
// //     };
// //   }, []);

// //   useEffect(() => {
// //     setStep(0); // Reset step first
// //     if (selectedJob?.status) {
// //       const statusSteps = {
// //         'Application Send': 1,
// //         'Application Viewed': 2,
// //         'Resume Viewed': 3,
// //         'Pending': 4,
// //         'ShortListed': 5,
// //         'Accepted': 5,
// //         'Rejected': 6,
// //       };
// //       setStep(statusSteps[selectedJob.status] || 0);
// //     }
// //   }, [selectedJob]); // This dependency ensures useEffect runs when selectedJob changes
  
// //   if (!selectedJob) return null;

// //   // Ensure we have valid values for all required properties
// //   const candidateId = selectedJob.candidate || '';
// //   const employerId = selectedJob.job?.employer?.id || '';
// //   const employerPic = selectedJob.job?.employer?.profile_pic 
// //     ? `${baseURL}${selectedJob.job.employer.profile_pic}` 
// //     : '';
// //   const employerName = selectedJob.job?.employer?.user_full_name || 'Employer';
// //   const candidateName = selectedJob.candidate_name || 'Candidate';

// //   const handleChat = () => {
// //     // Only open chat if we have valid IDs
// //     if (candidateId && employerId) {
// //       console.log("Opening chat with:", {
// //         candidate_id: candidateId,
// //         employer_id: employerId,
// //         profile_pic: employerPic,
// //         userName: employerName,
// //         currentUserId: currentUserId,
// //         senderName: candidateName
// //       });
// //       setChat(true);
// //     } else {
// //       console.error("Missing required IDs for chat:", { candidateId, employerId });
// //       alert("Cannot open chat: Missing required information");
// //     }
// //   };

// //   return (
// //     <div className="status-job-container">
// //       <div className="job-card">
// //         {chat && (
// //           <ChatModal
// //             candidate_id={candidateId}
// //             employer_id={employerId}
// //             setChat={setChat}
// //             profile_pic={employerPic}
// //             userName={employerName}
// //             currentUserId={currentUserId}
// //             senderName={candidateName}
// //           />
// //         )}
        
// //         <div className="chat-icon" onClick={handleChat} aria-label="Chat with employer">
// //           <RiMessage2Fill size={25} />
// //         </div>

// //         <div className="job-header">
// //           <h2>{selectedJob.job?.title || 'Job Title'}</h2>
// //           <p>{employerName}</p>
// //         </div>

// //         <div className="status-tracker">
// //           <h3>Application Status</h3>
// //           <div className="progress-steps">
// //             {[
// //               { label: "Sent", step: 1 },
// //               { label: "Viewed", step: 2 },
// //               { label: "Resume", step: 3 },
// //               { 
// //                 label: step >= 4 ? selectedJob.status : "Review", 
// //                 step: 4,
// //                 status: selectedJob.status
// //               },
// //             ].map(({ label, step: stepValue, status }, index) => {
// //               let stepClass = '';
// //               if (step >= stepValue) {
// //                 if (stepValue === 4) {
// //                   switch (status) {
// //                     case 'Pending':
// //                       stepClass = 'pending';
// //                       break;
// //                     case 'ShortListed':
// //                       stepClass = 'shortlisted';
// //                       break;
// //                     case 'Accepted':
// //                       stepClass = 'completed';
// //                       break;
// //                     case 'Rejected':
// //                       stepClass = 'rejected';
// //                       break;
// //                     default:
// //                       stepClass = '';
// //                   }
// //                 } else {
// //                   stepClass = 'completed';
// //                 }
// //               }
              
// //               return (
// //                 <div key={`step-${index}`} className="step-container">
// //                   <div className={`step-circle ${stepClass}`}>
// //                     {step >= stepValue ? (
// //                       <svg viewBox="0 0 24 24">
// //                         <path d="M5 13l4 4L19 7" />
// //                       </svg>
// //                     ) : (
// //                       <span>{index + 1}</span>
// //                     )}
// //                   </div>
// //                   <p className="step-label">{label}</p>
// //                   {index < 3 && !isMobile && (
// //                     <div className={`connector ${step > stepValue ? 'active' : ''}`}></div>
// //                   )}
// //                   {index < 3 && isMobile && (
// //                     <div className={`connector ${step > stepValue ? 'active' : ''}`}></div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       </div>

// //       <div className="job-details">
// //         <div className="details-section">
// //           <span className="section-title">Job Description</span>
// //           <p className="section-content">{selectedJob.job?.about || 'Not specified'}</p>
// //         </div>
// //         <div className="details-section">
// //           <span className="section-title">Job Type:</span>
// //           <p className="section-content">{selectedJob.job?.jobtype || 'Not specified'}</p>
// //         </div>
// //         <div className="details-section">
// //           <span className="section-title">Job Mode:</span>
// //           <p className="section-content">{selectedJob.job?.jobmode || 'Not specified'}</p>
// //         </div>
// //         <div className="details-section">
// //           <span className="section-title">Responsibilities</span>
// //           <p className="section-content">{selectedJob.job?.responsibility || 'Not specified'}</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default StatusJob;






// import React, { useState, useEffect } from 'react';
// import { RiMessage2Fill } from 'react-icons/ri';
// import ChatModal from './ChatModal';
// import SheduleModal from '../../../Components/Interview/Scheduledmodal';
// import '../job/style/Candidateview.css';

// function StatusJob({ selectedJob, toggleDrawer }) {
//   const [step, setStep] = useState(0);
//   const [showScheduleModal, setShowScheduleModal] = useState(false);
//   const [interviewScheduled, setInterviewScheduled] = useState(false);
//   const baseURL = 'http://127.0.0.1:8000';
//   const currentUserId = localStorage.getItem('user_id');

//   useEffect(() => {
//     setStep(0);
//     if (selectedJob?.status) {
//       const statusSteps = {
//         'Application Send': 1,
//         'Application Viewed': 2,
//         'Resume Viewed': 3,
//         'Pending': 4,
//         'ShortListed': 5,
//         'Scheduled': 5, // New status
//         'Accepted': 6,
//         'Rejected': 6,
//       };
//       setStep(statusSteps[selectedJob.status] || 0);
//       setInterviewScheduled(selectedJob.status === 'Scheduled');
//     }
//   }, [selectedJob]);

//   const handleScheduleInterview = async (interviewData) => {
//     try {
//       const response = await fetch(`${baseURL}/api/interview/schedule/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('access')}`
//         },
//         body: JSON.stringify({
//           application_id: selectedJob.id,
//           ...interviewData
//         })
//       });

//       if (response.ok) {
//         setInterviewScheduled(true);
//         setShowScheduleModal(false);
//         // Update the job status in parent component or refetch data
//       }
//     } catch (error) {
//       console.error('Error scheduling interview:', error);
//     }
//   };

//   // Add accept/reject handlers
//   const handleAcceptReject = async (status) => {
//     try {
//       const response = await fetch(`${baseURL}/api/application/${selectedJob.id}/`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('access')}`
//         },
//         body: JSON.stringify({ status })
//       });

//       if (response.ok) {
//         // Update status in parent component or refetch data
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//     }
//   };

//   // Modified status steps rendering
//   const renderStatusStep = (label, stepValue, status) => {
//     const isScheduledStep = status === 'Scheduled';
    
//     return (
//       <div className="step-container" key={label}>
//         <div className={`step-circle ${step >= stepValue ? status.toLowerCase() : ''}`}>
//           {step >= stepValue ? (
//             isScheduledStep ? (
//               <button 
//                 className="schedule-button"
//                 onClick={() => setShowScheduleModal(true)}
//               >
//                 Schedule
//               </button>
//             ) : (
//               <svg viewBox="0 0 24 24">
//                 <path d="M5 13l4 4L19 7" />
//               </svg>
//             )
//           ) : (
//             <span>{stepValue}</span>
//           )}
//         </div>
//         <p className="step-label">{label}</p>
//       </div>
//     );
//   };

//   return (
//     <div className="status-job-container">
//       {showScheduleModal && (
//         <SheduleModal
//           onClose={() => setShowScheduleModal(false)}
//           onSchedule={handleScheduleInterview}
//         />
//       )}

//       {/* Existing job card content */}

//       {interviewScheduled && (
//         <div className="interview-actions">
//           <button 
//             className="accept-button"
//             onClick={() => handleAcceptReject('Accepted')}
//           >
//             Accept Interview
//           </button>
//           <button
//             className="reject-button"
//             onClick={() => handleAcceptReject('Rejected')}
//           >
//             Reject Interview
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default StatusJob;