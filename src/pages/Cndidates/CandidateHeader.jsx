// import React, { useState, useEffect } from 'react';
// import logoimg from '../../assets/logoimg.jpg';
// import { Dropdown, Space, message } from 'antd';
// import { Link, useNavigate } from 'react-router-dom';
// import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
// import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
// import { useSelector, useDispatch } from 'react-redux';
// import NotificationBell from '../../Components/Notification/NotificationBell';
//  //import InterviewCallModal from '../../Components/Interview/InterviewCallModal';
// //import { openInterviewModal, closeInterviewModal } from '../../Redux/Interview/interviewCallSlice';
// import '../../assets/component/Employheader.css';

// function CandidateHeader() {
//   const baseURL = 'http://127.0.0.1:8000';
//   const userBasicDetails = useSelector((state) => state.user_basic_details || {});
//   const authentication = useSelector((state) => state.authentication_user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const interviewModal = useSelector((state) => state.interview_call.interviewModal);
//   const roomId = useSelector((state) => state.interview_call.roomId);
//   const interviewId = useSelector((state) => state.interview_call.interviewId);
//   const [userId, setUserId] = useState(null);

//   const token = localStorage.getItem('access');
//   const user_id= localStorage.getItem('user_id');

//   useEffect(() => {
//     if (authentication.userid) {
//       setUserId(authentication.userid);
//     }
//     console.log('Candidate ID in header:', authentication.userid);
//   }, [authentication]);

//   const profile_image = userBasicDetails.profile_pic
//     ? userBasicDetails.profile_pic.startsWith('http')
//       ? userBasicDetails.profile_pic
//       : `${baseURL}${userBasicDetails.profile_pic}`
//     : logoimg;

//   const handleLogout = () => {
//     localStorage.clear();
//     dispatch(
//       set_Authentication({
//         name: null,
//         email: null,
//         isAuthenticated: false,
//         isAdmin: false,
//         usertype: null,
//       })
//     );
//     dispatch(
//       set_user_basic_details({
//         name: null,
//         email: null,
//         phone: null,
//         profile_pic: null,
//         user_type_id: null,
//       })
//     );
//     localStorage.removeItem('user_id');     

//     message.success({
//       content: 'Logged out successfully!',
//       duration: 3,
//       style: { marginTop: '20px' },
//     });

//     navigate('/');
//   };

//   // useEffect(() => {
//   //   console.log('Interview Modal:', interviewModal);
//   //   console.log('Room ID:', roomId);
//   //   console.log('Interview ID:', interviewId);
//   // }, [interviewId, roomId, interviewModal]);

//   const profileDropdownItems = [
//     { label: <Link to="/candidate/find-job" className="dropdown-link">Home</Link>, key: '0' },
//     { label: <Link to="/candidate/SavedJobs" className="dropdown-link">Saved Jobs</Link>, key: '1' },
//     { label: <Link to="/candidate/applyedjobs" className="dropdown-link">Applied Jobs</Link>, key: '2' },
//     { label: <Link to="/candidate/profile" className="dropdown-link">Profile</Link>, key: '3' },
//     { type: 'divider' },
//     {
//       label: (
//         <button onClick={handleLogout} className="dropdown-logout-btn">
//           Logout
//         </button>
//       ),
//       key: '4',
//     },
//   ];

//   return (
//     <div className="candidate-header">
//       <div className="header-container">
//         {/* Logo Section */}
//         <div className="logo-section">
//           <div className="logo-image">
//             <img src={logoimg} alt="Logo" className="logo-img" />
//           </div>
//           <h1 className="logo-title">WorkNest</h1>
//         </div>

//         {/* Desktop Nav */}
//         <div className="nav-links">
//           <Link to="/candidate/find-job">Home</Link>
//           <Link to="/candidate/SavedJobs">Saved Jobs</Link>
//           <Link to="/candidate/applyedjobs">Applied Jobs</Link>
//         </div>

//         {/* Notifications and Profile */}
//         <div className="profile-notifications">
//           {user_id && <NotificationBell userId={user_id} />}
//           {console.log(".......................userrrrrrrrrrrrr",user_id)}
//           {interviewModal && <InterviewCallModal />}
//           <div className="user-profile">
//             <Dropdown
//               menu={{ items: profileDropdownItems }}
//               trigger={['click']}
//               overlayClassName="profile-dropdown"
//             >
//               <a onClick={(e) => e.preventDefault()}>
//                 <Space>
//                   <img
//                     src={profile_image}
//                     alt="Profile"
//                     className="profile-image"
//                     style={{
//                       width: '70px',
//                       height: '70px',
//                       borderRadius: '50%',
//                       objectFit: 'cover',
//                     }}
//                     onError={(e) => {
//                       e.target.onerror = null;
//                       e.target.src = logoimg;
//                     }}
//                   />
//                 </Space>
//               </a>
//             </Dropdown>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CandidateHeader;

























import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Space, message } from 'antd';
import { FaBars } from 'react-icons/fa';
import PropTypes from 'prop-types';

import NotificationBell from '../../Components/Notification/NotificationBell';
import logoimg from '../../assets/logoimg.jpg';
import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import '../../assets/Stylesheet/Header.css';

// Define dropdown items outside the component for reusability
const PROFILE_DROPDOWN_ITEMS = [
  { label: <Link to="/candidate/find-job" className="dropdown-link">Home</Link>, key: '0' },
  { label: <Link to="/candidate/SavedJobs" className="dropdown-link">Saved Jobs</Link>, key: '1' },
  { label: <Link to="/candidate/applyedjobs" className="dropdown-link">Applied Jobs</Link>, key: '2' },
  { label: <Link to="/candidate/profile" className="dropdown-link">Profile</Link>, key: '3' },
  { type: 'divider' },
  {
    label: <button className="dropdown-logout-btn">Logout</button>,
    key: '4',
  },
];

function CandidateHeader({ userId, profileImage }) {
  const baseURL = 'http://127.0.0.1:8000';
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const userBasicDetails = useSelector((state) => state.user_basic_details || {});
  const authentication = useSelector((state) => state.authentication_user);
  const interviewModal = useSelector((state) => state.interview_call.interviewModal);

  // Local state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Local storage
  const token = localStorage.getItem('access');
  const storedUserId = localStorage.getItem('user_id');

  // Profile image logic
  const profilePic = profileImage || userBasicDetails.profile_pic
    ? userBasicDetails.profile_pic.startsWith('http')
      ? userBasicDetails.profile_pic
      : `${baseURL}${userBasicDetails.profile_pic}`
    : logoimg;

  // Log user ID for debugging
  useEffect(() => {
    console.log('Candidate ID in header:', authentication.userid || storedUserId);
  }, [authentication.userid, storedUserId]);

  // Toggle mobile navigation
  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => !prev);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    dispatch(
      set_Authentication({
        name: null,
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        usertype: null,
      })
    );
    dispatch(
      set_user_basic_details({
        name: null,
        email: null,
        phone: null,
        profile_pic: null,
        user_type_id: null,
      })
    );

    message.success({
      content: 'Logged out successfully!',
      duration: 3,
      style: { marginTop: '20px' },
    });

    navigate('/');
  };

  // Update dropdown items with logout handler
  const dropdownItems = PROFILE_DROPDOWN_ITEMS.map((item) =>
    item.key === '4'
      ? { ...item, label: <button onClick={handleLogout} className="dropdown-logout-btn">Logout</button> }
      : item
  );

  return (
    <div className="candidate-header wn-candidate-header">
      <div className="header-container wn-header-container">
        {/* Logo Section */}
        <div className="logo-section wn-logo-section">
          {/* <div className="logo-image wn-logo-image">
            <img src={logoimg} alt="Logo" className="logo-img wn-logo-img" />
          </div> */}
          <h1 className="logo-title wn-logo-title">WorkNest</h1>
        </div>

        {/* Hamburger Menu */}
        <div className="wn-hamburger-menu" onClick={toggleMobileNav}>
          <FaBars />
        </div>

        {/* Desktop Nav */}
        <div className="nav-links wn-nav-links">
          <Link to="/candidate/find-job">Home</Link>
          <Link to="/candidate/SavedJobs">Saved Jobs</Link>
          <Link to="/candidate/applyedjobs">Applied Jobs</Link>
        </div>

        {/* Mobile Nav */}
        <div className={`wn-mobile-nav ${isMobileNavOpen ? 'active' : ''}`}>
          <Link to="/candidate/find-job" onClick={toggleMobileNav}>Home</Link>
          <Link to="/candidate/SavedJobs" onClick={toggleMobileNav}>Saved Jobs</Link>
          <Link to="/candidate/applyedjobs" onClick={toggleMobileNav}>Applied Jobs</Link>
        </div>

        {/* Notifications and Profile */}
        <div className="profile-notifications wn-profile-notifications">
          {storedUserId && <NotificationBell userId={storedUserId} />}
          <div className="user-profile wn-user-profile">
            <Dropdown
              menu={{ items: dropdownItems }}
              trigger={['click']}
              overlayClassName="profile-dropdown wn-profile-dropdown"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="profile-image wn-profile-image"
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
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
    </div>
  );
}

CandidateHeader.propTypes = {
  userId: PropTypes.string,
  profileImage: PropTypes.string,
};

export default CandidateHeader;