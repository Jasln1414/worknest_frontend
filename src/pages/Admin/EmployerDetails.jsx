import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import './Admin.css';

function Edetails() {
    const baseURL = import.meta.env.VITE_API_BASEURL || "http://127.0.0.1:8000";
    const { id } = useParams();
    const [employer, setEmployer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [render, setRender] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('access');
                console.log('Fetching employer with token:', token);
                if (!token) throw new Error("No authentication token found. Please log in.");

                const response = await axios.get(`${baseURL}/dashboard/employer/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                if (response.status === 200) {
                    setEmployer(response.data);
                    console.log('Employer data:', response.data);
                }
            } catch (error) {
                const errorMsg = error.response?.data?.error || error.message;
                setError(errorMsg);
                console.error('Error fetching employer details:', errorMsg);
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
            formData.append("id", employer.id);
            formData.append("action", action);
            formData.append("type", "employer");

            console.log('Sending status update with token:', token);
            const response = await axios.post(`${baseURL}/dashboard/status/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 200) {
                setEmployer(prev => ({
                    ...prev,
                    user: { ...prev.user, is_active: action === 'unblock' },
                    jobs: prev.jobs.map(job => ({
                        ...job,
                        active: action === 'unblock' // Set job.active based on action
                    }))
                }));
                setRender(!render);
                console.log('Status update successful:', response.data);
                setError(null);
                setStatusMessage({
                    text: `Employer ${action === 'block' ? 'blocked' : 'unblocked'} successfully`,
                    type: action === 'block' ? 'error' : 'success'
                });
                setTimeout(() => setStatusMessage(null), 5000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            console.error('Error updating status:', errorMsg);
            setError(`Failed to ${action} employer: ${errorMsg}`);
            if (error.response?.status === 401) {
                localStorage.removeItem('access');
                window.location.href = '/admin';
            }
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="sidebar"><Sidebar /></div>
                <div className="loading-container">
                    <CircularProgress />
                </div>
            </div>
        );
    }

    if (!employer) {
        return (
            <div className="container">
                <div className="sidebar"><Sidebar /></div>
                <div className="content">
                    <div className="error-message">
                        {error || "Failed to load employer data."}
                    </div>
                </div>
            </div>
        );
    }

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
                        {employer.user.is_active ? (
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
                            src={`${baseURL}${employer.profile_pic}`}
                            alt="Profile"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80'; }}
                        />
                        <div className="info-section">
                            <h2 className="employer-name">{employer.user.full_name}</h2>
                            <p><span className="label">Email:</span> {employer.user.email}</p>
                            <p><span className="label">Phone:</span> {employer.phone}</p>
                            <p><span className="label">Headquarters:</span> {employer.headquarters}</p>
                            <p><span className="label">Website:</span>
                                <a className="link" href={employer.website_link} target="_blank" rel="noopener noreferrer">
                                    {employer.website_link}
                                </a>
                            </p>
                        </div>
                        <div className="info-section">
                            <p><span className="label">Industry:</span> {employer.industry}</p>
                            <p><span className="label">Date Joined:</span> {new Date(employer.user.date_joined).toLocaleDateString()}</p>
                            <p><span className="label">Last Login:</span> {employer.user.last_login ? new Date(employer.user.last_login).toLocaleString() : 'Never'}</p>
                            <p><span className="label">Status:</span> {employer.user.is_active ? "Active" : "Inactive"}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="section-title">Address</h3>
                    <p className="section-content">{employer.address || 'No address provided'}</p>
                </div>

                <div className="card">
                    <h3 className="section-title">About</h3>
                    <p className="section-content">{employer.about || 'No about information provided'}</p>
                </div>

                <div className="card">
                    <h3 className="section-title">Jobs Posted</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Posted Date</th>
                                <th>Apply Before</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employer.jobs && employer.jobs.length > 0 ? (
                                employer.jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>{job.title}</td>
                                        <td>{new Date(job.posteDate).toLocaleDateString()}</td>
                                        <td>{new Date(job.applyBefore).toLocaleDateString()}</td>
                                        <td>
                                        <span
    className={`status-badge ${job.active ? 'status-active' : 'status-inactive'}`}
    style={{
        backgroundColor: job.active ? 'green' : 'red', // Set colors explicitly
        color: 'white', // White text
        border: '1px solid white',
        borderRadius: '18px', // White border
        minWidth: '80px', // Fixed minimum width
        display: 'inline-block', // Ensures width applies
        textAlign: 'center', // Centers text within the span
        padding:'2px',
    }}
>
    {job.active ? 'Active' : 'Inactive'}
</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="no-data">No jobs posted</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {statusMessage && (
                    <div className={`status-message ${statusMessage.type === 'success' ? 'status-success' : 'status-error'}`}>
                        {statusMessage.text}
                        <button
                            className="close-btn"
                            onClick={() => setStatusMessage(null)}
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

export default Edetails;