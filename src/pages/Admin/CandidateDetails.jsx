import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import './Admin.css';

function Cdetails() {
    const { id } = useParams();
    const baseURL = "http://127.0.0.1:8000";
    const [candidate, setCandidate] = useState({
        user: {},
        education: [],
        applied_jobs: [],
        profile_pic: '',
        phone: '',
        place: '',
        dob: '',
        resume: '',
        Gender: '',
        linkedin: '',
        github: '',
        skills: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [render, setRender] = useState(false);
    const [appliedJobs, setAppliedJobs] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access');
                console.log('Fetching candidate with token:', token);
                if (!token) throw new Error("No authentication token found. Please log in.");

                // Fetch candidate details
                const response = await axios.get(`${baseURL}/dashboard/candidate/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (response.status === 200) {
                    setCandidate({
                        ...response.data,
                        education: response.data.education || [],
                        applied_jobs: response.data.applied_jobs || []
                    });
                    console.log('Candidate data:', response.data);
                }

                // Fetch applied jobs
                await fetchAppliedJobs();
            } catch (error) {
                const errorMsg = error.response?.data?.error || error.message;
                setError(errorMsg);
                console.error('Error fetching candidate:', errorMsg);
                if (error.response?.status === 401) {
                    localStorage.removeItem('access');
                    window.location.href = '/admin';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [render, id, baseURL]);

    const handleStatus = async (action) => {
        try {
            const token = localStorage.getItem('access');
            console.log('Token for status update:', token);
            if (!token) throw new Error("No authentication token found. Please log in.");

            const formData = new FormData();
            formData.append("id", candidate.id);
            formData.append("action", action);
            formData.append("type", "candidate");

            console.log('Sending status update with token:', token);
            const response = await axios.post(`${baseURL}/dashboard/status/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                setCandidate(prev => ({
                    ...prev,
                    user: { ...prev.user, is_active: action === 'unblock' }
                }));
                setRender(!render);
                console.log('Status update successful:', response.data);
                setError(null);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            console.error('Error updating status:', errorMsg);
            setError(`Failed to ${action} candidate: ${errorMsg}`);
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                window.location.href = '/admin';
            }
        }
    };

    const fetchAppliedJobs = async () => {
  try {
    const token = localStorage.getItem('access');
    const response = await axios.get(
      `${baseURL}/dashboard/admin/candidate/${id}/applied-jobs/`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      }
    );
    setAppliedJobs(response.data);
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    setError(error.response?.data?.error || error.message);
  }
};

    return (
        <>
            <div className="sidebar"><Sidebar /></div>
            <div className="content">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                <div className="card profile-card">
                    <div className="button-container">
                        {candidate.user.is_active ? (
                            <button
                                onClick={() => handleStatus("block")}
                                className="btn btn-danger"
                            >
                                Block
                            </button>
                        ) : (
                            <button
                                onClick={() => handleStatus("unblock")}
                                className="btn btn-success"
                            >
                                Unblock
                            </button>
                        )}
                    </div>
                    <div className="profile-details">
                        <img
                            className="profile-pic"
                            src={`${baseURL}${candidate.profile_pic}`}
                            alt="Profile"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80'; }}
                        />
                        <div className="info-section">
                            <h2 className="candidate-name">{candidate.user.full_name}</h2>
                            <p><span className="label">Email:</span> {candidate.user.email}</p>
                            <p><span className="label">Id:</span> {candidate.id}</p>
                            <p><span className="label">Phone:</span> {candidate.phone}</p>
                            <p><span className="label">Place:</span> {candidate.place}</p>
                        </div>
                        <div className="info-section">
                            <p><span className="label">DOB:</span> {candidate.dob}</p>
                            <p><span className="label">Resume:</span>
                                <a className="link" href={`${baseURL}${candidate.resume}`} target="_blank" rel="noopener noreferrer">
                                    Download
                                </a>
                            </p>
                            <p><span className="label">Gender:</span> {candidate.Gender}</p>
                        </div>
                        <div className="info-section">
                            <p><span className="label">Linkedin:</span>
                                <a className="link" href={candidate.linkedin} target="_blank" rel="noopener noreferrer">
                                    {candidate.linkedin}
                                </a>
                            </p>
                            <p><span className="label">Github:</span>
                                <a className="link" href={candidate.github} target="_blank" rel="noopener noreferrer">
                                    {candidate.github}
                                </a>
                            </p>
                            <p><span className="label">Status:</span> {candidate.user.is_active ? 'Active' : 'Inactive'}</p>
                        </div>
                    </div>
                    <div className="date-section">
                        <p><span className="label">Date Joined:</span> {new Date(candidate.user.date_joined).toLocaleDateString()}</p>
                       
                    </div>
                </div>
                <div className="card">
                    <h3 className="section-title">Skills</h3>
                    <p className="section-content">{candidate.skills || 'No skills listed'}</p>
                </div>
                <div className="card">
                    <h3 className="section-title">Educational Details</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Education</th>
                                <th>College</th>
                                <th>Specialization</th>
                                <th>Completed</th>
                                <th>Mark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidate.education && candidate.education.length > 0 ? (
                                candidate.education.map((edu, index) => (
                                    <tr key={index}>
                                        <td>{edu.education}</td>
                                        <td>{edu.college}</td>
                                        <td>{edu.specilization}</td>
                                        <td>{edu.completed}</td>
                                        <td>{edu.mark}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">No education details available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="card">
                    <h3 className="section-title">Applied Jobs</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Location</th>
                                <th>LPA</th>
                                <th>Experience</th>
                                <th>Status</th>
                                <th>Applied On</th>
                            </tr>
                        </thead>


                        <tbody>
  {appliedJobs && appliedJobs.length > 0 ? (
    appliedJobs.map((list, index) => (
      <tr key={index}>
        <td>{list.job?.title || 'N/A'}</td>
        <td>{list.job?.location || 'N/A'}</td>
        <td>{list.job?.lpa || 'N/A'}</td>
        <td>{list.job?.experience || 'N/A'}</td>
        <td>{list.status || 'N/A'}</td>
        <td>{list.applyed_on ? new Date(list.applyed_on).toLocaleDateString() : 'N/A'}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" className="no-data">No applied jobs found</td>
    </tr>
  )}
</tbody>








                      
                    </table>
                </div>
            </div>
        </>
    );
}

export default Cdetails;