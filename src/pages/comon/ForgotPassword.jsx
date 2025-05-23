// ForgotPasswordModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import OtpModal from './OTP';
import ResetPasswordModal from './ResetPassword';
import '../../Styles/Candidate/CandidateLogin.css';
import './common.css';

function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [localEmail, setLocalEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  const baseURL = "http://127.0.0.1:8000";
  
  const handleResetRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = { email: localEmail };
    console.log("Sending payload:", payload);
    
    try {
      const endpoint = "/api/account/forgot_pass/";
      const response = await axios.post(`${baseURL}${endpoint}`, payload);
      
      if (response.status === 200) {
        toast.success('OTP has been sent to your email.', { position: 'top-center' });
        setIsOtpModalOpen(true);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.', { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOtpSuccess = () => {
    console.log("OTP verified successfully!");
    setIsOtpModalOpen(false);
    setIsResetModalOpen(true);
  };
  
  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
  };
  
  const closeResetModal = () => {
    setIsResetModalOpen(false);
  };
  
  const handlePasswordResetSuccess = () => {
    toast.success("Password reset successful! Please log in with your new password.");
    setIsResetModalOpen(false);
    if (typeof onBackToLogin === 'function') {
      onBackToLogin();
    } else {
      onClose();
    }
  };
  
  const handleBackgroundClick = (e) => {
    if (e.target.className === "forgot-password-overlay") {
      onClose();
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleBackgroundClick}>
      <div className="forgot-password-content" onClick={(e) => e.stopPropagation()}>
        <button className="forgot-password-close" onClick={onClose}>×</button>
        <h2 className="forgot-password-title">Forgot Password</h2>
        
        {!isOtpModalOpen && !isResetModalOpen && (
          <>
            <p className="forgot-password-description">Enter your email address and we'll send you an OTP to reset your password.</p>
            
            <form onSubmit={handleResetRequest} className="forgot-password-form">
              <div className="forgot-password-form-group">
                <label htmlFor="email" className="forgot-password-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                  className="forgot-password-input"
                />
              </div>
              
              <button type="submit" disabled={isSubmitting} className="forgot-password-submit">
                {isSubmitting ? "Processing..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        <OtpModal
          isOpen={isOtpModalOpen}
          closeModal={closeOtpModal}
          email={localEmail}
          onOtpSuccess={handleOtpSuccess}
        />

        <ResetPasswordModal
          isOpen={isResetModalOpen}
          closeModal={closeResetModal}
          email={localEmail}
          onResetSuccess={handlePasswordResetSuccess}
        />
      </div>
    </div>
  );
}

export default ForgotPasswordModal;