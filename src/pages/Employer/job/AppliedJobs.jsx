import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApplicationJobs, setSelectedJob } from './../../../Redux/Status/StatusSlice';
import ApplyCard from '../utilities/ApplyCard';
import CandidateView from './CandidateView';
import SideBar from '../SideBar';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import ApplicationData from '../utilities/ApplicationData';
import { FaArrowLeft } from 'react-icons/fa6';

const customDrawerStyle = {
  height: '75vh',
  top: '25vh',
  borderTopLeftRadius: '20px',
  borderTopRightRadius: '20px',
  boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)',
};

const candidatesSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 180px)',
};

const candidatesContentStyle = {
  flex: 1,
  overflowY: 'auto',
  minHeight: '300px',
};

function ApplicationsManagement() {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [change, setChange] = useState(true);
  const [questions, setQuestions] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  const { jobs, selectedJob, current, loading, error } = useSelector((state) => state.applicationJobs);

  const toggleApplication = () => {
    setApplicationOpen(!applicationOpen);
  };

  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 768);
  };

  const handleCloseCandidateView = () => {
    setChange(true);
    if (isSmallScreen) {
      setApplicationOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchApplicationJobs(token));
    } else {
      navigate('/login');
    }
  }, [dispatch, token, navigate]);

  useEffect(() => {
    if (selectedJob?.questions) {
      setQuestions(selectedJob.questions);
    } else {
      setQuestions([]);
    }
  }, [selectedJob]);

  const handleJobClick = (job) => {
    dispatch(setSelectedJob(job));
    if (isSmallScreen) {
      toggleApplication();
    }
  };

  const reRenderParent = () => {
    if (token) {
      dispatch(fetchApplicationJobs(token));
    }
  };

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') {
      return err.detail || err.message || JSON.stringify(err);
    }
    return 'An unknown error occurred.';
  };

  if (loading) return <div>Loading...</div>;
  if (error) {
    console.log('Error details:', error);
    return (
      <div className="error-message">
        <p>Error: {getErrorMessage(error)}</p>
        {getErrorMessage(error).includes('Authentication') && (
          <button onClick={() => navigate('/login')}>Login</button>
        )}
        <button onClick={() => dispatch(fetchApplicationJobs(token))}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app-mgmt-container">
      {!isSmallScreen && <SideBar />}

      <div className="app-mgmt-content-wrapper">
        <div className="app-mgmt-job-list-section">
          <ApplicationData jobData={jobs} handleJobClick={handleJobClick} toggleApplication={toggleApplication} />
        </div>

        {!isSmallScreen && (
          <div className="app-mgmt-candidates-section" style={{ ...candidatesSectionStyle }}>
            <div className="app-mgmt-header">
              <span style={{ fontWeight: 700, fontSize: '1.8rem', color: 'black' }}>Applied Candidates</span>
              <div onClick={() => setChange(!change)} className="app-mgmt-back-button">
                <FaArrowLeft size={27} />
              </div>
            </div>
            <div
              className={`app-mgmt-candidates-content ${change ? 'apply-card-content' : 'candidate-view-content'}`}
              style={{ ...candidatesContentStyle, paddingTop: '10px', paddingRight: '10px' }}
            >
              {change ? (
                <ApplyCard selectedJob={selectedJob} setChange={setChange} />
              ) : (
                <CandidateView
                  selectedJob={selectedJob}
                  current={current}
                  questions={questions}
                  fetchJobDetails={() => dispatch(fetchApplicationJobs(token))}
                  onClose={handleCloseCandidateView}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {isSmallScreen && (
        <>
          <Drawer
            open={applicationOpen && change}
            onClose={toggleApplication}
            direction="bottom"
            className="app-mgmt-application-drawer"
            style={customDrawerStyle}
          >
            <div className="app-mgmt-application-drawer-content">
              <div className="app-mgmt-header">
                <span style={{ fontWeight: 700, fontSize: '1.8rem', color: 'black' }}>Applied Candidates</span>
                <div onClick={toggleApplication} className="app-mgmt-back-button">
                  <FaArrowLeft size={27} />
                </div>
              </div>
              <div
                className="app-mgmt-candidates-content apply-card-content"
                style={{ overflowY: 'auto', flex: 1, height: 'calc(100% - 60px)', paddingTop: '15px' }}
              >
                <ApplyCard selectedJob={selectedJob} setChange={setChange} />
              </div>
            </div>
          </Drawer>

          <Drawer
            open={!change && applicationOpen}
            onClose={() => setChange(true)}
            direction="bottom"
            className="app-mgmt-candidate-view-drawer"
            style={customDrawerStyle}
          >
            <div className="app-mgmt-application-drawer-content">
              <div className="app-mgmt-header">
                <span style={{ fontWeight: 700, fontSize: '1.8rem', color: '#2563eb' }}>Candidate Details</span>
                <div onClick={() => setChange(true)} className="app-mgmt-back-button">
                  <FaArrowLeft size={27} />
                </div>
              </div>
              <div
                className="app-mgmt-candidates-content candidate-view-content"
                style={{ overflowY: 'auto', flex: 1, height: 'calc(100% - 60px)', paddingTop: '15px' }}
              >
                <CandidateView
                  selectedJob={selectedJob}
                  current={current}
                  questions={questions}
                  fetchJobDetails={() => dispatch(fetchApplicationJobs(token))}
                  onClose={() => setChange(true)}
                />
              </div>
            </div>
          </Drawer>
        </>
      )}
    </div>
  );
}

export default ApplicationsManagement;