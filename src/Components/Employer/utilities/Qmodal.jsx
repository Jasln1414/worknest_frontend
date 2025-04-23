import React from 'react';
import { IoMdClose } from "react-icons/io";
import './question.css';

const Qmodal = ({ setModal, questions, setQuestions }) => {
  const addQuestion = () => {
    setQuestions(prevQuestions => [...prevQuestions, { text: '' }]);
  };

  const removeQuestion = (index) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions.splice(index, 1);
      return newQuestions;
    });
  };

  const handleQuestionChange = (index, value) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      newQuestions[index] = {
        ...newQuestions[index],
        text: value
      };
      return newQuestions;
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Screening Questions</h2>
          {/* <p className="modal-subtitle">Add text questions to screen applicants</p> */}
          <button className="modal-close-button" onClick={() => setModal(false)}>
            <IoMdClose size={24} />
          </button>
        </div>
        
        <div className="question-form">
          {questions.map((question, index) => (
            <div className="question-input-group" key={index}>
              <div className="question-header">
                <label className="question-label">Question {index + 1}</label>
                {questions.length > 1 && (
                  <button 
                    className="question-remove-button"
                    type="button" 
                    onClick={() => removeQuestion(index)}
                  >
                    <IoMdClose size={16} />
                  </button>
                )}
              </div>
              
              <input
                type="text"
                value={question.text}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                className="question-input"
                placeholder="Enter your question here"
                required
              />
            </div>
          ))}
          
          <div className="button-group">
            <button 
              type="button" 
              onClick={addQuestion} 
              className="add-button"
            >
              + Add Another Question
            </button>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setModal(false)} 
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={() => setModal(false)}
              className="submit-button"
            >
              Save Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qmodal;