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


const HistoryCulture = ({ userId, db, appId, updateXP, showModal }) => {
  const [topic, setTopic] = useState('');
  const [response, setResponse] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [pastSearches, setPastSearches] = useState([]);

  // Fetch past searches
  useEffect(() => {
    if (userId) {
      const searchesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/historyCultureSearches`);
      const q = query(searchesCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const searches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        searches.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setPastSearches(searches);
      }, (error) => {
        console.error("Error fetching past searches:", error);
        showModal("Error loading your past history & culture searches.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const handleSearch = async () => {
    if (!topic.trim()) {
      showModal("Please enter a topic to explore.");
      return;
    }

    setIsSearching(true);
    setResponse('');

    const prompt = `Provide a detailed, informative, and concise overview of "${topic}" in history or culture.
    Focus on key facts, important figures, and significant events/aspects.`;

    try {
      // Use window.askGemini if it's a global function, otherwise use the local `askGemini`
      const result = await (typeof window !== 'undefined' && window.askGemini ? window.askGemini(prompt) : askGemini(prompt));
      setResponse(result);
      updateXP(20); // Award XP for exploring a topic

      // Save search to Firestore
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/historyCultureSearches`), {
        topic: topic.trim(),
        response: result,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error searching history/culture topic:", error);
      showModal("An error occurred while exploring the topic. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this exploration?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/historyCultureSearches`, searchId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting exploration:", error);
              showModal("Error deleting exploration. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };

  return (
    <div className="content-card">
      <h2>History & Culture Explorer</h2>

      <div className="section-block">
        <h3>Explore a Topic</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="e.g., 'Ancient Egypt', 'Renaissance Art', 'Japanese Tea Ceremony'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isSearching}
          />
          <button onClick={handleSearch} disabled={isSearching || !topic.trim()}>
            {isSearching ? 'Exploring...' : 'Explore Topic'}
          </button>
        </div>

        {response && (
          <div className="exploration-output">
            <h4>Information on "{topic || 'N/A'}":</h4> {/* Defensive check */}
            <p>{response}</p>
          </div>
        )}
      </div>

      <div className="section-block">
        <h3>Your Past Explorations</h3>
        {pastSearches.length === 0 ? (
          <p>No topics explored yet. Start searching above!</p>
        ) : (
          <div className="saved-list">
            {pastSearches.map(search => (
              <div key={search.id} className="saved-item">
                <h4>{search.topic || 'N/A'}</h4> {/* Defensive check */}
                <p>{(search.response || '').substring(0, 150)}...</p> {/* Defensive check */}
                <div className="item-actions">
                  <button onClick={() => showModal(
                    <div className="full-exploration-modal">
                      <h4>Topic: {search.topic || 'N/A'}</h4> {/* Defensive check */}
                      <p>{search.response || 'N/A'}</p> {/* Defensive check */}
                      <p className="note-timestamp">Explored: {search.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                    </div>
                  )} className="view-button">View Full</button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteSearch(search.id)}
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

export default HistoryCulture;
