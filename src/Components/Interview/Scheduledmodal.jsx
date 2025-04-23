import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Interview.css';

const SheduleModal = ({ setModal, candidate_id, job_id, setAppStatus, setInterviewScheduled, application_id }) => {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate date input
  const validateDate = (selectedDate) => {
    setDate(selectedDate);
    
    // Check if date is not empty and is in the future
    const now = new Date();
    const selected = new Date(selectedDate);
    setIsValid(selectedDate && selected > now);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission
    
    // Prevent multiple submissions
    if (isSubmitting) return;
    
    // Validate date before submission
    if (!date) {
      Swal.fire({
        icon: 'warning',
        title: 'Required Field',
        text: 'Please select a date and time for the interview.',
        timer: 1500,
      });
      return;
    }

    try {
      setIsSubmitting(true); // Disable submit button
      
      // Show loading indicator immediately
      Swal.fire({
        title: 'Scheduling...',
        text: 'Please wait while we schedule the interview',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const formData = new FormData();
      formData.append('candidate', candidate_id);
      formData.append('job', job_id);
      formData.append('date', date);
      // Add the specific application ID to ensure only this application is updated
      if (application_id) {
        formData.append('application_id', application_id);
      }

      // First, schedule the interview
      const response = await axios.post(
        `${baseURL}/api/interview/schedule/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      if (response.status === 201) {
        // If we have an application_id, update the application status
        if (application_id) {
          await axios.post(
            `${baseURL}/api/empjob/applicationStatus/${application_id}/`,
            { 
              action: 'Interview Scheduled',
              job_id: job_id  // Include job_id to ensure only this job's status is changed
            },
            { 
              headers: { 
                Authorization: `Bearer ${token}`, 
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
        
        // Update parent component states
        setAppStatus('Interview Scheduled');
        setInterviewScheduled(true);
        
        // Close modal
        setModal(false);
        
        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Interview Scheduled',
          text: 'Interview has been scheduled successfully for this specific job application.',
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Interview scheduling error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.detail || 'Failed to schedule interview. Please try again.',
        timer: 2000,
      });
    } finally {
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  // Handle modal close with escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      setModal(false);
    }
  };

  // Handle outside click to close modal
  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay' && !isSubmitting) {
      setModal(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex="0"
    >
      <div className="modal-container">
        <h2 className="modal-title">Schedule Interview</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-content">
            <label htmlFor="interview-date" className="modal-label">
              Select Date and Time
            </label>
            <input
              id="interview-date"
              type="datetime-local"
              value={date}
              onChange={(e) => validateDate(e.target.value)}
              className="modal-input"
              min={new Date().toISOString().slice(0, 16)} // Set min to current date/time
              required
            />
            {date && !isValid && (
              <p className="date-validation-error">Please select a future date and time</p>
            )}
          </div>
          <div className="modal-actions">
            <button 
              type="submit"
              className={`modal-button schedule ${isSubmitting || !isValid ? 'disabled' : ''}`}
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule'}
            </button>
            <button 
              type="button"
              onClick={() => !isSubmitting && setModal(false)} 
              className="modal-button cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SheduleModal;