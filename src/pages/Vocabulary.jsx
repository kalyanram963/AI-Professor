// src/pages/Vocabulary.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Re-import askGemini function (assuming it's available or passed as prop)
// For this standalone component, we'll assume askGemini is passed as a prop
// or we can re-define it here for demonstration purposes.
// In the final App.jsx, it will be passed down.

// Placeholder for askGemini if not passed as prop directly for testing this component alone
// In the full App.jsx, this will be passed down from the main App component.
const askGemini = async (promptText) => {
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY; // Ensure this is available
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


const Vocabulary = ({ userId, db, appId, updateXP, showModal }) => {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [savedWords, setSavedWords] = useState([]);
  const [grammarText, setGrammarText] = useState('');
  const [grammarCorrection, setGrammarCorrection] = useState('');
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);

  // Fetch saved vocabulary words
  useEffect(() => {
    if (userId) {
      const wordsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/vocabulary`);
      const q = query(wordsCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        words.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setSavedWords(words);
      }, (error) => {
        console.error("Error fetching saved words:", error);
        showModal("Error loading your saved vocabulary.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const handleSearchWord = async () => {
    if (!word.trim()) {
      showModal("Please enter a word to search.");
      return;
    }

    setIsSearching(true);
    setDefinition('');
    setExample('');
    setSynonyms('');

    try {
      const prompt = `Provide a concise definition, an example sentence, and 3-5 synonyms for the word "${word}". Format it as:
      Definition: [definition]
      Example: [example sentence]
      Synonyms: [synonym1, synonym2, ...]`;
      const result = await askGemini(prompt);

      const defMatch = result.match(/Definition: (.*)/);
      const exMatch = result.match(/Example: (.*)/);
      const synMatch = result.match(/Synonyms: (.*)/);

      setDefinition(defMatch ? defMatch[1].trim() : "N/A");
      setExample(exMatch ? exMatch[1].trim() : "N/A");
      setSynonyms(synMatch ? synMatch[1].trim() : "N/A");

      updateXP(10); // Award XP for searching a word

    } catch (error) {
      console.error("Error searching word:", error);
      showModal("An error occurred while searching for the word. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveWord = async () => {
    if (!word.trim() || !definition.trim()) {
      showModal("Please search for a word and get its definition before saving.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/vocabulary`), {
        word: word.trim(),
        definition: definition,
        example: example,
        synonyms: synonyms,
        timestamp: serverTimestamp(),
      });
      showModal("Word saved successfully!");
      setWord('');
      setDefinition('');
      setExample('');
      setSynonyms('');
    } catch (error) {
      console.error("Error saving word:", error);
      showModal("Error saving word. Please try again.");
    }
  };

  const handleDeleteWord = async (wordId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this word?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/vocabulary`, wordId));
              showModal("Word deleted successfully!");
            } catch (error) {
              console.error("Error deleting word:", error);
              showModal("Error deleting word. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };

  const handleCheckGrammar = async () => {
    if (!grammarText.trim()) {
      showModal("Please enter text to check grammar.");
      return;
    }

    setIsCheckingGrammar(true);
    setGrammarCorrection('');

    try {
      const prompt = `Correct the grammar and spelling of the following text. If no corrections are needed, state "No corrections needed." Provide only the corrected text or the "No corrections needed" message.
      Text to correct: "${grammarText}"`;
      const result = await askGemini(prompt);
      setGrammarCorrection(result);
      updateXP(15); // Award XP for grammar check
    } catch (error) {
      console.error("Error checking grammar:", error);
      showModal("An error occurred while checking grammar. Please try again.");
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Vocabulary & Grammar Builder</h2>

      <div className="section-block">
        <h3>Vocabulary Builder</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter a word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            disabled={isSearching}
          />
          <button onClick={handleSearchWord} disabled={isSearching || !word.trim()}>
            {isSearching ? 'Searching...' : 'Search Word'}
          </button>
        </div>

        {definition && (
          <div className="vocabulary-output">
            <h4>{word}</h4>
            <p><strong>Definition:</strong> {definition}</p>
            <p><strong>Example:</strong> {example}</p>
            <p><strong>Synonyms:</strong> {synonyms}</p>
            <button onClick={handleSaveWord} className="save-button">Save Word</button>
          </div>
        )}

        <div className="saved-list">
          <h3>Your Saved Vocabulary</h3>
          {savedWords.length === 0 ? (
            <p>No words saved yet. Search and save some!</p>
          ) : (
            savedWords.map(item => (
              <div key={item.id} className="saved-item">
                <h4>{item.word}</h4>
                <p>{item.definition.substring(0, 100)}...</p>
                <div className="item-actions">
                  <button onClick={() => showModal(
                    <div className="full-word-modal">
                      <h4>{item.word}</h4>
                      <p><strong>Definition:</strong> {item.definition}</p>
                      <p><strong>Example:</strong> {item.example}</p>
                      <p><strong>Synonyms:</strong> {item.synonyms}</p>
                      <p className="note-timestamp">Saved: {item.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                    </div>
                  )} className="view-button">View</button>
                  <button onClick={() => handleDeleteWord(item.id)} className="delete-button">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-block">
        <h3>Grammar Checker</h3>
        <textarea
          placeholder="Paste text for grammar check..."
          value={grammarText}
          onChange={(e) => setGrammarText(e.target.value)}
          disabled={isCheckingGrammar}
        />
        <button onClick={handleCheckGrammar} disabled={isCheckingGrammar || !grammarText.trim()}>
          {isCheckingGrammar ? 'Checking...' : 'Check Grammar'}
        </button>

        {grammarCorrection && (
          <div className="grammar-output">
            <h4>Correction:</h4>
            <p>{grammarCorrection}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vocabulary;

