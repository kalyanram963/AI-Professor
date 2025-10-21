import React, { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// askGemini and renderMarkdown are expected to be available globally via `window`
// or passed as props from App.jsx. No local definition needed here if global.

const Aptitude = ({ userId, db, appId, updateXP, showModal }) => {
  const [aptitudeTopic, setAptitudeTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(3); // State for user-selected number of questions
  const [questionTypePreference, setQuestionTypePreference] = useState('MCQ'); // User's preference for generation
  const [aptitudeQuestions, setAptitudeQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(''); // For direct answer type
  const [selectedOption, setSelectedOption] = useState(null); // For MCQ type
  const [feedback, setFeedback] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0); // Track score for current session
  const [pastResults, setPastResults] = useState([]);

  // Fetch past aptitude results from Firestore
  useEffect(() => {
    if (userId) {
      const resultsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/aptitudeResults`);
      const q = query(resultsCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setPastResults(results);
      }, (error) => {
        console.error("Error fetching aptitude results:", error);
        showModal("Error loading past aptitude results.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  // Function to generate aptitude questions using Gemini
  const generateAptitudeQuestion = async () => {
    if (!aptitudeTopic.trim()) {
      showModal("Please enter a topic for the aptitude questions.");
      return;
    }
    if (numQuestions < 1 || numQuestions > 10) {
      showModal("Please select between 1 and 10 questions.");
      return;
    }

    setLoading(true);
    setAptitudeQuestions([]);
    setCurrentQIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setFeedback('');
    setSolution('');
    setShowScore(false);
    setScore(0); // Reset score for new session

    const prompt = `
Generate ${numQuestions} aptitude questions related to "${aptitudeTopic}".
Prioritize "${questionTypePreference}" questions if possible, but include a mix if appropriate for the topic.
Each question should be either multiple-choice (MCQ) with 4 options (A, B, C, D) or a direct answer question.
For MCQ, ensure options are distinct and clearly labeled (e.g., "A) Option 1").
Provide a clear answer and a detailed explanation for each.
Format the output as a strict JSON array like this:

[
  {
    "question": "If a train travels at 60 km/h, how long does it take to travel 300 km?",
    "questionType": "Direct Answer",
    "answer": "5 hours",
    "explanation": "Time = Distance / Speed = 300 km / 60 km/h = 5 hours."
  },
  {
    "question": "Which of the following is the odd one out?",
    "questionType": "MCQ",
    "options": ["A) Apple", "B) Orange", "C) Banana", "D) Potato"],
    "answer": "D) Potato",
    "explanation": "Apple, Orange, and Banana are fruits. Potato is a vegetable."
  }
]

Return ONLY the JSON array. Do not include any conversational text, markdown backticks outside the JSON, or any other formatting.`;

    try {
      // Ensure window.askGemini is available before calling
      if (typeof window.askGemini !== 'function') {
        console.error("window.askGemini is not defined. Make sure it's exposed globally in App.jsx.");
        showModal("AI service not available. Please check the application setup.");
        return;
      }

      const response = await window.askGemini(prompt);
      console.log("Raw AI response for Aptitude:", response); // Log raw response for debugging

      let parsedQuiz = [];
      try {
        // First, try to find a JSON array wrapped in markdown code blocks (```json ... ```)
        const jsonCodeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
          parsedQuiz = JSON.parse(jsonCodeBlockMatch[1]);
        } else {
          // If not found, try to find a direct JSON array pattern
          const jsonArrayMatch = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
          if (jsonArrayMatch && jsonArrayMatch[0]) {
            parsedQuiz = JSON.parse(jsonArrayMatch[0]);
          } else {
            // As a last resort, try to parse the whole response directly
            parsedQuiz = JSON.parse(response);
          }
        }
      } catch (parseError) {
        console.error("JSON parsing error in Aptitude:", parseError);
        console.error("Raw AI response that caused parsing error:", response);
        showModal("Error parsing AI response. The AI might have returned an unexpected format. Please try again or refine your topic.");
        return; // Exit if parsing fails
      }

      console.log("Parsed Aptitude Quiz:", parsedQuiz); // Log parsed quiz for debugging

      if (Array.isArray(parsedQuiz) && parsedQuiz.length > 0 && parsedQuiz[0].question) { // Basic validation
        setAptitudeQuestions(parsedQuiz);
      } else {
        showModal("AI generated an invalid or empty set of questions. Please try a different topic or regenerate.");
      }
    } catch (error) {
      console.error('Error fetching AI response for aptitude:', error);
      showModal('An error occurred while generating questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle checking the answer
  const handleCheckAnswer = async () => {
    const currentQuestion = aptitudeQuestions[currentQIndex];
    if (!currentQuestion) {
      showModal("No question available to check.");
      return;
    }

    let isCorrect = false;
    let userAnswerForSave = '';

    if (currentQuestion.questionType === 'MCQ') {
      if (selectedOption === null) {
        showModal("Please select an option.");
        return;
      }
      // Ensure comparison is robust, trimming whitespace
      isCorrect = (selectedOption || '').trim() === (currentQuestion.answer || '').trim();
      userAnswerForSave = selectedOption || 'No answer selected';
    } else { // Direct Answer
      if (!userAnswer.trim()) {
        showModal("Please type your answer.");
        return;
      }
      isCorrect = userAnswer.trim().toLowerCase() === (currentQuestion.answer || '').trim().toLowerCase();
      userAnswerForSave = userAnswer.trim();
    }

    if (isCorrect) {
      setFeedback('Correct! 🎉');
      setScore(prevScore => prevScore + 1); // Increment score
      updateXP(15); // Award XP for correct answer
    } else {
      setFeedback('Incorrect. 😔');
    }
    setSolution(currentQuestion.explanation || 'No explanation provided.'); // Defensive check

    // Save result to Firestore
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/aptitudeResults`), {
        topic: aptitudeTopic,
        question: currentQuestion.question || 'N/A', // Defensive check
        userAnswer: userAnswerForSave,
        correctAnswer: currentQuestion.answer || 'N/A', // Defensive check
        explanation: currentQuestion.explanation || 'N/A', // Defensive check
        isCorrect: isCorrect,
        questionType: currentQuestion.questionType || 'N/A', // Defensive check
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving aptitude result:", error);
      showModal("Error saving your aptitude result.");
    }
  };

  // Handle moving to the next question
  const handleNextQuestion = () => {
    const nextQ = currentQIndex + 1;
    if (nextQ < aptitudeQuestions.length) {
      setCurrentQIndex(nextQ);
      setUserAnswer('');
      setSelectedOption(null);
      setFeedback('');
      setSolution('');
    } else {
      setShowScore(true);
    }
  };

  // Reset the aptitude session
  const handleResetAptitude = () => {
    setAptitudeQuestions([]);
    setCurrentQIndex(0);
    setUserAnswer('');
    setSelectedOption(null);
    setFeedback('');
    setSolution('');
    setShowScore(false);
    setScore(0);
    setAptitudeTopic('');
    setNumQuestions(3); // Reset to default number of questions
    setQuestionTypePreference('MCQ');
  };

  // Delete a past aptitude result
  const handleDeleteResult = async (resultId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this aptitude result?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/aptitudeResults`, resultId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting aptitude result:", error);
              showModal("Error deleting result. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };

  const currentQuestion = aptitudeQuestions[currentQIndex];

  return (
    <div className="content-card">
      <h2>Aptitude & Reasoning Trainer</h2>

      <div className="quiz-controls"> {/* Reusing quiz-controls for consistent styling */}
        <input
          type="text"
          placeholder="Enter aptitude topic (e.g., Algebra, Verbal Reasoning)"
          value={aptitudeTopic}
          onChange={(e) => setAptitudeTopic(e.target.value)}
          disabled={loading}
        />
        <input
          type="number"
          placeholder="Number of Questions (1-10)"
          min="1"
          max="10"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
          disabled={loading}
        />
        <select
          value={questionTypePreference}
          onChange={(e) => setQuestionTypePreference(e.target.value)}
          disabled={loading}
        >
          <option value="MCQ">Multiple Choice Questions</option>
          <option value="Direct Answer">Direct Answer Questions</option>
        </select>
        <button onClick={generateAptitudeQuestion} disabled={loading || !aptitudeTopic.trim()}>
          {loading ? 'Generating...' : 'Generate Questions'}
        </button>
      </div>

      {loading && <p>Generating aptitude questions...</p>}

      {aptitudeQuestions.length > 0 && !showScore && currentQuestion && (
        <div className="aptitude-question-card">
          <h4>Question {currentQIndex + 1} of {aptitudeQuestions.length}</h4>
          <p className="question-text">{currentQuestion.question || 'N/A'}</p>

          {currentQuestion.questionType === 'MCQ' ? (
            <div className="options-list">
              {(currentQuestion.options || []).map((option, index) => (
                <div key={index} className="option-item">
                  <input
                    type="radio"
                    id={`option-${index}`}
                    name="aptitude-option"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                    disabled={feedback !== ''} // Disable options once feedback is shown
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                </div>
              ))}
            </div>
          ) : (
            <div className="answer-area">
              <input
                type="text"
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={feedback !== ''} // Disable input once feedback is shown
              />
            </div>
          )}

          <div className="item-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
            {feedback === '' ? (
              <button
                onClick={handleCheckAnswer}
                disabled={loading || (currentQuestion.questionType === 'MCQ' && selectedOption === null) || (currentQuestion.questionType === 'Direct Answer' && !userAnswer.trim())}
              >
                Check Answer
              </button>
            ) : (
              <button onClick={handleNextQuestion}>
                {currentQIndex < aptitudeQuestions.length - 1 ? 'Next Question' : 'View Score'}
              </button>
            )}
          </div>

          {feedback && (
            <div className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
              <p>{feedback}</p>
              {solution && (
                <div className="solution-display">
                  <h4>Explanation:</h4>
                  {typeof window.renderMarkdown === 'function' ? window.renderMarkdown(solution) : <p>{solution}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showScore && (
        <div className="quiz-score-card"> {/* Reusing quiz-score-card for consistent styling */}
          <h3>Aptitude Session Completed!</h3>
          <p>Your Score: {score} / {aptitudeQuestions.length}</p>
          <button onClick={handleResetAptitude}>Start New Session</button>
        </div>
      )}

      <div className="saved-list" style={{ marginTop: '40px' }}>
        <h3>Past Aptitude Results</h3>
        {pastResults.length === 0 ? (
          <p>No aptitude results saved yet. Take an aptitude test!</p>
        ) : (
          pastResults.map(result => (
            <div key={result.id} className="saved-aptitude-item">
              <h4>{(result.topic || 'N/A')} - {(result.questionType || 'N/A')}</h4>
              <p>Question: {(result.question || 'N/A').substring(0, 70)}...</p> {/* Defensive check */}
              <p>Your Answer: {(result.userAnswer || 'N/A')}</p>
              <p>Correct Answer: {(result.correctAnswer || 'N/A')}</p>
              <p>Status: {result.isCorrect ? 'Correct' : 'Incorrect'}</p>
              <p className="note-timestamp">
                {result.timestamp?.toDate().toLocaleString() || 'N/A'}
              </p>
              <div className="item-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteResult(result.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Aptitude;
