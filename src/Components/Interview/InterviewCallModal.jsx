import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { openInterviewModal, closeInterviewModal } from '../../Redux/Interview/interviewCallSlice';
import './Interview.css';

function InterviewCallModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { interviewModal, roomId, interviewId } = useSelector(
    (state) => state.interview_call
  );

  const closeModal = () => {
    dispatch(closeInterviewModal());
  };

  const handleAccept = () => {
    dispatch(closeInterviewModal());
    navigate(`/interview/${interviewId}?roomID=${roomId}`);
  };

  if (!interviewModal) return null;

  return (
    <div className="unique-interview-modal-wrapper">
      <div className="unique-interview-modal-content">
        <div className="unique-interview-spinner-container">
          <div className="unique-interview-spinner-outer">
            <div className="unique-interview-spinner-inner"></div>
          </div>
        </div>

        <div className="unique-interview-button-group">
          <button className="unique-accept-button" onClick={handleAccept}>
            Accept
          </button>
          <button className="unique-reject-button" onClick={closeModal}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewCallModal;