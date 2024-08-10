// src/components/Questionnaire.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

const Questionnaire = () => {
  const { workshopId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [emotionalFeedback, setEmotionalFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log(`Fetching questions for workshop: ${workshopId}`);
        const questionCollection = collection(
          firestore,
          `workshops/${workshopId}/questionnaires`
        );
        const questionSnapshot = await getDocs(questionCollection);
        const questionList = questionSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Questions fetched:', questionList);
        setQuestions(questionList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setError('Failed to load questions');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [workshopId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: { answer, step: answer === 'yes' ? 'forward' : 'backward' },
    });
  };

  const handleEmotionalFeedbackChange = (event) => {
    setEmotionalFeedback(event.target.value);
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const answersCollection = collection(
        firestore,
        `workshops/${workshopId}/answers`
      );
      const participantId = uuidv4();
      await addDoc(answersCollection, {
        participantId,
        answers: Object.keys(answers).map((questionId) => ({
          questionId,
          answer: answers[questionId].answer,
          step: answers[questionId].step,
        })),
        emotionalFeedback,
      });
      alert('Answers and feedback submitted successfully!');
      navigate(`/results/${workshopId}`);
    } catch (error) {
      console.error('Error submitting answers and feedback:', error);
      setError('Failed to submit answers and feedback');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center">{error}</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const feedbackOptions = ['Happy', 'Sad', 'Frustrated', 'Neutral', 'Empowered'];

  return (
    <div className="container mt-5">
      <h1 className="text-center">Questionnaire</h1>
      {currentQuestionIndex < questions.length ? (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <p>{currentQuestion.question}</p>
            <div className="form-check">
              <input
                type="radio"
                name={currentQuestion.id}
                value="yes"
                onChange={() => handleAnswerChange(currentQuestion.id, 'yes')}
                required
                className="form-check-input"
                id={`yes-${currentQuestion.id}`}
              />
              <label className="form-check-label" htmlFor={`yes-${currentQuestion.id}`}>
                Yes
              </label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                name={currentQuestion.id}
                value="no"
                onChange={() => handleAnswerChange(currentQuestion.id, 'no')}
                required
                className="form-check-input"
                id={`no-${currentQuestion.id}`}
              />
              <label className="form-check-label" htmlFor={`no-${currentQuestion.id}`}>
                No
              </label>
            </div>
          </div>
          <button type="button" onClick={handleNextQuestion} className="btn btn-primary">
            Next
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-3">
            <p>How did you feel about this questionnaire?</p>
            {feedbackOptions.map((option) => (
              <div className="form-check" key={option}>
                <input
                  type="radio"
                  name="emotionalFeedback"
                  value={option}
                  onChange={handleEmotionalFeedbackChange}
                  required
                  className="form-check-input"
                  id={option}
                />
                <label className="form-check-label" htmlFor={option}>
                  {option}
                </label>
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn-success">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default Questionnaire;
