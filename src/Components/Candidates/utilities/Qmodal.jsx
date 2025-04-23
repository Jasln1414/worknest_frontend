// Qmodal.jsx
import React from 'react';
import './Qmodal.css';

const Qmodal = ({ setModal, questions, setAnswers, answers, handleApply }) => {
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer_text]) => ({
      question: parseInt(questionId),
      answer_text
    }));
    handleApply(formattedAnswers);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Application Questions</h2>
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div key={index} className="question-item">
              <label className="block text-lg font-semibold text-gray-800 rounded-md px-3 py-1 mb-2 shadow-sm">
    {question.text}
  </label>
              {question.question_type === 'TEXT' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                />
              )}
              {question.question_type === 'MCQ' && (
                <select
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
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
                  placeholder="Write your code here..."
                  className="code-input"
                />
              )}
            </div>
          ))
        ) : (
          <p>No questions available</p>
        )}

<div className="modal-buttons flex justify-end gap-6 p-6">
  <button 
    onClick={() => setModal(false)}
    className="w-32 h-12 bg-gradient-to-br from-teal-900 to-teal-900 text-teal-100 rounded-xl hover:from-teal-900 hover:to-teal-900 transition-all duration-300 shadow-sm text-base font-semibold"
  >
    Cancel
  </button>
  <button 
    onClick={handleSubmit}
    disabled={Object.keys(answers).length !== questions.length}
    className="w-48 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed shadow-sm text-base font-semibold"
  >
    Submit Application
  </button>
</div>




        {/* <div className="modal-buttons">
          <button onClick={() => setModal(false)}>Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
          >
            Submit Application
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Qmodal;