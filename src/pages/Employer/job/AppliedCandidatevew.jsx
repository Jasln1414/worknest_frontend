import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SheduleModal from '../../../Components/Interview/Scheduledmodal';
import ChatModal from './ChatModal';
import './style/Candidateview.css';
import { useNavigate } from 'react-router-dom';

const CandidateView = ({ selectedJob, current, questions: initialQuestions = [], fetchJobDetails }) => {
  const baseURL = 'http://127.0.0.1:8000';
  const navigate = useNavigate();

  const [appStatus, setAppStatus] = useState(current?.status || 'Application Send');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(current?.status === 'Interview Scheduled');
  const [interviewData, setInterviewData] = useState(null);
  const [questions, setQuestions] = useState(initialQuestions);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [receiverId, setReceiverId] = useState(null);
  const [isCheckingSchedule, setIsCheckingSchedule] = useState(false);

  const statusOptions = [
    'Application Send',
    'Application Viewed',
    'Resume Viewed',
    'Interview Scheduled',
    'ShortListed',
    'Accepted',
    'Rejected',
    'Interview Cancelled',
    'Completed',
    'You missed',
  ];

  const STATUS_MAPPING = {
    Accepted: 'Accepted',
    Rejected: 'Rejected',
    Canceled: 'Interview Cancelled',
    Upcoming: 'Interview Scheduled',
    Completed: 'Completed',
    'You missed': 'You missed',
  };

  // Validate and refresh token
  const getToken = async () => {
    let token = localStorage.getItem('access');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Session Expired',
        text: 'Please log in again.',
        timer: 1500,
        willClose: () => navigate('/login'),
      });
      return null;
    }

    // Check if token is expired (optional: decode JWT to check exp)
    try {
      const response = await axios.get(`${baseURL}/api/user/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return token;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Attempt token refresh
        const refresh = localStorage.getItem('refresh');
        if (refresh) {
          try {
            const refreshResponse = await axios.post(`${baseURL}/api/token/refresh/`, { refresh });
            token = refreshResponse.data.access;
            localStorage.setItem('access', token);
            return token;
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            Swal.fire({
              icon: 'error',
              title: 'Session Expired',
              text: 'Please log in again.',
              timer: 1500,
              willClose: () => navigate('/login'),
            });
            return null;
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Session Expired',
            text: 'Please log in again.',
            timer: 1500,
            willClose: () => navigate('/login'),
          });
          return null;
        }
      }
      return token;
    }
  };

  useEffect(() => {
    if (!current) return;

    // Set status to Application Viewed if not already viewed
    if (current.status === 'Application Send') {
      changeStatus('Application Viewed');
    } else {
      setAppStatus(current.status);
    }

    fetchStatusData();
  }, [current, selectedJob]);

  const fetchStatusData = async () => {
    const token = await getToken();
    if (!token) return;

    try {
      const response = await axios.get(`${baseURL}/api/interview/schedules/?job_id=${selectedJob.id}&candidate_id=${current.candidate.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const interviews = Array.isArray(response.data) ? response.data : response.data?.results || [];
      const matchingInterview = interviews.find(
        (interview) => interview.candidate === current.candidate.id && interview.job === selectedJob.id
      );

      const interviewStatus = matchingInterview?.status;
      const isActive = matchingInterview?.active !== false;
      const mappedStatus = interviewStatus
        ? STATUS_MAPPING[interviewStatus] || current.status
        : current.status;

      setAppStatus(mappedStatus || 'Application Send');
      setInterviewScheduled(isActive && mappedStatus === 'Interview Scheduled');
      setInterviewData(matchingInterview || null);
      setReceiverId(current.candidate?.user || null);
    } catch (error) {
      console.error('Error fetching status data:', error);
      let errorMessage = 'Failed to load interview details.';
      if (error.response?.status === 403 || error.response?.status === 401) {
        errorMessage = 'You do not have permission to view interview schedules. Please log in again.';
        Swal.fire({
          icon: 'error',
          title: 'Permission Denied',
          text: errorMessage,
          timer: 1500,
          willClose: () => navigate('/login'),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || errorMessage,
          timer: 1500,
        });
      }
      setAppStatus(current?.status || 'Application Send');
      setInterviewScheduled(current?.status === 'Interview Scheduled');
      setInterviewData(null);
    }
  };

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

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedJob?.id || !current) return;

      const token = await getToken();
      if (!token) return;

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
        if (error.response?.status === 403 || error.response?.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Permission Denied',
            text: 'Please log in again.',
            timer: 1500,
            willClose: () => navigate('/login'),
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to load questions.',
            timer: 1500,
          });
        }
      } finally {
        setLoadingQuestions(false);
      }
    };

    if (selectedJob?.id && (!initialQuestions || initialQuestions.length === 0)) {
      fetchQuestions();
    }
  }, [selectedJob, initialQuestions, current]);

  const changeStatus = async (newStatus) => {
    if (isButtonDisabled || newStatus === appStatus) return;

    const token = await getToken();
    if (!token) return;

    setIsButtonDisabled(true);
    setAppStatus(newStatus);

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
        { action: newStatus, job_id: selectedJob.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        if (['Accepted', 'Rejected', 'Interview Cancelled'].includes(newStatus)) {
          setInterviewScheduled(false);
          setInterviewData(null);
        } else if (newStatus === 'Interview Scheduled') {
          setInterviewScheduled(true);
          await fetchStatusData();
        }

        fetchJobDetails();

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Application status changed to ${newStatus}.`,
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setAppStatus(current?.status || 'Application Send');
      if (error.response?.status === 403 || error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Permission Denied',
          text: 'Please log in again.',
          timer: 1500,
          willClose: () => navigate('/login'),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.error || 'Failed to update status.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const openScheduleModal = async () => {
    if (isCheckingSchedule || ['Accepted', 'Rejected', 'Completed', 'You missed'].includes(appStatus)) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Schedule',
        text: 'Scheduling is not allowed for this status.',
        timer: 1500,
      });
      return;
    }

    const token = await getToken();
    if (!token) return;

    setIsCheckingSchedule(true);

    try {
      const response = await axios.get(`${baseURL}/api/interview/schedules/?job_id=${selectedJob.id}&candidate_id=${current.candidate?.id}`, {
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
      if (error.response?.status === 403 || error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Permission Denied',
          text: 'Please log in again.',
          timer: 1500,
          willClose: () => navigate('/login'),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to check existing interviews.',
          timer: 1500,
        });
      }
    } finally {
      setIsCheckingSchedule(false);
    }
  };

  const cancelInterview = async () => {
    if (isButtonDisabled || interviewData?.attended || ['Accepted', 'Rejected', 'Completed', 'You missed'].includes(appStatus)) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Cancel',
        text: interviewData?.attended ? 'Interview already attended.' : 'Cancellation not allowed for this status.',
        timer: 1500,
      });
      return;
    }

    const token = await getToken();
    if (!token) return;

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
      if (error.response?.status === 403 || error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Permission Denied',
          text: 'Please log in again.',
          timer: 1500,
          willClose: () => navigate('/login'),
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to cancel interview.',
          showConfirmButton: true,
        });
      }
    } finally {
      setIsButtonDisabled(false);
    }
  };

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

  if (!current) {
    return <div className="no-selection">Select an application to view details</div>;
  }

  const profilePic = current.candidate?.profile_pic ? `${baseURL}${current.candidate.profile_pic}` : '/default-profile.png';
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

      <div className="candidate-actions">
        <select
          className="status-dropdown"
          value={appStatus}
          onChange={(e) => changeStatus(e.target.value)}
          disabled={isButtonDisabled}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          className="action-button chat-button"
          onClick={() => setShowChatModal(true)}
          disabled={isButtonDisabled}
        >
          Chat
        </button>
        <button
          className="action-button schedule-button"
          onClick={openScheduleModal}
          disabled={isButtonDisabled || isCheckingSchedule || interviewScheduled}
          title={isCheckingSchedule ? 'Checking for existing interviews...' : interviewScheduled ? 'Interview already scheduled' : ''}
        >
          {isCheckingSchedule ? 'Checking...' : 'Schedule Interview'}
        </button>
        {interviewScheduled && (
          <button
            className="action-button cancel-button"
            onClick={cancelInterview}
            disabled={isButtonDisabled || interviewData?.attended}
            title={interviewData?.attended ? 'Cannot cancel - Interview already attended' : ''}
          >
            Cancel Interview
          </button>
        )}
        {interviewScheduled && (
          <span className="interview-date">
            Interview: {formatInterviewDate(interviewData?.date)}
          </span>
        )}
      </div>

      <div className="candidate-info-section">
        <h2 className="section-title">Candidate Info</h2>
        <div className="candidate-profile">
          <img src={profilePic} alt="Candidate Profile" className="profile-image" />
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
              <span className="info-label">Specialization:</span>
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
                  onClick={() => changeStatus('Resume Viewed')}
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
    </div>
  );
};

export default CandidateView;