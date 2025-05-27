import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SheduleModal from '../../../Components/Interview/Scheduledmodal';
import ChatModal from './ChatModal';
import './style/Candidateview.css';

const CandidateView = ({
  selectedJob,
  setChange,
  current,
  questions: initialQuestions = [],
  fetchJobDetails = () => {},
}) => {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');

  // State management
  const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(
    current?.status === 'Interview Scheduled'
  );
  const [interviewDate, setInterviewDate] = useState(null);
  const [interviewAttended, setInterviewAttended] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);

  // Update states when current prop changes
  useEffect(() => {
    if (!current) return;
     console.log('CandidateView line 42 - current=================:', current.status);
    setAppStatus(current.status || 'Application Send');
    setInterviewScheduled(current.status === 'Interview Scheduled');
    setReceiverId(current.candidate?.user || null);
    fetchInterviewDate();
  }, [current]);
  console.log('CandidateView line 42 - ##########################:',appStatus );
 
  // Fetch interview date and attended status
  const fetchInterviewDate = async () => {
    if (!current || !current.candidate?.id || !selectedJob?.id) {
      setInterviewDate(null);
      setInterviewScheduled(false);
      setInterviewAttended(false);
      return;
    }

    try {
      const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const matchingInterview = interviews.find(
        (interview) =>
          interview.candidate === current.candidate.id &&
          interview.job === selectedJob.id &&
          interview.active
      );

      if (matchingInterview?.date) {
        setInterviewDate(matchingInterview.date);
        setInterviewScheduled(true);
        setInterviewAttended(matchingInterview.attended || false);
        setAppStatus('Interview Scheduled');
      } else {
        setInterviewDate(null);
        setInterviewScheduled(current.status === 'Interview Scheduled');
        setInterviewAttended(false);
      }
    } catch (error) {
      console.error('Error fetching interview data:', error);
      setInterviewDate(null);
      setInterviewScheduled(current.status === 'Interview Scheduled');
      setInterviewAttended(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load interview details. Please try again.',
        timer: 1500,
      });
    }
  };

  // Format date for display
  const formatInterviewDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
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
          text: 'Failed to load questions. Please try again.',
          timer: 1500,
        });
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
        } else if (action === 'Accepted' || action === 'Rejected' || action === 'Interview Cancelled') {
          setInterviewScheduled(false);
          setInterviewDate(null);
          setInterviewAttended(false);
        } else {
          setInterviewScheduled(false);
          setInterviewDate(null);
          setInterviewAttended(false);
        }

        try {
          if (typeof fetchJobDetails === 'function') {
            fetchJobDetails();
          }
        } catch (fetchError) {
          console.error('Error refreshing job details:', fetchError);
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
        setInterviewDate(existingInterviews[0].date);
        setInterviewAttended(existingInterviews[0].attended || false);
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

  const openChatModal = () => {
    setShowChatModal(true);
  };

  const handleResume = () => {
    changeStatus('Resume Viewed');
  };

  // Cancel interview
  const cancelInterview = async () => {
    if (isButtonDisabled || interviewAttended || ['Accepted', 'Rejected'].includes(appStatus)) {
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
        setInterviewDate(null);
        setInterviewAttended(false);

        try {
          if (typeof fetchJobDetails === 'function') {
            fetchJobDetails();
          }
        } catch (fetchError) {
          console.error('Error refreshing job details:', fetchError);
        }

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
      const errorMessage =
         'Failed to cancel interview. Please try again.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        showConfirmButton: true,
      });
    } finally {
      setIsButtonDisabled(false);
    }
  };

  // Prepare question-answer pairs for display
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

  // Render action buttons based on interview status
  const renderActionButtons = () => (
    <div className="candidate-actions">
      {['Accepted', 'Rejected'].includes(appStatus) ? (
        <div className="status-info">
          <span className={`interview-status status-${appStatus.toLowerCase()}`}>
            {appStatus}
          </span>
          <button
            className="action-button chat-button"
            onClick={openChatModal}
            disabled={isButtonDisabled}
          >
            Chat
          </button>
        </div>
      ) : appStatus === 'Interview Cancelled' || !interviewScheduled ? (
        <>
          {appStatus === 'Interview Cancelled' && (
            <div className="interview-cancelled-info">
              <span className="interview-status">Interview Cancelled</span>
            </div>
          )}
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
            disabled={isButtonDisabled || isCheckingSchedule || ['Accepted', 'Rejected'].includes(appStatus)}
            title={['Accepted', 'Rejected'].includes(appStatus) ? "Cannot schedule - Candidate already selected/rejected" : ""}
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
            <span className="interview-date">{formatInterviewDate(interviewDate)}</span>
            {interviewAttended && (
              <span className="interview-attended">Attended</span>
            )}
          </div>
          {current.status==="Application Send" || current.status=== 'Interview Scheduled' ? 
          <><button
                  className={`action-button ${current.status === 'Accepted' ? 'accept-button active' : 'accept-button'}`}
                  onClick={() => changeStatus('Accepted')}
                  disabled={isButtonDisabled}
                >
                  Accept
                </button><button
                  className={`action-button ${current.status === 'Rejected' ? 'reject-button active' : 'reject-button'}`}
                  onClick={() => changeStatus('Rejected')}
                  disabled={isButtonDisabled}
                >
                    Reject
                  </button></>:
          <p>{current.status}</p>
}
          <button
            className="action-button cancel-button"
            onClick={cancelInterview}
            disabled={
              isButtonDisabled || 
              interviewAttended || 
              ['Accepted', 'Rejected'].includes(appStatus)
            }
            title={
              interviewAttended ? "Cannot cancel - Interview already attended" :
              ['Accepted', 'Rejected'].includes(appStatus) ? "Cannot cancel - Candidate already selected/rejected" :
              ""
            }
          >
            Cancel Interview
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
  const profilePic = current.candidate?.profile_pic ? `${baseURL}${current.candidate.profile_pic}` : '';
  const userName = current.candidate?.user_name || current.candidate_name || 'N/A';
  const candidateId = current.candidate?.id;
  const applicationId = current.id;
  const employerId = selectedJob?.employer_id || localStorage.getItem('user_id');
  const empName = selectedJob?.employer_name || 'Employer Name';

  return (
    <div className="candidate-view-container">
      {showScheduleModal && (
        <SheduleModal
          setModal={setShowScheduleModal}
          candidate_id={candidateId}
          job_id={selectedJob?.id}
          application_id={applicationId}
          onScheduleSuccess={(interviewData) => {
            setInterviewDate(interviewData.date);
            setInterviewScheduled(true);
            setInterviewAttended(false);
            setAppStatus('Interview Scheduled');
            Swal.fire({
              icon: 'success',
              title: 'Interview Scheduled',
              text: `Interview scheduled for ${formatInterviewDate(interviewData.date)}`,
              timer: 2000,
            });
            if (typeof fetchJobDetails === 'function') {
              fetchJobDetails();
            }
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

      {renderActionButtons()}

      



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
            <p className={`info-value status-${appStatus.toLowerCase().replace(' ', '-')}`}>
              {appStatus}
            </p>
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

      {/* <div className="back-btn">
        <button
          className="back-button"
          onClick={() => setChange(true)}
          disabled={isButtonDisabled}
        >
          Back to Applications
        </button>
      </div> */}
    </div>
  );
};

export default CandidateView; 