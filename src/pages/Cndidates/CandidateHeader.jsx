import React, { use, useState, useEffect } from 'react';
import logoimg from '../../assets/logoimg.jpg';
import { Dropdown, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X } from 'lucide-react';
import NotificationBell from '../../Components/Notification/NotificationBell';
import InterviewCallModal from '../../Components/Interview/InterviewCallModal';
import { openInterviewModal, closeInterviewModal } from '../../Redux/Interview/interviewCallSlice';



function CandidateHeader() {
  const baseURL = 'http://127.0.0.1:8000';
  const userBasicDetails = useSelector((state) => state.user_basic_details || {});
  const authentication = useSelector((state) => state.authentication);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const interviewModal = useSelector(state => state.interview_call.interviewModal);
  const roomId = useSelector(state => state.interview_call.roomId);
  const interviewId = useSelector(state => state.interview_call.interviewId);

  const profile_image = userBasicDetails.profile_pic
    ? userBasicDetails.profile_pic.startsWith('http')
      ? userBasicDetails.profile_pic
      : `${baseURL}${userBasicDetails.profile_pic}`
    : logoimg;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    dispatch(set_Authentication({
      name: null,
      email: null,
      isAuthenticated: false,
      isAdmin: false,
      usertype: null,
    }));
    dispatch(set_user_basic_details({
      name: null,
      email: null,
      phone: null,
      profile_pic: null,
      user_type_id: null,
    }));

    message.success({
      content: 'Logged out successfully!',
      duration: 3,
      style: {
        marginTop: '20px',
      },
    });

    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(()=>{
    console.log('Interview Modal:', interviewModal);
    console.log('Room ID:', roomId);
    console.log('Interview ID:', interviewId);
  },[interviewId,roomId,interviewModal])


  const profileDropdownItems = [
    { label: <Link to="/candidate/find-job" className="dropdown-link">Home</Link>, key: '0' },
    { label: <Link to="/candidate/SavedJobs" className="dropdown-link">Saved Jobs</Link>, key: '1' },
    { label: <Link to="/candidate/applyedjobs" className="dropdown-link">Applied Jobs</Link>, key: '2' },
    { label: <Link to="/candidate/profile" className="dropdown-link">Profile</Link>, key: '3' },
    { type: 'divider' },
    {
      label: (
        <button onClick={handleLogout} className="dropdown-logout-btn">
          Logout
        </button>
      ),
      key: '4',
    },
  ];

  const userId = authentication?.userId || userBasicDetails?.user_type_id;

  return (
    <div className="candidate-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-image">
            <img src={logoimg} alt="Logo" className="logo-img" />
          </div>
          <h1 className="logo-title">WorkNest</h1>
        </div>

        {/* Desktop Nav */}
        <div className="nav-links">
          <Link to="/candidate/find-job">Home</Link>
          <Link to="/candidate/SavedJobs">Saved Jobs</Link>
          <Link to="/candidate/applyedjobs">Applied Jobs</Link>
        </div>

        {/* Notifications and Profile */}
        <div className="profile-notifications">
          {userId && <NotificationBell userId={userId} />}
          {interviewModal && <InterviewCallModal />}
          <div className="user-profile">
            <Dropdown menu={{ items: profileDropdownItems }} trigger={['click']} overlayClassName="profile-dropdown">
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <img
                    src={profile_image}
                    alt="Profile"
                    className="profile-image"
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '0%'
                    }}
                    
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = logoimg;
                    }}
                  />
                </Space>
              </a>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            <Link to="/candidate/find-job" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/candidate/messages" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
            <Link to="/candidate/SavedJobs" onClick={() => setMobileMenuOpen(false)}>Saved Jobs</Link>
            <Link to="/candidate/applyedjobs" onClick={() => setMobileMenuOpen(false)}>Applied Jobs</Link>
            {userId && <NotificationBell userId={userId} />}
            <Link to="/candidate/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateHeader;
