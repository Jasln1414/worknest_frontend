import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';


function JobCard({
  id,
  title,
  img, // This should be profile_pic from the API
  posted,
  posteDate,
  salary,
  jobmode,
  location,
  experience,
  applybefore,
  jobtype,
  isApplied,
  empname,
  baseURL = 'http://127.0.0.1:8000',
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    console.log('Received img prop:', img); // Debug the img prop
    const loadImage = () => {
      let formattedImg = '';

      if (img) {
        formattedImg = img.startsWith('http') 
          ? img
          : img.startsWith('/')
            ? `${baseURL}${img}`
            : `${baseURL}/${img}`;
      }

      console.log('Attempting to load image:', formattedImg);

      if (!formattedImg) {
        setImageLoaded(true);
        return;
      }

      const imgElement = new Image();
      imgElement.src = formattedImg;

      imgElement.onload = () => {
        console.log('Image loaded successfully');
        setCurrentImage(formattedImg);
        setImageLoaded(true);
      };

      imgElement.onerror = () => {
        console.error('Image load failed');
        setCurrentImage('');
        setImageLoaded(true);
      };
    };

    loadImage();
  }, [img, baseURL, id]);

  const postDateStr = posted || posteDate;
  const isValidDate = postDateStr && !isNaN(new Date(postDateStr).getTime());
  const postDate = isValidDate ? new Date(postDateStr) : null;
  const postedText = isValidDate ? formatDistanceToNow(postDate, { addSuffix: true }) : 'N/A';

  const formattedSalary = salary && salary.includes('-')
    ? `${salary.replace('-', ' - ')} LPA`
    : `${salary || 'Negotiable'}${salary ? ' LPA' : ''}`;

  const displayJobMode = jobmode || 'Not specified';

  return (
    <div className="job-card">
      <div className="job-card-inner">
        <div className="job-card-header">
          <div className="image-loading-container">
            {!imageLoaded && <div className="image-loading-spinner"></div>}
            {currentImage && (
              <img
                src={currentImage}
                alt={title}
                className={`job-card-image ${imageLoaded ? 'loaded' : 'loading'}`}
                loading="lazy"
                style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
              />
            )}
          </div>
          <div className="job-card-title-wrapper">
            <Link to={`/candidate/find-job/job/${id}`} className="job-card-title-link">
              <h2
                className="job-card-title"
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                }}
              >
                {title}
              </h2>
            </Link>
            <div className="job-card-location">
              <span>{location || 'Location not specified'}</span>
            </div>
          </div>
        </div>

        <div className="job-card-details">
          <div className="job-card-info">
            <span className="job-card-label">Posted:</span>
            <span className="job-card-value">{postedText}</span>
          </div>
          <div className="job-card-info">
            <span className="job-card-label">Experience:</span>
            <span className="job-card-value">{experience || 'Not specified'}</span>
          </div>
          <div className="job-card-info">
            <span className="job-card-label">Salary:</span>
            <span className="job-card-value">{formattedSalary}</span>
          </div>
          <div className="job-card-info">
            <span className="job-card-label">Job Mode:</span>
            <span className="job-card-value">{displayJobMode}</span>
          </div>
        </div>

        <div className="job-card-footer">
          <span className="job-card-apply-before">
            Apply Before: {applybefore || 'Open'}
          </span>
          <div className="job-card-actions">
            <span className="job-card-type">{jobtype || 'Full-time'}</span>
            {isApplied && <span className="job-card-applied">Applied</span>}
            <Link to={`/candidate/find-job/job/${id}`} className="job-card-view-details">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(JobCard);