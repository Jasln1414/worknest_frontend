// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';
// import SheduleModal from '../../../Components/Interview/Scheduledmodal';
// import './style/CandidateView.css';

// const CandidateView = ({ selectedJob, setChange, current, questions: initialQuestions = [] }) => {
//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');
//   const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
//   const [showScheduleModal, setShowScheduleModal] = useState(false);
//   const [interviewScheduled, setInterviewScheduled] = useState(current?.status === 'Interview Scheduled');
//   const [interviewDate, setInterviewDate] = useState(null);
//   const [questions, setQuestions] = useState(initialQuestions);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [isButtonDisabled, setIsButtonDisabled] = useState(false);

//   // Resize listener
//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Update states when current prop changes
//   useEffect(() => {
//     if (current) {
//       setAppStatus(current.status || 'Application Send');
//       setInterviewScheduled(current.status === 'Interview Scheduled');
      
//       // Check for interview date when component mounts or current changes
//       fetchInterviewDate();
//     }
//   }, [current]);

//   // Fetch interview date if interview is scheduled
//   const fetchInterviewDate = async () => {
//     if (!current || !current.id || current.status !== 'Interview Scheduled') {
//       setInterviewDate(null);
//       return;
//     }
    
//     try {
//       // Try to get interview data from the application status endpoint
//       const response = await axios.get(
//        `${baseURL}/api/empjob/getApplicationjobs/`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
      
//       if (response.status === 200) {
//         // Find the current application in the response
//         const applications = response.data;
//         const currentApp = applications.find(app => app.id === current.id);
        
//         if (currentApp && currentApp.interview_date) {
//           setInterviewDate(currentApp.interview_date);
//         } else {
//           // If not found, try to get from interview endpoint
//           try {
//             const interviewResponse = await axios.get(
//               `${baseURL}/api/interview/schedules/`,
//               { headers: { Authorization: `Bearer ${token}` } }
//             );
            
//             if (interviewResponse.status === 200) {
//               const interviews = interviewResponse.data;
//               const matchingInterview = interviews.find(
//                 interview => interview.application_id === current.id ||
//                 (interview.candidate === current.candidate?.id && interview.job === selectedJob.id)
//               );
              
//               if (matchingInterview && matchingInterview.date) {
//                 setInterviewDate(matchingInterview.date);
//               }
//             }
//           } catch (interviewError) {
//             console.error('Error fetching interview data:', interviewError);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching application data:', error);
//     }
//   };

//   // Format date for display
//   const formatInterviewDate = (dateString) => {
//     if (!dateString) return '';
    
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       weekday: 'short',
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   // Fetch questions
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       if (!selectedJob?.id || !current) return;
      
//       setLoadingQuestions(true);
//       try {
//         // First check if we have answers with question text
//         if (current.answers?.length > 0 && current.answers.every(answer => answer && answer.question_text)) {
//           const uniqueQuestions = (current.answers || []).reduce((acc, answer) => {
//             if (!acc.some(q => q.id === answer.question)) {
//               acc.push({
//                 id: answer.question,
//                 text: answer.question_text,
//                 question_type: answer.question_type || 'TEXT',
//               });
//             }
//             return acc;
//           }, []);
//           setQuestions(uniqueQuestions);
//           return;
//         }

//         // Otherwise fetch questions from API
//         const response = await axios.get(
//           `${baseURL}/api/empjob/getjobs/questions/${selectedJob.id}/`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const questionsData = Array.isArray(response.data) ? response.data : [];
//         setQuestions(questionsData);

//         if (questionsData.length === 0) {
//           console.warn(`No questions found for job ${selectedJob.id}`);
//         }
//       } catch (error) {
//         console.error('Error fetching questions:', error.response || error);
//         Swal.fire({
//           icon: 'error',
//           title: 'Error',
//           text: 'Failed to fetch questions. Using answer data where available.',
//           timer: 2000,
//         });
//       } finally {
//         setLoadingQuestions(false);
//       }
//     };

//     if (selectedJob?.id && (!initialQuestions || initialQuestions.length === 0)) {
//       fetchQuestions();
//     }
//   }, [selectedJob, initialQuestions, token, current]);

//   if (!current) {
//     return <div className="no-selection">Select an application to view details</div>;
//   }

//   const answers = current.answers || [];
//   const profilePic = current.candidate?.profile_pic ? `${baseURL}${current.candidate.profile_pic}` : '';
//   const userName = current.candidate?.user_name || current.candidate_name;
//   const candidateId = current.candidate?.id;
//   const applicationId = current.id; // The specific application ID

//   const changeStatus = async (action) => {
//     // Prevent multiple clicks while processing
//     if (isButtonDisabled) return;
    
//     setIsButtonDisabled(true);
    
//     try {
//       // Show loading indicator
//       Swal.fire({
//         title: 'Updating Status...',
//         text: 'Please wait',
//         allowOutsideClick: false,
//         didOpen: () => {
//           Swal.showLoading();
//         }
//       });
      
//       // Use the applicationStatus endpoint with the current application ID
//       const response = await axios.post(
//         `${baseURL}/api/empjob/applicationStatus/${current.id}/`,
//         { 
//           action,
//           job_id: selectedJob.id // Include job_id parameter
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: 'application/json',
//             'Content-Type': 'application/json',
//           },
//         }
//       );
      
//       if (response.status === 200) {
//         setAppStatus(action);
        
//         // Update interviewScheduled state based on action
//         if (action === 'Interview Scheduled') {
//           setInterviewScheduled(true);
//           // Fetch the new interview date
//           fetchInterviewDate();
//         } else if (action === 'Accepted' || action === 'Rejected') {
//           // Keep interview scheduled state for these statuses
//         } else {
//           setInterviewScheduled(false);
//           setInterviewDate(null);
//         }
        
//         setChange(prev => !prev);
        
//         Swal.fire({
//           icon: 'success',
//           title: 'Status Updated',
//           text: `Application status changed to ${action}.`,
//           showConfirmButton: false,
//           timer: 1500,
//         });
//       }
//     } catch (error) {
//       console.error('Error updating status:', error.response || error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: 'Failed to update status. Please try again.',
//         showConfirmButton: false,
//         timer: 1500,
//       });
//     } finally {
//       setIsButtonDisabled(false);
//     }
//   };

//   const handleResume = () => changeStatus('Resume Viewed');
  
//   // Function to open schedule modal
//   const openScheduleModal = () => {
//     setShowScheduleModal(true);
//   };

//   const getQuestionAnswerPairs = () => {
//     if (!answers || !Array.isArray(answers) || answers.length === 0) {
//       return [];
//     }

//     return answers.map(answer => {
//       const matchingQuestion = questions.find(q => q && Number(q.id) === Number(answer.question));
//       return {
//         question: {
//           id: answer.question,
//           text: answer.question_text || matchingQuestion?.text || `Question ${answer.question} (Not Found)`,
//           question_type: matchingQuestion?.question_type || 'TEXT',
//         },
//         answer,
//         key: `${answer.id || 'unknown'}-${answer.question}`,
//       };
//     });
//   };

//   const questionAnswerPairs = getQuestionAnswerPairs();

//   const renderActionButtons = () => (
//     <div className="candidate-actions">
//       {!interviewScheduled ? (
//         // If interview is NOT scheduled, show these buttons
//         <>
//           <button
//             className={`action-button ${appStatus === 'Pending' ? 'pending-button active' : 'pending-button'}`}
//             onClick={() => changeStatus('Pending')}
//             disabled={isButtonDisabled}
//           >
//             Pending
//           </button>
//           <button
//             className={`action-button ${appStatus === 'ShortListed' ? 'accept-button active' : 'accept-button'}`}
//             onClick={() => changeStatus('ShortListed')}
//             disabled={isButtonDisabled}
//           >
//             Shortlist
//           </button>
//           <button
//             className="action-button schedule-button"
//             onClick={openScheduleModal}
//             disabled={isButtonDisabled}
//           >
//             Schedule Interview
//           </button>
//         </>
//       ) : (
//         // If interview IS scheduled, show interview info and these buttons
//         <>
//           <div className="interview-scheduled-info">
//             <span className="interview-status">Interview Scheduled</span>
//             {interviewDate && (
//               <span className="interview-date">{formatInterviewDate(interviewDate)}</span>
//             )}
//           </div>
//           <button
//             className={`action-button ${appStatus === 'Accepted' ? 'accept-button active' : 'accept-button'}`}
//             onClick={() => changeStatus('Accepted')}
//             disabled={isButtonDisabled}
//           >
//             Accept
//           </button>
//           <button
//             className={`action-button ${appStatus === 'Rejected' ? 'reject-button active' : 'reject-button'}`}
//             onClick={() => changeStatus('Rejected')}
//             disabled={isButtonDisabled}
//           >
//             Reject
//           </button>
//         </>
//       )}
//     </div>
//   );

//   return (
//     <div className="candidate-view-container">
//       {/* Pass application_id to the ScheduleModal */}
//       {showScheduleModal && (
//         <SheduleModal
//           setModal={setShowScheduleModal}
//           candidate_id={candidateId}
//           job_id={selectedJob?.id}
//           application_id={applicationId} // Pass the specific application ID
//           setAppStatus={setAppStatus}
//           setInterviewScheduled={setInterviewScheduled}
//         />
//       )}

//       {renderActionButtons()}

//       <div className="candidate-info-section">
//         <h2 className="section-title">Candidate Info</h2>
//         <div className="candidate-profile">
//           {profilePic && <img src={profilePic} alt="Candidate Profile" className="profile-image" />}
//           <p className="candidate-name">{userName || 'N/A'}</p>
//         </div>
//         <div className="info-details">
//           <div className="info-item">
//             <span className="info-label">Email</span>
//             <p className="info-value">{current.candidate?.email || 'N/A'}</p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Phone</span>
//             <p className="info-value">{current.candidate?.phone || 'N/A'}</p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Gender</span>
//             <p className="info-value">{current.candidate?.Gender || current.candidate?.gender || 'N/A'}</p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Date of Birth</span>
//             <p className="info-value">{current.candidate?.dob || 'N/A'}</p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Applied On</span>
//             <p className="info-value">{current.applyed_on ? new Date(current.applyed_on).toLocaleDateString() : 'N/A'}</p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Status</span>
//             <p className="info-value">{appStatus}</p>
//           </div>
//         </div>
//       </div>

//       {current.candidate?.education?.length > 0 && (
//         <div className="education-info-section">
//           <h2 className="section-title">Education Info</h2>
//           <div className="info-details">
//             <div className="info-item">
//               <span className="info-label">Qualification</span>
//               <p className="info-value">{current.candidate.education[0].education || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Specialisation</span>
//               <p className="info-value">{current.candidate.education[0].specilization || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Completed Year</span>
//               <p className="info-value">{current.candidate.education[0].completed || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <span className="info-label">College</span>
//               <p className="info-value">{current.candidate.education[0].college || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Mark in CGPA</span>
//               <p className="info-value">{current.candidate.education[0].mark || 'N/A'}</p>
//             </div>
//             <div className="info-item">
//               <span className="info-label">Skills</span>
//               <p className="info-value">{current.candidate.skills || 'N/A'}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="links-section">
//         <h2 className="section-title">Links</h2>
//         <div className="info-details">
//           <div className="info-item">
//             <span className="info-label">LinkedIn</span>
//             <p className="info-value">
//               {current.candidate?.linkedin ? (
//                 <a href={current.candidate.linkedin} target="_blank" rel="noopener noreferrer" className="link">
//                   {current.candidate.linkedin}
//                 </a>
//               ) : (
//                 'N/A'
//               )}
//             </p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">GitHub</span>
//             <p className="info-value">
//               {current.candidate?.github ? (
//                 <a href={current.candidate.github} target="_blank" rel="noopener noreferrer" className="link">
//                   {current.candidate.github}
//                 </a>
//               ) : (
//                 'N/A'
//               )}
//             </p>
//           </div>
//           <div className="info-item">
//             <span className="info-label">Resume</span>
//             <p className="info-value">
//               {current.candidate?.resume ? (
//                 <a
//                   href={`${baseURL}${current.candidate.resume}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="link"
//                   onClick={handleResume}
//                 >
//                   View Resume
//                 </a>
//               ) : (
//                 'N/A'
//               )}
//             </p>
//           </div>
//           {current.candidate?.links?.length > 0 &&
//             current.candidate.links.map((link, index) => (
//               <div className="info-item" key={index}>
//                 <span className="info-label">{link.name || `Link ${index + 1}`}</span>
//                 <p className="info-value">
//                   <a href={link.url} target="_blank" rel="noopener noreferrer" className="link">
//                     {link.url}
//                   </a>
//                 </p>
//               </div>
//             ))}
//         </div>
//       </div>

//       <div className="answers-section">
//         <h2 className="section-title">Interview Questions & Answers</h2>
//         {loadingQuestions ? (
//           <div className="loading-questions">Loading questions...</div>
//         ) : questionAnswerPairs.length > 0 ? (
//           <div className="qa-container">
//             {questionAnswerPairs.map(pair => (
//               <div className="qa-item" key={pair.key}>
//                 <div className="question">
//                   <h3>{pair.question.text}</h3>
//                 </div>
//                 <div className="answer">
//                   <pre>{pair.answer.answer_text || 'No answer provided'}</pre>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="no-answers">No questions or answers available</div>
//         )}
//       </div>

//       <button 
//         className="back-btn" 
//         onClick={() => setChange(prev => !prev)}
//         disabled={isButtonDisabled}
//       >
//         Back to Applications
//       </button>
//     </div>
//   );
// };

// export default CandidateView;

















import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SheduleModal from '../../../Components/Interview/Scheduledmodal';
import ChatModal from './ChatModal';
// import '../../../Styles/USER/Home.css';

const CandidateView = ({ selectedJob, setChange, current, questions: initialQuestions = [] }) => {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(current?.status === 'Interview Scheduled');
  const [interviewDate, setInterviewDate] = useState(null);
  const [questions, setQuestions] = useState(initialQuestions);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Update states when current prop changes
  useEffect(() => {
    if (current) {
      setAppStatus(current.status || 'Application Send');
      setInterviewScheduled(current.status === 'Interview Scheduled');
      fetchInterviewDate();
    }
  }, [current]);

  // Fetch interview date if interview is scheduled
  const fetchInterviewDate = async () => {
    if (!current || !current.id || current.status !== 'Interview Scheduled') {
      setInterviewDate(null);
      return;
    }

    try {
      const response = await axios.get(
        `${baseURL}/api/empjob/getApplicationjobs/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('API Response for getApplicationjobs:', response.data);

      if (response.status === 200) {
        const applications = Array.isArray(response.data) ? response.data : response.data?.applications || [];
        const currentApp = applications.find(app => app.id === current.id);

        if (currentApp && currentApp.interview_date) {
          setInterviewDate(currentApp.interview_date);
        } else {
          try {
            const interviewResponse = await axios.get(
              `${baseURL}/api/interview/schedules/`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (interviewResponse.status === 200) {
              const interviews = Array.isArray(interviewResponse.data)
                ? interviewResponse.data
                : interviewResponse.data?.interviews || [];
              const matchingInterview = interviews.find(
                interview =>
                  interview.application_id === current.id ||
                  (interview.candidate === current.candidate?.id && interview.job === selectedJob.id)
              );

              if (matchingInterview && matchingInterview.date) {
                setInterviewDate(matchingInterview.date);
              } else {
                setInterviewDate(null);
              }
            }
          } catch (interviewError) {
            console.error('Error fetching interview data:', interviewError);
            setInterviewDate(null);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching application data:', error.response || error);
      setInterviewDate(null);
    }
  };

  // Format date for display
  const formatInterviewDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedJob?.id || !current) return;

      setLoadingQuestions(true);
      try {
        if (current?.answers?.some(answer => answer.question_text)) {
          const uniqueQuestions = current.answers.reduce((acc, answer) => {
            if (answer.question_text && !acc.some(q => q.id === answer.question)) {
              acc.push({
                id: answer.question,
                text: answer.question_text,
                question_type: 'TEXT',
              });
            }
            return acc;
          }, []);
          setQuestions(uniqueQuestions);
          return;
        }

        const response = await axios.get(
          `${baseURL}/api/job/questions/${selectedJob.id}/`, // Using old version's endpoint
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const questionsData = Array.isArray(response.data) ? response.data : response.data?.questions || [];
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching questions:', error.response || error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch questions. Using answer data where available.',
          timer: 2000,
        });
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (selectedJob?.id && (!initialQuestions || initialQuestions.length === 0)) {
      fetchQuestions();
    }
  }, [selectedJob, initialQuestions, token, current]);

  if (!current) {
    return <div className="no-selection">Select an application to view details</div>;
  }

  const answers = current.answers || [];
  const profilePic = current.candidate?.profile_pic ? `${baseURL}${current.candidate.profile_pic}` : '';
  const userName = current.candidate?.user_name || current.candidate_name;
  const candidateId = current.candidate?.id;
  const applicationId = current.id;
  const employerId = selectedJob?.employer_id || localStorage.getItem('user_id'); // Fallback to localStorage
  const empName = selectedJob?.employer_name || 'Employer Name'; // Fallback

  const changeStatus = async (action) => {
    if (isButtonDisabled) return;

    setIsButtonDisabled(true);

    try {
      Swal.fire({
        title: 'Updating Status...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${baseURL}/api/empjob/applicationStatus/${current.id}/`,
        { action, job_id: selectedJob.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setAppStatus(action);

        if (action === 'Interview Scheduled') {
          setInterviewScheduled(true);
          fetchInterviewDate();
        } else if (action === 'Accepted' || action === 'Rejected') {
          // Keep interview scheduled state
        } else {
          setInterviewScheduled(false);
          setInterviewDate(null);
        }

        setChange(true);

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Application status changed to ${action}.`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error.response || error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update status. Please try again.',
        showConfirmButton: false,
        timer: 1500,
      });
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleResume = () => {
    changeStatus('Resume Viewed');
  };

  const openScheduleModal = () => {
    setShowScheduleModal(true);
  };

  const openChatModal = () => {
    setShowChatModal(true);
  };

  const getQuestionAnswerPairs = () => {
    return answers.map(answer => {
      if (answer.question_text) {
        return {
          question: {
            id: answer.question,
            text: answer.question_text,
          },
          answer,
          key: `${answer.id || 'unknown'}-${answer.question}`,
        };
      }

      const question = questions.find(q => q && Number(q.id) === Number(answer.question));
      if (question) {
        return {
          question,
          answer,
          key: `${answer.id || 'unknown'}-${answer.question}`,
        };
      }

      return {
        question: {
          id: answer.question,
          text: `Interview Question (ID: ${answer.question})`,
        },
        answer,
        key: `${answer.id || 'unknown'}-${answer.question}`,
      };
    });
  };

  const questionAnswerPairs = getQuestionAnswerPairs();

  const renderActionButtons = () => (
    <div className="candidate-actions">
      {!interviewScheduled ? (
        <>
          <button
            className={`action-button ${appStatus === 'Pending' ? 'pending-button active' : 'pending-button'}`}
            onClick={() => changeStatus('Pending')}
            disabled={isButtonDisabled}
          >
            Pending
          </button>
          <button
            className={`action-button ${appStatus === 'ShortListed' ? 'accept-button active' : 'accept-button'}`}
            onClick={() => changeStatus('ShortListed')}
            disabled={isButtonDisabled}
          >
            ShortList
          </button>
          <button
            className="action-button schedule-button"
            onClick={openScheduleModal}
            disabled={isButtonDisabled}
          >
            Schedule Interview
          </button>
          <button
            className="action-button chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </>
      ) : (
        <>
          <div className="interview-scheduled-info">
            <span className="interview-status">Interview Scheduled</span>
            {interviewDate && <span className="interview-date">{formatInterviewDate(interviewDate)}</span>}
          </div>
          <button
            className={`action-button ${appStatus === 'Accepted' ? 'accept-button active' : 'accept-button'}`}
            onClick={() => changeStatus('Accepted')}
            disabled={isButtonDisabled}
          >
            Accept
          </button>
          <button
            className={`action-button ${appStatus === 'Rejected' ? 'reject-button active' : 'reject-button'}`}
            onClick={() => changeStatus('Rejected')}
            disabled={isButtonDisabled}
          >
            Reject
          </button>
          <button
            className="action-button chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="candidate-view-container">
      {showScheduleModal && (
        <SheduleModal
          setModal={setShowScheduleModal}
          candidate_id={candidateId}
          job_id={selectedJob?.id}
          application_id={applicationId}
          setAppStatus={setAppStatus}
          setInterviewScheduled={setInterviewScheduled}
        />
      )}

      {showChatModal && (
        <ChatModal
          setChat={setShowChatModal}
          profile_pic={profilePic}
          userName={userName}
          emp_name={empName}
          candidate_id={candidateId}
          employer_id={employerId}
          senderName={empName}
          currentUserId={employerId}
        />
      )}

      {renderActionButtons()}

      <div className="candidate-info-section">
        <h2 className="section-title">Candidate Info</h2>
        <div className="candidate-profile">
          {profilePic && <img src={profilePic} alt="Candidate Profile" className="profile-image" />}
          <p className="candidate-name">{userName || 'N/A'}</p>
        </div>
        <div className="info-details">
          <div className="info-item">
            <span className="info-label">Email:</span>
            <p className="info-value">{current.candidate?.email || 'N/A'}</p>
          </div>
          <div className="info-item">
            <span className="info-label">Phone:</span>
            <p className="info-value">{current.candidate?.phone || 'N/A'}</p>
          </div>
          <div className="info-item">
            <span className="info-label">Gender:</span>
            <p className="info-value">{current.candidate?.Gender || current.candidate?.gender || 'N/A'}</p>
          </div>
          <div className="info-item">
            <span className="info-label">Date of Birth:</span>
            <p className="info-value">{current.candidate?.dob || 'N/A'}</p>
          </div>
          <div className="info-item">
            <span className="info-label">Applied On:</span>
            <p className="info-value">
              {current.applyed_on ? new Date(current.applyed_on).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <p className="info-value">{appStatus}</p>
          </div>
        </div>
      </div>

      {current.candidate?.education?.length > 0 && (
        <div className="education-info-section">
          <h2 className="section-title">Education Info</h2>
          <div className="info-details">
            <div className="info-item">
              <span className="info-label">Qualification:</span>
              <p className="info-value">{current.candidate.education[0].education || 'N/A'}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Specialisation:</span>
              <p className="info-value">{current.candidate.education[0].specilization || 'N/A'}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Completed Year:</span>
              <p className="info-value">{current.candidate.education[0].completed || 'N/A'}</p>
            </div>
            <div className="info-item">
              <span className="info-label">College:</span>
              <p className="info-value">{current.candidate.education[0].college || 'N/A'}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Mark in CGPA:</span>
              <p className="info-value">{current.candidate.education[0].mark || 'N/A'}</p>
            </div>
            <div className="info-item">
              <span className="info-label">Skills:</span>
              <p className="info-value">{current.candidate.skills || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="links-section">
        <h2 className="section-title">Links</h2>
        <div className="info-details">
          <div className="info-item">
            <span className="info-label">LinkedIn:</span>
            <p className="info-value">
              {current.candidate?.linkedin ? (
                <a href={current.candidate.linkedin} target="_blank" rel="noopener noreferrer" className="link">
                  {current.candidate.linkedin}
                </a>
              ) : (
                'N/A'
              )}
            </p>
          </div>
          <div className="info-item">
            <span className="info-label">GitHub:</span>
            <p className="info-value">
              {current.candidate?.github ? (
                <a href={current.candidate.github} target="_blank" rel="noopener noreferrer" className="link">
                  {current.candidate.github}
                </a>
              ) : (
                'N/A'
              )}
            </p>
          </div>
          <div className="info-item">
            <span className="info-label">Resume:</span>
            <p className="info-value">
              {current.candidate?.resume ? (
                <a
                  href={`${baseURL}${current.candidate.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                  onClick={handleResume}
                >
                  View Resume
                </a>
              ) : (
                'N/A'
              )}
            </p>
          </div>
          {current.candidate?.links?.length > 0 &&
            current.candidate.links.map((link, index) => (
              <div className="info-item" key={index}>
                <span className="info-label">{link.name || `Link ${index + 1}`}</span>
                <p className="info-value">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="link">
                    {link.url}
                  </a>
                </p>
              </div>
            ))}
        </div>
      </div>

      <div className="answers-section">
        <h2 className="section-title">Interview Questions & Answers</h2>
        {loadingQuestions ? (
          <p className="loading-questions">Loading questions...</p>
        ) : questionAnswerPairs.length > 0 ? (
          <div className="qa-container">
            {questionAnswerPairs.map(({ question, answer, key }) => (
              <div key={key} className="qa-item">
                <div className="question">
                  <h3>{question.text}</h3>
                </div>
                <div className="answer">
                  <pre>{answer.answer_text || 'No answer provided'}</pre>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-answers">No answers provided</p>
        )}
      </div>

      <button
        className="back-btn"
        onClick={() => setChange(true)}
        disabled={isButtonDisabled}
      >
        Back to Applications
      </button>
    </div>
  );
};

export default CandidateView;