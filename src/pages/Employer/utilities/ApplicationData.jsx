import React, { useState } from "react";
import '../../../Styles/Job/StatusJob.css';

function ApplicationData({ jobData, handleJobClick, toggleApplication }) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Calculate total number of pages
  const totalPages = Math.ceil(jobData.length / itemsPerPage);
  
  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Navigate to previous and next page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatDate = (dateTimeString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="app-data-container">
      <div className="app-data-card">
        <div className="app-data-header">
          <span className="app-data-title">Applications</span>
        </div>
        <div className="app-data-list">
          {currentJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => handleJobClick(job)}
              className="app-data-job-item"
            >
              <div className="app-data-expiry">
                Expiry: {job.applyBefore}
              </div>
              <div className="app-data-applications-count">
                <span className="app-data-count-badge">
                  {job.applications.length}
                </span>
              </div>
              
              <div className="app-data-job-header">
                <div className="app-data-job-title-section">
                  <p className="app-data-job-title">{job.title}</p>
                  <p className="app-data-employer">{job.employer_name}</p>
                </div>
              </div>
              
              <div className="app-data-job-details">
                <div className="app-data-job-info">
                  <div className="app-data-info-item">
                    Job Posted:
                    <span className="app-data-badge app-data-badge-green">
                      {formatDate(job.posteDate)}
                    </span>
                  </div>
                  <div className="app-data-info-item">
                    Location:
                    <span className="app-data-badge app-data-badge-yellow">
                      {job.location}
                    </span>
                  </div>
                </div>
                
                <div className="app-data-job-info">
                  <div className="app-data-info-item">
                    Experience:
                    <span className="app-data-badge app-data-badge-pink">
                      {job.experience}
                    </span>
                  </div>
                  <div className="app-data-info-item">
                    Salary:
                    <span className="app-data-badge app-data-badge-blue">
                      {job.lpa} lpa
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="app-data-pagination">
            <button 
              onClick={goToPreviousPage} 
              className={`app-data-pagination-button ${currentPage === 1 ? 'app-data-pagination-disabled' : ''}`}
              disabled={currentPage === 1}
            >
               Prev
            </button>
            
            <div className="app-data-pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`app-data-pagination-number ${currentPage === i + 1 ? 'app-data-pagination-active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            
            <button 
              onClick={goToNextPage} 
              className={`app-data-pagination-button ${currentPage === totalPages ? 'app-data-pagination-disabled' : ''}`}
              disabled={currentPage === totalPages}
            >
              Next 
            </button>
          </div>
        )}
        
        {/* <div className="app-data-pagination-info">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, jobData.length)} of {jobData.length} applications
        </div> */}
      </div>
    </div>
  );
}

export default ApplicationData;