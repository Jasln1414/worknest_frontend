// import React, { useState } from "react";
// import axios from "axios";
// import { useDispatch } from "react-redux";
// import { set_Authentication } from "../../Redux/Authentication/authenticationSlice";
// import { set_user_basic_details } from "../../Redux/UserDetails/userBasicDetailsSlice";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import { Formik, Field, Form, ErrorMessage } from "formik";
// import { toast } from "react-toastify";
// import { LoginSchema, initialValues } from "../../validation/LoginValidation";
// import "../../Styles/Candidate/CandidateLogin.css";
// import { GoogleLogin } from '@react-oauth/google';
// import ForgotPasswordPage from "../../pages/comon/ForgotPassword";


// function CandidateLogin({ isOpen, onClose, switchToSignup }) {
//   const [formError, setFormError] = useState("");
//   const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const baseURL = "http://127.0.0.1:8000";

//   const handleLoginSubmit = async (values, { setSubmitting }) => {
//     const formData = new FormData();
//     formData.append("email", values.email);
//     formData.append("password", values.password);

//     try {
//       const response = await axios.post(`${baseURL}/api/account/candidatelogin/`, formData);
//       console.log("Login Response:", response);
//       console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@.................user id.............", response.data);

//       if (response.status === 200) {
//         // Save tokens to localStorage
//         localStorage.setItem("access", response.data.access_token);
//         localStorage.setItem("refresh", response.data.refresh_token);
//         localStorage.setItem("user_id", response.data.user_id);
        

//         // Decode the token
//         const decodedToken = jwtDecode(response.data.access_token);

//         // Update Redux store
//         dispatch(
//           set_Authentication({
//             name: decodedToken.name,
//             email: response.data.email,
//             userid: response.data.user_id,
//             isAuthenticated: true,
//             isAdmin: response.data.isAdmin,
//             usertype: response.data.usertype,
//           })
//         );

//         dispatch(
//           set_user_basic_details({
//             profile_pic: response.data.user_data.profile_pic,
//             user_type_id: response.data.user_data.id,
//           })
//         );

//         // Show success toast
//         toast.success("Login successful!", {
//           position: "top-center",
//         });

//         // Close the modal
//         onClose();

//         // Navigate based on profile completion status
//         if (response.data.user_data.completed === false) {
//           navigate("/candidate/profile-creation");
//         } else {
//           navigate("/candidate/find-job");
//         }
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//       setFormError(error.response?.data?.message || "Login failed. Please try again.");
//       toast.error("Login failed. Please check your credentials.", {
//         position: "top-center",
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const openForgotPasswordModal = () => {
//     setShowForgotPasswordModal(true);
//   };

//   const handleBackToLogin = () => {
//     setShowForgotPasswordModal(false);
//   };

//   const handleBackgroundClick = (e) => {
//     if (e.target.className === "candidate-login-overlay") {
//       onClose();
//     }
//   };

//   if (!isOpen) return null;
  
//   // If forgot password modal is open, render the ForgotPasswordPage component
//   if (showForgotPasswordModal) {
//     return (
//       <ForgotPasswordPage
//         isOpen={true} 
//         onClose={() => setShowForgotPasswordModal(false)}
//         onBackToLogin={handleBackToLogin}
//         userType="candidate"  // Add this line to specify user type
//       />
//     );
//   }

//   const GoogleTestlogin = async (userDetails) => {
//     console.log("userDetails after login", userDetails);
//     const formData = {
//       client_id: userDetails,
//     };
//     try {
//       const response = await axios.post(baseURL + '/api/account/auth/candidate/', formData);
//       console.log("auth response ", response);

//        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@.................user id.............", response.data);
//       if (response.status === 200) {
//         localStorage.setItem('access', response.data.access_token);
//         localStorage.setItem('refresh', response.data.refresh_token);
//         localStorage.setItem("user_id", response.data.user_id);

//         dispatch(
//           set_Authentication({
//             name: jwtDecode(response.data.access_token).name,
//             email: response.data.email,
//             userid: response.data.user_id,
//             isAuthenticated: true,
//             isAdmin: response.data.isAdmin,
//             usertype: response.data.usertype,
//           })
//         );
//         dispatch(
//           set_user_basic_details({
//             profile_pic: response.data.user_data.profile_pic,
//             user_type_id: response.data.user_data.id,
//           })
//         );
//         toast.success('Login successful!', {
//           position: "top-center",
//         });
//         if (response.data.user_data.completed === false) {
//           navigate("/candidate/profile-creation");
//         } else {
//           navigate("/candidate/find-job");
//         }
//       } else {
//         console.log("response...............................", response);
//         setFormError(response.data.message);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div className="candidate-login-overlay" onClick={handleBackgroundClick}>
//       <div className="candidate-login-content" onClick={(e) => e.stopPropagation()}>
//         <button className="candidate-login-close-icon" onClick={onClose} aria-label="Close">
//           &times;
//         </button>
//         <div className="candidate-login-form">
//           <Formik
//             initialValues={initialValues}
//             validationSchema={LoginSchema}
//             onSubmit={handleLoginSubmit}
//           >
//             {({ errors, touched, isSubmitting }) => (
//               <Form>
//                 <h3 className="candidate-login-title">Candidate Sign In</h3>
//                 <div className="candidate-form-group">
//                   <label htmlFor="email" className="candidate-sr-only">Email</label>
//                   <Field
//                     id="email"
//                     type="email"
//                     name="email"
//                     placeholder="Enter your email id"
//                     className={`candidate-form-input ${errors.email && touched.email ? "candidate-input-error" : ""}`}
//                     disabled={isSubmitting}
//                     aria-label="Email"
//                   />
//                   <ErrorMessage name="email" component="div" className="candidate-error-message" />
//                 </div>
//                 <div className="candidate-form-group">
//                   <label htmlFor="password" className="candidate-sr-only">Password</label>
//                   <Field
//                     id="password"
//                     type="password"
//                     name="password"
//                     placeholder="Enter your password"
//                     className={`candidate-form-input ${errors.password && touched.password ? "candidate-input-error" : ""}`}
//                     disabled={isSubmitting}
//                     aria-label="Password"
//                   />
//                   <ErrorMessage name="password" component="div" className="candidate-error-message" />
                 
//                 </div>
//                 {formError && <div className="candidate-form-error">{formError}</div>}

//                 {/* Submit Button */}
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="candidate-submit-button"
//                 >
//                   {isSubmitting ? "Signing In..." : "Sign In"}
//                 </button>
//                  {/* Forgot Password Link - added to the right side */}
//                  <div className="text-right mt-1">
//                     <a 
//                       href="#" 
//                       onClick={(e) => {
//                         e.preventDefault();
//                         openForgotPasswordModal();
//                       }}
//                       className="text-blue-600 text-sm hover:underline"
//                     >
//                       Forgot Password?
//                     </a>
//                   </div>
//                 {/* Sign Up and Google Login Section */}
//                 <div className="candidate-signup-text">
//                   <button type="button" onClick={switchToSignup}>
//                     Don't have an account? Sign Up
//                   </button>
//                   <br />
//                   <br />
                  
//                   {/* <div className="flex justify-center"> */}
//                     <GoogleLogin
//                       onSuccess={credentialResponse => {
//                         GoogleTestlogin(credentialResponse.credential);
//                       }}
//                       onError={() => {
//                         console.log('Login Failed');
//                       }}
//                     />
//                   {/* </div> */}
//                 </div>
//               </Form>
//             )}
//           </Formik>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CandidateLogin;























import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { set_Authentication } from "../../Redux/Authentication/authenticationSlice";
import { set_user_basic_details } from "../../Redux/UserDetails/userBasicDetailsSlice";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import { LoginSchema, initialValues } from "../../validation/LoginValidation";
//import "../../Styles/Candidate/CandidateLogin.css";
import '../../assets/Stylesheet/Registration.css';
import { GoogleLogin } from '@react-oauth/google';
import ForgotPasswordPage from "../../pages/comon/ForgotPassword";

function CandidateLogin({ isOpen, onClose, switchToSignup }) {
  const [formError, setFormError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const baseURL = "http://127.0.0.1:8000";

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    try {
      const response = await axios.post(`${baseURL}/api/account/candidatelogin/`, formData);
      console.log("Login Response:", response);

      if (response.status === 200) {
        // Save tokens to localStorage
        localStorage.setItem("access", response.data.access_token);
        localStorage.setItem("refresh", response.data.refresh_token);
        localStorage.setItem("user_id", response.data.user_id);

        // Decode the token
        const decodedToken = jwtDecode(response.data.access_token);

        // Update Redux store
        dispatch(
          set_Authentication({
            name: decodedToken.name,
            email: response.data.email,
            userid: response.data.user_id,
            isAuthenticated: true,
            isAdmin: response.data.isAdmin,
            usertype: response.data.usertype,
            profile_completed: response.data.user_data.completed || false,
          })
        );

        dispatch(
          set_user_basic_details({
            profile_pic: response.data.user_data.profile_pic,
            user_type_id: response.data.user_data.id,
          })
        );

        // Show success toast
        toast.success("Login successful!", {
          position: "top-center",
          autoClose: 3000,
        });

        // Close the modal
        onClose();

        // Navigate based on profile completion status
        if (!response.data.user_data.completed) {
          navigate("/candidate/profile-creation");
        } else {
          navigate("/candidate/find-job");
        }
      } else {
        // Handle unexpected status codes
        const errorMessage = response.data.message || "Unexpected response from server.";
        setFormError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        if (error.response.status === 401) {
          // Differentiate based on backend message
          const backendMessage = error.response.data.message?.toLowerCase() || "";
          if (backendMessage.includes("email")) {
            errorMessage = "No account found with this email.";
          } else if (backendMessage.includes("password")) {
            errorMessage = "Incorrect password.";
          } else {
            errorMessage = "Invalid email or password.";
          }
        } else if (error.response.status === 403) {
          errorMessage = error.response.data.message || "Only candidates can login.";
        } else {
          errorMessage = error.response.data.message || "Server error.";
        }
      }

      setFormError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openForgotPasswordModal = () => {
    setShowForgotPasswordModal(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPasswordModal(false);
  };

  const handleBackgroundClick = (e) => {
    if (e.target.className === "candidate-login-overlay") {
      onClose();
    }
  };

  if (!isOpen) return null;

  if (showForgotPasswordModal) {
    return (
      <ForgotPasswordPage
        isOpen={true}
        onClose={() => setShowForgotPasswordModal(false)}
        onBackToLogin={handleBackToLogin}
        userType="candidate"
      />
    );
  }

  const GoogleTestlogin = async (credential) => {
    try {
      const response = await axios.post(`${baseURL}/api/account/auth/candidate/`, {
        client_id: credential,
      });
      console.log("Google auth response:", response);

      if (response.status === 200) {
        localStorage.setItem("access", response.data.access_token);
        localStorage.setItem("refresh", response.data.refresh_token);
        localStorage.setItem("user_id", response.data.user_id);

        const decodedToken = jwtDecode(response.data.access_token);

        dispatch(
          set_Authentication({
            name: decodedToken.name,
            email: response.data.email,
            userid: response.data.user_id,
            isAuthenticated: true,
            isAdmin: response.data.isAdmin,
            usertype: response.data.usertype,
            profile_completed: response.data.user_data.completed || false,
          })
        );

        dispatch(
          set_user_basic_details({
            profile_pic: response.data.user_data.profile_pic,
            user_type_id: response.data.user_data.id,
          })
        );

        toast.success("Google login successful!", {
          position: "top-center",
          autoClose: 3000,
        });

        onClose();

        if (!response.data.user_data.completed) {
          navigate("/candidate/profile-creation");
        } else {
          navigate("/candidate/find-job");
        }
      } else {
        const errorMessage = response.data.message || "Google login failed.";
        setFormError(errorMessage);
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error("Google login error:", error);
      let errorMessage = "Google login failed.";
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = error.response.data.message || "Only candidates can login.";
        } else {
          errorMessage = error.response.data.message || "Server error.";
        }
      }
      setFormError(errorMessage);
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="candidate-login-overlay" onClick={handleBackgroundClick}>
      <div className="candidate-login-content" onClick={(e) => e.stopPropagation()}>
        <button className="candidate-login-close-icon" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="candidate-login-form">
          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={handleLoginSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <h3 className="candidate-login-title">Candidate Sign In</h3>
                <div className="candidate-form-group">
                  <label htmlFor="email" className="candidate-sr-only">Email</label>
                  <Field
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email id"
                    className={`candidate-form-input ${errors.email && touched.email ? "candidate-input-error" : ""}`}
                    disabled={isSubmitting}
                    aria-label="Email"
                  />
                  <ErrorMessage name="email" component="div" className="candidate-error-message" />
                </div>
                <div className="candidate-form-group">
                  <label htmlFor="password" className="candidate-sr-only">Password</label>
                  <Field
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className={`candidate-form-input ${errors.password && touched.password ? "candidate-input-error" : ""}`}
                    disabled={isSubmitting}
                    aria-label="Password"
                  />
                  <ErrorMessage name="password" component="div" className="candidate-error-message" />
                </div>
                {formError && <div className="candidate-form-error">{formError}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="candidate-submit-button"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </button>

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

                <div className="candidate-signup-text">
                  <button type="button" onClick={switchToSignup}>
                    Don't have an account? Sign Up
                  </button>
                  <br />
                  <br />
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      GoogleTestlogin(credentialResponse.credential);
                    }}
                    onError={() => {
                      console.log("Google Login Failed");
                      toast.error("Google login failed.", {
                        position: "top-center",
                        autoClose: 5000,
                      });
                    }}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default CandidateLogin;