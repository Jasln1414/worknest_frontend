import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../../assets/component/plan.css';
import Sidebar from '../../Components/admin/utilities/AdminSideBar';

const SubscriptionPlanManager = () => {
  const baseURL = 'http://127.0.0.1:8000/';
  const authentication_user = useSelector((state) => state.authentication_user);
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  const ALLOWED_PLAN_NAMES = {
    BASIC: 'basic',
    STANDARD: 'standard',
    PREMIUM: 'premium'
  };

  const [state, setState] = useState({
    plans: [],
    formData: {
      name: ALLOWED_PLAN_NAMES.BASIC,
      description: '',
      price: '',
      job_limit: '',
    },
    isModalOpen: false,
    error: '',
    success: '',
    loading: false,
    deletingPlanId: null,
    editingPlanId: null,
  });

  const { plans, formData, isModalOpen, error, success, loading, deletingPlanId, editingPlanId } = state;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (error || success) {
        setState(prev => ({ ...prev, error: '', success: '' }));
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, success]);

  useEffect(() => {
    if (!authentication_user.isAuthenticated || !authentication_user.isAdmin || !token) {
      navigate('/admin/');
    }
  }, [authentication_user, navigate, token]);

  const fetchPlans = useCallback(async () => {
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Authentication token not found. Please log in.',
        loading: false,
      }));
      navigate('/admin/');
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const response = await axios.get(`${baseURL}api/payment/subscription/plans/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const normalizedPlans = response.data.map(plan => ({
        ...plan,
        name: Object.values(ALLOWED_PLAN_NAMES).includes(plan.name.toLowerCase()) ? plan.name.toLowerCase() : ALLOWED_PLAN_NAMES.BASIC,
        price: parseFloat(plan.price || 0).toFixed(2),
        job_limit: parseInt(plan.job_limit || 1, 10),
        duration: parseInt(plan.duration || 30, 10),
      }));
      setState(prev => ({
        ...prev,
        plans: normalizedPlans,
        loading: false,
      }));
    } catch (err) {
      let errorMessage = 'Failed to fetch plans.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        navigate('/admin/');
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view plans.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error('Fetch error:', err);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
      error: '',
    }));
  };

  const openModal = (plan = null) => {
    setState(prev => ({
      ...prev,
      formData: plan ? {
        name: Object.values(ALLOWED_PLAN_NAMES).includes(plan.name) ? plan.name : ALLOWED_PLAN_NAMES.BASIC,
        description: plan.description || '',
        price: plan.price ? parseFloat(plan.price).toString() : '',
        job_limit: plan.job_limit ? plan.job_limit.toString() : '',
      } : {
        name: ALLOWED_PLAN_NAMES.BASIC,
        description: '',
        price: '',
        job_limit: '',
      },
      isModalOpen: true,
      editingPlanId: plan?.id || null,
      error: '',
      success: '',
    }));
  };

  const closeModal = () => {
    setState(prev => ({ ...prev, isModalOpen: false, editingPlanId: null }));
  };

  const validateForm = () => {
    const { name, description, price, job_limit } = formData;
    if (!name || !description || !price || !job_limit) return 'All fields are required.';
    if (!Object.values(ALLOWED_PLAN_NAMES).includes(name)) return `Plan name must be one of: ${Object.values(ALLOWED_PLAN_NAMES).join(', ')}`;
    if (isNaN(price) || parseFloat(price) <= 0) return 'Price must be a positive number.';
    if (isNaN(job_limit) || parseInt(job_limit) <= 0) return 'Job limit must be a positive integer.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: '' }));
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      job_limit: parseInt(formData.job_limit, 10),
    };
    try {
      if (editingPlanId) {
        await axios.put(`${baseURL}dashboard/subscription/plans/${editingPlanId}/`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        setState(prev => ({ ...prev, success: 'Plan updated successfully!' }));
      } else {
        await axios.post(`${baseURL}api/payment/addsubscriptionplan/`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        setState(prev => ({ ...prev, success: 'Plan created successfully!' }));
      }
      fetchPlans();
      closeModal();
    } catch (err) {
      let errorMessage = 'Failed to save plan. Please try again.';
      if (err.response?.data) {
        if (err.response.data.name) errorMessage = `Invalid plan name: ${err.response.data.name.join(' ')}`;
        else if (err.response.data.non_field_errors) errorMessage = err.response.data.non_field_errors.join(' ');
        else if (err.response.data.detail) errorMessage = err.response.data.detail;
      }
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('Submission error:', err.response?.data || err);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    setState(prev => ({ ...prev, deletingPlanId: planId }));
    try {
      await axios.delete(`${baseURL}dashboard/subscription/plans/${planId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setState(prev => ({ ...prev, success: 'Plan deleted successfully!' }));
      fetchPlans();
    } catch (err) {
      let errorMessage = 'Failed to delete plan.';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        navigate('/admin/');
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to delete plans.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Plan not found. It may have already been deleted.';
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      setState(prev => ({ ...prev, error: errorMessage }));
      console.error('Delete error:', err);
    } finally {
      setState(prev => ({ ...prev, deletingPlanId: null }));
    }
  };

  const planOptions = [
    { value: ALLOWED_PLAN_NAMES.BASIC, label: 'Basic' },
    { value: ALLOWED_PLAN_NAMES.STANDARD, label: 'Standard' },
    { value: ALLOWED_PLAN_NAMES.PREMIUM, label: 'Premium' },
  ];

  return (
    
      <>
        <Sidebar />
       
         
           
            <div className="button-container">
              <button
                onClick={() => openModal()}
                className="add-plan-button"
                aria-label="Add new plan"
              >
                Add New Plan
              </button>
            </div>
         

          {error && (
            <div className="alert alert-error" role="alert">
              <button
                className="close-btn"
                onClick={() => setState(prev => ({ ...prev, error: '' }))}
                aria-label="Close error message"
              >
                ×
              </button>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="alert">
              <button
                className="close-btn"
                onClick={() => setState(prev => ({ ...prev, success: '' }))}
                aria-label="Close success message"
              >
                ×
              </button>
              {success}
            </div>
          )}

          <div className="table-responsive"style={{marginLeft:'270px',marginTop:"60px",marginBottom:"90px"}}>
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price (₹)</th>
                  <th>Duration (Days)</th>
                  <th>Job Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && !plans.length ? (
                  <tr>
                    <td colSpan="6" className="loading-cell">
                      <div className="spinner"></div> Loading plans...
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No subscription plans found.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id}>
                      <td data-label="Name">
                        {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                      </td>
                      <td data-label="Description" className="description-cell">
                        {plan.description}
                      </td>
                      <td data-label="Price">₹{parseFloat(plan.price).toFixed(2)}</td>
                      <td data-label="Duration">{plan.duration}</td>
                      <td data-label="Job Limit">{plan.job_limit}</td>
                      <td data-label="Actions" className="actions-cell">
                        <button
                          className="edit-button"
                          onClick={() => openModal(plan)}
                          aria-label={`Edit ${plan.name} plan`}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(plan.id)}
                          disabled={deletingPlanId === plan.id}
                          aria-label={`Delete ${plan.name} plan`}
                        >
                          {deletingPlanId === plan.id ? (
                            <span className="mini-spinner"></span>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="modal-overlay" onClick={closeModal} role="dialog" aria-modal="true">
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{editingPlanId ? 'Edit Plan' : 'Add New Plan'}</h2>
                  <button
                    className="close-modal"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-group">
                    <label htmlFor="plan-name">Plan Name *</label>
                    <select
                      id="plan-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      aria-required="true"
                    >
                      {planOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="plan-description">Description *</label>
                    <textarea
                      id="plan-description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the plan features"
                      rows="4"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="plan-price">Price (₹) *</label>
                      <input
                        id="plan-price"
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="plan-job-limit">Job Limit *</label>
                      <input
                        id="plan-job-limit"
                        name="job_limit"
                        type="number"
                        min="1"
                        step="1"
                        value={formData.job_limit}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>
                  <div className="form-note">
                    <p><strong>Note:</strong> Plan duration is fixed at 30 days.</p>
                  </div>
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner"></span>
                          {editingPlanId ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        editingPlanId ? 'Update Plan' : 'Create Plan'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="cancel-button"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      
     
    </>
  );
};

export default SubscriptionPlanManager;