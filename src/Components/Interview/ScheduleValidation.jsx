// SheduleModal.js
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatInTimeZone, utcToZonedTime } from 'date-fns-tz';
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
    e.preventDefault();
    if (isSubmitting) return;
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
      setIsSubmitting(true);
      Swal.fire({
        title: 'Scheduling...',
        text: 'Please wait while we schedule the interview',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Convert the input date (in local time) to America/New_York
      const nyDateTime = utcToZonedTime(new Date(date), 'America/New_York');
      const formattedDate = formatInTimeZone(nyDateTime, 'America/New_York', "yyyy-MM-dd'T'HH:mm:ssXXX");

      const formData = new FormData();
      formData.append('candidate', candidate_id);
      formData.append('job', job_id);
      formData.append('date', formattedDate); // Send in New York time
      if (application_id) {
        formData.append('application_id', application_id);
      }

      const response = await axios.post(
        `${baseURL}/api/interview/schedule/`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      if (response.status === 201) {
        if (application_id) {
          await axios.post(
            `${baseURL}/api/empjob/applicationStatus/${application_id}/`,
            { action: 'Interview Scheduled', job_id },
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
          );
        }
        setAppStatus('Interview Scheduled');
        setInterviewScheduled(true);
        setModal(false);
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
      setIsSubmitting(false);
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