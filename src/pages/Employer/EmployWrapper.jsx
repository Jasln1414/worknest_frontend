import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import EmpHome from './EmployerHome';
import EmployerHeader from './EmployerHeader';
import { useDispatch, useSelector } from 'react-redux';
import isAuthUser from '../../utils/isAuthUser';
import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import axios from 'axios';
import EmpProfileCreation from './EmployerProfile';
import PostJob from './PostJob';
import EmployerProfileView from './EmpProfileView';
import JobDetail from './job/jobdetail';
import Applications from './job/AppliedJobs';
import SubscriptionPlans from '../../Components/Subscription/SubscriptionPlans';
import Schedules from '../../Components/Interview/EmployerInterviewSchedule';
import { message } from 'antd';

// Custom ProtectedRoute component
const ProtectedRoute = ({ element, isProfileComplete }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isProfileComplete) {
      message.info({
        content: 'Please complete your profile to access this feature.',
        duration: 3,
      });
      navigate('/employer/profile_creation');
    }
  }, [isProfileComplete, navigate]);

  return isProfileComplete ? element : null;
};

function EmployerWrapper() {
  const navigate = useNavigate();
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const dispatch = useDispatch();
  const authentication_user = useSelector((state) => state.authentication_user);

  const checkAuth = async () => {
    const isAuthenticated = await isAuthUser();
    if (isAuthenticated.name) {
      try {
        const response = await axios.get(`${baseURL}/api/account/user/details`, {
          headers: {
            authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 200) {
          dispatch(
            set_Authentication({
              name: response.data.data.full_name,
              userid: response.data.user_data.id,
              email: response.data.data.email,
              companyName: response.data.data.companyName || null,
              isAuthenticated: true,
              isAdmin: response.data.data.isAdmin || false,
              usertype: response.data.data.usertype,
              profile_completed: response.data.user_data.profile_completed || !!response.data.data.companyName, // Fallback to companyName
            })
          );
          dispatch(
            set_user_basic_details({
              name: response.data.data.full_name,
              email: response.data.data.email,
              phone: response.data.user_data.phone || null,
              profile_pic: response.data.user_data.profile_pic || null,
              user_type_id: response.data.user_data.id,
            })
          );
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    checkAuth();
  }, [authentication_user]);

  const isProfileComplete = authentication_user.profile_completed;

  return (
    <div>
      <EmployerHeader />
      <Routes>
        <Route path="/EmpHome" element={<EmpHome />} />
        <Route path="/profile_creation" element={<EmpProfileCreation />} />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<EmployerProfileView />} isProfileComplete={isProfileComplete} />}
        />
        <Route
          path="/postjob"
          element={<ProtectedRoute element={<PostJob />} isProfileComplete={isProfileComplete} />}
        />
        <Route
          path="/jobdetail/:jobId"
          element={<ProtectedRoute element={<JobDetail />} isProfileComplete={isProfileComplete} />}
        />
        <Route
          path="/applications"
          element={<ProtectedRoute element={<Applications />} isProfileComplete={isProfileComplete} />}
        />
        <Route
          path="/shedules"
          element={<ProtectedRoute element={<Schedules />} isProfileComplete={isProfileComplete} />}
        />
        <Route
          path="/subscriptions"
          element={<ProtectedRoute element={<SubscriptionPlans />} isProfileComplete={isProfileComplete} />}
        />
      </Routes>
    </div>
  );
}

export default EmployerWrapper;