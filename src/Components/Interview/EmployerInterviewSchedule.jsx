import React, { useState, useEffect } from 'react';
import SideBar from '../../pages/Employer/SideBar';
import axios from 'axios';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import { extractDate, extractTime, isInterviewStartable } from './DateTime';
import './Interview.css';

function Schedules() {
  const baseURL = 'http://127.0.0.1:8000';
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const token = localStorage.getItem('access');
  const [interview, setInterview] = useState([]);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Enhanced data processing function
  const processInterviewData = (item) => {
    console.log('Processing individual item:', JSON.stringify(item, null, 2));
    
    const jobTitle = 
      item.job_title ||
      item.job?.title ||
      item.job?.job_title ||
      item.job_info?.title ||
      item.job_info?.job_title ||
      item.position ||
      item.role ||
      'Position Not Specified';

    const candidateName = 
      item.candidate_name ||
      item.candidate?.name ||
      item.candidate?.full_name ||
      item.candidate?.first_name + ' ' + item.candidate?.last_name ||
      item.applicant_name ||
      item.applicant?.name ||
      item.applicant?.full_name ||
      item.user?.name ||
      item.user?.full_name ||
      'Candidate Name Not Available';

    const interviewDate = 
      item.interview_date ||
      item.date ||
      item.scheduled_date ||
      item.datetime ||
      item.created_at ||
      null;

    return {
      id: item.id || item.interview_id || Math.random().toString(36),
      job_title: jobTitle,
      candidate_name: candidateName,
      applyDate: item.created_at || item.applied_date || null,
      date: interviewDate,
      status: item.status || item.interview_status || 'Pending',
      attended: item.attended || item.has_attended || false,
      original: item,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching interview schedules...');
        const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        
        console.log('Raw API Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status === 200) {
          let interviewData = response.data;
          
          if (interviewData.results) {
            interviewData = interviewData.results;
          } else if (interviewData.data) {
            interviewData = interviewData.data;
          }
          
          if (!Array.isArray(interviewData)) {
            interviewData = [interviewData];
          }
          
          if (interviewData.length === 0) {
            setError('No interview schedules found.');
            setInterview([]);
          } else {
            console.log('Processing', interviewData.length, 'interviews');
            const processedData = interviewData.map(processInterviewData);
            console.log('Processed data:', JSON.stringify(processedData, null, 2));
            setInterview(processedData);
            setError(null);
          }
        }
      } catch (error) {
        console.error('Error fetching interviews:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          setError('Access denied. You may not have permission to view interview schedules.');
        } else if (error.response?.status === 404) {
          setError('Interview schedules endpoint not found.');
        } else {
          setError('Failed to load interview schedules. Please try again later.');
        }
        
        try {
          const localInterviews = JSON.parse(localStorage.getItem('scheduled_interviews') || '[]');
          console.log('Local Interviews:', JSON.stringify(localInterviews, null, 2));
          if (localInterviews.length > 0) {
            const processedLocalData = localInterviews.map(processInterviewData);
            setInterview(processedLocalData);
            setError(prev => prev + ' (Using cached data)');
          } else {
            setInterview([]);
          }
        } catch (localError) {
          console.error('Error retrieving local interviews:', localError);
          setInterview([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [load, token]);

  const markInterviewAttended = async (interviewId) => {
    try {
      const response = await axios.patch(
        `${baseURL}/api/interview/status/${interviewId}/`,
        { action: 'Attended', attended: true },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setInterview(prev =>
          prev.map(item =>
            item.id === interviewId ? { ...item, status: 'Completed', attended: true } : item
          )
        );
        setLoad(!load);
      }
    } catch (error) {
      console.error('Error marking interview as attended:', error);
      alert('Failed to mark interview as attended. Please try again.');
    }
  };

  const getInterviewStatus = (interviewDate, currentStatus, attended) => {
    if (!interviewDate) return currentStatus || 'Not scheduled';
    
    const now = new Date();
    const interviewTime = new Date(interviewDate);
    const gracePeriodEnd = new Date(interviewTime.getTime() + 15 * 60000);
    
    if (['Selected', 'Rejected', 'Canceled', 'Completed'].includes(currentStatus)) {
      return currentStatus;
    }
    
    if (now < interviewTime) {
      return 'Upcoming';
    } else if (now >= interviewTime && now <= gracePeriodEnd) {
      return 'Ongoing';
    } else {
      return attended ? 'Completed' : 'You missed';
    }
  };

  const updateInterviewStatus = async (interviewId, newStatus) => {
    if (!['You missed', 'Selected', 'Completed'].includes(newStatus)) return;
    
    try {
      await axios.patch(
        `${baseURL}/api/interview/schedules/${interviewId}/`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(`Interview ${interviewId} status updated to ${newStatus}`);
      setLoad(!load);
    } catch (error) {
      console.error(`Error updating interview ${interviewId} status:`, error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (interview.length === 0) return;
    
    const interval = setInterval(() => {
      const updatedInterviews = interview.map(item => {
        const currentStatus = getInterviewStatus(item.date, item.status, item.attended);
        if (currentStatus === 'You missed' && item.status !== 'You missed' && !item.attended) {
          updateInterviewStatus(item.id, 'You missed');
        } else if (currentStatus === 'Completed' && item.status !== 'Completed' && item.attended) {
          updateInterviewStatus(item.id, 'Completed');
        }
        return { ...item, status: currentStatus };
      });
      setInterview(updatedInterviews);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [interview, token]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = interview.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(interview.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getVisiblePages = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="schedules-container">
      <div>
        {isSmallScreen ? (
          <>
            <button onClick={toggleDrawer} className="drawer-toggle-button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="drawer-icon">
                <path d="M12 22C17.5 22 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"></path>
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
          <h1 className="main-heading">Interview Schedules</h1>

          {error && (
            <div
              className="error-message"
              style={{
                color: '#d32f2f',
                margin: '10px 0',
                padding: '12px',
                backgroundColor: '#ffebee',
                borderRadius: '6px',
                border: '1px solid #ffcdd2',
              }}
            >
              {error}
            </div>
          )}

          {isLoading ? (
            <div
              className="loading"
              style={{
                textAlign: 'center',
                margin: '40px 0',
                color: '#666',
                fontSize: '16px',
              }}
            >
              <div>Loading interview schedules...</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                This may take a moment...
              </div>
            </div>
          ) : interview.length === 0 ? (
            <div
              className="no-interviews"
              style={{
                textAlign: 'center',
                margin: '40px 0',
                color: '#666',
                fontSize: '16px',
              }}
            >
              <div>No interviews scheduled yet.</div>
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                Interview schedules will appear here once they are created.
              </div>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="schedule-table">
                  <thead>
                    <tr className="table-header">
                      <th>Job Title</th>
                      <th>Candidate</th>
                      <th>Interview Date</th>
                      <th>Interview Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => {
                      const currentStatus = getInterviewStatus(item.date, item.status, item.attended);
                      return (
                        <tr key={item.id || `interview-${index}`} className="table-row">
                          <td title={item.job_title}>{item.job_title}</td>
                          <td title={item.candidate_name}>{item.candidate_name}</td>
                          <td>{item.date ? extractDate(item.date) : 'Not scheduled'}</td>
                          <td>{item.date ? extractTime(item.date) : 'Not scheduled'}</td>
                          <td className={`status-cell ${currentStatus.toLowerCase().replace(' ', '-')}`}>
                            {currentStatus === 'Ongoing' && isInterviewStartable(item.date) ? (
                              <Link to={`/interview/${item.id}`} onClick={() => markInterviewAttended(item.id)}>
                                <button className="start-button">Start</button>
                              </Link>
                            ) : (
                              <span className={`status-badge ${currentStatus.toLowerCase().replace(' ', '-')}`}>
                                {currentStatus}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <Button
                    variant="contained"
                    disabled={currentPage === 1}
                    onClick={handlePrevPage}
                    className="pagination-button"
                  >
                    Previous
                  </Button>
                  {getVisiblePages().map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'contained' : 'outlined'}
                      onClick={() => handlePageChange(page)}
                      className="pagination-button"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="contained"
                    disabled={currentPage === totalPages}
                    onClick={handleNextPage}
                    className="pagination-button"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedules;