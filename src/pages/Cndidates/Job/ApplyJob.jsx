// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import Drawer from 'react-modern-drawer';
// import Swal from 'sweetalert2';
// import 'react-modern-drawer/dist/index.css';
// import StatusJob from './StatusJob';
// import { useMediaQuery } from 'react-responsive';


// // Import the Pagination component
// function Pagination({ currentPage, totalPages, onPageChange }) {
//   const handlePrevious = () => {
//     if (currentPage > 1) {
//       onPageChange(currentPage - 1);
//     }
//   };
  
//   const handleNext = () => {
//     if (currentPage < totalPages) {
//       onPageChange(currentPage + 1);
//     }
//   };
  
//   const pageNumbers = [];
//   for (let i = 1; i <= totalPages; i++) {
//     pageNumbers.push(i);
//   }

//   return (
//     <div className="pagination">
//       <button
//         onClick={handlePrevious}
//         disabled={currentPage === 1}
//         className="pagination-button"
//       >
//         Previous
//       </button>
//       {pageNumbers.map((number) => (
//         <button
//           key={number}
//           onClick={() => onPageChange(number)}
//           className={`pagination-button ${currentPage === number ? 'active' : ''}`}
//         >
//           {number}
//         </button>
//       ))}
//       <button
//         onClick={handleNext}
//         disabled={currentPage === totalPages}
//         className="pagination-button"
//       >
//         Next
//       </button>
//     </div>
//   );
// }

// function ApplyedJob() {
//   const baseURL = 'http://127.0.0.1:8000';
//   const token = localStorage.getItem('access');
//   const navigate = useNavigate();
//   const authentication_user = useSelector((state) => state.authentication_user);
//   const [jobData, setJobData] = useState([]);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
//   const [loading, setLoading] = useState(true);
//   const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this to trigger refreshes

//   // Add pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const jobsPerPage = 5;

//   const toggleDrawer = () => setIsOpen(!isOpen);

//   const fetchApplyedJobs = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${baseURL}/api/empjob/getApplyedjobs/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       if (response.status === 200 && response.data.length > 0) {
//         setJobData(response.data);
//         // If there's already a selected job, find and update it
//         if (selectedJob) {
//           const updatedSelectedJob = response.data.find((job) => job.id === selectedJob.id);
//           if (updatedSelectedJob) {
//             setSelectedJob(updatedSelectedJob);
//           } else {
//             // If the selected job is no longer in the data, select the first one
//             setSelectedJob(response.data[0]);
//           }
//         } else {
//           // If no job is selected, select the first one
//           setSelectedJob(response.data[0]);
//         }
//       } else {
//         setJobData([]);
//         setSelectedJob(null);
//       }
//     } catch (error) {
//       console.error("Error fetching jobs:", error);
//       alert("Failed to fetch applied jobs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchApplyedJobs();
    
//     // Set up a polling interval to fetch updates (optional)
//     const interval = setInterval(() => {
//       setRefreshTrigger(prev => prev + 1);
//     }, 30000); // Poll every 30 seconds
    
//     return () => clearInterval(interval);
//   }, [token, refreshTrigger]); // Add refreshTrigger to dependencies

//   const formatDate = (dateTimeString) => {
//     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//     return new Date(dateTimeString).toLocaleDateString(undefined, options);
//   };

//   const handleJobClick = (job) => {
//     if (!job.job.active) {
//       // Show SweetAlert2 for inactive jobs
//       Swal.fire({
//         title: 'Job No Longer Active',
//         text: 'This position has been deactivated by the employer and is no longer accepting applications.',
//         icon: 'warning',
//         confirmButtonText: 'Understood',
//         confirmButtonColor: '#3085d6',
//         background: '#f8f9fa',
//         iconColor: '#f1c40f',
//         customClass: {
//           popup: 'swal-custom-popup',
//           title: 'swal-custom-title',
//           content: 'swal-custom-content'
//         }
//       });
//     }
    
//     // Set the selected job regardless of status to allow viewing details
//     setSelectedJob(job);
//     if (isMobile) toggleDrawer();
//   };

//   const updateJobStatus = async (jobId, action) => {
//     try {
//       const response = await axios.post(
//         `${baseURL}/api/empjob/application-status/${jobId}/`,
//         { action },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       if (response.status === 200) {
//         await fetchApplyedJobs(); // Refresh job data after status update
//       }
//     } catch (error) {
//       console.error("Error updating status:", error.response ? error.response.data : error);
//       alert(`Failed to update status: ${error.response ? error.response.data.message : 'Unknown error'}`);
//     }
//   };

//   // Handle page change
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   // Get current jobs for pagination
//   const indexOfLastJob = currentPage * jobsPerPage;
//   const indexOfFirstJob = indexOfLastJob - jobsPerPage;
//   const currentJobs = jobData.slice(indexOfFirstJob, indexOfLastJob);
//   const totalPages = Math.ceil(jobData.length / jobsPerPage);

//   if (loading && jobData.length === 0) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="applyed-jobs-wrapper">
//       <h1 className="applyed-jobs-heading">Applied Jobs</h1>
//       {jobData.length > 0 ? (
//         <div className="applyed-jobs-layout">
//           <div className="job-list-section">
//             <h2>Your Applications</h2>
//             <p>{jobData.length} applications</p>
//             {currentJobs.map((job) => (
//               <div
//                 key={job.id}
//                 onClick={() => handleJobClick(job)}
//                 className={`job-list-item ${selectedJob && selectedJob.id === job.id ? 'selected-job' : ''}`}
//               >
//                 <div className="job-item-content">
//                   <div className="job-item-image">
                    
//                     <img
//                       src={`${job.job.employer.profile_pic}`}
//                       alt={job.job.employer.user_full_name}
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = "";
//                       }}
//                     />
//                   </div>
//                   <div className="job-item-details">
//                     <h3>{job.job.title}</h3>
//                     <p>{job.job.employer.user_full_name}</p>
//                     <p>{job.job.location}</p>
//                     <div className="job-item-tags">
//                       <span className="job-experience-tag">{job.job.experience || 'Not specified'} experience</span>
//                       <span className="job-salary-tag">{job.job.lpa} LPA</span>
//                     </div>
//                     <div className="job-item-footer">
//                       <div className="job-applied-date">
//                         Applied on {formatDate(job.applyed_on)}
//                       </div>
//                       <div className="job-status-tag">
//                         {!job.job.active ? (
//                           <span className="status-indicator inactive">Inactive</span>
//                         ) : (
//                           <span className={`status-indicator ${job.status === 'Pending' ? 'in-progress' : job.status === 'Accepted' ? 'accepted' : job.status === 'Rejected' ? 'rejected' : 'pending'}`}>
//                             {job.status || 'Pending'}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
            
//             {/* Add pagination component */}
//             {jobData.length > jobsPerPage && (
//               <Pagination 
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={handlePageChange}
//               />
//             )}
//           </div>
//           <div className="job-details-section">
//             {selectedJob ? (
//               <div>
//                 {!selectedJob.job.active && (
//                   <div className="job-inactive-notice">
//                     <div className="warning-icon">⚠️</div>
//                     <p>This job is no longer active. The employer has deactivated this position.</p>
//                   </div>
//                 )}
//                 <StatusJob
//                   toggleDrawer={toggleDrawer}
//                   selectedJob={selectedJob}
//                   updateJobStatus={updateJobStatus}
//                   refreshTrigger={refreshTrigger} // Pass the trigger to force refresh
//                 />
//               </div>
//             ) : (
//               <div className="no-job-selected-message">Select a job to view details</div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="no-applications-message">
//           <div className="no-applications-content">
//             <div className="no-applications-icon">
//               <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <h2>No Applications Yet</h2>
//             <p>You haven't applied to any jobs yet. Start your job search journey today!</p>
//             <button onClick={() => navigate('/jobs')} className="find-jobs-button">
//               Find Jobs
//             </button>
//           </div>
//         </div>
//       )}
//       <div className="mobile-drawer-wrapper">
//         <Drawer
//           open={isOpen}
//           onClose={toggleDrawer}
//           direction="bottom"
//           size="85vh"
//           className="mobile-drawer-content"
//         >
//           <div className="drawer-handle"></div>
//           {selectedJob && (
//             <div>
//               {!selectedJob.job.active && (
//                 <div className="job-inactive-notice mobile">
//                   <div className="warning-icon">⚠️</div>
//                   <p>This job is no longer active. The employer has deactivated this position.</p>
//                 </div>
//               )}
//               <StatusJob
//                 toggleDrawer={toggleDrawer}
//                 selectedJob={selectedJob}
//                 updateJobStatus={updateJobStatus}
//                 refreshTrigger={refreshTrigger} // Pass the trigger to force refresh
//               />
//             </div>
//           )}
//         </Drawer>
//       </div>
//     </div>
//   );
// }

// export default ApplyedJob;












import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Drawer from 'react-modern-drawer';
import Swal from 'sweetalert2';
import 'react-modern-drawer/dist/index.css';
import StatusJob from './StatusJob';
import { useMediaQuery } from 'react-responsive';
import './candi.css';

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