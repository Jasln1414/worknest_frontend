import React from 'react';
import { Link } from 'react-router-dom';
import './Interview.css';

function InterviewCallModal({ setInterviewModal, roomId, intID }) {
  const closeModal = (e) => {
    setInterviewModal();
  };

  return (
    <div className="modal-container">
      <div className="modal-content">
        <div className="spinner-container">
          <div className="spinner-gradient">
            <div className="spinner-inner"></div>
          </div>
        </div>
        <div className="button-group">
          <Link to={`/interview/${intID}?roomID=${roomId}`}>
            <button className="accept-button">
              Accept
            </button>
          </Link>
          <button className="reject-button" onClick={closeModal}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewCallModal;