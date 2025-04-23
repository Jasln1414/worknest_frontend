// Employer_Auth_Api.js
import { BaseApi } from "../BaseApi";
import { toast } from "react-toastify";


export const EmployerSignupApi = async (formData) => {
  try {
    const response = await BaseApi.post("/api/account/employer/register/", formData);

    if (response.status === 200 || response.status === 201) {
      toast.success("Registration successful! OTP sent.");
      localStorage.setItem("email", formData.get("email"));
      return { success: true, data: response.data };
    } else {
      toast.error("Something went wrong. Please try again.");
      return { success: false };
    }
  } catch (error) {
    console.error("Signup error:", error);
    toast.error("An error occurred. Please try again later.");
    return { success: false };
  }
};

export const EmployerVerifyOtpApi = async (otpData) => {
  try {
    const response = await BaseApi.post("/api/account/verify-otp/", otpData);

    if (response.status === 200 || response.status === 201) {
     {/*toast.success("OTP verified successfully!");*/}
      return { success: true, data: response.data };
    } else {
      toast.error("Invalid OTP. Please try again.");
      return { success: false };
    }
  } catch (error) {
    if (error.response) {
      console.error("OTP verification error response:", error.response);
      toast.error(`Error: ${error.response.data.error || "An error occurred. Please try again."}`);
    } else {
      console.error("OTP verification error:", error);
      toast.error("An error occurred. Please try again.");
    }
    return { success: false };
  }
};

export const ResendOtpApi = async (data) => {
  try {
    const response = await BaseApi.post("/api/account/resend-otp/", data);
    
    if (response.status === 200 || response.status === 201) {
      {/*toast.success("OTP has been resent to your email.");*/}
      return { success: true, data: response.data };
    } else {
      toast.error("Failed to resend OTP. Please try again.");
      return { success: false };
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    toast.error("An error occurred. Please try again later.");
    return { success: false };
  }
};


import Swal from 'sweetalert2';
import {jwtDecode }from 'jwt-decode';
import axios from 'axios';

import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';









export const EmployerLoginApi = async (formData, dispatch, set_Authentication, navigate) => {
  const baseURL = 'http://127.0.0.1:8000';
  try {
    const response = await BaseApi.post('/api/account/Emplogin/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status === 200) {
      const { access_token, refresh_token, user_data } = response.data;

      if (!access_token || !refresh_token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Failed',
          text: 'Missing authentication tokens!',
        });
        return { success: false };
      }

      localStorage.setItem('access', access_token);
      localStorage.setItem('refresh', refresh_token);

      const decodedToken = jwtDecode(access_token);

      let profilePic = null;
      if (user_data?.profile_pic) {
        profilePic = user_data.profile_pic.startsWith('http')
          ? user_data.profile_pic
          : `${baseURL}${user_data.profile_pic.startsWith('/') ? '' : '/'}${user_data.profile_pic}`;
      }

      const authPayload = {
        name: decodedToken.name || 'Unknown',
        email: user_data.email,
        isAuthenticated: true,
        isAdmin: false,
        usertype: 'employer',
        profilePic: profilePic,
        id: decodedToken.user_id,
        profile_pic: profilePic,
        user_type_id: user_data.id,
        profileCompleted: user_data.completed,
      };

      const userDetailsPayload = {
        name: decodedToken.name || 'Unknown',
        email: user_data.email,
        phone: null,
        profile_pic: profilePic,
        user_type_id: user_data.id,
      };

      dispatch(set_Authentication(authPayload));
      dispatch(set_user_basic_details(userDetailsPayload));

      if (profilePic) {
        localStorage.setItem('profilePic', profilePic);
      }

      // Fetch updated user details
      try {
        const userResponse = await axios.get(`${baseURL}/api/account/user/details`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (userResponse.status === 200) {
          dispatch(
            set_user_basic_details({
              ...userDetailsPayload,
              phone: userResponse.data.user_data.phone || null,
              name: userResponse.data.user_data.name || decodedToken.name,
            })
          );
        }
      } catch (error) {
        dispatch(set_user_basic_details(userDetailsPayload));
      }

      const isProfileCompleted = user_data.completed ?? true;
      localStorage.setItem('profileCompleted', isProfileCompleted.toString());

      navigate(!isProfileCompleted 
        ? '/employer/profile_creation/' 
        : '/employer/EmpHome/'
      );

      return { success: true };
    }
  } catch (error) {
    console.error('Login Error:', error);
    const errorMessage = error.response?.status === 403
      ? 'Your employer account needs admin approval.'
      : error.response?.data?.detail || error.message || 'Login failed.';

    Swal.fire({
      icon: 'error',
      title: error.response?.status === 403 
        ? 'Account Not Approved' 
        : 'Login Failed',
      text: errorMessage,
    });

    return { success: false };
  }
};


















export const UserVerifyOtpApi = async (otpData) => {
  try {
    const response = await BaseApi.post("/api/account/verify-otp/", otpData);

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      toast.error("Invalid OTP. Please try again.");
      return { success: false };
    }
  } catch (error) {
    if (error.response) {
      console.error("OTP verification error response:", error.response);
      toast.error(`Error: ${error.response.data.error || "An error occurred. Please try again."}`);
    } else {
      console.error("OTP verification error:", error);
      toast.error("An error occurred. Please try again.");
    }
    return { success: false };
  }
};

export const UserResendOtpApi = async (data) => {
  try {
    const response = await BaseApi.post("/api/account/resend-otp/", data);

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      toast.error("Failed to resend OTP. Please try again.");
      return { success: false };
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    toast.error("An error occurred. Please try again later.");
    return { success: false };
  }
};