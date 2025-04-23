
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import { set_Authentication } from '../../Redux/Authentication/authenticationSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { ProfileValidationSchema, initialValues } from '../../validation/EmpProfile';
import ProfilepicModal from './ProfilepicModal';
import Swal from 'sweetalert2';
import '../../assets/Employer/profile.css';

function EmpProfileCreation() {
  const baseURL = "http://127.0.0.1:8000";
  const token = localStorage.getItem('access');
  const authentication_user = useSelector((state) => state.authentication_user || { name: "", email: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profile_pic, setProfilepic] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [modal, setModal] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-csrf-token/`, { withCredentials: true });
        const csrf = document.cookie
          .split('; ')
          .find(row => row.startsWith('csrftoken='))
          ?.split('=')[1];
        setCsrfToken(csrf || response.data.csrfToken || '');
        console.log('Fetched CSRF Token:', csrf);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    getCsrfToken();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result);
      };
      setModal(true);
      reader.readAsDataURL(file);
    }
  };

  const handleCropSubmit = (croppedUrl) => {
    setCroppedImageUrl(croppedUrl);
    setModal(false);
  };

  useEffect(() => {
    const convertBase64ToImage = (base64String) => {
      const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
      if (!base64Pattern.test(base64String)) {
        return;
      }
      const base64Content = base64String.replace(base64Pattern, '');
      const binaryString = window.atob(base64Content);
      const length = binaryString.length;
      const byteArray = new Uint8Array(length);
      for (let i = 0; i < length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: 'image/png' });
      const file = new File([blob], 'profile_pic.png', { type: 'image/png' });
      setProfilepic(file);
    };
    convertBase64ToImage(croppedImageUrl);
  }, [croppedImageUrl]);

  const updateUserDetails = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/account/user/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.status === 200) {
        console.log('Updated user details:', response.data);
        dispatch(
          set_Authentication({
            ...authentication_user,
            name: response.data.data.name,
            email: response.data.data.email,
            isAuthenticated: true,
            isAdmin: response.data.data.isAdmin || false,
            usertype: 'employer',
            id: response.data.data.user_id,
            profileCompleted: response.data.user_data.completed
          })
        );
        dispatch(
          set_user_basic_details({
            name: response.data.user_data.name,
            email: response.data.user_data.email,
            phone: response.data.user_data.phone,
            profile_pic: response.data.user_data.profile_pic,
            user_type_id: response.data.user_data.id
          })
        );
        localStorage.setItem('profileCompleted', response.data.user_data.completed.toString());
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('phone', values.phone || '');
    formData.append('website_link', values.website_link || '');
    formData.append('headquarters', values.headquarters || '');
    formData.append('industry', values.industry || '');
    formData.append('address', values.address || '');
    formData.append('about', values.about || '');
    formData.append('completed', 'true');
    if (profile_pic instanceof File) {
      formData.append('profile_pic', profile_pic);
    }

    try {
      console.log('Profile Creation - Token:', token ? 'Present' : 'Missing');
      console.log('Profile Creation - CSRF Token:', csrfToken);
      console.log('Sending Profile Creation:', Object.fromEntries(formData));

      const response = await axios.put(`${baseURL}/api/account/employer/profile/update/`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken || '',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log('Profile Creation Response:', response.data);
        dispatch(
          set_Authentication({
            ...authentication_user,
            profileCompleted: true,
          })
        );
        dispatch(
          set_user_basic_details({
            profile_pic: response.data.data?.profile_pic || '',
            phone: values.phone,
            email: authentication_user.email,
            name: authentication_user.name,
            user_type_id: response.data.data?.id
          })
        );
        localStorage.setItem('profileCompleted', 'true');
        await updateUserDetails();
        await Swal.fire({
          icon: 'success',
          title: 'Profile Created!',
          text: 'Your company profile has been successfully created.',
          confirmButtonColor: '#1E3A8A',
        });
        navigate('/employer/EmpHome/');
      }
    } catch (error) {
      console.error('Profile Creation Error:', error);
      let errorMessage = 'Failed to create profile.';
      if (error.response) {
        console.error('Backend error:', error.response.data, 'Status:', error.response.status);
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          navigate('/login');
        } else if (error.response.status === 403) {
          errorMessage = 'Permission denied. Invalid CSRF token or session.';
        }
      } else {
        errorMessage = error.message.includes('Network Error')
          ? 'Network error. Please check your connection.'
          : error.message;
      }
      await Swal.fire({
        icon: 'error',
        title: 'Profile Creation Failed',
        text: errorMessage,
        confirmButtonColor: '#1E3A8A',
      });
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Complete Company Profile</h3>
            <p className="sidebar-text">Unlock 500+ jobs from top companies and receive direct calls from HRs</p>
          </div>
          <div className="sidebar-content">
            <ul>{/* Sidebar content can go here */}</ul>
          </div>
        </div>
        <div className="main-content">
          <div className="form-container">
            <div className="form-header">
              <p className="form-title">About Company</p>
              <div className="form-body">
                <Formik
                  initialValues={initialValues}
                  validationSchema={ProfileValidationSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched, isSubmitting }) => (
                    <Form>
                      <div className="form-fields-container">
                        <div className="form-row">
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Company Name"
                              value={authentication_user.name || ''}
                              className="form-input"
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <Field
                              type="text"
                              placeholder="Mobile Number"
                              name="phone"
                              className={`form-input ${errors.phone && touched.phone ? 'input-error' : ''}`}
                            />
                            <ErrorMessage name="phone" component="div" className="error-message" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Email"
                              value={authentication_user.email || ''}
                              className="form-input"
                              readOnly
                            />
                          </div>
                          <div className="form-group">
                            <Field
                              type="text"
                              placeholder="Company Website"
                              name="website_link"
                              className={`form-input ${errors.website_link && touched.website_link ? 'input-error' : ''}`}
                            />
                            <ErrorMessage name="website_link" component="div" className="error-message" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <Field
                              type="text"
                              placeholder="Headquarters"
                              name="headquarters"
                              className={`form-input ${errors.headquarters && touched.headquarters ? 'input-error' : ''}`}
                            />
                            <ErrorMessage name="headquarters" component="div" className="error-message" />
                          </div>
                          <div className="form-group">
                            <Field
                              type="text"
                              placeholder="Industry Type"
                              name="industry"
                              className={`form-input ${errors.industry && touched.industry ? 'input-error' : ''}`}
                            />
                            <ErrorMessage name="industry" component="div" className="error-message" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group full-width">
                            <Field
                              as="textarea"
                              className={`form-textarea ${errors.about && touched.about ? 'input-error' : ''}`}
                              name="about"
                              rows="4"
                              placeholder="About the company"
                            />
                            <ErrorMessage name="about" component="div" className="error-message" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group full-width">
                            <Field
                              type="text"
                              placeholder="Address"
                              name="address"
                              className={`form-input ${errors.address && touched.address ? 'input-error' : ''}`}
                            />
                            <ErrorMessage name="address" component="div" className="error-message" />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group full-width">
                            <label htmlFor="profile_pic" className="file-label">Profile Image</label>
                            <input
                              type="file"
                              name="profile_pic"
                              onChange={handleImageChange}
                              className="file-input"
                            />
                          </div>
                        </div>
                        {croppedImageUrl && (
                          <div className="form-row">
                            <div className="image-preview">
                              <img src={croppedImageUrl} alt="Avatar" className="profile-image" />
                            </div>
                          </div>
                        )}
                        {modal && (
                          <ProfilepicModal
                            setCroppedImageUrl={setCroppedImageUrl}
                            setImageUrl={setImageUrl}
                            imageUrl={imageUrl}
                            closeModal={() => setModal(false)}
                            onCropSubmit={handleCropSubmit}
                          />
                        )}
                        <div className="form-actions">
                          <button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="submit-button"
                          >
                            {isLoading ? 'Submitting...' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpProfileCreation;