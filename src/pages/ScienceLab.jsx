import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore'; // Added doc, deleteDoc

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


const ScienceLab = ({ userId, db, appId, updateXP, showModal }) => {
  const [experimentTopic, setExperimentTopic] = useState('');
  const [experimentDescription, setExperimentDescription] = useState('');
  const [experimentOutcome, setExperimentOutcome] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [pastExperiments, setPastExperiments] = useState([]);

  // Fetch past experiments
  useEffect(() => {
    if (userId) {
      const experimentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/scienceExperiments`);
      const q = query(experimentsCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const experiments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        experiments.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setPastExperiments(experiments);
      }, (error) => {
        console.error("Error fetching past experiments:", error);
        showModal("Error loading your past experiments.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const handleSimulateExperiment = async () => {
    if (!experimentTopic.trim()) {
      showModal("Please enter a topic for the experiment.");
      return;
    }

    setIsSimulating(true);
    setExperimentDescription('');
    setExperimentOutcome('');

    const prompt = `Describe a simple science experiment related to "${experimentTopic}".
    Provide the materials needed, the procedure, and a detailed explanation of the expected outcome and the scientific principle behind it.
    Format your response as:
    Experiment: [Description of experiment]
    Materials: [List of materials]
    Procedure: [Steps of procedure]
    Outcome: [Expected outcome and scientific explanation]
    `;

    try {
      // Use window.askGemini if it's a global function, otherwise use the local `askGemini`
      const result = await (typeof window !== 'undefined' && window.askGemini ? window.askGemini(prompt) : askGemini(prompt));

      const expMatch = result.match(/Experiment: (.*?)Materials: (.*?)Procedure: (.*?)Outcome: (.*)/s);

      let desc = "";
      let outcome = "";

      if (expMatch && expMatch.length >= 5) {
        desc = `Experiment: ${expMatch[1].trim()}\nMaterials: ${expMatch[2].trim()}\nProcedure: ${expMatch[3].trim()}`;
        outcome = expMatch[4].trim();
      } else {
        // Fallback for less structured responses
        desc = result.split('Outcome:')[0].trim();
        outcome = result.split('Outcome:').length > 1 ? result.split('Outcome:')[1].trim() : "Outcome not clearly parsed.";
      }

      setExperimentDescription(desc);
      setExperimentOutcome(outcome);

      updateXP(30); // Award XP for simulating an experiment

      // Save experiment to Firestore
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/scienceExperiments`), {
        topic: experimentTopic.trim(),
        description: desc, // Save the parsed description
        outcome: outcome, // Save the parsed outcome
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error simulating experiment:", error);
      showModal("An error occurred while simulating the experiment. Please try again.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleDeleteExperiment = async (experimentId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this experiment?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/scienceExperiments`, experimentId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting experiment:", error);
              showModal("Error deleting experiment. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };

  return (
    <div className="content-card">
      <h2>Virtual Science Lab (Text-Based Simulation)</h2>
      <p>Describe an experiment topic, and the AI will simulate it for you!</p>

      <div className="section-block">
        <h3>Simulate New Experiment</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., 'Volcano eruption', 'Plant growth', 'Acid-base reaction'"
            value={experimentTopic}
            onChange={(e) => setExperimentTopic(e.target.value)}
            disabled={isSimulating}
          />
          <button onClick={handleSimulateExperiment} disabled={isSimulating || !experimentTopic.trim()}>
            {isSimulating ? 'Simulating...' : 'Simulate Experiment'}
          </button>
        </div>

        {experimentDescription && (
          <div className="experiment-output">
            <h4>Experiment Description:</h4>
            <pre>{experimentDescription}</pre> {/* Use pre to preserve formatting */}
            <h4>Expected Outcome & Explanation:</h4>
            <p>{experimentOutcome}</p>
          </div>
        )}
      </div>

      <div className="section-block">
        <h3>Your Past Experiments</h3>
        {pastExperiments.length === 0 ? (
          <p>No experiments simulated yet. Try one!</p>
        ) : (
          <div className="saved-list">
            {pastExperiments.map(exp => (
              <div key={exp.id} className="saved-item">
                <h4>Experiment: {exp.topic || 'N/A'}</h4>
                <p>{(exp.description || '').substring(0, 100)}...</p> {/* Defensive check */}
                <div className="item-actions">
                  <button onClick={() => showModal(
                    <div className="full-experiment-modal">
                      <h4>Topic: {exp.topic || 'N/A'}</h4>
                      <h4>Description:</h4>
                      <pre>{exp.description || 'N/A'}</pre> {/* Defensive check */}
                      <h4>Outcome & Explanation:</h4>
                      <p>{exp.outcome || 'N/A'}</p> {/* Defensive check */}
                      <p className="note-timestamp">Simulated: {exp.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                    </div>
                  )} className="view-button">View Details</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteExperiment(exp.id)}
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

export default ScienceLab;
