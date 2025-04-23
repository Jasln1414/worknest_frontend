import React, { useState, useEffect } from 'react';
import SideBar from './SideBar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import Swal from 'sweetalert2';
import '../Employer/job/style/EmpHome.css';

function EmpHome() {
  const [jobData, setJobData] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(9);

  const token = localStorage.getItem('access');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const baseURL = 'http://127.0.0.1:8000/';

  const checkScreenSize = () => {
    setIsSmallScreen(window.innerWidth < 768);
  };

  const fetchUsageData = async () => {
    setUsageLoading(true);
    try {
      const response = await axios.get(`${baseURL}api/empjob/job-usage/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Job usage response:', response.data);
      if (response.status === 200) {
        setUsageData(response.data);
      }
    } catch (error) {
      console.error('Error fetching job usage data:', error.response?.data || error);
      if (error.response?.status === 404) {
        console.warn('Job usage endpoint not found. Using fallback data.');
        setUsageData({ job_count: 0, has_active_subscription: false });
      }
    } finally {
      setUsageLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${baseURL}api/account/user/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        const profileData = response.data.data || {};
        const userData = response.data.user_data || profileData;
        setUserDetails({ ...profileData, ...userData });
        dispatch(
          set_user_basic_details({
            name: profileData.full_name || profileData.name,
            email: profileData.email,
            phone: profileData.phone,
            profile_pic: userData.profile_pic || profileData.profile_pic,
            user_type_id: userData.id || profileData.id,
          })
        );
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseURL}api/empjob/getAlljobs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setJobData(
          Array.isArray(response.data)
            ? response.data
            : response.data && Array.isArray(response.data.data)
            ? response.data.data
            : []
        );
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      setError('Failed to fetch job details. Please try again.');
      setJobData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJobStatusChange = async (jobId, action) => {
    try {
      const isActivating = action === 'activate';
      await axios.get(`${baseURL}/csrf/`, { withCredentials: true });
      const response = await axios.post(
        `${baseURL}/api/empjob/getjobs/status/${jobId}/`,
        { active: isActivating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setJobData((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, active: isActivating } : job
          )
        );
        Swal.fire({
          icon: 'success',
          title: isActivating ? 'Activated' : 'Deactivated',
          text: `The job has been successfully ${action}d.`,
        });
        fetchUsageData();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update job status. Please try again later.',
      });
    }
  };

  const handlePostJobClick = (e) => {
    if (!usageData?.has_active_subscription) {
      e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'No Active Subscription',
        text: 'Please subscribe to a plan to post jobs.',
        showCancelButton: true,
        confirmButtonText: 'View Plans',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/employer/subscriptions');
        }
      });
    } else if (usageData.remaining_jobs !== 'Unlimited' && usageData.remaining_jobs <= 0) {
      e.preventDefault();
      Swal.fire({
        icon: 'warning',
        title: 'Job Limit Reached',
        text: 'You have reached your job posting limit. Upgrade your plan or pay for an additional job posting.',
        showCancelButton: true,
        confirmButtonText: 'Upgrade Plan',
        cancelButtonText: 'Pay for Extra Job',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/employer/subscriptions');
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          initiatePaymentForExtraJob();
        }
      });
    }
  };

  const initiatePaymentForExtraJob = async () => {
    try {
      const response = await axios.post(
        `${baseURL}api/payment/create/`,
        { employer_id: userDetails.id },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      const { id: order_id, amount, key } = response.data;

      const options = {
        key,
        amount,
        currency: 'INR',
        order_id,
        name: 'Additional Job Posting',
        description: 'Payment for posting an additional job',
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              `${baseURL}api/payment/verify/`,
              {
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                transaction_id: response.razorpay_payment_id,
                method: 'Razorpay',
              },
              { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            if (verifyResponse.data.success) {
              Swal.fire({
                icon: 'success',
                title: 'Payment Successful',
                text: 'You can now post an additional job!',
              });
              navigate('/employer/postjob/');
            }
          } catch (verifyErr) {
            Swal.fire({
              icon: 'error',
              title: 'Payment Verification Failed',
              text: 'Please try again or contact support.',
            });
          }
        },
        prefill: { email: userDetails.email, contact: userDetails.phone },
        theme: { color: '#4B5563' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Initiation Failed',
        text: 'Unable to process payment. Please try again.',
      });
    }
  };

  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    if (token) {
      fetchProfileData();
      fetchJobDetails();
      fetchUsageData();
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [token]);

  const safeJobData = Array.isArray(jobData) ? jobData : [];
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = safeJobData.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(safeJobData.length / jobsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

  return (
    <div className="eh-container">
      {!isSmallScreen && (
        <div className="ep-sidebar-fixed">
          <SideBar />
        </div>
      )}

      <div className={`eh-main-content ${isSmallScreen ? 'eh-mobile-content' : ''}`}>
        {!isSmallScreen && userDetails && (
          <div className="eh-user-details">
            <h2>Welcome, {userDetails.full_name || userDetails.name}</h2>
          </div>
        )}

        {!usageLoading && usageData && (
          <div className="job-usage-dashboard">
            <div className="usage-header">
              <h2>Job Posting Stats</h2>
              {usageData.has_active_subscription && (
                <div className="subscription-badge">
                  <span>{usageData.subscription_plan}</span>
                </div>
              )}
            </div>

            <div className="usage-stats-container">
              <div className="usage-stat-card">
                <div className="stat-icon jobs-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Jobs Posted</h3>
                  <p className="stat-value">{usageData.job_count}</p>
                </div>
              </div>

              <div className="usage-stat-card">
                <div className="stat-icon remaining-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Remaining Jobs</h3>
                  <p className="stat-value">
                    {usageData.has_active_subscription
                      ? usageData.remaining_jobs === 'Unlimited'
                        ? '∞'
                        : usageData.remaining_jobs
                      : '0'}
                  </p>
                </div>
              </div>

              <div className="usage-stat-card">
                <div className="stat-icon expiry-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{usageData.has_active_subscription ? 'Expires On' : 'Subscription'}</h3>
                  <p className="stat-value">
                    {usageData.has_active_subscription
                      ? formatDate(usageData.subscription_end_date)
                      : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {!usageData.has_active_subscription && (
              <div className="subscription-cta">
                <div className="cta-message">
                  <h3>No Active Subscription</h3>
                  <p>Subscribe to post jobs and access all employer features</p>
                </div>
                <Link to="/employer/subscriptions" className="cta-button">
                  View Plans
                </Link>
              </div>
            )}

            {usageData.has_active_subscription &&
              usageData.remaining_jobs !== 'Unlimited' &&
              usageData.remaining_jobs === 0 && (
                <div className="subscription-cta warning-cta">
                  <div className="cta-message">
                    <h3>Job Limit Reached!</h3>
                    <p>You've used all your job postings. Upgrade your plan or pay ₹200 for an extra job slot.</p>
                  </div>
                  <div className="cta-buttons">
                    <Link to="/employer/subscriptions" className="cta-button upgrade-button">
                      Upgrade Plan
                    </Link>
                    <button onClick={initiatePaymentForExtraJob} className="cta-button pay-button">
                      Pay for Extra Job
                    </button>
                  </div>
                </div>
              )}

            {usageData.has_active_subscription &&
              (usageData.remaining_jobs === 'Unlimited' || usageData.remaining_jobs > 0) && (
                <div className="subscription-cta post-job-cta">
                  <div className="cta-message">
                    <h3>Ready to Post a New Job?</h3>
                    <p>Create a new job listing to start receiving applications</p>
                  </div>
                  <Link to="/employer/postjob/" onClick={handlePostJobClick} className="cta-button post-button">
                    Post New Job
                  </Link>
                </div>
              )}
          </div>
        )}

        <div className="jobs-heading">
          <h2>Your Job Listings</h2>
          {safeJobData.length > 0 && (
            <Link to="/employer/postjob/" onClick={handlePostJobClick} className="post-new-job-button">
              Post New Job
            </Link>
          )}
        </div>

        {loading ? (
          <div className="eh-loading-message">Loading jobs...</div>
        ) : error ? (
          <div className="eh-error-message">{error}</div>
        ) : safeJobData.length > 0 ? (
          <>
            <div className="eh-job-grid">
              {currentJobs.map((job) => (
                <div key={job.id} className="eh-job-card">
                  <div className="eh-job-card-inner">
                    <Link to={`/employer/jobdetail/${job.id}`}>
                      <p className="eh-job-title">{job.title}</p>
                    </Link>
                    <div className="eh-job-detail">
                      <span>
                        Status:{' '}
                        {job.active ? (
                          <span className="eh-job-status-active">Active</span>
                        ) : (
                          <span className="eh-job-status-inactive">Inactive</span>
                        )}
                      </span>
                    </div>
                    <div className="eh-job-detail">
                      <span>Location: {job.location}</span>
                    </div>
                    <div className="eh-job-detail">
                      <span>Experience: {job.experience}</span>
                    </div>
                    <div className="eh-job-detail">
                      <span>Salary: {job.lpa} LPA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="eh-pagination-container">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`eh-pagination-button eh-prev-btn ${currentPage === 1 ? 'eh-disabled' : ''}`}
              >
                Previous
              </button>
              <div className="eh-pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`eh-pagination-number ${currentPage === i + 1 ? 'eh-active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`eh-pagination-button eh-next-btn ${currentPage === totalPages ? 'eh-disabled' : ''}`}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="eh-no-jobs-container">
            <div className="eh-no-jobs-message">
              <h3 className="eh-no-jobs-title">Add your first job</h3>
              <p className="eh-no-jobs-text">There are currently no job listings. Post a job to start attracting candidates.</p>
              <Link to="/employer/postjob/" onClick={handlePostJobClick}>
                <button className="eh-post-job-button">Post First Job</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmpHome;