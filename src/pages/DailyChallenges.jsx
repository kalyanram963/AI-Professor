import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore'; // Added doc and deleteDoc

// Placeholder for askGemini function (will be passed as prop in App.jsx)
// This function is assumed to be available globally via `window.askGemini` or passed as a prop.
// I'm keeping the local definition for clarity, but in App.jsx it's passed down.
const askGemini = async (promptText) => {
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ""; // Ensure this is available
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined.");
    return "Error: Gemini API key not configured.";
  }
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
  const headers = { 'Content-Type': 'application/json' };
  const payload = { contents: [{ role: "user", parts: [{ text: promptText }] }] };

  try {
    const response = await fetch(`${geminiEndpoint}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      return result.candidates[0].content.parts[0].text;
    } else {
      return "No response from Gemini AI.";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't process your request.";
  }
};


const DailyChallenges = ({ userId, db, appId, updateXP, showModal }) => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [challengeResponse, setChallengeResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [feedback, setFeedback] = useState(''); // State for AI feedback on user's response

  // Fetch past challenges
  useEffect(() => {
    if (userId) {
      const challengesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/dailyChallenges`);
      const q = query(challengesCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const challenges = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        challenges.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setPastChallenges(challenges);
      }, (error) => {
        console.error("Error fetching past challenges:", error);
        showModal("Error loading your past daily challenges.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);


  const generateChallenge = async () => {
    setIsGenerating(true);
    setCurrentChallenge(null);
    setChallengeResponse('');
    setFeedback(''); // Clear any previous feedback

    const challengeTypes = [
      "Summarize a short paragraph on a random historical event.",
      "Solve a simple logical reasoning puzzle (provide the puzzle and its solution).",
      "Define a complex English word and use it in a sentence.",
      "Explain a basic scientific concept (e.g., photosynthesis, gravity).",
      "Write a short creative story starter (1-2 sentences).",
      "Provide a quick math problem (e.g., algebra, geometry) and its step-by-step solution."
    ];
    const randomChallengeType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

    const prompt = `Generate a daily challenge based on the following type: "${randomChallengeType}".
    Provide the challenge description clearly. If it's a question, also provide the answer/solution and a brief explanation in a separate section.
    Format your response like this:
    Challenge: [Challenge description]
    Solution/Explanation: [Solution or Explanation]
    `;

    try {
      // Use window.askGemini if it's a global function, otherwise use the local `askGemini`
      const result = await (typeof window !== 'undefined' && window.askGemini ? window.askGemini(prompt) : askGemini(prompt));
      const challengeMatch = result.match(/Challenge: (.*?)Solution\/Explanation: (.*)/s);

      if (challengeMatch && challengeMatch.length >= 3) {
        setCurrentChallenge({
          type: randomChallengeType,
          description: challengeMatch[1].trim(),
          solutionExplanation: challengeMatch[2].trim(),
        });
      } else {
        // Fallback for less structured responses
        setCurrentChallenge({
          type: randomChallengeType,
          description: result.split('Solution/Explanation:')[0].replace('Challenge:', '').trim(),
          solutionExplanation: result.split('Solution/Explanation:').length > 1 ? result.split('Solution/Explanation:')[1].trim() : "No specific solution provided.",
        });
      }
      updateXP(5); // Award XP for generating a challenge
    } catch (error) {
      console.error("Error generating challenge:", error);
      showModal("An error occurred while generating the challenge. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitChallenge = async () => {
    if (!currentChallenge || !challengeResponse.trim()) {
      showModal("Please generate a challenge and provide your response.");
      return;
    }

    setIsSubmitting(true);
    // For simplicity, we'll just save the user's attempt.
    // A more advanced version would send the user's response to the AI for evaluation.
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/dailyChallenges`), {
        challengeType: currentChallenge.type || 'N/A', // Defensive check
        challengeDescription: currentChallenge.description || 'N/A', // Defensive check
        userResponse: challengeResponse,
        solutionExplanation: currentChallenge.solutionExplanation || 'N/A', // Defensive check
        timestamp: serverTimestamp(),
        // For a real app, you might add a 'status' like 'completed', 'attempted', etc.
      });
      showModal("Your challenge response has been saved!");
      updateXP(15); // Award XP for submitting a challenge
      setCurrentChallenge(null); // Clear current challenge after submission
      setChallengeResponse('');
    } catch (error) {
      console.error("Error saving challenge response:", error);
      showModal("Error saving your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const evaluateResponse = async () => {
    if (!currentChallenge || !challengeResponse.trim()) {
      showModal("Please provide your response to evaluate.");
      return;
    }

    setIsSubmitting(true); // Re-using this for loading state

    const prompt = `Evaluate the following user response for the challenge:
    Challenge: "${currentChallenge.description || 'N/A'}"
    Correct Solution/Explanation: "${currentChallenge.solutionExplanation || 'N/A'}"
    User's Response: "${challengeResponse}"

    Provide constructive feedback. Indicate if the answer is correct/incorrect and why. Suggest improvements if needed. Keep it concise.`;

    try {
      // Use window.askGemini if it's a global function, otherwise use the local `askGemini`
      const aiFeedback = await (typeof window !== 'undefined' && window.askGemini ? window.askGemini(prompt) : askGemini(prompt));
      setFeedback(aiFeedback);
      updateXP(10); // Award XP for getting feedback
    } catch (error) {
      console.error("Error evaluating response:", error);
      showModal("An error occurred while evaluating your response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this challenge entry?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/dailyChallenges`, challengeId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting challenge:", error);
              showModal("Error deleting challenge. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };


  return (
    <div className="content-card">
      <h2>Daily Challenges</h2>

      <div className="section-block">
        <h3>New Challenge</h3>
        <button onClick={generateChallenge} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate New Challenge'}
        </button>

        {currentChallenge && (
          <div className="challenge-display">
            <h4>Challenge:</h4>
            <p className="challenge-description">{currentChallenge.description || 'N/A'}</p>

            <textarea
              placeholder="Type your response or solution here..."
              value={challengeResponse}
              onChange={(e) => setChallengeResponse(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="challenge-actions">
              <button onClick={evaluateResponse} disabled={isSubmitting || !challengeResponse.trim()}>
                {isSubmitting ? 'Evaluating...' : 'Get Feedback'}
              </button>
              <button onClick={handleSubmitChallenge} disabled={isSubmitting || !challengeResponse.trim()}>
                Save Challenge
              </button>
            </div>
            {feedback && (
              <div className="feedback-display">
                <h4>AI Feedback:</h4>
                <p>{feedback}</p>
                <div className="solution-toggle">
                  <button onClick={() => showModal(
                    <div className="full-solution-modal">
                      <h4>Official Solution/Explanation:</h4>
                      <p>{currentChallenge.solutionExplanation || 'N/A'}</p>
                    </div>
                  )}>View Official Solution</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="section-block">
        <h3>Past Challenges</h3>
        {pastChallenges.length === 0 ? (
          <p>No challenges completed yet. Generate one and submit your response!</p>
        ) : (
          <div className="saved-list">
            {pastChallenges.map(challenge => (
              <div key={challenge.id} className="saved-item">
                <h4>{challenge.challengeType || 'N/A'}</h4>
                <p>{(challenge.challengeDescription || '').substring(0, 100)}...</p>
                <div className="item-actions">
                  <button onClick={() => showModal(
                    <div className="full-challenge-modal">
                      <h4>Challenge:</h4>
                      <p>{challenge.challengeDescription || 'N/A'}</p>
                      <h4>Your Response:</h4>
                      <p>{challenge.userResponse || 'N/A'}</p>
                      <h4>Official Solution/Explanation:</h4>
                      <p>{challenge.solutionExplanation || 'N/A'}</p>
                      <p className="note-timestamp">Completed: {challenge.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                    </div>
                  )} className="view-button">View Details</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteChallenge(challenge.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallenges;
