// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { set_Authentication } from "../../Redux/Authentication/authenticationSlice";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";
// import "../../Styles/Login.css";
// import { EmployerLoginApi } from "../../Api/Employer_Api/Employer_Auth_Api";
// import { GoogleLogin } from '@react-oauth/google';
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import ForgotPasswordPage from "../../pages/comon/ForgotPassword";

// const LoginModal = ({ isOpen, onClose, switchToSignup }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [formError, setFormError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const handleBackToLogin = () => {
//     setShowForgotPasswordModal(false);
//   };

//   const openForgotPasswordModal = () => {
//     setShowForgotPasswordModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Reset previous errors
//     setFormError("");
//     setIsSubmitting(true);

//     const formData = new FormData();
//     formData.append("email", email);
//     formData.append("password", password);

//     try {
//       const response = await EmployerLoginApi(formData, dispatch, set_Authentication, navigate);

//       // If the API call fails, this will throw an error
//       if (!response.success) {
//         throw new Error(response.message || "Login failed");
//       }

//       // Check if the employer is verified
//       if (!response.data.is_verified) {
//         // Show SweetAlert2 message if the employer is not verified
//         Swal.fire({
//           icon: 'warning',
//           title: 'Account Not Verified',
//           text: 'Your account is not verified by the admin. Please wait for verification.',
//           confirmButtonText: 'OK',
//         });

//         // Clear the form fields
//         setEmail("");
//         setPassword("");
//         return; // Stop further execution
//       }

//       // Debugging: Log the user_data.completed value
//       console.log("User data completed:", response.data?.user_data?.completed);

//       // If the employer is verified, proceed with login
//       toast.success("Login successful!");

//       // Add an extra layer of protection with optional chaining
//       if (response.data?.user_data?.completed === false) {
//         navigate('/employer/profile_creation/');
//       } else {
//         navigate('/employer/EmpHome/');
//       }
//     } catch (error) {
//       // Handle different types of errors
//       const errorMessage = error.response?.data?.message || 
//                            error.message || 
//                            "An unexpected error occurred";

//       // Set form error to display to user
//       setFormError(errorMessage);

//       // Clear the form fields
//       setEmail("");
//       setPassword("");
//     } finally {
//       // Always reset submitting state
//       setIsSubmitting(false);
//     }
//   };

//   const GoogleTestlogin = async (userDetails) => {
//     console.log("userDetails after login", userDetails);
//     const formData = {
//       client_id: userDetails,
//     };
//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/account/auth/employer/', formData);
//       console.log("auth response ", response);

//       if (response.status === 200) {
//         localStorage.setItem('access', response.data.access_token);
//         localStorage.setItem('refresh', response.data.refresh_token);

//         dispatch(
//           set_Authentication({
//             name: jwtDecode(response.data.access_token).name,
//             email: response.data.email,
//             isAuthenticated: true,
//             isAdmin: response.data.isAdmin,
//             usertype: response.data.usertype,
//           })
//         );

//         toast.success('Login successful!', {
//           position: "top-center",
//         });

//         // Debugging: Log the user_data.completed value
//         console.log("User data completed:", response.data?.user_data?.completed);

//         // Add an extra layer of protection with optional chaining
//         if (response.data?.user_data?.completed === false) {
//           navigate('/employer/profile_creation/');
//         } else {
//           navigate('/employer/EmpHome/');
//         }
//       } else {
//         console.log("response...............................", response);
//         setFormError(response.data.message);
//       }
//     } catch (error) {
//       console.error("Google login error:", error.response?.data || error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Login Failed',
//         text: error.response?.data?.detail || 'You have to be approved by admin.',
//       });
//     }
//   };

//   if (!isOpen) return null;
  
//   if (showForgotPasswordModal) {
//     return (
//       <ForgotPasswordPage
//         isOpen={true} 
//         onClose={() => setShowForgotPasswordModal(false)}
//         onBackToLogin={handleBackToLogin}
//         userType="employer"  // Add this line to specify user type
//       />
//     );
//   }

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <button className="close-icon" onClick={onClose}>
//           ×
//         </button>

//         <h2>Employer Sign In</h2>

//         {formError && <div className="error-message">{formError}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <input 
//               type="email"
//               placeholder="Enter your email id"
//               value={email}
//               onChange={(e) => {
//                 setEmail(e.target.value);
//                 setFormError(""); // Clear error when user starts typing
//               }}
//               required
//               autoComplete="username"
//               disabled={isSubmitting}
//             />
//           </div>
                 
//           <div className="input-group">
//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 setFormError(""); // Clear error when user starts typing
//               }}
//               required
//               autoComplete="current-password"
//               disabled={isSubmitting}
//             />
//           </div>

//           <div className="button-group">
//             <button 
//               type="submit" 
//               className="submit-btn" 
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Signing In..." : "Sign In"}
//             </button>
//           </div>

//           <div className="text-right mt-1">
//             <a 
//               href="#" 
//               onClick={(e) => {
//                 e.preventDefault();
//                 openForgotPasswordModal();
//               }}
//               className="text-blue-600 text-sm hover:underline"
//             >
//               Forgot Password?
//             </a>
//           </div>
//           <br></br>
//           <div className="text-gray-700">
           
//             <button type="button" onClick={switchToSignup}>
//               Don't have an account?{" "} Sign Up
//             </button>
//           </div>

//           <div className='flex justify-center'>
//             <GoogleLogin
//               onSuccess={credentialResponse => {
//                 GoogleTestlogin(credentialResponse.credential);
//               }}
//               onError={() => {
//                 console.log('Login Failed');
//               }}
//             />
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginModal;





import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { set_user_basic_details } from '../../Redux/UserDetails/userBasicDetailsSlice';
import { set_Authentication } from "../../Redux/Authentication/authenticationSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import "../../Styles/Login.css";
import { EmployerLoginApi } from "../../Api/Employer_Api/Employer_Auth_Api";
import { GoogleLogin } from '@react-oauth/google';
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ForgotPasswordPage from "../../pages/comon/ForgotPassword";

const LoginModal = ({ isOpen, onClose, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const baseURL = 'http://127.0.0.1:8000';

  const handleBackToLogin = () => {
    setShowForgotPasswordModal(false);
  };

  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await EmployerLoginApi(formData, dispatch, set_Authentication, navigate);

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      if (!response.data.is_verified) {
        Swal.fire({
          icon: 'warning',
          title: 'Account Not Verified',
          text: 'Your account is not verified by the admin. Please wait for verification.',
          confirmButtonText: 'OK',
        });

        setEmail("");
        setPassword("");
        return;
      }

      console.log("Regular login - User data completed:", response.data?.user_data?.completed);

      toast.success("Login successful!");

      if (response.data?.user_data?.completed === false) {
        navigate('/employer/profile_creation/');
      } else {
        navigate('/employer/EmpHome/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                           error.message || 
                           "An unexpected error occurred";
      setFormError(errorMessage);
      setEmail("");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const GoogleTestlogin = async (credential) => {
    console.log("Google client_id sent:", credential);
    if (!credential) {
      console.error("No Google credential provided");
      setFormError("Google login failed: No credential received.");
      Swal.fire({
        icon: 'error',
        title: 'Google Login Failed',
        text: 'No credential received from Google. Please try again.',
      });
      return;
    }

    try {
      // Clear stale localStorage to avoid conflicts
      localStorage.removeItem('profileCompleted');
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('profilePic');

      // Send Google JWT with 'client_id'
      const response = await axios.post(`${baseURL}/api/account/auth/employer/`, {
        client_id: credential,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Google auth response:", response.data);

      if (response.status === 200) {
        const { access_token, refresh_token, user_data, email, name, user_id, isAdmin, user_type } = response.data;

        if (!access_token || !refresh_token) {
          throw new Error("Missing authentication tokens");
        }

        // Store tokens
        localStorage.setItem('access', access_token);
        localStorage.setItem('refresh', refresh_token);

        // Decode the access token
        const decodedToken = jwtDecode(access_token);

        // Normalize profile picture URL
        let profilePic = null;
        if (user_data?.profile_pic) {
          profilePic = user_data.profile_pic.startsWith('http')
            ? user_data.profile_pic
            : `${baseURL}${user_data.profile_pic.startsWith('/') ? '' : '/'}${user_data.profile_pic}`;
        }

        // Prepare authentication payload
        const authPayload = {
          name: decodedToken.name || name || 'Unknown',
          email: email,
          isAuthenticated: true,
          isAdmin: isAdmin || false,
          usertype: user_type || 'employer',
          profilePic: profilePic,
          id: decodedToken.user_id || user_id,
          user_type_id: user_data?.id,
          profileCompleted: user_data?.completed ?? false,
        };

        // Prepare user details payload
        const userDetailsPayload = {
          name: decodedToken.name || name || 'Unknown',
          email: email,
          phone: user_data?.phone || null,
          profile_pic: profilePic,
          user_type_id: user_data?.id,
        };

        // Update Redux store
        dispatch(set_Authentication(authPayload));
        dispatch(set_user_basic_details(userDetailsPayload));

        if (profilePic) {
          localStorage.setItem('profilePic', profilePic);
        }

        // Log profile completion status
        console.log("Google login - User data completed:", user_data?.completed);

        // Navigate based on profile completion
        if (user_data?.completed !== true) {
          console.log("Navigating to profile creation");
          navigate('/employer/profile_creation/');
        } else {
          console.log("Navigating to employer home");
          navigate('/employer/EmpHome/');
        }

        toast.success('Google login successful!', {
          position: "top-center",
        });
      } else {
        throw new Error(response.data.error || "Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error.response?.data || error.message);
      let errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred during Google login.';

      // Handle 403 "not yet approved" case
      if (error.response?.status === 403 && errorMessage.includes("not yet approved")) {
        Swal.fire({
          icon: 'warning',
          title: 'Approval Pending',
          text: 'Your account is awaiting admin approval. Please try again later or contact support.',
          confirmButtonText: 'OK',
        });
      } else {
        setFormError(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Google Login Failed',
          text: errorMessage,
        });
      }
    }
  };

  if (!isOpen) return null;
  
  if (showForgotPasswordModal) {
    return (
      <ForgotPasswordPage
        isOpen={true} 
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={handleBackToLogin}
        userType="employer"
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-icon" onClick={onClose}>
          ×
        </button>

        <h2>Employer Sign In</h2>

        {formError && <div className="error-message">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input 
              type="email"
              placeholder="Enter your email id"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFormError("");
              }}
              required
              autoComplete="username"
              disabled={isSubmitting}
            />
          </div>
                 
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFormError("");
              }}
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="text-right mt-1">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                openForgotPasswordModal();
              }}
              className="text-blue-600 text-sm hover:underline"
            >
              Forgot Password?
            </a>
          </div>
          <br />
          <div className="text-gray-700">
            <button type="button" onClick={switchToSignup}>
              Don't have an account? Sign Up
            </button>
          </div>

          <div className='flex justify-center'>
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                console.log("GoogleLogin onSuccess:", credentialResponse);
                GoogleTestlogin(credentialResponse.credential);
              }}
              onError={() => {
                console.log('Google Login Failed');
                setFormError('Google login failed.');
                Swal.fire({
                  icon: 'error',
                  title: 'Google Login Failed',
                  text: 'Unable to authenticate with Google. Please try again.',
                });
              }}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;