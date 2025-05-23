import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatInTimeZone, toDate } from 'date-fns-tz';
import './Interview.css';

const SheduleModal = ({ setModal, candidate_id, job_id, setAppStatus, setInterviewScheduled, application_id }) => {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Get current time in America/New_York for min attribute
  const getMinDateTime = () => {
    const now = new Date();
    return formatInTimeZone(now, 'America/New_York', "yyyy-MM-dd'T'HH:mm");
  };

  // Validate date input
  const validateDate = (selectedDate) => {
    setDate(selectedDate);
    if (!selectedDate) {
      setIsValid(false);
      return;
    }
    const selected = toDate(selectedDate, { timeZone: 'America/New_York' });
    const now = new Date();
    setIsValid(selected > now);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isValid) return;
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
      const loadingSwal = Swal.fire({
        title: 'Scheduling...',
        text: 'Please wait while we schedule the interview',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Convert date to UTC ISO string (YYYY-MM-DDTHH:mm:ssZ)
      const utcDate = date ? toDate(date, { timeZone: 'America/New_York' }).toISOString() : '';

      const payload = {
        candidate: candidate_id,
        job: job_id,
        date: utcDate,
        ...(application_id && { application_id }), // Conditionally include application_id
      };

      console.log('Scheduling request:', payload);

      const response = await axios.post(
        `${baseURL}/api/interview/schedule/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Scheduling response:', response.data);

      if (response.status === 201 && response.data.id) {
        if (typeof setAppStatus === 'function') {
          setAppStatus('Interview Scheduled');
        } else {
          console.error('setAppStatus is not a function:', setAppStatus);
        }
        if (typeof setInterviewScheduled === 'function') {
          setInterviewScheduled(true);
        } else {
          console.error('setInterviewScheduled is not a function:', setInterviewScheduled);
        }
        setModal(false);

        await loadingSwal.close();

        Swal.fire({
          icon: 'success',
          title: 'Interview Scheduled',
          text: `Interview scheduled successfully for ${formatInTimeZone(new Date(response.data.date), 'America/New_York', 'MMM d, yyyy h:mm a z')}`,
          timer: 1500,
        });
      } else {
        throw new Error('Invalid response from scheduling API');
      }
    } catch (error) {
      console.error('Interview scheduling error:', error);
      let errorMessage = 'Failed to schedule interview. Please try again.';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response.status === 409) {
          errorMessage = error.response.data.message || 'An active interview already exists for this candidate and job.';
        } else if (error.response.data) {
          const errors = error.response.data;
          if (errors.date) {
            errorMessage = `Date error: ${errors.date[0]}`;
          } else if (errors.candidate) {
            errorMessage = `Candidate error: ${errors.candidate[0]}`;
          } else if (errors.job) {
            errorMessage = `Job error: ${errors.job[0]}`;
          } else {
            errorMessage = errors.message || errorMessage;
          }
        }
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        timer: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !isSubmitting) {
      setModal(false);
    }
  };

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
              Select Date and Time (EDT)
            </label>
            <input
              id="interview-date"
              type="datetime-local"
              value={date}
              onChange={(e) => validateDate(e.target.value)}
              className="modal-input"
              min={getMinDateTime()}
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