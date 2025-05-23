import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import JobCard from '../utilities/Jobcard';
import Pagination from '../utilities/Paginations';
import './SavedJob.css';

const useSavedJobs = (token) => {
    const [jobdata, setJobData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshFlag, setRefreshFlag] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/empjob/savedjobs/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobData(response.data.data || []);
            setError(null);
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
            setError("Failed to load saved jobs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, refreshFlag]);

    return { 
        jobdata, 
        loading, 
        error,
        refresh: () => setRefreshFlag(!refreshFlag)
    };
};

// Save Button Component
const SaveButton = ({ jobId, onUpdate }) => {
    const [isSaved, setIsSaved] = useState(true); // Default to true for saved jobs list
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('access');

    const handleSaveToggle = async () => {
        try {
            setLoading(true);
            const action = isSaved ? 'unsave' : 'save';
            await axios.post(
                `http://127.0.0.1:8000/api/empjob/savejobs/${jobId}/`,
                { action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setIsSaved(!isSaved);
            onUpdate?.(); // Trigger parent refresh
        } catch (error) {
            console.error("Error toggling save status:", error);
            Swal.fire('Error', 'Failed to update save status', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleSaveToggle}
            className={`save-button ${isSaved ? 'saved' : ''}`}
            disabled={loading}
        >
            {loading ? (
                'Processing...'
            ) : (
                <>
                    {isSaved ? <FaBookmark /> : <FaRegBookmark />}
                    {isSaved ? 'Unsave' : 'Save'}
                </>
            )}
        </button>
    );
};

// Main Component
function SavedJobs() {
    const token = localStorage.getItem('access');
    const { jobdata, loading, error, refresh } = useSavedJobs(token);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 6;
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobdata.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(jobdata.length / jobsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleJobClick = (job) => {
        if (!job.active) {
            Swal.fire({
                title: 'Job No Longer Active',
                text: 'This position has been deactivated by the employer.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        }
    };

    if (error) {
        Swal.fire('Error', error, 'error');
    }

    return (
        <div className="saved-jobs-container">
            {/* <div className="saved-jobs-wrapper"> */}
                <div className="saved-jobs-header">
                    <h1 className="saved-jobs-title">SAVED JOBS</h1>
                    <div className="title-underline"></div>
                </div>
                
                {loading ? (
                    <div className="jobs-grid loading-grid">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="job-card-skeleton">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line"></div>
                            </div>
                        ))}
                    </div>
                ) : jobdata.length > 0 ? (
                    <>
                        <div className="jobs-grid-saved">
                            {currentJobs.map((savedJob) => (
                                <div 
                                    key={savedJob.job.id} 
                                    className={`job-card-container ${!savedJob.job.active ? 'inactive-job' : ''}`}
                                    onClick={() => handleJobClick(savedJob.job)}
                                >
                                    <JobCard
                                        {...savedJob.job}
                                        baseURL="http://127.0.0.1:8000"
                                        empname={savedJob.job.employer.user_full_name}
                                        img={savedJob.job.employer.profile_pic}
                                    />
                                    {/* <div className="job-card-actions">
                                        <SaveButton 
                                            jobId={savedJob.job.id} 
                                            onUpdate={refresh}
                                        />
                                    </div> */}
                                    
                                    {!savedJob.job.active && (
                                        <div className="inactive-badge">
                                            <span>NO LONGER ACTIVE</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <Pagination 
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="empty-title">No Saved Jobs Yet</h3>
                        <p className="empty-message">Save jobs you're interested in to view them here later</p>
                        <button 
                            onClick={() => window.location.href = '/jobs'}
                            className="browse-button"
                        >
                            Browse Jobs
                        </button>
                    </div>
                )}
            </div>
        // </div>
    );
}

export default SavedJobs;