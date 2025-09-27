import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Style/Candschedule.css';

function ScheduledInterviews() {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [interview, setInterview] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interview data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseURL}/api/interview/schedules/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (response.status === 200) {
        // Normalize job title data
        const normalizedData = response.data.map((item) => ({
          ...item,
          job_title: item.job_title || item.job_info?.title || item.job?.title || 'Unknown Job',
          employer_name: item.employer_name || item.employer?.user?.full_name || 'Unknown Company',
        }));
        setInterview(normalizedData);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError('Failed to load interview schedules.');
    } finally {
      setIsLoading(false);
    }
  };

  // WebSocket for real-time updates
  useEffect(() => {
    fetchData();

    const userId = localStorage.getItem('user_id'); // Adjust based on your auth setup
    if (!userId) return;

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/notifications/${userId}/`);
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notify_message') {
        console.log('Notification received:', data.message);
        fetchData(); // Refresh interviews
      }
    };
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, [token]);

  // Date and time formatting
  const extractDate = (datetimeString) => {
    if (!datetimeString) return 'Not available';
    const dateObject = new Date(datetimeString);
    return dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const extractTime = (datetimeString) => {
    if (!datetimeString) return 'Not available';
    const dateObject = new Date(datetimeString);
    return dateObject.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="is-root-container scheduled-interviews-container" >
      <div className="is-content-wrapper" style={{ marginTop: '60px', marginBottom: '80px' }}>
        <h1 className="main-heading">Interview Schedules</h1>
        {error && <div className="error-message">{error}</div>}
        {isLoading ? (
          <div className="loading">Loading interviews...</div>
        ) : interview.length === 0 ? (
          <div className="no-interviews">No interviews scheduled yet.</div>
        ) : (
          <div className="is-table-wrapper">
            <table className="is-data-table interviews-table">
              <thead>
                <tr className="table-header">
                  <th scope="col">Job Title</th>
                  <th scope="col">Company</th>
                  <th scope="col">Interview Date</th>
                  <th scope="col">Interview Time</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {interview.map((interviewItem) => (
                  <tr key={interviewItem.id} className="table-row">
                    <td>
                      <Link
                        to={`/candidate/jobdetails/${interviewItem.job?.id || interviewItem.job}`}
                        className="job-title-link"
                        aria-label={`View details for ${interviewItem.job_title}`}
                      >
                        {interviewItem.job_title}
                      </Link>
                    </td>
                    <td>{interviewItem.employer_name}</td>
                    <td>{extractDate(interviewItem.date)}</td>
                    <td>{extractTime(interviewItem.date)}</td>
                    <td>
                      <span
                        className={`status-cell ${interviewItem.status.toLowerCase().replace(/\s/g, '-')}`}
                      >
                        {interviewItem.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <footer className="is-footer">
        <p>&copy; {new Date().getFullYear()} WorkNest. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default ScheduledInterviews;