import React, { useState, useEffect } from "react";
import { CiCircleRemove } from "react-icons/ci";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { set_user_basic_details } from "../../Redux/UserDetails/userBasicDetailsSlice";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { toast } from "react-toastify";
import ProfilepicModal from '../Employer/ProfilepicModal';
import { ProfileDataSchema, initialValues } from "../../validation/CandidateProfileValidation";
//import "../../Styles/Candidate/ProfileCreation.css";
//import "../../Styles/Login.css";
import '../../assets/component/profile.css';

function CandidateProfileCreation() {
  const baseURL = "http://127.0.0.1:8000/";
  const token = localStorage.getItem("access");
  const authentication_user = useSelector((state) => state.authentication_user);
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState([]);
  const [skill, setSkill] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [profile_pic, setProfilepic] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [modal, setModal] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState("");
  const [isSpinner, setIsSpinner] = useState(false);
  const [resume, setResume] = useState({ resume: null });
  const [imgError, setImgError] = useState("");

  const stepDown = () => setStep(step - 1);
  const stepUp = (errors, touched, values) => {
    if (step === 1) {
      if (!errors.phone && !errors.dob && !errors.gender && values.phone && values.dob && values.gender) {
        setStep(step + 1);
      } else {
        toast.error("Please fill out all required fields in Step 1 (Phone, DOB, Gender).", { position: "top-center" });
      }
    } else if (step === 2) {
      if (!errors.education && !errors.specilization && !errors.college && values.education && values.specilization && values.college) {
        setStep(step + 1);
      } else {
        toast.error("Please fill out all required fields in Step 2 (Education, Specialization, College).", { position: "top-center" });
      }
    }
  };

  const handleSkill = (e) => setSkill(e.target.value);
  const handleAddSkill = () => {
    if (skill.trim() !== "") {
      setSkills([...skills, skill.trim()]);
      setSkill("");
    }
  };
  const handleRemoveSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result);
      setModal(true);
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload a valid image file.", { position: "top-center" });
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf" && file.size <= 5 * 1024 * 1024) {
        setResume({ resume: file });
      } else {
        toast.error("Please upload a valid PDF file (max 5MB).", { position: "top-center" });
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill.", { position: "top-center" });
      setSubmitting(false);
      return;
    }

    const skillString = skills.join(",");
    const formData = new FormData();
    formData.append("email", authentication_user.email || "");
    formData.append("place", values.place || "");
    formData.append("phone", values.phone || "");
    formData.append("dob", values.dob || "");
    formData.append("Gender", values.gender || "");
    if (profile_pic) formData.append("profile_pic", profile_pic);
    formData.append("education", values.education || "");
    formData.append("specilization", values.specilization || "");
    formData.append("college", values.college || "");
    formData.append("completed", values.completed || "");
    formData.append("mark", values.mark || "");
    formData.append("skills", skillString);
    formData.append("linkedin", values.linkedin || "");
    formData.append("github", values.github || "");
    if (resume.resume) formData.append("resume", resume.resume, resume.resume.name);

    setIsSpinner(true);
    try {
      const response = await axios.post(`${baseURL}api/account/user/profile_creation/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200 || response.status === 201) {
        dispatch(set_user_basic_details({ profile_pic: response.data.data?.profile_pic || "" }));
        setIsSpinner(false);
        toast.success("Profile created successfully!", { position: "top-center" });
        navigate("/candidate/profile");
      }
    } catch (error) {
      console.error("Profile Creation Error:", error);
      setIsSpinner(false);
      if (error.response) {
        toast.error(error.response.data.message || "Failed to create profile.", { position: "top-center" });
      } else if (error.request) {
        toast.error("Network error. Is the backend running?", { position: "top-center" });
      } else {
        toast.error("An unexpected error occurred.", { position: "top-center" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const convertBase64ToImage = (base64String) => {
      const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;
      if (!base64Pattern.test(base64String)) return;
      const base64Content = base64String.replace(base64Pattern, "");
      const binaryString = window.atob(base64Content);
      const length = binaryString.length;
      const byteArray = new Uint8Array(length);
      for (let i = 0; i < length; i++) byteArray[i] = binaryString.charCodeAt(i);
      const type = base64String.match(/^data:image\/(png|jpeg|jpg);base64,/)[1];
      const blob = new Blob([byteArray], { type: `image/${type}` });
      const file = new File([blob], `profile_pic.${type}`, { type: `image/${type}` });
      setProfilepic(file);
    };
    convertBase64ToImage(croppedImageUrl);
  }, [croppedImageUrl]);

  return (
    <>
      {isSpinner && (
        <div className="spinner-overlay">
          <div className="spinner">
            <div className="spinner-inner"></div>
          </div>
        </div>
      )}
      {!isSpinner && (
        <div className="profile-creation-container">
          <div className="profile-creation-wrapper">
            <div className="left-panel">
              <h3>Complete Your Profile</h3>
              <p>Unlock 500+ jobs from top companies and receive direct calls from HRs</p>
              <p>{authentication_user.name || "User"}</p>
              <ul>
                <li><IoMdCheckmarkCircle /> Take 3 Steps</li>
                <li><IoMdCheckmarkCircle /> Direct call from HR</li>
                <li><IoMdCheckmarkCircle /> Connect with Top Companies</li>
              </ul>
            </div>

            <div className="right-panel">
              <div className="step-indicator">
                <div className={`step ${step > 1 ? "completed" : ""}`}>1</div>
                <div className={`step ${step > 2 ? "completed" : ""}`}>2</div>
                <div className="step">3</div>
              </div>
              <Formik
                initialValues={initialValues}
                validationSchema={ProfileDataSchema}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({ errors, touched, isSubmitting, values }) => (
                  <Form>
                    {step === 1 && (
                      <div className="step-content">
                        <h4>About Me</h4>
                        <div className="form-group">
                          <label>Username</label>
                          <Field type="text" name="username" placeholder="Username" value={authentication_user.name || ""} readOnly />
                        </div>
                        <div className="form-group">
                          <label>Mobile Number *</label>
                          <Field type="text" name="phone" placeholder="Type here" />
                          <ErrorMessage name="phone" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Email</label>
                          <Field type="text" name="email" placeholder="Email" value={authentication_user.email || ""} readOnly />
                        </div>
                        <div className="form-group">
                          <label>Place</label>
                          <Field type="text" name="place" placeholder="Type here" />
                          <ErrorMessage name="place" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Date of Birth *</label>
                          <Field type="date" name="dob" />
                          <ErrorMessage name="dob" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Gender *</label>
                          <Field as="select" name="gender">
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="others">Others</option>
                          </Field>
                          <ErrorMessage name="gender" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Profile Image</label>
                          <input type="file" accept=".jpg,.jpeg,.png" name="profile_pic" onChange={handleImageChange} />
                          {imgError && <div className="error-message">{imgError}</div>}
                          {croppedImageUrl && <img src={croppedImageUrl} alt="Profile" className="profile-image" />}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="step-content">
                        <h4>Education</h4>
                        <div className="form-group">
                          <label>Education *</label>
                          <Field as="select" name="education">
                            <option value="">Select</option>
                            <option value="10th">10th</option>
                            <option value="higher_secondary">Higher Secondary</option>
                            <option value="graduation">Graduation</option>
                            <option value="post_graduation">Post Graduation</option>
                            <option value="iti">ITI</option>
                            <option value="diploma">Diploma</option>
                          </Field>
                          <ErrorMessage name="education" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Specialization *</label>
                          <Field type="text" name="specilization" placeholder="Type here" />
                          <ErrorMessage name="specilization" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>College Name *</label>
                          <Field type="text" name="college" placeholder="School/College" />
                          <ErrorMessage name="college" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Date of Completion</label>
                          <Field type="date" name="completed" />
                          <ErrorMessage name="completed" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Mark in CGPA</label>
                          <Field type="text" name="mark" placeholder="Type here" />
                          <ErrorMessage name="mark" component="div" className="error-message" />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="step-content">
                        <h4>Skills</h4>
                        <div className="form-group">
                          <label>Add Skills *</label>
                          <div className="skill-input">
                            <input type="text" value={skill || ""} onChange={handleSkill} placeholder="Type here" />
                            <br></br>
                            <br></br>
                            
                            <button type="button" onClick={handleAddSkill}>Add</button>
                          </div>
                          <div className="skills-list">
                            {skills.map((skill, index) => (
                              <div key={index} className="skill-item">
                                <span>{skill}</span>
                                <span onClick={() => handleRemoveSkill(index)}><CiCircleRemove /></span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>LinkedIn Profile</label>
                          <Field type="text" name="linkedin" placeholder="Type here" />
                          <ErrorMessage name="linkedin" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>GitHub Profile</label>
                          <Field type="text" name="github" placeholder="Type here" />
                          <ErrorMessage name="github" component="div" className="error-message" />
                        </div>
                        <div className="form-group">
                          <label>Resume</label>
                          <input type="file" name="resume" onChange={handleResumeChange} />
                        </div>
                      </div>
                    )}

                    <div className="navigation-buttons">
                      {step > 1 && (
                        <button type="button" onClick={stepDown} className="prev-button">Prev</button>
                      )}
                      {step < 3 && (
                        <button type="button" onClick={() => stepUp(errors, touched, values)} className="next-button">Next</button>
                      )}
                      {step === 3 && (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="submit-button"
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                      )}
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}
      {modal && (
        <ProfilepicModal
          setCroppedImageUrl={setCroppedImageUrl}
          setImgError={setImgError}
          setImageUrl={setImageUrl}
          imageUrl={imageUrl}
          closeModal={() => setModal(false)}
        />
      )}
    </>
  );
}

export default CandidateProfileCreation;