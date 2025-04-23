import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Interview.css';

function AcceptRejectModal({ setModal, modalData, setLoad, load }) {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [isProcessing, setIsProcessing] = useState(false);

  const interview = modalData[0];

  const handleClose = () => {
    if (!isProcessing) {
      setModal(false);
    }
  };

  const handleAcceptReject = async (action) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Show loading indicator
      Swal.fire({
        title: `${action === 'Accepted' ? 'Accepting' : 'Rejecting'}...`,
        text: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Update application status if application_id exists
      if (interview.application_id) {
        await axios.post(
          `${baseURL}/api/empjob/applicationStatus/${interview.application_id}/`,
          { action },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
      }
      
      // Update interview status
      const response = await axios.post(
        `${baseURL}/api/interview/update-status/${interview.id}/`,
        { status: action },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.status === 200) {
        setModal(false);
        setLoad(!load);
        
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Candidate has been ${action.toLowerCase()} for this position.`,
          timer: 1500
        });
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()} interview:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Action Failed',
        text: `Failed to ${action.toLowerCase()} candidate. ${error.response?.data?.message || 'Please try again.'}`,
        timer: 2000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReschedule = () => {
    // We'll just close this modal and let the parent component handle rescheduling
    setModal(false);
    
    Swal.fire({
      title: 'Reschedule Interview',
      text: 'This feature will be available soon. Please use the main scheduling interface.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') handleClose();
    }}>
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
            <div className="detail-label">Applied Date:</div>
            <div className="detail-value">
              {interview.applyDate ? formatDate(interview.applyDate) : 'Not available'}
            </div>
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
          
          {interview.original && interview.original.notes && (
            <div className="detail-row">
              <div className="detail-label">Notes:</div>
              <div className="detail-value">{interview.original.notes}</div>
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          {/* Only show Accept/Reject for eligible interviews */}
          {(interview.status === 'Upcoming' || interview.status === 'Completed') && (
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
          
          {/* Only show Reschedule for upcoming interviews */}
          {interview.status === 'Upcoming' && (
            <button 
              className="modal-button reschedule-button"
              onClick={handleReschedule}
              disabled={isProcessing}
            >
              Reschedule
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