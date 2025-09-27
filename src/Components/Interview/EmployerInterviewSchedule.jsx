import React, { useState, useEffect } from 'react';
import SideBar from '../../pages/Employer/SideBar';
import axios from 'axios';
import Swal from 'sweetalert2';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { Link } from 'react-router-dom';
import { extractDate, extractTime, isInterviewTimeReached } from './DateTime';
import { parseISO, addMinutes, isAfter } from 'date-fns';
import './Style/Candschedule.css';

function Schedules() {
  const baseURL = 'http://127.0.0.1:8000';
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const token = localStorage.getItem('access');
  const [interview, setInterview] = useState([]);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 640);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isWithinStartWindow = (dateString, windowMinutes = 5) => {
    if (!dateString) return false;
    const interviewTime = parseISO(dateString);
    const now = new Date();
    const endWindow = addMinutes(interviewTime, windowMinutes);
    return isAfter(now, interviewTime) && isAfter(endWindow, now);
  };

  const getInterviewStatus = (date, status, attended) => {
    // If status is already set (Accepted, Rejected, etc.), return it
    if (status && status !== 'Upcoming' && status !== 'In Progress') {
      return status;
    }
    
    if (!date) return 'Upcoming';
    
    const interviewDate = parseISO(date);
    const now = new Date();
    const startWindowEnd = addMinutes(interviewDate, 5);

    if (attended && status === 'In Progress') {
      return 'In Progress';
    }

    if (attended) {
      return 'Completed';
    }

    if (isAfter(now, startWindowEnd)) {
      return 'You missed';
    }

    return 'Upcoming';
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.status === 200) {
          let interviewData = response.data;
          if (!Array.isArray(interviewData)) {
            interviewData = [interviewData];
          }

          const processedData = interviewData.map((item) => ({
            id: item.id,
            job_title: item.job_title || item.job_info?.title || 'Unknown Job',
            candidate_name: item.candidate_name || 'Unknown Candidate',
            applyDate: item.apply_date || null,
            date: item.date || null,
            status: item.status || 'Upcoming',
            attended: item.attended || false,
            original: item,
          }));

          setInterview(processedData);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
        setError('Failed to load interview schedules.');
        try {
          const localInterviews = JSON.parse(localStorage.getItem('scheduled_interviews') || '[]');
          if (localInterviews.length > 0) {
            setInterview(localInterviews);
          }
        } catch (localError) {
          console.error('Error retrieving local interviews:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [load]);

  useEffect(() => {
    if (interview.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const interviewsToUpdate = interview.filter(
        (item) =>
          item.status === 'Upcoming' &&
          !item.attended &&
          item.date &&
          isAfter(now, addMinutes(parseISO(item.date), 5))
      );

      if (interviewsToUpdate.length > 0) {
        interviewsToUpdate.forEach(async (item) => {
          try {
            await axios.post(
              `${baseURL}/api/interview/status/${item.id}/`,
              { action: 'Missed' },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          } catch (error) {
            console.error(`Error updating interview ${item.id} to Missed:`, error);
          }
        });
        setLoad((prev) => !prev);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [interview, token]);

  const handleStartInterview = async (interviewId) => {
    try {
      // Set status to "In Progress" when starting
      setInterview((prevInterviews) =>
        prevInterviews.map((item) =>
          item.id === interviewId ? { ...item, attended: true, status: 'In Progress' } : item
        )
      );

      const response = await axios.post(
        `${baseURL}/api/interviewCall/`,
        { interviewId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Interview Started',
          text: 'The interview has been started.',
          timer: 1500,
        });
      }
    } catch (error) {
      console.error(`Error starting interview ${interviewId}:`, error);
      setInterview((prevInterviews) =>
        prevInterviews.map((item) =>
          item.id === interviewId ? { ...item, attended: false, status: 'Upcoming' } : item
        )
      );
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: error.response?.data?.message || 'Failed to start interview.',
        timer: 2000,
      });
    }
  };

  const handleCompleteInterview = async (interviewId) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/interview/status/${interviewId}/`,
        { action: 'Complete' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("sssssssssssssssssssssss",response.data)

      if (response.status === 200) {
        setLoad(!load);
        Swal.fire({
          icon: 'success',
          title: 'Interview Completed',
          text: 'The interview has been marked as completed.',
          timer: 1500,
        });
      }
    } catch (error) {
      console.error(`Error completing interview ${interviewId}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: error.response?.data?.message || 'Failed to complete interview.',
        timer: 2000,
      });
    }
  };

  const handleAcceptReject = async (interviewId, action) => {
    try {
      Swal.fire({
        title: `${action === 'Accepted' ? 'Accepting' : 'Rejecting'}...`,
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${baseURL}/api/interview/status/${interviewId}/`,
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setLoad(!load);
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Candidate has been ${action.toLowerCase()} for this position.`,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} interview ${interviewId}:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: error.response?.data?.message || `Failed to ${action.toLowerCase()} candidate.`,
        timer: 2000,
      });
    }
  };

  return (
    <div className="schedules-container">
      <div>
        {isSmallScreen ? (
          <>
            <button onClick={toggleDrawer} className="drawer-toggle-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="drawer-icon">
                <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
                <path d="M8 12H16"></path>
                <path d="M12 16V8"></path>
              </svg>
            </button>
            <Drawer open={isOpen} onClose={toggleDrawer} direction="left" className="drawer-menu">
              <div className="drawer-sidebar">
                <SideBar />
              </div>
            </Drawer>
          </>
        ) : (
          <SideBar />
        )}
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <h1 className="personally-main-heading">Interview Schedules</h1>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading">Loading interview schedules...</div>
          ) : interview.length === 0 ? (
            <div className="no-interviews">No interviews scheduled yet.</div>
          ) : (
            <div className="table-container">
              <table className="schedule-table">
                <thead>
                  <tr className="table-header">
                    <th>Job Title</th>
                    <th>Candidate</th>
                    <th>Interview Date</th>
                    <th>Interview Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interview.map((item, index) => {
                    const status = getInterviewStatus(item.date, item.status, item.attended);
                    const showAcceptReject = status === 'Completed';
                    const isStartable = (status === 'Upcoming' && isWithinStartWindow(item.date)) || 
                                       status === 'In Progress';

                    return (
                      <tr key={item.id || `interview-${index}`} className="table-row">
                        <td>{item.job_title || 'Unknown Job'}</td>
                        <td>{item.candidate_name || 'Unknown Candidate'}</td>
                        <td>{item.date ? extractDate(item.date) : 'Not available'}</td>
                        <td>{item.date ? extractTime(item.date) : 'Not available'}</td>
                        <td className={`status-cell ${status.toLowerCase().replace(' ', '-')}`}>
                          {isStartable ? (
                            <Link to={`/interview/${item.id}`}>
                              <button
                                className="start-button"
                                onClick={() => handleStartInterview(item.id)}
                              >
                                {status === 'In Progress' ? 'Rejoin' : 'Start'}
                              </button>
                            </Link>
                          ) : (
                            <p>{status}</p>
                          )}
                        </td>
                        <td>
                          {showAcceptReject ? (
                            <>
                              <button
                                className="accept-button"
                                onClick={() => handleAcceptReject(item.id, 'Accepted')}
                              >
                                Accept
                              </button>
                              <button
                                className="reject-button"
                                onClick={() => handleAcceptReject(item.id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </>
                          ) : status === 'In Progress' ? (
                            <button
                              className="complete-button"
                              onClick={() => handleCompleteInterview(item.id)}
                            >
                              Complete
                            </button>
                          ) : (
                            <p>No actions available</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedules;