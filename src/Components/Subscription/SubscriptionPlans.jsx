import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SideBar from '../../pages/Employer/SideBar';
import MobileMenuToggle from '../../pages/Employer/utilities/MobileToggle';
import './Subcription.css'; 

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [additionalJobsCount, setAdditionalJobsCount] = useState(1);
  const [showAdditionalJobsModal, setShowAdditionalJobsModal] = useState(false);
  const baseURL = 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('access');

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching subscription plans...');
        const response = await axios.get(`${baseURL}/payment/subscription/plans/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Plans API Response:', response.data);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setPlans(response.data);
        } else {
          setError('No subscription plans found.');
        }
      } catch (err) {
        console.error('Error fetching plans:', err.response?.data || err);
        setError('Failed to load subscription plans.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUsageData = async () => {
      setUsageLoading(true);
      try {
        const response = await axios.get(`${baseURL}/empjob/job-usage/`, {
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

    if (token) {
      fetchPlans();
      fetchUsageData();
    } else {
      setError('Please log in to view subscription plans.');
    }
  }, [token]);

  const handleSubscribe = async (planId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Subscribing to plan ID:', planId);
      const response = await axios.post(
        `${baseURL}/payment/subscription/create/`,
        { plan_id: planId },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('Subscription create response:', response.data);
      const { order_id, amount, key_id, subscription_type } = response.data;

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => initiatePayment(order_id, amount, key_id, planId, subscription_type);
        script.onerror = () => {
          setError('Failed to load payment gateway.');
          setLoading(false);
        };
        document.body.appendChild(script);
      } else {
        initiatePayment(order_id, amount, key_id, planId, subscription_type);
      }
    } catch (err) {
      console.error('Subscription creation error:', err.response?.data || err);
      Swal.fire({
        icon: 'error',
        title: 'Subscription Error',
        text: err.response?.data?.message || 'Error creating subscription.',
        confirmButtonColor: '#1E3A8A',
      });
      setError(err.response?.data?.message || 'Error creating subscription.');
      setLoading(false);
    }
  };

  const handleAddJobSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Adding additional job slots:', additionalJobsCount);
      const response = await axios.post(
        `${baseURL}/payment/job-slots/add/`,
        { job_count: additionalJobsCount },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('Add job slots response:', response.data);
      const { order_id, amount, key_id, job_count } = response.data;

      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => initiateJobSlotsPayment(order_id, amount, key_id, job_count);
        script.onerror = () => {
          setError('Failed to load payment gateway.');
          setLoading(false);
        };
        document.body.appendChild(script);
      } else {
        initiateJobSlotsPayment(order_id, amount, key_id, job_count);
      }
    } catch (err) {
      console.error('Adding job slots error:', err.response?.data || err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error adding job slots.',
        confirmButtonColor: '#1E3A8A',
      });
      setError(err.response?.data?.message || 'Error adding job slots.');
      setLoading(false);
    }
  };

  const initiatePayment = (orderId, amount, keyId, planId, subscriptionType) => {
    const planDetails = plans.find((p) => p.id === planId);
    console.log('Initiating payment for:', { orderId, amount, keyId, plan: planDetails, type: subscriptionType });

    const options = {
      key: keyId,
      amount,
      currency: 'INR',
      name: 'WorkNest',
      description: subscriptionType === 'extension'
        ? `Extending ${planDetails?.name || 'Plan'} subscription`
        : `Subscription to ${planDetails?.name || 'Plan'}`,
      order_id: orderId,
      handler: async (response) => {
        console.log('Payment success:', response);
        try {
          const verifyResponse = await axios.post(
            `${baseURL}/payment/subscription/verify/`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          console.log('Verification response:', verifyResponse.data);
          if (subscriptionType === 'extension') {
            Swal.fire({
              icon: 'success',
              title: 'Subscription Extended!',
              text: 'Your subscription has been successfully extended.',
              confirmButtonColor: '#1E3A8A',
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Subscription Activated!',
              text: 'Your subscription has been successfully activated.',
              confirmButtonColor: '#1E3A8A',
            });
          }
          fetchUsageData();
        } catch (verifyErr) {
          console.error('Verification error:', verifyErr.response?.data || verifyErr);
          Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: verifyErr.response?.data?.message || 'Payment verification failed.',
            confirmButtonColor: '#1E3A8A',
          });
          setError(verifyErr.response?.data?.message || 'Payment verification failed.');
        } finally {
          setLoading(false);
        }
      },
      prefill: { email: localStorage.getItem('user_email') || '', contact: localStorage.getItem('user_phone') || '' },
      theme: { color: '#1E3A8A' },
      modal: { confirm_close: true, escape: false, animation: true },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: response.error.description,
        confirmButtonColor: '#1E3A8A',
      });
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
    rzp.open();
  };

  const initiateJobSlotsPayment = (orderId, amount, keyId, jobCount) => {
    console.log('Initiating job slots payment for:', { orderId, amount, keyId, jobCount });

    const options = {
      key: keyId,
      amount,
      currency: 'INR',
      name: 'WorkNest',
      description: `Adding ${jobCount} additional job slots`,
      order_id: orderId,
      handler: async (response) => {
        console.log('Payment success:', response);
        try {
          const verifyResponse = await axios.post(
            `${baseURL}/payment/job-slots/verify/`,
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
          console.log('Verification response:', verifyResponse.data);
          Swal.fire({
            icon: 'success',
            title: 'Job Slots Added!',
            text: `Successfully added ${jobCount} job slots to your subscription.`,
            confirmButtonColor: '#1E3A8A',
          });
          setShowAdditionalJobsModal(false);
          setAdditionalJobsCount(1);
          fetchUsageData();
        } catch (verifyErr) {
          console.error('Verification error:', verifyErr.response?.data || verifyErr);
          Swal.fire({
            icon: 'error',
            title: 'Verification Failed',
            text: verifyErr.response?.data?.message || 'Payment verification failed.',
            confirmButtonColor: '#1E3A8A',
          });
          setError(verifyErr.response?.data?.message || 'Payment verification failed.');
        } finally {
          setLoading(false);
        }
      },
      prefill: { email: localStorage.getItem('user_email') || '', contact: localStorage.getItem('user_phone') || '' },
      theme: { color: '#1E3A8A' },
      modal: { confirm_close: true, escape: false, animation: true },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: response.error.description,
        confirmButtonColor: '#1E3A8A',
      });
      setError(`Payment failed: ${response.error.description}`);
      setLoading(false);
    });
    rzp.open();
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

  const fetchUsageData = async () => {
    setUsageLoading(true);
    try {
      const response = await axios.get(`${baseURL}/empjob/job-usage/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Job usage response:', response.data);
      if (response.status === 200) {
        setUsageData(response.data);
      }
    } catch (error) {
      console.error('Error fetching job usage data:', error.response?.data || error);
    } finally {
      setUsageLoading(false);
    }
  };

  return (
    <div className="subscription-wrapper">
      <MobileMenuToggle toggleSidebar={toggleSidebar} isSidebarVisible={isSidebarVisible} />
      <div className={`sidebar-container ${isSidebarVisible ? 'active' : ''}`}>
        <SideBar />
      </div>
      <div className="subscription-container">
        <h2>Choose Your WorkNest Subscription Plan</h2>

        {!usageLoading && usageData && (
          <div className="job-usage-dashboard">
            <div className="usage-header">
              <h3>Your Subscription Stats</h3>
              {usageData.has_active_subscription && (
                <div className="subscription-badge">
                  <span>{usageData.subscription_plan}</span>
                </div>
              )}
            </div>

            <div className="usage-stats-container">
              <div className="usage-stat-card">
                <div className="stat-icon jobs-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <h4>Jobs Posted</h4>
                  <p className="stat-value">{usageData.job_count}</p>
                </div>
              </div>

              <div className="usage-stat-card">
                <div className="stat-icon remaining-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div className="stat-content">
                  <h4>Remaining Jobs</h4>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <h4>{usageData.has_active_subscription ? 'Expires On' : 'Subscription'}</h4>
                  <p className="stat-value">
                    {usageData.has_active_subscription
                      ? formatDate(usageData.subscription_end_date)
                      : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {usageData.has_active_subscription &&
              usageData.remaining_jobs !== 'Unlimited' &&
              usageData.remaining_jobs === 0 && (
                <div className="add-jobs-container">
                  <button
                    onClick={() => setShowAdditionalJobsModal(true)}
                    className="add-jobs-button"
                  >
                    Buy Additional Job Slots
                  </button>
                </div>
              )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {loading && !error && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}
        {!loading && plans.length === 0 && !error && (
          <div className="no-plans-message">
            <p>No subscription plans available.</p>
          </div>
        )}

        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card">
              {plan.name.toLowerCase().includes('premium') && <div className="popular-badge">POPULAR</div>}
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
              <div className="plan-pricing">
                <p className="plan-price">
                  ₹{plan.price}
                  <span>/month</span>
                </p>
                <p className="plan-feature">
                  <span className="feature-check">✓</span> Job Limit:{' '}
                  {plan.job_limit === 9999 ? 'Unlimited' : plan.job_limit}
                </p>
                <p className="plan-feature">
                  <span className="feature-check">✓</span> Premium Support
                </p>
              </div>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className="subscribe-button"
              >
                {loading
                  ? 'Processing...'
                  : usageData?.has_active_subscription && usageData?.subscription_plan === plan.name
                  ? 'Renew Subscription'
                  : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showAdditionalJobsModal && (
        <div className="modal-overlay">
          <div className="jobs-modal">
            <div className="modal-header">
              <h3>Buy Additional Job Slots</h3>
              <button
                className="modal-close-button"
                onClick={() => setShowAdditionalJobsModal(false)}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <p>You've reached your plan's job limit. Purchase additional job slots to post more jobs.</p>
            <div className="job-count-selector">
              <label htmlFor="job-slots">Number of Job Slots:</label>
              <div className="job-count-controls">
                <button
                  onClick={() => setAdditionalJobsCount((prev) => Math.max(1, prev - 1))}
                  disabled={additionalJobsCount <= 1}
                  aria-label="Decrease job slots"
                >
                  −
                </button>
                <input
                  id="job-slots"
                  type="number"
                  min="1"
                  value={additionalJobsCount}
                  onChange={(e) => setAdditionalJobsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  aria-label="Number of job slots"
                />
                <button
                  onClick={() => setAdditionalJobsCount((prev) => prev + 1)}
                  aria-label="Increase job slots"
                >
                  +
                </button>
              </div>
            </div>
            <div className="job-cost-summary">
              <p>Cost per job slot: ₹200</p>
              <p className="total-cost">Total: ₹{200 * additionalJobsCount}</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowAdditionalJobsModal(false)}>
                Cancel
              </button>
              <button
                className="confirm-button"
                onClick={handleAddJobSlots}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;