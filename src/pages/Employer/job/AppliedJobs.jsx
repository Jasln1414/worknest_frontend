import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ApplyCard from '../utilities/ApplyCard';
import CandidateView from './CandidateView';
import SideBar from '../SideBar';
import Drawer from 'react-modern-drawer';
import 'react-modern-drawer/dist/index.css';
import ApplicationData from '../utilities/ApplicationData';
import { FaArrowLeft } from "react-icons/fa6";
// import '../../../Styles/Job/StatusJob.css';

// Custom styles for the drawer
const customDrawerStyle = {
  height: "75vh",
  top: "25vh",
  borderTopLeftRadius: "20px",
  borderTopRightRadius: "20px",
  boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.1)"
};

// Scroll fix styles
const candidatesSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 180px)'
};

const candidatesContentStyle = {
  flex: 1,
  overflowY: 'auto',
  minHeight: '300px'
};

function ApplicationsManagement() {
    const [applicationOpen, setApplicationOpen] = useState(false);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [jobData, setJobData] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [change, setChange] = useState(true);
    const [current, setCurrent] = useState(null);
    const [fetchJob, setFetchJob] = useState(false);
    const [status, setStatus] = useState('');
    const [questions, setQuestions] = useState([]);
    const baseURL = 'http://127.0.0.1:8000';
    const token = localStorage.getItem('access');
    const navigate = useNavigate();

    const toggleApplication = () => {
        setApplicationOpen(!applicationOpen);
    };

    const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 768);
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        fetchJobDetails();
    }, [token, fetchJob]);

const fetchJobDetails = async () => {
        try {
            const response = await axios.get(`${baseURL}/api/empjob/getApplicationjobs/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                setJobData(response.data.data);
                setSelectedJob(response.data.data[0]);
                if (response.data.data[0]?.questions !== null) {
                    setQuestions(response.data.data[0].questions);
                } else {
                    setQuestions([]);
                }
            }
        } catch (error) {
            console.error("Something went wrong", error);
        }
    };

    const handleJobClick = (job) => {
        setSelectedJob(job);
        if (isSmallScreen) {
            toggleApplication();
        }
    };

    return (
        <div className="app-mgmt-container">
            {!isSmallScreen && (
                
                    <SideBar />
               
            )}

            <div className="app-mgmt-content-wrapper">
                <div className="app-mgmt-job-list-section">
                    <ApplicationData 
                        jobData={jobData} 
                        handleJobClick={handleJobClick} 
                        toggleApplication={toggleApplication} 
                    />
                </div>

                {/* Candidates section for desktop */}
                {!isSmallScreen && (
                    <div className="app-mgmt-candidates-section" style={{
                        ...candidatesSectionStyle,
                        marginTop: '20px'  // Add more top margin
                    }}>
                        <div className="app-mgmt-header">
                            <span style={{
                                fontWeight: 700,
                                fontSize: '1.8rem',
                                color: 'black'
                            }}>Applied Candidates</span>
                            <div onClick={() => setChange(!change)} className="app-mgmt-back-button">
                                <FaArrowLeft size={27} />
                            </div>
                        </div>
                        <div 
                            className={`app-mgmt-candidates-content ${change ? 'apply-card-content' : 'candidate-view-content'}`}
                            style={{
                                ...candidatesContentStyle,
                                paddingTop: '10px',
                                paddingRight: '10px'  // Add space for scrollbar
                            }}
                        >
                            {change ? (
                                <ApplyCard 
                                    selectedJob={selectedJob} 
                                    setChange={setChange} 
                                    setCurrent={setCurrent} 
                                    setStatus={setStatus} 
                                />
                            ) : (
                                <CandidateView 
                                    selectedJob={selectedJob} 
                                    setChange={setChange} 
                                    current={current} 
                                    questions={questions} 
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile drawer components */}
            {isSmallScreen && (
                <>
                    {/* First drawer for applied candidates list */}
                    <Drawer
                        open={applicationOpen && change}
                        onClose={toggleApplication}
                        direction="bottom"
                        className="app-mgmt-application-drawer"
                        style={customDrawerStyle}
                    >
                        <div className="app-mgmt-application-drawer-content">
                            <div className="app-mgmt-header">
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '1.8rem',
                                    color: 'black'
                                }}>Applied Candidates</span>
                                <div onClick={toggleApplication} className="app-mgmt-back-button">
                                    <FaArrowLeft size={27} />
                                </div>
                            </div>
                            <div 
                                className="app-mgmt-candidates-content apply-card-content"
                                style={{ 
                                    overflowY: 'auto', 
                                    flex: 1, 
                                    height: 'calc(100% - 60px)',
                                    paddingTop: '15px'  // Add more top space in drawer
                                }}
                            >
                                <ApplyCard 
                                    selectedJob={selectedJob} 
                                    setChange={setChange} 
                                    setCurrent={setCurrent} 
                                    setStatus={setStatus} 
                                />
                            </div>
                        </div>
                    </Drawer>

                    {/* Second drawer for candidate details */}
                    <Drawer
                        open={!change && applicationOpen}
                        onClose={() => setChange(true)}
                        direction="bottom"
                        className="app-mgmt-candidate-view-drawer"
                        style={customDrawerStyle}
                    >
                        <div className="app-mgmt-application-drawer-content">
                            <div className="app-mgmt-header">
                                <span style={{
                                    fontWeight: 700,
                                    fontSize: '1.8rem',
                                    color: '#2563eb'
                                }}>Candidate Details</span>
                                <div onClick={() => setChange(true)} className="app-mgmt-back-button">
                                    <FaArrowLeft size={27} />
                                </div>
                            </div>
                            <div 
                                className="app-mgmt-candidates-content candidate-view-content"
                                style={{ 
                                    overflowY: 'auto', 
                                    flex: 1, 
                                    height: 'calc(100% - 60px)',
                                    paddingTop: '15px'  // Add more top space in drawer
                                }}
                            >
                                <CandidateView 
                                    selectedJob={selectedJob} 
                                    setChange={setChange} 
                                    current={current} 
                                    questions={questions} 
                                    setFetchJob ={setFetchJob}
                                    fetchJob={fetchJob}
                                    fetchJobDetails={fetchJobDetails}
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