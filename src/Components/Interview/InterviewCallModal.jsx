import React, { useRef, useState,useEffect } from 'react'
import { Link,useNavigate } from 'react-router-dom';
import { openInterviewModal, closeInterviewModal } from '../../Redux/Interview/interviewCallSlice';
import { useDispatch, useSelector } from 'react-redux';

function InterviewCallModal() {
   
    const dispatch = useDispatch();

    const { interviewModal, roomId, interviewId } = useSelector(
      (state) => state.interview_call
    );
  
    const closeModal = () => {
      dispatch(closeInterviewModal());
    };

    if (!interviewModal) return null; 

  return (
    <div className="interview-modal-wrapper">
    <div className="interview-modal-content">
      <div className="interview-spinner-container">
        <div className="interview-spinner-outer">
          <div className="interview-spinner-inner"></div>
        </div>
      </div>

      <div className="interview-button-group">
        <Link
          to={`/interview/${interviewId}?roomID=${roomId}`}
          onClick={() => {
            setTimeout(() => {
              dispatch(closeInterviewModal());
            }, 1000);
          }}
        >
          <button className="accept-button">Accept</button>
        </Link>
        <button className="reject-button" onClick={closeModal}>Reject</button>
      </div>
    </div>
  </div>
  )
}

export default InterviewCallModal