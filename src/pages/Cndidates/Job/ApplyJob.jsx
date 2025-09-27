import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Drawer from 'react-modern-drawer';
import Swal from 'sweetalert2';
import 'react-modern-drawer/dist/index.css';
import StatusJob from './StatusJob';
import { useMediaQuery } from 'react-responsive';
import './detail.css';

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="unique-pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="unique-pagination-button"
      >
        Previous
      </button>
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`unique-pagination-button ${currentPage === number ? 'unique-active' : ''}`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="unique-pagination-button"
      >
        Next
      </button>
    </div>
  );
}

function ApplyedJob() {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const navigate = useNavigate();
  const authentication_user = useSelector((state) => state.authentication_user);
  const [jobData, setJobData] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const toggleDrawer = () => setIsOpen(!isOpen);

  const fetchApplyedJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/api/empjob/getApplyedjobs/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 200 && response.data.length > 0) {
        setJobData(response.data);
        if (selectedJob) {
          const updatedSelectedJob = response.data.find((job) => job.id === selectedJob.id);
          if (updatedSelectedJob) {
            setSelectedJob(updatedSelectedJob);
          } else {
            setSelectedJob(response.data[0]);
          }
        } else {
          setSelectedJob(response.data[0]);
        }
      } else {
        setJobData([]);
        setSelectedJob(null);
      }


      
    } catch (error) {
      console.error("Error fetching jobs:", error);
      alert("Failed to fetch applied jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplyedJobs();
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [token, refreshTrigger]);

  const formatDate = (dateTimeString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  const handleJobClick = (job) => {
    if (!job.job.active) {
      Swal.fire({
        title: 'Job No Longer Active',
        text: 'This position has been deactivated by the employer and is no longer accepting applications.',
        icon: 'warning',
        confirmButtonText: 'Understood',
        confirmButtonColor: '#3085d6',
        background: '#f8f9fa',
        iconColor: '#f1c40f',
        customClass: {
          popup: 'unique-swal-custom-popup',
          title: 'unique-swal-custom-title',
          content: 'unique-swal-custom-content'
        }
      });
    }
    setSelectedJob(job);
    if (isMobile) toggleDrawer();
  };

  const updateJobStatus = async (jobId, action) => {
    try {
      const response = await axios.post(
        `${baseURL}/api/empjob/application-status/${jobId}/`,
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        await fetchApplyedJobs();
      }
    } catch (error) {
      console.error("Error updating status:", error.response ? error.response.data : error);
      alert(`Failed to update status: ${error.response ? error.response.data.message : 'Unknown error'}`);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobData.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobData.length / jobsPerPage);

  if (loading && jobData.length === 0) {
    return <div className="unique-loading">Loading...</div>;
  }

  return (
    <div className="unique-applyed-jobs-wrapper">
      <h1 className="unique-applyed-jobs-heading">Applied Jobs</h1>
      {jobData.length > 0 ? (
        <div className="unique-applyed-jobs-layout">
          <div className="unique-job-list-section">
            <h2>Your Applications</h2>
            <p>{jobData.length} applications</p>
            {currentJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className={`unique-job-list-item ${selectedJob && selectedJob.id === job.id ? 'unique-selected-job' : ''}`}
              >
                <div className="unique-job-item-content">
                  <div className="unique-job-item-image">
                    <img
                      src={`${job.job.employer.profile_pic}`}
                      alt={job.job.employer.user_full_name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "";
                      }}
                    />
                  </div>
                  <div className="unique-job-item-details">
                    <h3>{job.job.title}</h3>
                    <p>{job.job.employer.user_full_name}</p>
                    <p>{job.job.location}</p>
                    <div className="unique-job-item-tags">
                      <span className="unique-job-experience-tag">{job.job.experience || 'Not specified'} experience</span>
                      <span className="unique-job-salary-tag">{job.job.lpa} LPA</span>
                    </div>
                    <div className="unique-job-item-footer">
                      <div className="unique-job-applied-date">
                        Applied on {formatDate(job.applyed_on)}
                      </div>
                      <div className="unique-job-status-tag">
                        {!job.job.active ? (
                          <span className="unique-status-indicator unique-inactive">Inactive</span>
                        ) : (
                          <span className={`unique-status-indicator ${job.status === 'Pending' ? 'unique-in-progress' : job.status === 'Accepted' ? 'unique-accepted' : job.status === 'Rejected' ? 'unique-rejected' : 'unique-pending'}`}>
                            {job.status || 'Pending'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {jobData.length > jobsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
          <div className="unique-job-details-section">
            {selectedJob ? (
              <div>
                {!selectedJob.job.active && (
                  <div className="unique-job-inactive-notice">
                    <div className="unique-warning-icon">⚠️</div>
                    <p>This job is no longer active. The employer has deactivated this position.</p>
                  </div>
                )}
                <StatusJob
                  toggleDrawer={toggleDrawer}
                  selectedJob={selectedJob}
                  updateJobStatus={updateJobStatus}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            ) : (
              <div className="unique-no-job-selected-message">Select a job to view details</div>
            )}
          </div>
        </div>
      ) : (
        <div className="unique-no-applications-message">
          <div className="unique-no-applications-content">
            <div className="unique-no-applications-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2>No Applications Yet</h2>
            <p>You haven't applied to any jobs yet. Start your job search journey today!</p>
            <button onClick={() => navigate('/jobs')} className="unique-find-jobs-button">
              Find Jobs
            </button>
          </div>
        </div>
      )}
      <div className="unique-mobile-drawer-wrapper">
        <Drawer
          open={isOpen}
          onClose={toggleDrawer}
          direction="bottom"
          size="85vh"
          className="unique-mobile-drawer-content"
        >
          <div className="unique-drawer-handle"></div>
          {selectedJob && (
            <div>
              {!selectedJob.job.active && (
                <div className="unique-job-inactive-notice unique-mobile">
                  <div className="unique-warning-icon">⚠️</div>
                  <p>This job is no longer active. The employer has deactivated this position.</p>
                </div>
              )}
              <StatusJob
                toggleDrawer={toggleDrawer}
                selectedJob={selectedJob}
                updateJobStatus={updateJobStatus}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </Drawer>
      </div>
    </div>
  );
}

export default ApplyedJob;