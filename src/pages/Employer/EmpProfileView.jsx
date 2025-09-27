// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { useDispatch } from 'react-redux';
// import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
// import logo from '../../assets/logo.jpg';
// import SideBar from './SideBar';
// import EditEmployerProfileModal from './EditEmployerProfileModal';
// import '../../Styles/EmpProfile.css';

// function EmployerProfileView() {
//   const baseURL = "http://127.0.0.1:8000/";
//   const token = localStorage.getItem('access');
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [profileData, setProfileData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   // Utility function to properly construct image URLs
//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return logo;
//     if (imagePath.startsWith('http')) return imagePath;
//     return `${baseURL}${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
//   };

//   // Function to get CSRF token from cookies
//   const getCookie = (name) => {
//     let cookieValue = null;
//     if (document.cookie && document.cookie !== '') {
//       const cookies = document.cookie.split(';');
//       for (let i = 0; i < cookies.length; i++) {
//         const cookie = cookies[i].trim();
//         if (cookie.substring(0, name.length + 1) === (name + '=')) {
//           cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//           break;
//         }
//       }
//     }
//     return cookieValue;
//   };

//   const csrfToken = getCookie('csrftoken');



  

//   // Fetch profile data
//   useEffect(() => {
//     if (!token) {
//       console.log("No access token found, redirecting to login");
//       navigate('/'); // Redirect to login
//       return;
//     }
//     const fetchData = async () => {
//       try {
//           const response = await axios.get(`${baseURL}api/empjob/profile/`, {
//               headers: {
//                   Authorization: `Bearer ${token}`,
//                   'X-CSRFToken': csrfToken,
//                   Accept: 'application/json',
//                   'Content-Type': 'application/json',
//               },
//           });
          
//           if (response.status === 200 && response.data?.data) {
//               console.log('Full API Response......................................:', response.data);
//               const profile = response.data.data;
              
//               setProfileData({
//                 ...profile,
//                 user_email: profile.user_email || '',
//                 phone: profile.phone || '',
//                 website_link: profile.website_link || '',
//                 headquarters: profile.headquarters || '',
//                 industry: profile.industry || '',
//                 address: profile.address || '',
//                 about: profile.about || ''
//             });
//               dispatch(set_user_basic_details({
//                   profile_pic: profile.profile_pic,
//                   name: profile.user_full_name,
//                   email: profile.user?.email || '',
//                   userId: profile.id
//               }));
//               localStorage.setItem('userId', profile.id);
//               localStorage.setItem('userType', response.data.user_type); // Store userType
//               localStorage.setItem('profileCompleted', 'true');
//           } else {
//               setError('No profile data found in response');
//               navigate('/employer/profile_creation/');
//           }
//       } catch (error) {
//           // ... (existing error handling)
//       } finally {
//           setLoading(false);
//       }
//   };
   

//     fetchData();
//   }, [baseURL, token, dispatch, navigate, csrfToken]);

//   // Handle Edit Button Click
//   const handleEditClick = () => {
//     setIsEditModalOpen(true);
//   };

//   // Handle Save After Editing
//   const handleSave = async (updatedData) => {
//     try {
//       const response = await axios.put(`${baseURL}api/account/employer/profile/update/`, updatedData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'X-CSRFToken': csrfToken,
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.status === 200) {
//         setProfileData(updatedData);
//         dispatch(set_user_basic_details({
//           profile_pic: updatedData.profile_pic,
//           name: updatedData.user_full_name,
//           email: updatedData.user_email,
//         }));
//         localStorage.setItem('profileCompleted', 'true'); // Mark profile as complete
//         setIsEditModalOpen(false);
//       } else {
//         setError(`Failed to update profile: ${response.status}`);
//       }
//     } catch (error) {
//       console.error('Error updating profile data:', error);
//       setError(`Error updating profile: ${error.message}`);
//     }


    
//   };

//   if (loading) {
//     return <div className="loading-container">Loading employer profile data...</div>;
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <h3>Error loading employer profile: {error}</h3>
//         <p>Please check the console for more details.</p>
//         <button onClick={() => navigate('/employer/profile_creation/')} className="error-button">
//           Create Profile
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="ep-main-container">
     
//         <SideBar />
      
//       <div className="ep-content-wrapper">
//         <div className="ep-header-section">
//           <div className="ep-avatar-wrapper">
//             <img
//               src={getImageUrl(profileData.profile_pic)}
//               alt="Employer Profile"
//               className="ep-avatar-image"
//             />
//           </div>
//           <h2 className="ep-company-title">{profileData.user_full_name || 'Company Name Not Available'}</h2>
//           <button onClick={handleEditClick} className="edit-profile-button">Edit Profile</button>
//         </div>
//         <div className="ep-info-row">
//           <div className="ep-detail-block">
//             <h3 className="ep-block-heading">Contact Information</h3>
//             <div className="ep-detail-row">
//               <span className="ep-icon">📧</span>
//               <span className="ep-data-text">{profileData.user_email || 'No Email Provided'}</span>
//             </div>
//             <div className="ep-detail-row">
//               <span className="ep-icon">📞</span>
//               <span className="ep-data-text">{profileData.phone || 'No Phone Provided'}</span>
//             </div>
//             <div className="ep-detail-row">
//               <span className="ep-icon">🌐</span>
//               <span className="ep-data-text">
//                 {profileData.website_link ? (
//                   <a href={profileData.website_link} target="_blank" rel="noopener noreferrer" className="ep-external-link">
//                     {profileData.website_link}
//                   </a>
//                 ) : (
//                   'No Website Provided'
//                 )}
//               </span>
//             </div>
//           </div>
//           <div className="ep-detail-block">
//             <h3 className="ep-block-heading">Company Information</h3>
//             <div className="ep-detail-row">
//               <span className="ep-icon">📍</span>
//               <span className="ep-data-text">{profileData.headquarters || 'No Headquarters Provided'}</span>
//             </div>
//             <div className="ep-detail-row">
//               <span className="ep-icon">🏢</span>
//               <span className="ep-data-text">{profileData.industry || 'No Industry Provided'}</span>
//             </div>
//             <div className="ep-detail-row">
//               <span className="ep-icon">🏠</span>
//               <span className="ep-data-text">{profileData.address || 'No Address Provided'}</span>
//             </div>
//           </div>
//         </div>
//         <div className="ep-detail-block ep-full-width">
//           <h3 className="ep-block-heading">About the Company</h3>
//           <div className="ep-detail-row">
//             <span className="ep-description-text">{profileData.about || 'No description provided'}</span>
//           </div>
//         </div>
//       </div>
//       {isEditModalOpen && (
//         <EditEmployerProfileModal
//           profileData={profileData}
//           onClose={() => setIsEditModalOpen(false)}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// }

// export default EmployerProfileView;




import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import logo from '../../assets/logo.jpg';
import SideBar from './SideBar';
import EditEmployerProfileModal from './EditEmployerProfileModal';
import '../../Styles/EmpProfile.css';

function EmployerProfileView() {
  const baseURL = "http://127.0.0.1:8000/";
  const token = localStorage.getItem('access');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Utility function to properly construct image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return logo;
    if (imagePath.startsWith('http')) return imagePath;
    return `${baseURL}${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  // Function to get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const csrfToken = getCookie('csrftoken');

  // Fetch profile data
  useEffect(() => {
    if (!token) {
      console.log("No access token found, redirecting to login");
      navigate('/'); // Redirect to login
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`${baseURL}api/empjob/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-CSRFToken': csrfToken,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (response.status === 200 && response.data?.data) {
          console.log('Full API Response:', response.data);
          const profile = response.data.data;
          
          setProfileData({
            ...profile,
            user_email: profile.user_email || '',
            phone: profile.phone || '',
            website_link: profile.website_link || '',
            headquarters: profile.headquarters || '',
            industry: profile.industry || '',
            address: profile.address || '',
            about: profile.about || ''
          });

          dispatch(set_user_basic_details({
            profile_pic: profile.profile_pic,
            name: profile.user_full_name,
            email: profile.user?.email || '',
            userId: profile.id
          }));

          localStorage.setItem('userId', profile.id);
          localStorage.setItem('userType', response.data.user_type);
          localStorage.setItem('profileCompleted', 'true');
        } else {
          setError('No profile data found in response');
          navigate('/employer/profile_creation/');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
        if (error.response?.status === 404) {
          navigate('/employer/profile_creation/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseURL, token, dispatch, navigate, csrfToken]);

  // Handle Edit Button Click
  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  // Handle Save After Editing
  const handleSave = async (updatedData) => {
    try {
      // // First update the profile data
      // const response = await axios.put(
      //   `${baseURL}api/account/employer/profile/update/`, 
      //   updatedData, 
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       'X-CSRFToken': csrfToken,
      //       Accept: 'application/json',
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );

      if (response.status === 200) {
        // Update local state and Redux
        setProfileData(updatedData);
        dispatch(set_user_basic_details({
          profile_pic: updatedData.profile_pic,
          name: updatedData.user_full_name,
          email: updatedData.user_email,
        }));

        

       
      } else {
        setError(`Failed to update profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating profile data:', error);
      setError(`Error updating profile: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading employer profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error loading employer profile: {error}</h3>
        <p>Please check the console for more details.</p>
        <button 
          onClick={() => navigate('/employer/profile_creation/')} 
          className="error-button"
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="ep-main-container">
      <SideBar />
      
      <div className="ep-content-wrapper">
        <div className="ep-header-section">
          <div className="ep-avatar-wrapper">
            <img
              src={getImageUrl(profileData.profile_pic)}
              alt="Employer Profile"
              className="ep-avatar-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = logo;
              }}
            />
          </div>
          <h2 className="ep-company-title">
            {profileData.user_full_name || 'Company Name Not Available'}
          </h2>
          <button onClick={handleEditClick} className="edit-profile-button">
            Edit Profile
          </button>
        </div>

        <div className="ep-info-row">
          <div className="ep-detail-block">
            <h3 className="ep-block-heading">Contact Information</h3>
            <div className="ep-detail-row">
              <span className="ep-icon">📧</span>
              <span className="ep-data-text">
                {profileData.user_email || 'No Email Provided'}
              </span>
            </div>
            <div className="ep-detail-row">
              <span className="ep-icon">📞</span>
              <span className="ep-data-text">
                {profileData.phone || 'No Phone Provided'}
              </span>
            </div>
            <div className="ep-detail-row">
              <span className="ep-icon">🌐</span>
              <span className="ep-data-text">
                {profileData.website_link ? (
                  <a 
                    href={profileData.website_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="ep-external-link"
                  >
                    {profileData.website_link}
                  </a>
                ) : (
                  'No Website Provided'
                )}
              </span>
            </div>
          </div>

          <div className="ep-detail-block">
            <h3 className="ep-block-heading">Company Information</h3>
            <div className="ep-detail-row">
              <span className="ep-icon">📍</span>
              <span className="ep-data-text">
                {profileData.headquarters || 'No Headquarters Provided'}
              </span>
            </div>
            <div className="ep-detail-row">
              <span className="ep-icon">🏢</span>
              <span className="ep-data-text">
                {profileData.industry || 'No Industry Provided'}
              </span>
            </div>
            <div className="ep-detail-row">
              <span className="ep-icon">🏠</span>
              <span className="ep-data-text">
                {profileData.address || 'No Address Provided'}
              </span>
            </div>
          </div>
        </div>

        <div className="ep-detail-block ep-full-width">
          <h3 className="ep-block-heading">About the Company</h3>
          <div className="ep-detail-row">
            <span className="ep-description-text">
              {profileData.about || 'No description provided'}
            </span>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditEmployerProfileModal
          profileData={profileData}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default EmployerProfileView;