import React, { useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { PostJobValidationSchema } from '../../validation/PostJobValidation';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../../pages/comon/common.css';

function JobDetailModal({ setModal, jobData, onUpdate }) {
  const baseURL = 'http://127.0.0.1:8000/';
  const modalRef = useRef();

  const closeModal = (e) => {
    if (modalRef.current === e.target) {
      setModal(false);
    }
  };

  // Parse salary range from jobData.lpa (e.g., "$20K-$30K" → ["$20K", "$30K"])
  const parseSalary = () => {
    if (!jobData?.lpa) return ['', ''];
    const parts = jobData.lpa.split('-');
    return [
      parts[0] ? parts[0].trim() : '',
      parts[1] ? parts[1].trim() : ''
    ];
  };

  const [salaryFrom, salaryTo] = parseSalary();

  const initialValues = {
    title: jobData?.title || '',
    location: jobData?.location || '',
    saleryfrom: salaryFrom, // e.g., "$20K" or "$20/Hour"
    saleryto: salaryTo,     // e.g., "$30K" or "$30/Hour"
    applyBefore: jobData?.applyBefore || '',
    experience: jobData?.experience || '',
    jobmode: jobData?.jobmode || '',
    jobtype: jobData?.jobtype || '',
    about: jobData?.about || '',
    responsibility: jobData?.responsibility || '',
  };

  const handleSubmit = async (values) => {
    try {
      // Construct salary range string (e.g., "$20K-$30K")
      const lpa = `${values.saleryfrom}-${values.saleryto}`;
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('location', values.location);
      formData.append('lpa', lpa);
      formData.append('applyBefore', values.applyBefore);
      formData.append('experience', values.experience);
      formData.append('jobmode', values.jobmode);
      formData.append('jobtype', values.jobtype);
      formData.append('about', values.about);
      formData.append('responsibility', values.responsibility);
      formData.append('jobId', jobData.id);

      const response = await axios.post(`${baseURL}api/empjob/editJob/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200) {
        toast.success('Job updated successfully!', { position: 'top-center' });
        onUpdate();
        setModal(false);
      }
    } catch (error) {
      console.error('Error editing job:', error);
      toast.error(error.response?.data?.message || 'Failed to update job', { position: 'top-center' });
    }
  };

  const handleCancel = () => {
    setModal(false);
  };

  return (
    <div ref={modalRef} onClick={closeModal} className="jd-modal-overlay">
      <div className="jd-modal-container">
        <button className="jd-modal-close" onClick={() => setModal(false)}>
          <IoMdClose size={24} />
        </button>

        <div className="jd-modal-content">
          <h2 className="jd-modal-title">Edit Job Details</h2>

          <Formik
            initialValues={initialValues}
            validationSchema={PostJobValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="jd-modal-form">
                <div className="jd-form-section">
                  <div className="jd-form-row">
                    <div className="jd-form-group">
                      <label htmlFor="title" className="jd-form-label">Title</label>
                      <Field
                        type="text"
                        id="title"
                        name="title"
                        className={`jd-form-input ${errors.title && touched.title ? 'error' : ''}`}
                      />
                      <ErrorMessage name="title" component="div" className="jd-error" />
                    </div>

                    <div className="jd-form-group">
                      <label htmlFor="location" className="jd-form-label">Location</label>
                      <Field
                        type="text"
                        id="location"
                        name="location"
                        className={`jd-form-input ${errors.location && touched.location ? 'error' : ''}`}
                      />
                      <ErrorMessage name="location" component="div" className="jd-error" />
                    </div>
                  </div>

                  <div className="jd-form-row">
                    <div className="jd-form-group">
                      <label htmlFor="saleryfrom" className="jd-form-label">Salary From</label>
                      <Field
                        type="text"
                        id="saleryfrom"
                        name="saleryfrom"
                        placeholder="e.g., $20K or $20/Hour"
                        className={`jd-form-input ${errors.saleryfrom && touched.saleryfrom ? 'error' : ''}`}
                      />
                      <ErrorMessage name="saleryfrom" component="div" className="jd-error" />
                    </div>

                    <div className="jd-form-group">
                      <label htmlFor="saleryto" className="jd-form-label">Salary To</label>
                      <Field
                        type="text"
                        id="saleryto"
                        name="saleryto"
                        placeholder="e.g., $30K or $30/Hour"
                        className={`jd-form-input ${errors.saleryto && touched.saleryto ? 'error' : ''}`}
                      />
                      <ErrorMessage name="saleryto" component="div" className="jd-error" />
                    </div>
                  </div>

                  <div className="jd-form-row">
                    <div className="jd-form-group">
                      <label htmlFor="jobtype" className="jd-form-label">Job Type</label>
                      <Field
                        as="select"
                        id="jobtype"
                        name="jobtype"
                        className={`jd-form-input ${errors.jobtype && touched.jobtype ? 'error' : ''}`}
                      >
                        <option value="">Select</option>
                        <option value="Full Time">Full Time</option>
                        <option value="Part Time">Part Time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </Field>
                      <ErrorMessage name="jobtype" component="div" className="jd-error" />
                    </div>

                    <div className="jd-form-group">
                      <label htmlFor="jobmode" className="jd-form-label">Job Mode</label>
                      <Field
                        as="select"
                        id="jobmode"
                        name="jobmode"
                        className={`jd-form-input ${errors.jobmode && touched.jobmode ? 'error' : ''}`}
                      >
                        <option value="">Select</option>
                        <option value="Remote">Remote</option>
                        <option value="On Site">On Site</option>
                        <option value="Hybrid">Hybrid</option>
                      </Field>
                      <ErrorMessage name="jobmode" component="div" className="jd-error" />
                    </div>
                  </div>

                  <div className="jd-form-row">
                    <div className="jd-form-group">
                      <label htmlFor="experience" className="jd-form-label">Experience</label>
                      <Field
                        as="select"
                        id="experience"
                        name="experience"
                        className={`jd-form-input ${errors.experience && touched.experience ? 'error' : ''}`}
                      >
                        <option value="">Select</option>
                        <option value="Internship">Internship</option>
                        <option value="Entry Level">Entry Level</option>
                        <option value="Associate">Associate</option>
                        <option value="Mid Level">Mid Level</option>
                        <option value="Senior Level">Senior Level</option>
                      </Field>
                      <ErrorMessage name="experience" component="div" className="jd-error" />
                    </div>

                    <div className="jd-form-group">
                      <label htmlFor="applyBefore" className="jd-form-label">Apply Before</label>
                      <Field
                        type="date"
                        id="applyBefore"
                        name="applyBefore"
                        className={`jd-form-input ${errors.applyBefore && touched.applyBefore ? 'error' : ''}`}
                      />
                      <ErrorMessage name="applyBefore" component="div" className="jd-error" />
                    </div>
                  </div>

                  <div className="jd-form-group">
                    <label htmlFor="about" className="jd-form-label">About</label>
                    <Field
                      as="textarea"
                      id="about"
                      name="about"
                      rows="4"
                      className={`jd-form-textarea ${errors.about && touched.about ? 'error' : ''}`}
                    />
                    <ErrorMessage name="about" component="div" className="jd-error" />
                  </div>

                  <div className="jd-form-group">
                    <label htmlFor="responsibility" className="jd-form-label">Responsibilities</label>
                    <Field
                      as="textarea"
                      id="responsibility"
                      name="responsibility"
                      rows="4"
                      className={`jd-form-textarea ${errors.responsibility && touched.responsibility ? 'error' : ''}`}
                    />
                    <ErrorMessage name="responsibility" component="div" className="jd-error" />
                  </div>

                  <div className="jd-form-actions">
                    <button
                      type="submit"
                      className="jd-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : 'Update Job'}
                    </button>
                    <button
                      type="button"
                      className="jd-cancel-btn"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default JobDetailModal;