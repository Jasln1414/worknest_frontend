import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import ProfilepicModal from './ProfilepicModal';
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';

import '../../Styles/EmpHome.css';
import { useDispatch } from 'react-redux';

function EditEmployerProfileModal({ profileData, onClose, onSave }) {
  const baseURL = 'http://127.0.0.1:8000';
  const token = localStorage.getItem('access');
  const [profile_pic, setProfilepic] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [modal, setModal] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const [imgError, setImgError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ProfileData,setProfileData]=useState({})
  const [csrfToken, setCsrfToken] = useState('');
  const dispatch=useDispatch()

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await axios.get(`${baseURL}/get-csrf-token/`, { withCredentials: true });
        const csrf = document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrftoken='))
          ?.split('=')[1];
        setCsrfToken(csrf || response.data.csrfToken || '');
        console.log('EditProfile - Fetched CSRF Token:', csrf);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    getCsrfToken();
  }, []);

  useEffect(() => {
    if (profileData.profile_pic) {
      setCroppedImageUrl(
        profileData.profile_pic.startsWith('http')
          ? profileData.profile_pic
          : `${baseURL}${profileData.profile_pic}`
      );
    }
  }, [profileData.profile_pic, baseURL]);

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
      if (!base64String || !base64String.startsWith('data:image')) {
        return;
      }
      const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
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

  const ProfileEditValidationSchema = Yup.object().shape({
    phone: Yup.string()
      .matches(/^[0-9]+$/, 'Phone number must be digits only')
      .min(10, 'Phone number must be at least 10 digits')
      .required('Phone number is required'),
    website_link: Yup.string().url('Enter a valid URL').required('Website link is required'),
    headquarters: Yup.string().required('Headquarters location is required'),
    industry: Yup.string().required('Industry type is required'),
    address: Yup.string().required('Address is required'),
    about: Yup.string()
      .required('Company description is required')
      .min(50, 'Description should be at least 50 characters'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
  setIsSubmitting(true);

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
    console.log('EditProfile - Token:', token ? 'Present' : 'Missing');
    console.log('EditProfile - CSRF Token:', csrfToken);
    console.log('Sending Profile Update:', Object.fromEntries(formData));

    const response = await axios.put(
      `${baseURL}/api/account/employer/profile/update/`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken || '',
        },
        withCredentials: true,
      }
    );

    console.log('Profile Update Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated',
        text: 'Your profile has been successfully updated.',
      });

      localStorage.setItem('profileCompleted', 'true');

      // Redux + local state update
      const updatedData = {
        ...values,
        profile_pic: response.data.data?.profile_pic || croppedImageUrl,
        user_full_name: profileData.user_full_name,
        user_email: profileData.user_email,
        completed: true,
      };

      setProfileData(updatedData); // update local state
      dispatch(set_user_basic_details({
        profile_pic: updatedData.profile_pic,
        name: updatedData.user_full_name,
        email: updatedData.user_email,
      }));

      // onSave(updatedData); // trigger parent update
      onClose(); // close the modal/drawer
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    let errorMessage = 'Failed to update profile.';
    if (error.response) {
      console.error('Backend error:', error.response.data, 'Status:', error.response.status);
      errorMessage = error.response.data.message || errorMessage;

      if (error.response.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        errorMessage = 'Permission denied. Invalid CSRF token or session.';
      }
    } else {
      errorMessage = error.message.includes('Network Error')
        ? 'Network error. Please check your connection.'
        : error.message;
    }

    Swal.fire({
      icon: 'error',
      title: 'Profile Update Failed',
      text: errorMessage,
    });
  } finally {
    setIsSubmitting(false);
    setSubmitting(false);
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Edit Company Profile</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <Formik
            initialValues={{
              phone: profileData.phone || '',
              website_link: profileData.website_link || '',
              headquarters: profileData.headquarters || '',
              industry: profileData.industry || '',
              address: profileData.address || '',
              about: profileData.about || '',
            }}
            validationSchema={ProfileEditValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting: formikSubmitting }) => (
              <Form>
                <div className="form-fields-container">
                  <div className="form-row">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={profileData.user_full_name || ''}
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
                        value={profileData.user_email || ''}
                        className="form-input"
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <Field
                        type="text"
                        placeholder="Company Website"
                        name="website_link"
                        className={`form-input ${
                          errors.website_link && touched.website_link ? 'input-error' : ''
                        }`}
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
                        className={`form-input ${
                          errors.headquarters && touched.headquarters ? 'input-error' : ''
                        }`}
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
                      <label htmlFor="profile_pic" className="file-label">
                        Profile Image
                      </label>
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
                  <div className="form-actions">
                    <button type="button" onClick={onClose} className="cancel-button">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || formikSubmitting}
                      className="submit-button"
                    >
                      {isSubmitting || formikSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {modal && (
        <ProfilepicModal
          setCroppedImageUrl={setCroppedImageUrl}
          setImageUrl={setImageUrl}
          setImgError={setImgError}
          imageUrl={imageUrl}
          closeModal={() => setModal(false)}
          onCropSubmit={handleCropSubmit}
        />
      )}
    </div>
  );
}

export default EditEmployerProfileModal;