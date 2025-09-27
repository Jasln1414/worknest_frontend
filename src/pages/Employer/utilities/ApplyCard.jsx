import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentCandidate } from './../../../Redux/Status/StatusSlice';
import '../job/style/AppliedjobCandidate.css';

import Pagination from './paginations';

function ApplyCard({ selectedJob, setChange }) {
  const baseURL = 'http://127.0.0.1:8000';
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleClick = (data) => {
    dispatch(setCurrentCandidate(data));
    setChange(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplications = selectedJob?.applications?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil(selectedJob?.applications?.length / itemsPerPage) || 1;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedJob || !selectedJob.applications || selectedJob.applications.length === 0) {
    return <div className="applycard-no-applications">No applications available for this job</div>;
  }

  return (
    <div className="applycard-container">
      <div className="applycard-count">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, selectedJob.applications.length)} of {selectedJob.applications.length} candidates
      </div>
      
      <div className="applycard-grid">
        {currentApplications.map((data, index) => (
          <div key={index} className="applycard-card">
            <div className="applycard-card-header">
              <div className="applycard-candidate-info">
                <div className="applycard-profile-pic-container">
                  <img
                    src={baseURL + data.candidate.profile_pic}
                    alt="Candidate profile"
                    className="applycard-profile-pic"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-profile.png';
                    }}
                  />
                </div>
                <div className="applycard-candidate-details">
                  <p className="applycard-candidate-name">{data.candidate.user_name}</p>
                  <p className="applycard-candidate-education">
                    {data.candidate.education[0]?.education || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="applycard-view-button-container">
                <button 
                  className="applycard-view-button" 
                  onClick={() => handleClick(data)}
                  aria-label={`View ${data.candidate.user_name}'s profile`}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default ApplyCard;
