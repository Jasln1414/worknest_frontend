// // import React, { useState, useEffect } from 'react';
// // import logoimg from '../../assets/logoimg.jpg';
// // import { Dropdown, Space, message } from 'antd';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
// // import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
// // import { useSelector, useDispatch } from 'react-redux';
// // import { Menu, X } from 'lucide-react';
// // import NotificationBell from '../../Components/Notification/NotificationBell';
// // import '../../Styles/OTP.css'; // Added to match CandidateHeader
// // import '../../Components/Notification/Notification.css';
// // //import './EmployerHeader.css'; // Custom styles

// // function EmployerHeader() {
// //   const baseURL = 'http://127.0.0.1:8000';
// //   const userBasicDetails = useSelector((state) => state.user_basic_details || {});
// //   const authentication = useSelector((state) => state.authentication);
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const profile_image = userBasicDetails.profile_pic
// //     ? userBasicDetails.profile_pic.startsWith('http')
// //       ? userBasicDetails.profile_pic
// //       : `${baseURL}${userBasicDetails.profile_pic}`
// //     : logoimg;

// //   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
// //   const [isSmallScreen, setIsSmallScreen] = useState(false); // For logo image hiding
// //   const userId = authentication?.userId || userBasicDetails?.user_type_id;

// //   // Debug state
// //   useEffect(() => {
// //     console.log('EmployerHeader - userId:', userId);
// //     console.log('Authentication:', authentication);
// //     console.log('UserBasicDetails:', userBasicDetails);
// //   }, [userId, authentication, userBasicDetails]);

// //   // Handle screen resize
// //   const handleResize = () => {
// //     setIsSmallScreen(window.innerWidth < 768);
// //   };

// //   useEffect(() => {
// //     window.addEventListener('resize', handleResize);
// //     handleResize();
// //     return () => window.removeEventListener('resize', handleResize);
// //   }, []);

// //   const handleLogout = () => {
// //     localStorage.clear();
// //     dispatch(
// //       set_Authentication({
// //         name: null,
// //         email: null,
// //         isAuthenticated: false,
// //         isAdmin: false,
// //         usertype: null,
// //       })
// //     );
// //     dispatch(
// //       set_user_basic_details({
// //         name: null,
// //         email: null,
// //         phone: null,
// //         profile_pic: null,
// //         user_type_id: null,
// //       })
// //     );
// //     message.success({
// //       content: 'Logged out successfully!',
// //       duration: 3,
// //       style: { marginTop: '20px' },
// //     });
// //     navigate('/');
// //   };

// //   const toggleMobileMenu = () => {
// //     setMobileMenuOpen(!mobileMenuOpen);
// //   };

// //   const profileDropdownItems = [
// //     { label: <Link to="/employer/EmpHome" className="dropdown-link">Home</Link>, key: '0' },
// //     { label: <Link to="/employer/postjob" className="dropdown-link">Post Job</Link>, key: '1' },
// //     { label: <Link to="/employer/applications" className="dropdown-link">Applications</Link>, key: '2' },
// //     { label: <Link to="/employer/profile" className="dropdown-link">Profile</Link>, key: '5' },
// //     { label: <Link to="/employer/subscriptions" className="dropdown-link">Subscription Plans</Link>, key: '6' },
// //     {
// //       label: (
// //         <button onClick={handleLogout} className="dropdown-logout-btn">
// //           Logout
// //         </button>
// //       ),
// //       key: '7',
// //     },
// //   ];

// //   return (
// //     <div className="employer-header">
// //       <div className="header-container">
// //         {/* Logo Section */}
// //         <div className="logo-section">
// //           <div className="logo-image">
// //             {!isSmallScreen && <img src={logoimg} alt="Logo" className="logo-img" />}
// //           </div>
// //           <h1 className="logo-title">WorkNest</h1>
// //         </div>

// //         {/* Desktop Nav */}
// //         <div className="nav-links">
// //           <Link to="/employer/EmpHome">Home</Link>
// //           <Link to="/employer/postjob">Post Job</Link>
// //           <Link to="/employer/applications">Applications</Link>
// //         </div>

// //         {/* Notifications and Profile */}
// //         <div className="profile-notifications">
// //           {userId && <NotificationBell userId={userId} />}
// //           <div className="user-profile">
// //             <Dropdown menu={{ items: profileDropdownItems }} trigger={['click']} overlayClassName="profile-dropdown">
// //               <a onClick={(e) => e.preventDefault()}>
// //                 <Space>
// //                   <img
// //                     src={profile_image}
// //                     alt="Profile"
// //                     className="profile-image"
// //                     style={{
// //                       width: '70px',
// //                       height: '70px',
// //                       borderRadius: '50%',
// //                       objectFit: 'cover',
// //                       marginBottom: '0%',
// //                     }}
// //                     onError={(e) => {
// //                       e.target.onerror = null;
// //                       e.target.src = logoimg;
// //                     }}
// //                   />
// //                 </Space>
// //               </a>
// //             </Dropdown>
// //           </div>
// //           <button className="mobile-menu-button" onClick={toggleMobileMenu}>
// //             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
// //           </button>
// //         </div>
// //       </div>

// //       {/* Mobile Menu */}
// //       {mobileMenuOpen && (
// //         <div className="mobile-menu">
// //           <div className="mobile-menu-links">
// //             <Link to="/employer/EmpHome" onClick={toggleMobileMenu}>Home</Link>
// //             <Link to="/employer/postjob" onClick={toggleMobileMenu}>Post Job</Link>
// //             <Link to="/employer/applications" onClick={toggleMobileMenu}>Applications</Link>
// //             {userId && <NotificationBell userId={userId} />}
// //             <Link to="/employer/profile" onClick={toggleMobileMenu}>Profile</Link>
// //             <Link to="/employer/subscriptions" onClick={toggleMobileMenu}>Subscription Plans</Link>
// //             <button onClick={() => { handleLogout(); toggleMobileMenu(); }}>Logout</button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default EmployerHeader;
















// import React, { useState, useEffect } from 'react';
// import logoimg from '../../assets/logoimg.jpg';
// import { Dropdown, Space, message } from 'antd';
// import { Link, useNavigate } from 'react-router-dom';
// import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
// import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
// import { useSelector, useDispatch } from 'react-redux';
// import { Menu, X } from 'lucide-react';
// import NotificationBell from '../../Components/Notification/NotificationBell';

// // import '../../Styles/OTP.css';
// // import '../../Components/Notification/Notification.css';

// function EmployerHeader() {
//   const baseURL = 'http://127.0.0.1:8000';
//   const userBasicDetails = useSelector((state) => state.user_basic_details || {});
//   const authentication = useSelector((state) => state.authentication_user);
 
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
  
//   // Add a state to store the userId with an initial value from localStorage
//   const [userId, setUserId] = useState();

//   const profile_image = userBasicDetails.profile_pic
//     ? userBasicDetails.profile_pic.startsWith('http')
//       ? userBasicDetails.profile_pic
//       : `${baseURL}${userBasicDetails.profile_pic}`
//     : logoimg;

//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   // Update the userId when redux state changes, but don't reset to null if already set
//   useEffect(() => {
//     const userIdFromAuth = authentication?.userid;
//     const userIdFromDetails = userBasicDetails?.user_type_id;
//     const storedUserId = localStorage.getItem('user_id');
    
//     const newUserId = userIdFromAuth || userIdFromDetails || storedUserId;
    
//     if (userIdFromAuth) {
//       setUserId(userIdFromAuth);
//       // Also update localStorage for future page loads
//       if (storedUserId !== newUserId) {
//         localStorage.setItem('user_id', newUserId);
//       }
//     }
//     console.log('EmployerHeader - Updated userId:', userIdFromAuth);
//   }, [authentication, userBasicDetails]);

//   // Simple debug log for userId only
//   useEffect(() => {
//     console.log('EmployerHeader - Using userId:', userId);
//   }, [userId]);

//   const handleLogout = () => {
//     localStorage.clear();
//     setUserId(null);
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
//     message.success({
//       content: 'Logged out successfully!',
//       duration: 3,
//       style: { marginTop: '20px' },
//     });
//     navigate('/');
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   const profileDropdownItems = [
//     { label: <Link to="/employer/EmpHome" className="dropdown-link">Home</Link>, key: '0' },
//     { label: <Link to="/employer/postjob" className="dropdown-link">Post Job</Link>, key: '1' },
//     { label: <Link to="/employer/applications" className="dropdown-link">Applications</Link>, key: '2' },
//     { label: <Link to="/employer/profile" className="dropdown-link">Profile</Link>, key: '5' },
//     { label: <Link to="/employer/subscriptions" className="dropdown-link">Subscription Plans</Link>, key: '6' },
//     {
//       label: (
//         <button onClick={handleLogout} className="dropdown-logout-btn">
//           Logout
//         </button>
//       ),
//       key: '7',
//     },
//   ];

//   // Only render NotificationBell if userId is available
//   const renderNotificationBell = () => {
//     if (!userId) return null;
//     return <NotificationBell userId={userId} />;
//   };

//   return (
//     <div className="employer-header">
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
//           <Link to="/employer/EmpHome">Home</Link>
//           <Link to="/employer/postjob">Post Job</Link>
//           <Link to="/employer/applications">Applications</Link>
//         </div>

//         {/* Notifications and Profile */}
//         <div className="profile-notifications">
//           {renderNotificationBell()}
          
//           <div className="user-profile">
//             <Dropdown menu={{ items: profileDropdownItems }} trigger={['click']} overlayClassName="profile-dropdown">
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
//                       marginBottom: '0%',
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
//           <button className="mobile-menu-button" onClick={toggleMobileMenu}>
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="mobile-menu">
//           <div className="mobile-menu-links">
//             <Link to="/employer/EmpHome" onClick={toggleMobileMenu}>Home</Link>
//             <Link to="/employer/postjob" onClick={toggleMobileMenu}>Post Job</Link>
//             <Link to="/employer/applications" onClick={toggleMobileMenu}>Applications</Link>
//             {renderNotificationBell()}
//             <Link to="/employer/profile" onClick={toggleMobileMenu}>Profile</Link>
//             <Link to="/employer/subscriptions" onClick={toggleMobileMenu}>Subscription Plans</Link>
//             <button onClick={() => { handleLogout(); toggleMobileMenu(); }}>Logout</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default EmployerHeader;












import React, { useState, useEffect } from 'react';
import logoimg from '../../assets/logoimg.jpg';
import { Dropdown, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, X } from 'lucide-react';
import NotificationBell from '../../Components/Notification/NotificationBell';
//import './EmployerHeader.css'; 

function EmployerHeader() {
  const baseURL = 'http://127.0.0.1:8000';
  const userBasicDetails = useSelector((state) => state.user_basic_details || {});
  const authentication = useSelector((state) => state.authentication_user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initialize userId from localStorage or Redux
  const [userId, setUserId] = useState(localStorage.getItem('user_id') || null);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const profile_image = userBasicDetails.profile_pic
    ? userBasicDetails.profile_pic.startsWith('http')
      ? userBasicDetails.profile_pic
      : `${baseURL}${userBasicDetails.profile_pic}`
    : logoimg;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update userId when Redux state changes
  useEffect(() => {
    const userIdFromAuth = authentication?.userid;
    const userIdFromDetails = userBasicDetails?.user_type_id;
    const newUserId = userIdFromAuth || userIdFromDetails || localStorage.getItem('user_id');

    if (newUserId && newUserId !== userId) {
      setUserId(newUserId);
      localStorage.setItem('user_id', newUserId);
      console.log('EmployerHeader - Updated userId:', newUserId);
    }
  }, [authentication, userBasicDetails, userId]);

  // Debug userId
  useEffect(() => {
    console.log('EmployerHeader - Using userId:', userId);
  }, [userId]);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    dispatch(
      set_Authentication({
        name: null,
        email: null,
        isAuthenticated: false,
        isAdmin: false,
        usertype: null,
        userid: null,
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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const profileDropdownItems = [
    { label: <Link to="/employer/EmpHome" className="dropdown-link">Home</Link>, key: '0' },
    { label: <Link to="/employer/postjob" className="dropdown-link">Post Job</Link>, key: '1' },
    { label: <Link to="/employer/applications" className="dropdown-link">Applications</Link>, key: '2' },
    { label: <Link to="/employer/profile" className="dropdown-link">Profile</Link>, key: '5' },
    { label: <Link to="/employer/subscriptions" className="dropdown-link">Subscription Plans</Link>, key: '6' },
    {
      label: (
        <button onClick={handleLogout} className="dropdown-logout-btn">
          Logout
        </button>
      ),
      key: '7',
    },
  ];

  // Only render NotificationBell if userId is available
  const renderNotificationBell = () => {
    if (!userId) return null;
    return <NotificationBell userId={userId} senderName={authentication?.name || userBasicDetails?.name || 'Employer'} />;
  };

  return (
    <div className="employer-header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-image">{!isSmallScreen && <img src={logoimg} alt="Logo" className="logo-img" />}</div>
          <h1 className="logo-title">WorkNest</h1>
        </div>

        {/* Desktop Nav */}
        {/* <div className="nav-links">
          <Link to="/employer/EmpHome">Home</Link>
          <Link to="/employer/postjob">Post Job</Link>
          <Link to="/employer/applications">Applications</Link>
        </div> */}

        {/* Notifications and Profile */}
        <div className="profile-notifications">
          {renderNotificationBell()}
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
                      marginBottom: '0%',
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
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            <Link to="/employer/EmpHome" onClick={toggleMobileMenu}>Home</Link>
            <Link to="/employer/postjob" onClick={toggleMobileMenu}>Post Job</Link>
            <Link to="/employer/applications" onClick={toggleMobileMenu}>Applications</Link>
            {renderNotificationBell()}
            <Link to="/employer/profile" onClick={toggleMobileMenu}>Profile</Link>
            <Link to="/employer/subscriptions" onClick={toggleMobileMenu}>Subscription Plans</Link>
            <button onClick={() => { handleLogout(); toggleMobileMenu(); }}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerHeader;