import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import SideBar from '../../pages/Employer/SideBar';
import MobileMenuToggle from '../../pages/Employer/utilities/MobileToggle';
import './Subcription.css'; 

// SubscriptionPlans component for managing and displaying subscription plans
const SubscriptionPlans = () => {
  // State management
  const [plans, setPlans] = useState([]); // Store subscription plans
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error messages
  const [usageData, setUsageData] = useState(null); // User's subscription usage data
  const [usageLoading, setUsageLoading] = useState(true); // Loading state for usage data
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Sidebar visibility for mobile
  const baseURL = 'http://127.0.0.1:8000/api'; // API base URL
  const token = localStorage.getItem('access'); // Authentication token

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Normalize plan names for consistent comparison
  const normalizePlanName = (name) => {
    return name?.trim().toLowerCase();
  };

  // Check if a plan is the user's current active subscription
  const isPlanActive = (planName) => {
    const isActive = usageData?.has_active_subscription && 
      normalizePlanName(usageData?.subscription_plan) === normalizePlanName(planName);
    console.log(`Checking if plan "${planName}" is active:`, {
      usageDataPlan: usageData?.subscription_plan,
      normalizedUsageDataPlan: normalizePlanName(usageData?.subscription_plan),
      normalizedPlanName: normalizePlanName(planName),
      isActive,
    });
    return isActive;
  };

  // Format date for display
  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';

  // Fetch subscription plans from API
  const fetchPlans = async () => {
    if (!token) {
      setError('Please log in to view subscription plans.');
      setLoading(false);
      return;
    }
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
      setError(err.response?.data?.message || 'Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's subscription usage data
  const fetchUsageData = async () => {
    if (!token) {
      setUsageLoading(false);
      return;
    }
    setUsageLoading(true);
    try {
      const response = await axios.get(`${baseURL}/empjob/job-usage/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Job usage response:', response.data);
      if (response.status === 200) {
        setUsageData(response.data);
        console.log('Normalized subscription plan:', normalizePlanName(response.data.subscription_plan));
      }
    } catch (error) {
      console.error('Error fetching job usage data:', error.response?.data || error);
      if (error.response?.status === 404) {
        console.warn('Job usage endpoint not found. Using fallback data.');
        setUsageData({ job_count: 0, has_active_subscription: false });
      } else {
        setError('Failed to load usage data.');
      }
    } finally {
      setUsageLoading(false);
    }
  };

  // Initiate Razorpay payment
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
          Swal.fire({
            icon: 'success',
            title: subscriptionType === 'extension' ? 'Subscription Extended!' : 'Subscription Activated!',
            text: subscriptionType === 'extension'
              ? 'Your subscription has been successfully extended.'
              : 'Your subscription has been successfully activated.',
            confirmButtonColor: '#1E3A8A',
          });
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

  // Handle subscription to a plan
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

  // Fetch plans and usage data on component mount
  useEffect(() => {
    fetchPlans();
    fetchUsageData();
  }, [token]);

  return (
    <div className="subscription-wrapper">
     
   
        <SideBar />
    

      {/* Main subscription content */}
      <div className="subscription-container">
        <h2>Choose Your WorkNest Subscription Plan</h2>

        {/* Subscription stats dashboard */}
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
          </div>
        )}

        {/* Error and loading states */}
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

        {/* Subscription plans grid */}
        <div className="plans-grid">
          {plans.map((plan) => {
            const isActive = isPlanActive(plan.name);

            return (
              <div
                key={plan.id}
                className={`plan-card ${isActive ? 'plan-active' : ''}`}
              >
                {isActive && <div className="current-plan-badge">CURRENT PLAN</div>}
                {plan.name.toLowerCase().includes('premium') && !isActive && (
                  <div className="popular-badge">POPULAR</div>
                )}
                <h3>{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
                <div className="plan-pricing">
                  <p className="plan-price">
                    ₹{plan.price}
                    <span>/month</span>
                  </p>
                  <p className="plan-feature">
                    <span className="feature-check">✓</span> Job Limit: {plan.job_limit}
                  </p>
                  <p className="plan-feature">
                    <span className="feature-check">✓</span> Premium Support
                  </p>
                </div>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={usageData?.has_active_subscription || loading}
                  className={`subscribe-button ${
                    usageData?.has_active_subscription ? 'inactive-plan-button' : ''
                  }`}
                  title={
                    usageData?.has_active_subscription && !isActive
                      ? `Cannot subscribe until current plan expires on ${formatDate(usageData.subscription_end_date)}`
                      : ''
                  }
                >
                  {loading && usageData?.has_active_subscription
                    ? 'Processing...'
                    : isActive
                    ? 'Active Plan'
                    : usageData?.has_active_subscription
                    ? 'Subscription Active'
                    : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;