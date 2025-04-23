import React, { useState, useEffect } from 'react';
import SideBar from '../../pages/Employer/SideBar';
import axios from 'axios';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import { Link } from 'react-router-dom';
import AcceptRejectModal from './AcceptRejectModal';
import { extractDate, extractTime, isInterviewTimeReached } from './DateTime';
import './Interview.css';

function Schedules() {
  const baseURL = 'http://127.0.0.1:8000';
  const [isOpen, setIsOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const token = localStorage.getItem('access');
  const [interview, setInterview] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalData, setModalData] = useState();
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching interview schedules...');
        
        const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });
        
        console.log('API Response:', response);
        
        if (response.status === 200) {
          let interviewData = response.data;
          
          if (!Array.isArray(interviewData)) {
            interviewData = [interviewData];
          }
          
          console.log('Interview data:', interviewData);
          
          const processedData = interviewData.map(item => {
            console.log(`Interview ID ${item.id}:`, {
              job_title: item.job_title,
              candidate_name: item.candidate_name,
              applyDate: item.applyDate,
              date: item.date,
              status: item.status
            });
            
            return {
              id: item.id,
              job_title: item.job_title || (item.job_info?.title) || 'Unknown Job',
              candidate_name: item.candidate_name || 'Unknown Candidate',
              applyDate: item.applyDate || null,
              date: item.date || null,
              status: item.status || 'Upcoming',
              original: item
            };
          });
          
          console.log('Processed data:', processedData);
          setInterview(processedData);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
        setError('Failed to load interview schedules.');
        
        try {
          const localInterviews = JSON.parse(localStorage.getItem('scheduled_interviews') || '[]');
          if (localInterviews.length > 0) {
            console.log('Using locally stored interviews:', localInterviews);
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

  const toggleModal = (interview_id) => {
    const data = interview.filter(int => String(int.id) === String(interview_id));
    if (data.length > 0) {
      setModalData(data);
      setModal(true);
    } else {
      console.error('Interview not found with ID:', interview_id);
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

            <Drawer
              open={isOpen}
              onClose={toggleDrawer}
              direction='left'
              className='drawer-menu'
            >
              <div className='drawer-sidebar'><SideBar /></div>
            </Drawer>
          </>
        ) : (
          <SideBar />
        )}
      </div>
      <div className="main-content">
        {modal && <AcceptRejectModal setModal={setModal} modalData={modalData} setLoad={setLoad} load={load} />}
        <div className="content-wrapper">
          <h1 className="main-heading">Interview Schedules</h1>
          
          {error && (
            <div className="error-message" style={{
              color: 'red',
              margin: '10px 0',
              padding: '10px',
              backgroundColor: '#ffeeee',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="loading" style={{
              textAlign: 'center',
              margin: '40px 0',
              color: '#666'
            }}>
              Loading interview schedules...
            </div>
          ) : interview.length === 0 ? (
            <div className="no-interviews" style={{
              textAlign: 'center',
              margin: '40px 0',
              color: '#666'
            }}>
              No interviews scheduled yet.
            </div>
          ) : (
            <div className="table-container">
              <table className="schedule-table">
                <thead>
                  <tr className="table-header">
                    <th>Job Title</th>
                    <th>Candidate</th>
                    <th>Applied Date</th>
                    <th>Interview Date</th>
                    <th>Interview Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interview.map((item, index) => (
                    <tr key={item.id || `interview-${index}`} className="table-row">
                      <td>{item.job_title || 'Unknown Job'}</td>
                      <td>{item.candidate_name || 'Unknown Candidate'}</td>
                      <td>
                        {item.applyDate ? 
                         extractDate(item.applyDate) : 
                         'Not available'}
                      </td>
                      <td>
                        {item.date ? 
                         extractDate(item.date) : 
                         'Not available'}
                      </td>
                      <td>
                        {item.date ? 
                         extractTime(item.date) : 
                         'Not available'}
                      </td>
                      <td className={`status-cell ${(item.status || 'upcoming').toLowerCase()}`}>
                        {item.date && isInterviewTimeReached(item.date) && 
                        (item.status === "Upcoming" || !item.status) ? (
                          <Link to={`/interview/${item.id}`}>
                            <button className="start-button">Start</button>
                          </Link>
                        ) : (
                          // item.status || 'Upcoming'
                          <Link to={`/interview/${item.id}`}>
                          <button className="start-button">Start</button>
                        </Link>
                        )}
                      </td>
                      <td>
                        <button 
                          className="view-button"
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => toggleModal(item.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
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