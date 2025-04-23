
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CandidateHeader from './CandidateHeader';
import CandidateHome from './FindJob';
import ProfileCreation from './CandidateProfileCreation';
import Profile from './ProfileView';
import JobDetail from './Job/CandidateJobDeatail';
import ApplyedJob from './Job/ApplyJob';
import SavedJobs from './Job/SavedJobs';
import SheduledInterviews from '../../Components/Interview/CandiInterviewSchedule';
//import Message from './Message/Message';

function CandidateWrapper() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authentication_user);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token || !authentication_user.isAuthenticated) {
      navigate('/');
    }
  }, [authentication_user.isAuthenticated, navigate]);

  return (
    <div>
      <CandidateHeader />
      <Routes>
        <Route index element={<CandidateHome />} />
        <Route path="find-job" element={<CandidateHome />} />
        <Route path="/find-job/job/:jobId" element={<JobDetail />} />
        <Route path="/applyedjobs" element={<ApplyedJob />} />
        <Route path="/savedjobs" element={<SavedJobs />} />
        <Route path='/shedules' element={<SheduledInterviews/>}></Route>
        {/* <Route path="/messages" element={<Message />} /> */}
        <Route
          path="profile-creation"
          element={
            authentication_user.isAuthenticated ? (
              <ProfileCreation />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="profile"
          element={
            authentication_user.isAuthenticated ? (
              <Profile />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            <div>
              <h1>404 - Candidate Page Not Found</h1>
              <p>The candidate page you are looking for does not exist.</p>
              <button onClick={() => navigate('/candidate')}>
                Go to Candidate Home
              </button>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default CandidateWrapper;

// import React, { useEffect } from 'react';
// import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import CandidateHeader from './CandidateHeader';
// import CandidateHome from './FindJob';
// import ProfileCreation from './CandidateProfileCreation';
// import Profile from './ProfileView';
// import JobDetail from './Job/CandidateJobDeatail';
// import ApplyedJob from './Job/ApplyJob';
// import SavedJobs from './Job/SavedJobs';
// import axios from 'axios';
// import ScheduledInterviews from '../../Components/Interview/CandiInterviewSchedule';
// import Footer from '../../Components/Footer';
// import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
// import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
// import isAuthUser from '../../utils/isAuthUser';

// function CandidateWrapper() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const baseURL = 'http://127.0.0.1:8000';
  
//   // Add safe default values
//   const { isAuthenticated } = useSelector(
//     (state) => state.authentication_user || {}
//   );

//   const checkAuth = async () => {
//     try {
//       const token = localStorage.getItem('access');
//       const isAuth = await isAuthUser();

//       if (!isAuth || !token) {
//         navigate('/');
//         return;
//       }

//       const response = await axios.get(`${baseURL}/api/account/user/details`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Accept': 'application/json',
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.status === 200) {
//         dispatch(set_Authentication({
//           name: response.data.data.full_name,
//           email: response.data.data.email,
//           isAuthenticated: true,
//           usertype: response.data.data.usertype,
//         }));

//         dispatch(set_user_basic_details({
//           profile_pic: response.data.user_data.profile_pic
//         }));
//       }
//     } catch (error) {
//       console.error('Authentication error:', error);
//       localStorage.removeItem('access');
//       navigate('/');
//     }
//   };

//   useEffect(() => {
//     const verifyAuth = async () => {
//       await checkAuth();
      
//       const interval = setInterval(async () => {
//         const isValid = await isAuthUser();
//         if (!isValid) {
//           clearInterval(interval);
//           navigate('/');
//         }
//       }, 300000);

//       return () => clearInterval(interval);
//     };

//     verifyAuth();
//   }, [navigate, dispatch]);

//   // Loading state
//   if (isAuthenticated === undefined) {
//     return <div>Loading authentication...</div>;
//   }

//   return (
//     <div>
//       <CandidateHeader />
//       <Routes>
//         <Route index element={<CandidateHome />} />
//         <Route path="find-job" element={<CandidateHome />} />
//         <Route path="/find-job/job/:jobId" element={<JobDetail />} />
//         <Route path="/applied-jobs" element={<ApplyedJob />} />
//         <Route path="/saved-jobs" element={<SavedJobs />} />
//         <Route path="/schedules" element={<ScheduledInterviews />} />

//         <Route
//           path="profile-creation"
//           element={isAuthenticated ? <ProfileCreation /> : <Navigate to="/" replace />}
//         />
        
//         <Route
//           path="profile"
//           element={isAuthenticated ? <Profile /> : <Navigate to="/" replace />}
//         />
        
//         <Route
//           path="*"
//           element={
//             <div>
//               <h1>404 - Candidate Page Not Found</h1>
//               <p>The candidate page you are looking for does not exist.</p>
//               <button onClick={() => navigate('/candidate')}>
//                 Go to Candidate Home
//               </button>
//             </div>
//           }
//         />
//       </Routes>
//       <Footer />
//     </div>
//   );
// }

// export default CandidateWrapper;