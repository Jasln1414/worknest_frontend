import React, { useState, useEffect } from 'react';
import { RiMessage2Fill } from 'react-icons/ri';
import ChatModal from './ChatModal';
import '../../../Styles/Job/StatusJob.css';

function StatusJob({ selectedJob, toggleDrawer }) {
  const [step, setStep] = useState(0);
  const [chat, setChat] = useState(false);
  const baseURL = 'http://127.0.0.1:8000';
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    setStep(0); // Reset step first
    if (selectedJob?.status) {
      const statusSteps = {
        'Application Send': 1,
        'Application Viewed': 2,
        'Resume Viewed': 3,
        'Pending': 4,
        'ShortListed': 5,
        'Accepted': 5,
        'Rejected': 6,
      };
      setStep(statusSteps[selectedJob.status] || 0);
    }
  }, [selectedJob]);

  if (!selectedJob) return null;

  const candidateId = selectedJob.candidate || '';
  const employerId = selectedJob.job?.employer?.id || '';
  const profilePic = selectedJob.job?.employer?.profile_pic
    ? `${baseURL}${selectedJob.job.employer.profile_pic}`
    : '';
  const employerName = selectedJob.job?.employer?.user_full_name || 'Employer';
  const candidateName = selectedJob.candidate_name || 'Candidate';

  const handleChat = () => {
    if (candidateId && employerId) {
      setChat(true);
    } else {
      console.error('Missing IDs for chat:', { candidateId, employerId });
      alert('Cannot open chat: Missing required information');
    }
  };

  return (
    <div className="status-job-container overflow-y-auto max-h-[calc(100vh-80px)] md:max-h-none md:overflow-y-visible">
      <div className="job-card">
        {chat && (
          <ChatModal
            candidate_id={candidateId}
            employer_id={employerId}
            setChat={setChat}
            profile_pic={profilePic}
            userName={employerName}
            currentUserId={currentUserId}
            senderName={candidateName}
          />
        )}

        <div className="chat-icon" onClick={handleChat}>
          <RiMessage2Fill size={25} />
        </div>

        <div className="job-header">
          <h2>{selectedJob.job?.title || 'Job Title'}</h2>
          <p>{employerName}</p>
        </div>

        <div className="status-tracker">
          <h3>Application Status</h3>
          <div className="progress-steps">
            {[
              { label: 'Sent', step: 1 },
              { label: 'Viewed', step: 2 },
              { label: 'Resume', step: 3 },
              {
                label: step >= 4 ? selectedJob.status : 'Review',
                step: 4,
                status: selectedJob.status,
              },
            ].map(({ label, step: stepValue, status }, index) => {
              let stepClass = '';
              if (step >= stepValue) {
                if (stepValue === 4) {
                  switch (status) {
                    case 'Pending':
                      stepClass = 'pending';
                      break;
                    case 'ShortListed':
                      stepClass = 'shortlisted';
                      break;
                    case 'Accepted':
                      stepClass = 'completed';
                      break;
                    case 'Rejected':
                      stepClass = 'rejected';
                      break;
                    default:
                      stepClass = '';
                  }
                } else {
                  stepClass = 'completed';
                }
              }

              return (
                <div key={`step-${index}`} className="step-container">
                  <div className={`step-circle ${stepClass}`}>
                    {step >= stepValue ? (
                      <svg viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <p className="step-label">{label}</p>
                  {index < 3 && (
                    <div className={`connector ${step > stepValue ? 'active' : ''}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="job-details">
        <div className="details-section">
          <span className="section-title">Job Description</span>
          <p className="section-content">{selectedJob.job?.about || 'Not specified'}</p>
        </div>
        <div className="details-section">
          <span className="section-title">Job Type:</span>
          <p className="section-content">{selectedJob.job?.jobtype || 'Not specified'}</p>
        </div>
        <div className="details-section">
          <span className="section-title">Job Mode:</span>
          <p className="section-content">{selectedJob.job?.jobmode || 'Not specified'}</p>
        </div>
        <div className="details-section">
          <span className="section-title">Responsibilities</span>
          <p className="section-content">{selectedJob.job?.responsibility || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
}

export default StatusJob;