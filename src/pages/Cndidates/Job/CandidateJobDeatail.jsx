import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaSuitcase, FaCheckCircle, FaBookmark } from "react-icons/fa";
import { MdCurrencyRupee, MdDateRange } from "react-icons/md";
import { SlLocationPin } from "react-icons/sl";
import { formatDistanceToNow } from 'date-fns';
import Swal from 'sweetalert2';
import Qmodal from '../../../Components/Candidates/utilities/Qmodal';
import '../../../assets/Stylesheet/candijobdetail.css';
import './candi.css';

const JobDetail = () => {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const { jobId } = useParams();
  const [jobData, setJobData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [modal, setModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/account/current_user/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserId(response.data.id);
      } catch (error) {
        setError('Failed to load user data');
        console.error('Error fetching user ID:', error);
      }
    };
    fetchUserId();
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobResponse, questionsResponse, applicationStatusResponse, savedStatusResponse] = await Promise.all([
          axios.get(`${baseURL}/api/empjob/getjobs/detail/${jobId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${baseURL}/api/empjob/getjobs/questions/${jobId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${baseURL}/api/empjob/check-application/${jobId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${baseURL}/api/empjob/check-saved/${jobId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setJobData(jobResponse.data);
        setQuestions(Array.isArray(questionsResponse.data) ? questionsResponse.data : (questionsResponse.data?.questions || []));
        setHasApplied(applicationStatusResponse.data.has_applied);
        setIsSaved(savedStatusResponse.data.is_saved);
      } catch (error) {
        setError('Failed to load job details');
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId, token]);

  const handleSave = async () => {
    try {
      const action = isSaved ? 'unsave' : 'save';
      const response = await axios.post(
        `${baseURL}/api/empjob/savejob/${jobId}/`, 
        { action }, 
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setIsSaved(!isSaved);
      Swal.fire({
        icon: "success",
        title: `Job ${action}d successfully`,
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update saved status'
      });
    }
  };

  const handleApplyClick = () => {
    if (hasApplied) {
      Swal.fire({
        icon: 'info',
        title: 'Already Applied',
        text: 'You have already applied to this job!',
        timer: 1500
      });
      return;
    }
    setModal(questions.length > 0);
    if (questions.length === 0) {
      handleApply([]);
    }
  };

  const handleApply = async (submittedAnswers) => {
    try {
      if (!userId) throw new Error('User not authenticated');
      const response = await axios.post(
        `${baseURL}/api/empjob/applyjob/${jobId}/`,
        { answers: submittedAnswers },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setModal(false);
      setHasApplied(true);
      Swal.fire({
        icon: "success",
        title: response.data.message || 'Application submitted!',
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Application failed",
        text: error.response?.data?.message || error.message,
      });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${baseURL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  if (loading) return <div className="job-detail__loading">Loading job details...</div>;
  if (error) return <div className="job-detail__error">{error}</div>;
  if (!jobData) return <div className="job-detail__error">Job not found</div>;

  const image = getImageUrl(jobData?.employer?.profile_pic);

  return (
    <div className="job-detail">
      {modal && (
        <Qmodal 
          setModal={setModal} 
          questions={questions} 
          setAnswers={setAnswers} 
          answers={answers} 
          handleApply={handleApply}
        />
      )}

      <div className="job-detail__header">
        <div className="job-detail__logo-container">
          {image && <img src={image} alt="Company Logo" className="job-detail__logo" />}
        </div>
        <div className="job-detail__info">
          <h1 className="job-detail__title">{jobData.title}</h1>
          <h2 className="job-detail__company">{jobData.employer.user_full_name}</h2>
        </div>
      </div>

      <div className="job-detail__meta">
        <div className="job-detail__meta-item">
          <FaSuitcase className="job-detail__meta-icon" />
          <span>{jobData.experience}</span>
        </div>
        <div className="job-detail__meta-item">
          <MdCurrencyRupee className="job-detail__meta-icon" />
          <span>{jobData.lpa} LPA</span>
        </div>
        <div className="job-detail__meta-item">
          <SlLocationPin className="job-detail__meta-icon" />
          <span>{jobData.location}</span>
        </div>
      </div>

      <div className="job-detail__actions">
        <div className="job-detail__action-item">
          <MdDateRange className="job-detail__action-icon" />
          <span>Posted {formatDistanceToNow(new Date(jobData.posteDate), { addSuffix: true }).replace('about ', '').replace('hours', 'hr')}</span>
        </div>
        <div className="job-detail__action-buttons">
          {hasApplied ? (
            <div className="job-detail__applied-badge">
              <FaCheckCircle className="job-detail__applied-icon" />
              <span>Applied</span>
            </div>
          ) : (
            <button 
              className="job-detail__button job-detail__button--apply" 
              onClick={handleApplyClick}
              aria-label="Apply for this job"
            >
              <FaCheckCircle className="job-detail__button-icon" /> Apply
            </button>
          )}
          <button 
            className={`job-detail__button job-detail__button--save ${isSaved ? 'job-detail__button--saved' : ''}`} 
            onClick={handleSave}
            aria-label={isSaved ? "Unsave this job" : "Save this job"}
          >
            <FaBookmark className="job-detail__button-icon" /> {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="job-detail__section">
        <h2 className="job-detail__section-title">Job Description</h2>
        <div className="job-detail__content">
          <p className="job-detail__paragraph">{jobData.about}</p>
          <h3 className="job-detail__section-subtitle">Job Type: {jobData.jobtype}</h3>
          <h3 className="job-detail__section-subtitle">Job Mode: {jobData.jobmode}</h3>
          <h3 className="job-detail__section-subtitle">Responsibilities</h3>
          <p className="job-detail__paragraph">{jobData.responsibility}</p>
        </div>
      </div>

      <div className="job-detail__section">
        <h2 className="job-detail__section-title">About the Company</h2>
        <div className="job-detail__content">
          <p className="job-detail__paragraph">{jobData.employer.about}</p>
          <h3 className="job-detail__section-subtitle">Address</h3>
          <p className="job-detail__paragraph">{jobData.employer.address}</p>
          <h3 className="job-detail__section-subtitle">Headquarters: {jobData.employer.headquarters}</h3>
          <h3 className="job-detail__section-subtitle">
            Website: {' '}
            <a 
              href={jobData.employer.website_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="job-detail__link"
            >
              {jobData.employer.website_link}
            </a>
          </h3>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;