import React, { useEffect, useRef } from 'react';
import './Qmodal.css';

const Qmodal = ({ setModal, questions, setAnswers, answers, handleApply }) => {
  const modalRef = useRef(null);

  // Focus modal on mount
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer_text]) => ({
      question: parseInt(questionId),
      answer_text,
    }));
    handleApply(formattedAnswers);
    setModal(false); // Close modal after submission
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setModal(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <h2 id="modal-title">Application Questions</h2>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div key={index} className="question-item">
              <label className="">
                {question.text}
              </label>
              {question.question_type === 'TEXT' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  aria-label={`Answer for ${question.text}`}
                />
              )}
              {question.question_type === 'MCQ' && (
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  aria-label={`Select an option for ${question.text}`}
                >
                  <option value="">Select an option</option>
                  {Object.entries(question.options || {}).map(([key, value]) => (
                    <option key={key} value={key}>{`${key}: ${value}`}</option>
                  ))}
                </select>
              )}
              {question.question_type === 'CODE' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="/* Write your code here... */"
                  className="code-input"
                  aria-label={`Code input for ${question.text}`}
                />
              )}
            </div>
          ))
        ) : (
          <p className="no-questions">No questions available</p>
        )}
        <div className="modal-buttons flex justify-end gap-6 p-6">
          <button
            onClick={() => setModal(false)}
           className="cancel-btn"

            aria-label="Cancel application"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
           
             className="submit-btn"

            aria-label="Submit application"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default Qmodal;