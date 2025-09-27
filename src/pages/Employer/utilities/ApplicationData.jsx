// src/components/job/ApplicationData.js
import React, { useState } from 'react';
import '../job/style/AppliedjobCandidate.css';
import Pagination from './paginations';

function ApplicationData({ jobData, handleJobClick, toggleApplication }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const formatDate = (dateTimeString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="job-applications-wrapper">
      <div className="job-applications-header-section"> 
        <span className="job-applications-main-title">Applications</span>
        {jobData.length > 0 && (
          <span className="job-applications-count-display">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, jobData.length)} of {jobData.length} jobs
          </span>
        )}
      </div>
      
      {jobData.length === 0 ? (
        <div className="no-job-applications-message">
          No job applications found
        </div>
      ) : (
        <>
          <div className="job-applications-list-container">
            {currentJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => {
                  handleJobClick(job);
                  toggleApplication();
                }}
                className="job-application-card-item"
              >
                <div className="job-application-expiry-badge">
                  Expiry: {job.applyBefore}
                </div>
                <div className="job-application-count-section">
                  <span className="job-application-count-indicator">
                    {job.applications.length}
                  </span>
                </div>
                <div className="job-application-header-content">
                  <div className="job-application-title-wrapper">
                    <p className="job-application-position-title">{job.title}</p>
                    <p className="job-application-company-name">{job.employer_name}</p>
                  </div>
                </div>
                <div className="job-application-details-grid">
                  <div className="job-application-info-section">
                    <div className="job-application-detail-item">
                      Job Posted:
                      <span className="job-application-info-badge job-application-badge-success">
                        {formatDate(job.posteDate)}
                      </span>
                    </div>
                    <div className="job-application-detail-item">
                      Location:
                      <span className="job-application-info-badge job-application-badge-warning">
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="job-application-info-section">
                    <div className="job-application-detail-item">
                      Experience:
                      <span className="job-application-info-badge job-application-badge-danger">
                        {job.experience}
                      </span>
                    </div>
                    <div className="job-application-detail-item">
                      Salary:
                      <span className="job-application-info-badge job-application-badge-info">
                        {job.lpa} lpa
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination-controls">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ApplicationData;