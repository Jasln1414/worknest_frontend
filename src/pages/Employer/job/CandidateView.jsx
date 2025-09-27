import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SheduleModal from '../../../Components/Interview/Scheduledmodal';
import ChatModal from './ChatModal';
import './style/AppliedCandidateview.css';

const CandidateView = ({ current, selectedJob, fetchJobDetails, onClose, questions: propQuestions }) => {
  // API Configuration
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  // State Management
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [appStatus, setAppStatus] = useState(current?.status || '');
  const [receiverId, setReceiverId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

  // Close modal handlers
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Escape key handler to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [onClose]);

  // Initialize candidate data when current changes
  useEffect(() => {
    if (current) {
      setAppStatus(current.status || '');
      checkInterviewStatus();
    }
  }, [current]);

  // Use propQuestions if available, otherwise fetch questions
  useEffect(() => {
    if (propQuestions && propQuestions.length > 0) {
      setQuestions(propQuestions);
    } else {
      const fetchQuestions = async () => {
        if (!selectedJob?.id || !current) return;

        setLoadingQuestions(true);
        try {
          // Check if questions are already available in answers
          if (current?.answers?.some((answer) => answer.question_text)) {
            const uniqueQuestions = current.answers.reduce((acc, answer) => {
              if (answer.question_text && !acc.some((q) => q.id === answer.question)) {
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

          // Fetch questions from API
          const response = await axios.get(`${baseURL}/api/job/questions/${selectedJob.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const questionsData = Array.isArray(response.data) ? response.data : response.data?.questions || [];
          setQuestions(questionsData);
        } catch (error) {
          console.error('Error fetching questions:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to load questions.',
            timer: 1500,
          });
        } finally {
          setLoadingQuestions(false);
        }
      };

      if (selectedJob?.id) {
        fetchQuestions();
      }
    }
  }, [selectedJob, token, current, propQuestions]);

  // Utility Functions
  const formatInterviewDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  // Check if interview is already scheduled
  const checkInterviewStatus = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const existingInterviews = interviews.filter(
        (interview) =>
          interview.candidate === current.candidate?.id &&
          interview.job === selectedJob.id &&
          interview.active
      );

      if (existingInterviews.length > 0) {
        setInterviewScheduled(true);
        setInterviewData(existingInterviews[0]);
        setAppStatus('Interview Scheduled');
      }
    } catch (error) {
      console.error('Error checking interview status:', error);
    }
  };

  // Update application status
  const changeStatus = async (status) => {
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);

    try {
      await axios.post(
        `${baseURL}/api/empjob/applicationStatus/${current.id}/`,
        {
          candidate_id: current.candidate.id,
          job_id: selectedJob.id,
          status: status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppStatus(status);
      fetchJobDetails();
      
      if (status === 'ShortListed') {
        Swal.fire({
          icon: 'success',
          title: 'Candidate Shortlisted!',
          text: 'The candidate has been added to your shortlist.',
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update status',
      });
    } finally {
      setIsButtonDisabled(false);
    }
  };

  // Open schedule interview modal
  const openScheduleModal = async () => {
    if (isCheckingSchedule || ['Accepted', 'Rejected'].includes(appStatus)) return;

    setIsCheckingSchedule(true);

    try {
      const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const existingInterviews = interviews.filter(
        (interview) =>
          interview.candidate === current.candidate?.id &&
          interview.job === selectedJob.id &&
          interview.active
      );

      if (existingInterviews.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Interview Already Scheduled',
          text: 'This candidate already has an active interview for this position.',
          footer: `Scheduled for: ${formatInterviewDate(existingInterviews[0].date)}`,
        });
        setInterviewScheduled(true);
        setInterviewData(existingInterviews[0]);
        setAppStatus('Interview Scheduled');
        return;
      }

      setShowScheduleModal(true);
    } catch (error) {
      console.error('Error checking for existing interviews:', error);
      setShowScheduleModal(true);
    } finally {
      setIsCheckingSchedule(false);
    }
  };

  // Open chat modal
  const openChatModal = () => {
    setShowChatModal(true);
  };

  // Handle resume view and update status
  const handleResume = () => {
    changeStatus('Resume Viewed');
  };

  // Cancel scheduled interview
  const cancelInterview = async () => {
    if (isButtonDisabled || interviewData?.attended || ['Accepted', 'Rejected'].includes(appStatus)) {
      return;
    }

    const confirmation = await Swal.fire({
      title: 'Cancel Interview',
      text: 'Are you sure you want to cancel this interview?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No',
    });

    if (!confirmation.isConfirmed) return;

    setIsButtonDisabled(true);

    try {
      Swal.fire({
        title: 'Canceling Interview...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${baseURL}/api/interview/cancelApplication/`,
        {
          candidate_id: current.candidate.id,
          job_id: selectedJob.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setAppStatus('Interview Cancelled');
        setInterviewScheduled(false);
        setInterviewData(null);
        fetchJobDetails();

        Swal.fire({
          icon: 'success',
          title: 'Interview Cancelled',
          text: 'The interview has been cancelled successfully.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to cancel interview.',
        showConfirmButton: true,
      });
    } finally {
      setIsButtonDisabled(false);
    }
  };

  // Map questions to answers for display
  const getQuestionAnswerPairs = () => {
    if (!current || !current.answers) return [];

    return current.answers.map((answer) => {
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

      const question = questions.find((q) => q && Number(q.id) === Number(answer.question));
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

  // Candidate data
  const profilePic = current.candidate?.profile_pic ? `${baseURL}${current.candidate.profile_pic}` : '';
  const userName = current.candidate?.user_name || current.candidate_name || 'N/A';
  const candidateId = current.candidate?.id;
  const applicationId = current.id;
  const employerId = selectedJob?.employer_id || localStorage.getItem('user_id');
  const empName = selectedJob?.employer_name || 'Employer Name';

  // Render action buttons based on application status
  const renderActionButtons = () => (
    <div className="cv-action-buttons">
      {['Accepted', 'Rejected'].includes(appStatus) ? (
        <div className="cv-status-info">
          <span className={`cv-status-badge cv-status-${appStatus.toLowerCase()}`}>
            {appStatus}
          </span>
          <button
            className="cv-button cv-chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </div>
      ) : appStatus === 'Interview Cancelled' ? (
        <div className="cv-status-info">
          <span className="cv-status-badge cv-status-cancelled">Interview Cancelled</span>
          <button
            className="cv-button cv-schedule-button"
            onClick={openScheduleModal}
            disabled={isButtonDisabled || isCheckingSchedule}
          >
            {isCheckingSchedule ? 'Checking...' : 'Reschedule'}
          </button>
          <button
            className="cv-button cv-chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </div>
      ) : interviewScheduled ? (
        <div className="cv-interview-scheduled">
          <div className="cv-interview-info">
            <span className="cv-status-badge cv-status-scheduled">Interview Scheduled</span>
            <span className="cv-interview-date">{formatInterviewDate(interviewData?.date)}</span>
            {interviewData?.attended && (
              <span className="cv-attended-badge">Attended</span>
            )}
          </div>
          <button
            className="cv-button cv-cancel-button"
            onClick={cancelInterview}
            disabled={isButtonDisabled || interviewData?.attended}
          >
            Cancel
          </button>
          <button
            className="cv-button cv-chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </div>
      ) : (
        <div className="cv-action-group">
          {appStatus === 'Application Send' && (
            <button
              className="cv-button cv-view-button"
              onClick={handleResume}
              disabled={isButtonDisabled}
            >
              View Resume
            </button>
          )}
          
          {appStatus === 'ShortListed' ? (
            <>
              <span className="cv-status-badge cv-status-shortlisted">ShortListed</span>
              <button
                className="cv-button cv-accept-button"
                onClick={() => changeStatus('Accepted')}
                disabled={isButtonDisabled}
              >
                Accept
              </button>
              <button
                className="cv-button cv-reject-button"
                onClick={() => changeStatus('Rejected')}
                disabled={isButtonDisabled}
              >
                Reject
              </button>
              <button
                className="cv-button cv-schedule-button"
                onClick={openScheduleModal}
                disabled={isButtonDisabled || isCheckingSchedule}
              >
                {isCheckingSchedule ? 'Checking...' : 'Schedule'}
              </button>
            </>
          ) : (
            <>
              <button
                className="cv-button cv-shortlist-button"
                onClick={() => changeStatus('ShortListed')}
                disabled={isButtonDisabled}
              >
                ShortList
              </button>
              <button
                className="cv-button cv-accept-button"
                onClick={() => changeStatus('Accepted')}
                disabled={isButtonDisabled}
              >
                Accept
              </button>
              <button
                className="cv-button cv-reject-button"
                onClick={() => changeStatus('Rejected')}
                disabled={isButtonDisabled}
              >
                Reject
              </button>
              {['Application Viewed', 'Resume Viewed'].includes(appStatus) && (
                <button
                  className="cv-button cv-schedule-button"
                  onClick={openScheduleModal}
                  disabled={isButtonDisabled || isCheckingSchedule}
                >
                  {isCheckingSchedule ? 'Checking...' : 'Schedule'}
                </button>
              )}
            </>
          )}
          
          <button
            className="cv-button cv-chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </div>
      )}
    </div>
  );

  // Return null if no candidate selected
  if (!current) {
    return <div className="cv-no-selection">Select an application to view details</div>;
  }

  // Main Component Render
  return (
    <div className="cv-modal-overlay" onClick={handleOverlayClick}>
      <div className="cv-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="cv-modal-header">
          <h2>Candidate Details</h2>
          <button className="cv-close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="cv-modal-tabs">
          <button 
            className={`cv-tab-button ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`cv-tab-button ${activeSection === 'education' ? 'active' : ''}`}
            onClick={() => setActiveSection('education')}
          >
            Education
          </button>
          <button 
            className={`cv-tab-button ${activeSection === 'links' ? 'active' : ''}`}
            onClick={() => setActiveSection('links')}
          >
            Links
          </button>
          <button 
            className={`cv-tab-button ${activeSection === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveSection('questions')}
          >
            Q&A
          </button>
        </div>

        {/* Modal Content */}
        <div className="cv-modal-content">
          {/* Action Buttons */}
          {renderActionButtons()}

          {/* Personal Information Section */}
          {activeSection === 'personal' && (
            <div className="cv-tab-content">
              <div className="cv-profile-section">
                <div className="cv-avatar-container">
                  <img 
                    src={profilePic || '/default-avatar.png'} 
                    alt="Candidate Profile" 
                    className="cv-avatar" 
                  />
                </div>
                <h3 className="cv-candidate-name">{userName}</h3>
              </div>

              <div className="cv-form-group">
                <label>Email</label>
                <div className="cv-info-value">{current.candidate?.email || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Phone</label>
                <div className="cv-info-value">{current.candidate?.phone || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Gender</label>
                <div className="cv-info-value">{current.candidate?.Gender || current.candidate?.gender || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Date of Birth</label>
                <div className="cv-info-value">{current.candidate?.dob || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Applied On</label>
                <div className="cv-info-value">
                  {current.applyed_on ? new Date(current.applyed_on).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="cv-form-group">
                <label>Status</label>
                <div className={`cv-status-value cv-status-${appStatus.toLowerCase().replace(' ', '-')}`}>
                  {appStatus}
                </div>
              </div>
            </div>
          )}

          {/* Education Information Section */}
          {activeSection === 'education' && current.candidate?.education?.length > 0 && (
            <div className="cv-tab-content">
              <div className="cv-form-group">
                <label>Qualification</label>
                <div className="cv-info-value">{current.candidate.education[0].education || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Specialization</label>
                <div className="cv-info-value">{current.candidate.education[0].specilization || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Completed Year</label>
                <div className="cv-info-value">{current.candidate.education[0].completed || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>College</label>
                <div className="cv-info-value">{current.candidate.education[0].college || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Mark in CGPA</label>
                <div className="cv-info-value">{current.candidate.education[0].mark || 'N/A'}</div>
              </div>

              <div className="cv-form-group">
                <label>Skills</label>
                <div className="cv-skills-container">
                  {current.candidate.skills ? (
                    current.candidate.skills.split(',').map((skill, index) => (
                      <span key={index} className="cv-skill-tag">{skill.trim()}</span>
                    ))
                  ) : (
                    <div className="cv-info-value">N/A</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Links Section */}
          {activeSection === 'links' && (
            <div className="cv-tab-content">
              <div className="cv-form-group">
                <label>LinkedIn</label>
                <div className="cv-info-value">
                  {current.candidate?.linkedin ? (
                    <a href={current.candidate.linkedin} target="_blank" rel="noopener noreferrer" className="cv-link">
                      {current.candidate.linkedin}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              <div className="cv-form-group">
                <label>GitHub</label>
                <div className="cv-info-value">
                  {current.candidate?.github ? (
                    <a href={current.candidate.github} target="_blank" rel="noopener noreferrer" className="cv-link">
                      {current.candidate.github}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              <div className="cv-form-group">
                <label>Resume</label>
                <div className="cv-info-value">
                  {current.candidate?.resume ? (
                    <a
                      href={`${baseURL}${current.candidate.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cv-link"
                      onClick={handleResume}
                    >
                      View Resume
                    </a>
                  ) : (
                    'N/A'
                  )}
                </div>
              </div>

              {/* Additional Links */}
              {current.candidate?.links?.length > 0 &&
                current.candidate.links.map((link, index) => (
                  <div className="cv-form-group" key={index}>
                    <label>{link.name || `Link ${index + 1}`}</label>
                    <div className="cv-info-value">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="cv-link">
                        {link.url}
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Questions & Answers Section */}
          {activeSection === 'questions' && (
            <div className="cv-tab-content">
              <div className="cv-questions-section">
                <h3 className="cv-title">Interview Questions & Answers</h3>

                {loadingQuestions ? (
                  <div className="cv-loading">Loading questions...</div>
                ) : questionAnswerPairs.length > 0 ? (
                  <div className="cv-qa-container">
                    {questionAnswerPairs.map(({ question, answer, key }) => (
                      <div key={key} className="cv-qa-item">
                        <div className="cv-question">
                          <strong>Q: {question.text}</strong>
                        </div>
                        <div className="cv-answer">
                          <p>A: {answer.answer_text || 'No answer provided'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="cv-no-answers">No answers provided</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="cv-modal-actions">
          <button className="cv-button cv-close-action" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <SheduleModal
          setModal={setShowScheduleModal}
          candidate_id={candidateId}
          job_id={selectedJob?.id}
          application_id={applicationId}
          setAppStatus={setAppStatus}
          setInterviewScheduled={setInterviewScheduled}
          onScheduleSuccess={(interviewData) => {
            setInterviewData(interviewData);
            setInterviewScheduled(true);
            setAppStatus('Interview Scheduled');
            Swal.fire({
              icon: 'success',
              title: 'Interview Scheduled',
              text: `Interview scheduled for ${formatInterviewDate(interviewData.date)}`,
              timer: 2000,
            });
            fetchJobDetails();
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
    </div>
  );
};

export default CandidateView;