// // import React, { useState } from 'react';
// // import ForgetPasswordModal from './ForgotPassword';
// // import OtpModal from '../../Components/Employer/OtpModal';
// // import ResetPassword from './ResetPassword';

// // const PasswordResetFlow = () => {
// //   const [currentModal, setCurrentModal] = useState(null);
// //   const [email, setEmail] = useState('');
// //   const [otpVerified, setOtpVerified] = useState(false);

// //   const handleForgetPasswordSubmit = (email) => {
// //     setEmail(email);
// //     setCurrentModal('otp');
// //   };

// //   const handleOtpSuccess = () => {
// //     setOtpVerified(true);
// //     setCurrentModal('resetPassword');
// //   };

// //   const handleResetPasswordSuccess = () => {
// //     setCurrentModal(null);
// //     // Optionally, you can show a success message or redirect the user
// //   };

// //   return (
// //     <>
// //       <button onClick={() => setCurrentModal('forgetPassword')}>Forgot Password?</button>

// //       {currentModal === 'forgetPassword' && (
// //         <ForgetPasswordModal
// //           isOpen={true}
// //           onClose={() => setCurrentModal(null)}
// //           onSubmit={handleForgetPasswordSubmit}
// //         />
// //       )}

// //       {currentModal === 'otp' && (
// //         <OtpModal
// //           isOpen={true}
// //           closeModal={() => setCurrentModal(null)}
// //           email={email}
// //           onOtpSuccess={handleOtpSuccess}
// //         />
// //       )}

// //       {currentModal === 'resetPassword' && (
// //         <ResetPassword
// //           isOpen={true}
// //           onClose={() => setCurrentModal(null)}
// //           onSuccess={handleResetPasswordSuccess}
// //         />
// //       )}
// //     </>
// //   );
// // };

// // export default PasswordResetFlow;









// import React, { useState } from 'react';
// import ForgotPasswordModal from './ForgotPasswordModal';
// import EmailVerificationModal from './EmailVerificationModal';
// import ResetPasswordModal from './ResetPasswordModal';

// function ParentModalManager() {
//   const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
//   const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
//   const [isResetModalOpen, setIsResetModalOpen] = useState(false);
//   const [email, setEmail] = useState('');
//   const [isLoginFormOpen, setIsLoginFormOpen] = useState(true); // Example state for login form visibility

//   const openForgotPasswordModal = () => {
//     setIsForgotPasswordOpen(true);
//     setIsLoginFormOpen(false); // Hide login form when opening forgot password
//   };

//   const closeForgotPasswordModal = () => setIsForgotPasswordOpen(false);

//   const handleOtpRequestSuccess = (userEmail) => {
//     setEmail(userEmail);
//     setIsOtpModalOpen(true);
//     closeForgotPasswordModal(); // Close ForgotPasswordModal when OTP modal opens
//   };

//   const handleOtpSuccess = () => {
//     setIsOtpModalOpen(false);
//     setIsResetModalOpen(true); // Open ResetPasswordModal after OTP verification
//   };

//   const handleResetSuccess = () => {
//     setIsResetModalOpen(false);
//     setIsLoginFormOpen(true); // Return to login form after successful reset
//   };

//   const closeOtpModal = () => setIsOtpModalOpen(false);
//   const closeResetModal = () => setIsResetModalOpen(false);

//   return (
//     <div>
//       {/* Example login form or button to trigger forgot password */}
//       {isLoginFormOpen && (
//         <div>
//           <h2>Login Form</h2>
//           <button onClick={openForgotPasswordModal}>Forgot Password?</button>
//         </div>
//       )}

//       {/* Forgot Password Modal */}
//       <ForgotPasswordModal
//         isOpen={isForgotPasswordOpen}
//         onClose={closeForgotPasswordModal}
//         onOtpRequestSuccess={handleOtpRequestSuccess}
//         onBackToLogin={() => {
//           closeForgotPasswordModal();
//           setIsLoginFormOpen(true);
//         }}
//       />

//       {/* OTP Verification Modal */}
//       <EmailVerificationModal
//         isOpen={isOtpModalOpen}
//         closeModal={closeOtpModal}
//         email={email}
//         onOtpSuccess={handleOtpSuccess}
//       />

//       {/* Reset Password Modal */}
//       <ResetPasswordModal
//         isOpen={isResetModalOpen}
//         closeModal={closeResetModal}
//         email={email}
//         onResetSuccess={handleResetSuccess}
//       />
//     </div>
//   );
// }

// export default ParentModalManager;