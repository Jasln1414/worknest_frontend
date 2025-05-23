import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './interview.css';

function ScheduledInterviews() {
    const baseURL ='http://127.0.0.1:8000';
    const token = localStorage.getItem('access');
    const [interview, setInterview] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(baseURL + '/api/interview/shedules/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.status === 200) {
                    setInterview(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const extractDate = (datetimeString) => {
        const dateObject = new Date(datetimeString);
        return dateObject.toISOString().split('T')[0];
    };

    const extractTime = (datetimeString) => {
        const dateObject = new Date(datetimeString);
        let hours = dateObject.getUTCHours();
        const minutes = String(dateObject.getUTCMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    return (
        <div className="scheduled-interviews-container">
            <div className="main-content">
                <h1 className="main-heading">Interview Schedules</h1>
                <div className="table-container">
                    <table className="interviews-table">
                        <thead>
                            <tr className="table-header">
                                <th>Job Title</th>
                                <th>Company</th>
                                
                                <th>Interview Date</th>
                                <th>Interview Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {interview.map((interviewItem) => (
                                <tr key={interviewItem.id} className="table-row">
                                    <td>
                                        <Link 
                                            to={`/candidate/jobdetails/${interviewItem.job.id}`}
                                            className="job-title-link"
                                        >
                                            {interviewItem.job.title}
                                        </Link>
                                    </td>
                                    <td>{interviewItem.employer_name}</td>
                                    
                                    <td>{extractDate(interviewItem.date)}</td>
                                    <td>{extractTime(interviewItem.date)}</td>
                                    <td className={`status-cell ${interviewItem.status.toLowerCase()}`}>
                                        {interviewItem.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ScheduledInterviews;