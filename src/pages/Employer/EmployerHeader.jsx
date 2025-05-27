// import React, { useState, useEffect } from 'react';
// import logoimg from '../../assets/logoimg.jpg';
// import { Dropdown, Space, message } from 'antd';
// import { Link, useNavigate } from 'react-router-dom';
// import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
// import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
// import { useSelector, useDispatch } from 'react-redux';
// import NotificationBell from '../../Components/Notification/NotificationBell';
// import '../../assets/component/Employheader.css';

// function EmployerHeader() {
//   const baseURL = 'http://127.0.0.1:8000';
//   const userBasicDetails = useSelector((state) => state.user_basic_details || {});
//   const authentication = useSelector((state) => state.authentication_user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const userIdFromAuth = authentication?.userid;
//     const userIdFromDetails = userBasicDetails?.user_type_id;
//     const storedUserId = localStorage.getItem('user_id');
//     const newUserId = userIdFromAuth || userIdFromDetails || storedUserId;

//     if (newUserId) {
//       setUserId(newUserId);
//       if (storedUserId !== newUserId) {
//         localStorage.setItem('user_id', newUserId);
//       }
//     }
//     console.log('EmployerHeader - Updated userId:', userIdFromAuth);
//   }, [authentication, userBasicDetails]);

//   useEffect(() => {
//     console.log('EmployerHeader - Using userId:', userId);
//   }, [userId]);

//   const profile_image = userBasicDetails.profile_pic
//     ? userBasicDetails.profile_pic.startsWith('http')
//       ? userBasicDetails.profile_pic
//       : `${baseURL}${userBasicDetails.profile_pic}`
//     : logoimg;

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

//   const profileDropdownItems = [
//     { label: <Link to="/employer/EmpHome" className="dropdown-link">Home</Link>, key: '0' },
//     { label: <Link to="/employer/postjob" className="dropdown-link">Post Job</Link>, key: '1' },
//     { label: <Link to="/employer/applications" className="dropdown-link">Applications</Link>, key: '2' },
//     { label: <Link to="/employer/profile" className="dropdown-link">Profile</Link>, key: '5' },
//     { label: <Link to="/employer/subscriptions" className="dropdown-link">Subscription Plans</Link>, key: '6' },
//     { type: 'divider' },
//     {
//       label: (
//         <button onClick={handleLogout} className="dropdown-logout-btn">
//           Logout
//         </button>
//       ),
//       key: '7',
//     },
//   ];

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
//           <Link to="/employer/subscriptions">Subscription Plan</Link>
//           <Link to="/employer/applications">Applications</Link>
//         </div>

//         {/* Notifications and Profile */}
//         <div className="profile-notifications">
//           {renderNotificationBell()}
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

// export default EmployerHeader;












import React, { useState, useEffect } from 'react';
import logoimg from '../../assets/logoimg.jpg';
import { Dropdown, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { set_Authentication, clear_Authentication } from '../../Redux/Authentication/authenticationSlice';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import { useSelector, useDispatch } from 'react-redux';
import NotificationBell from '../../Components/Notification/NotificationBell';
import '../../assets/component/Employheader.css';

function EmployerHeader() {
  const baseURL = 'http://127.0.0.1:8000';
  const userBasicDetails = useSelector((state) => state.user_basic_details || {});
  const authentication = useSelector((state) => state.authentication_user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  const isProfileComplete = authentication.profile_completed;

  useEffect(() => {
    const userIdFromAuth = authentication?.userid;
    const userIdFromDetails = userBasicDetails?.user_type_id;
    const storedUserId = localStorage.getItem('user_id');
    const newUserId = userIdFromAuth || userIdFromDetails || storedUserId;

    if (newUserId) {
      setUserId(newUserId);
      if (storedUserId !== newUserId) {
        localStorage.setItem('user_id', newUserId);
      }
    }
  }, [authentication, userBasicDetails]);

  const handleLogout = () => {
    localStorage.clear();
    setUserId(null);
    dispatch(clear_Authentication());
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

  const profileDropdownItems = [
    { label: <Link to="/employer/EmpHome" className="dropdown-link">Home</Link>, key: '0' },
    ...(isProfileComplete
      ? [
          { label: <Link to="/employer/postjob" className="dropdown-link">Post Job</Link>, key: '1' },
          { label: <Link to="/employer/applications" className="dropdown-link">Applications</Link>, key: '2' },
          { label: <Link to="/employer/subscriptions" className="dropdown-link">Subscription Plans</Link>, key: '6' },
        ]
      : []),
    { label: <Link to="/employer/profile" className="dropdown-link">Profile</Link>, key: '5' },
    { type: 'divider' },
    {
      label: (
        <button onClick={handleLogout} className="dropdown-logout-btn">
          Logout
        </button>
      ),
      key: '7',
    },
  ];

  const renderNotificationBell = () => {
    if (!userId || !isProfileComplete) return null;
    return <NotificationBell userId={userId} />;
  };

  return (
    <div className="employer-header">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-image">
            <img src={logoimg} alt="Logo" className="logo-img" />
          </div>
          <h1 className="logo-title">WorkNest</h1>
        </div>

        <div className="nav-links">
          <Link to="/employer/EmpHome">Home</Link>
          {isProfileComplete && (
            <>
              <Link to="/employer/subscriptions">Subscription Plan</Link>
              <Link to="/employer/applications">Applications</Link>
            </>
          )}
        </div>

        <div className="profile-notifications">
          {renderNotificationBell()}
          <div className="user-profile">
            <Dropdown
              menu={{ items: profileDropdownItems }}
              trigger={['click']}
              overlayClassName="profile-dropdown"
            >
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <img
                    src={
                      userBasicDetails.profile_pic
                        ? userBasicDetails.profile_pic.startsWith('http')
                          ? userBasicDetails.profile_pic
                          : `${baseURL}${userBasicDetails.profile_pic}`
                        : logoimg
                    }
                    alt="Profile"
                    className="profile-image"
                    style={{
                      width: '70px',
                      height: '70px',
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

export default EmployerHeader;