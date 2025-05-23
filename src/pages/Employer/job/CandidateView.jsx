import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SheduleModal from '../../../Components/Interview/Scheduledmodal';
import ChatModal from './ChatModal';
import '../../../Styles/USER/Home.css';

const CandidateView = ({ 
  selectedJob, 
  setChange, 
  current, 
  questions: initialQuestions = [], 
  setFetchJob, 
  fetchJob, 
  fetchJobDetails 
}) => {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  
  // State management
  const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(
    current?.status === 'Interview Scheduled' || 
    current?.interview_status === 'Scheduled'
  );
  const [interviewDate, setInterviewDate] = useState(null);
  const [questions, setQuestions] = useState(initialQuestions);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);

  // Update states when current prop changes
  useEffect(() => {
    if (current) {
      if (current.status === 'Application Send') {
        changeStatus("Application Viewed");
      }
      setAppStatus(current.status || 'Application Send');
      setInterviewScheduled(
        current.status === 'Interview Scheduled' || 
        current.interview_status === 'Scheduled'
      );
      setReceiverId(current.candidate?.user || null);
      fetchInterviewDate();
    }
  }, [current]);

  // Fetch interview date if interview is scheduled
  const fetchInterviewDate = async () => {
    if (!current || !current.id || !interviewScheduled) {
      setInterviewDate(null);
      return;
    }

    try {
      const response = await axios.get(
        `${baseURL}/api/interview/schedules/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const interviews = Array.isArray(response.data) ? response.data : response.data?.interviews || [];
        const matchingInterview = interviews.find(
          interview =>
            (interview.application_id === current.id) ||
            (interview.candidate === current.candidate?.id && interview.job === selectedJob?.id)
        );

        if (matchingInterview?.date) {
          setInterviewDate(matchingInterview.date);
        } else {
          setInterviewDate(null);
        }
      }
    } catch (error) {
      console.error('Error fetching interview data:', error);
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
          `${baseURL}/api/job/questions/${selectedJob.id}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const questionsData = Array.isArray(response.data) ? response.data : response.data?.questions || [];
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (selectedJob?.id && (!initialQuestions || initialQuestions.length === 0)) {
      fetchQuestions();
    }
  }, [selectedJob, initialQuestions, token, current]);

  // Change application status
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setAppStatus(action);
        if (action === 'Interview Scheduled') {
          setInterviewScheduled(true);
          await fetchInterviewDate();
        } else if (action === 'Accepted' || action === 'Rejected') {
          // Keep interview scheduled state
        } else {
          setInterviewScheduled(false);
          setInterviewDate(null);
        }

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Application status changed to ${action}.`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
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

  // Check for existing interviews before showing schedule modal
  const openScheduleModal = async () => {
    if (isCheckingSchedule) return;
    
    setIsCheckingSchedule(true);
    
    try {
      const response = await axios.get(
        `${baseURL}/api/interview/schedules/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const interviews = Array.isArray(response.data) ? response.data : response.data?.interviews || [];
      const existingInterviews = interviews.filter(
        interview => interview.candidate === current.candidate?.id && 
                   interview.job === selectedJob.id &&
                   interview.active
      );
      
      if (existingInterviews.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Interview Already Scheduled',
          text: 'This candidate already has an active interview for this position.',
          footer: `Scheduled for: ${formatInterviewDate(existingInterviews[0].date)}`
        });
        return;
      }
      
      setShowScheduleModal(true);
    } catch (error) {
      console.error('Error checking for existing interviews:', error);
      setShowScheduleModal(true); // Still allow trying to schedule
    } finally {
      setIsCheckingSchedule(false);
    }
  };

  const openChatModal = () => {
    setShowChatModal(true);
  };

  const handleResume = () => {
    changeStatus('Resume Viewed');
  };

  // Prepare question-answer pairs for display
  const getQuestionAnswerPairs = () => {
    const answers = current.answers || [];
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

  // Render action buttons based on interview status
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
            disabled={isButtonDisabled || isCheckingSchedule}
          >
            {isCheckingSchedule ? 'Checking...' : 'Schedule Interview'}
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
            {interviewDate && (
              <span className="interview-date">
                {formatInterviewDate(interviewDate)}
              </span>
            )}
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

  if (!current) {
    return <div className="no-selection">Select an application to view details</div>;
  }

  // Prepare candidate data
  const answers = current.answers || [];
  const profilePic = current.candidate?.profile_pic ? `${baseURL}${current.candidate.profile_pic}` : '';
  const userName = current.candidate?.user_name || current.candidate_name || 'N/A';
  const candidateId = current.candidate?.id;
  const applicationId = current.id;
  const employerId = selectedJob?.employer_id || localStorage.getItem('user_id');
  const empName = selectedJob?.employer_name || 'Employer Name';

  return (
    <div className="candidate-view-container">
      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <SheduleModal
          setModal={setShowScheduleModal}
          candidate_id={candidateId}
          job_id={selectedJob?.id}
          application_id={applicationId}
          onScheduleSuccess={(interviewData) => {
            setInterviewDate(interviewData.date);
            setInterviewScheduled(true);
            setAppStatus('Interview Scheduled');
            Swal.fire({
              icon: 'success',
              title: 'Interview Scheduled',
              text: `Interview scheduled for ${formatInterviewDate(interviewData.date)}`,
              timer: 2000
            });
          }}
          onScheduleError={(error) => {
            Swal.fire({
              icon: 'error',
              title: 'Scheduling Failed',
              text: error.message || 'Failed to schedule interview',
            });
          }}
        />
      )}

      {/* Chat Modal */}
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
          receiverId={receiverId}
        />
      )}

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Candidate Information Section */}
      <div className="candidate-info-section">
        <h2 className="section-title">Candidate Info</h2>
        <div className="candidate-profile">
          {profilePic && <img src={profilePic} alt="Candidate Profile" className="profile-image" />}
          <p className="candidate-name">{userName}</p>
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

      {/* Education Information Section */}
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

      {/* Links Section */}
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

      {/* Questions & Answers Section */}
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

      {/* Back Button */}
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