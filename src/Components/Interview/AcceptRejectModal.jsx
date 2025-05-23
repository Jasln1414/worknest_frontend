import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { formatInTimeZone } from 'date-fns-tz';
import { isInterviewTimeReached } from './DateTime';
import './Interview.css';

function AcceptRejectModal({ setModal, modalData, setLoad, load }) {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [isProcessing, setIsProcessing] = useState(false);

  const interview = modalData[0];

  // Debug: Log interview data
  console.log('Interview data:', interview);

  const handleClose = () => {
    if (!isProcessing) {
      setModal(false);
    }
  };

  const handleAcceptReject = async (action) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      Swal.fire({
        title: `${action === 'Accepted' ? 'Accepting' : 'Rejecting'}...`,
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${baseURL}/api/interview/status/${interview.id}/`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setModal(false);
        setLoad(!load);

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Candidate has been ${action.toLowerCase()} for this position.`,
          timer: 1500,
        });
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} interview:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: `Failed to ${action.toLowerCase()} candidate. ${error.response?.data?.message || 'Please try again.'}`,
        timer: 2000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (isProcessing) return;

    // Debug: Log cancel data
    const cancelData = {
      interview_id: interview?.id,
      candidate_id: interview?.candidate || interview?.original?.candidate,
      job_id: interview?.job || interview?.original?.job,
    };
    console.log('Cancel data:', cancelData);

    // Validate required fields
    if (!cancelData.interview_id || !cancelData.candidate_id || !cancelData.job_id) {
      console.error('Missing required fields for cancel:', cancelData);
      Swal.fire({
        icon: 'error',
        title: 'Cancel Failed',
        text: 'Missing interview, candidate, or job data.',
        timer: 2000,
      });
      setIsProcessing(false);
      return;
    }

    try {
      setIsProcessing(true);

      Swal.fire({
        title: 'Canceling...',
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post(
        `${baseURL}/api/interview/cancelApplication/`,
        cancelData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setModal(false);
        setLoad(!load);

        Swal.fire({
          icon: 'success',
          title: 'Application Canceled',
          text: 'The interview has been canceled successfully.',
          timer: 1500,
        });
      }
    } catch (error) {
      console.error('Error canceling interview:', error);
      Swal.fire({
        icon: 'error',
        title: 'Cancel Failed',
        text: `Failed to cancel interview. ${error.response?.data?.message || 'Please try again.'}`,
        timer: 2000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return formatInTimeZone(new Date(dateString), 'America/New_York', 'EEE, d MMM yyyy h:mm a z');
  };

  const getStatusMessage = () => {
    if (!interview) return 'Interview data is missing.';
    if (interview.status === 'Expired') {
      return 'This interview has expired as the scheduled time has passed.';
    } else if (interview.status === 'Completed') {
      return 'This interview has been completed.';
    } else if (interview.status === 'Accepted') {
      return 'The candidate has been accepted for this position.';
    } else if (interview.status === 'Rejected') {
      return 'The candidate has been rejected for this position.';
    } else if (interview.status === 'Canceled') {
      return 'This interview has been canceled.';
    } else if (interview.status === 'Upcoming' && interview.date && isInterviewTimeReached(interview.date)) {
      return 'This interview has expired as the scheduled time has passed.';
    } else {
      return 'This interview is scheduled and upcoming.';
    }
  };

  if (!interview) {
    return (
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal-container">
          <h2 className="modal-title">Error</h2>
          <p>No interview data available.</p>
          <button className="modal-button cancel" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target.className === 'modal-overlay') handleClose();
      }}
    >
      <div className="modal-container">
        <h2 className="modal-title">Interview Details</h2>

        <div className="interview-details">
          <div className="detail-row">
            <div className="detail-label">Job Title:</div>
            <div className="detail-value">{interview.job_title || 'Not available'}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Candidate:</div>
            <div className="detail-value">{interview.candidate_name || 'Not available'}</div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Interview Date:</div>
            <div className="detail-value">
              {interview.date ? formatDate(interview.date) : 'Not available'}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Current Status:</div>
            <div className={`detail-value status-cell ${(interview.status || 'upcoming').toLowerCase()}`}>
              {interview.status || 'Upcoming'}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-label">Status Message:</div>
            <div className="detail-value">{getStatusMessage()}</div>
          </div>

          {interview.original && interview.original.notes && (
            <div className="detail-row">
              <div className="detail-label">Notes:</div>
              <div className="detail-value">{interview.original.notes}</div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {(interview.status === 'Upcoming' || interview.status === 'Completed' || interview.status === 'Expired') && (
            <>
              <button
                className="modal-button accept-button"
                onClick={() => handleAcceptReject('Accepted')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Accept Candidate'}
              </button>

              <button
                className="modal-button reject-button"
                onClick={() => handleAcceptReject('Rejected')}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Reject Candidate'}
              </button>
            </>
          )}

          {interview.status === 'Upcoming' && (
            <button
              className="modal-button cancel-button"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </button>
          )}

          <button
            className="modal-button cancel"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcceptRejectModal;