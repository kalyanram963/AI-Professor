// src/pages/Flashcards.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const Flashcards = ({ userId, db, appId, updateXP, showModal }) => {
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [savedFlashcards, setSavedFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Fetch saved flashcards
  useEffect(() => {
    if (userId) {
      const flashcardsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/flashcards`);
      const q = query(flashcardsCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        cards.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setSavedFlashcards(cards);
      }, (error) => {
        console.error("Error fetching flashcards:", error);
        showModal("Error loading your saved flashcards.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const handleCreateFlashcard = async () => {
    if (!frontText.trim() || !backText.trim()) {
      showModal("Please enter text for both the front and back of the flashcard.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/flashcards`), {
        front: frontText.trim(),
        back: backText.trim(),
        timestamp: serverTimestamp(),
      });
      showModal("Flashcard created successfully!");
      setFrontText('');
      setBackText('');
      updateXP(5); // Award XP for creating a flashcard
    } catch (error) {
      console.error("Error creating flashcard:", error);
      showModal("Error creating flashcard. Please try again.");
    }
  };

  const handleDeleteFlashcard = async (cardId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this flashcard?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/flashcards`, cardId));
              showModal("Flashcard deleted successfully!");
              // Reset review if the current card is deleted
              if (savedFlashcards[currentCardIndex]?.id === cardId) {
                setIsReviewing(false);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }
            } catch (error) {
              console.error("Error deleting flashcard:", error);
              showModal("Error deleting flashcard. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };

  const startReview = () => {
    if (savedFlashcards.length === 0) {
      showModal("You need to create some flashcards first!");
      return;
    }
    setIsReviewing(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    setIsFlipped(false); // Flip back to front for the next card
    if (currentCardIndex < savedFlashcards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      showModal("You've reviewed all flashcards! Well done!");
      setIsReviewing(false);
      setCurrentCardIndex(0);
    }
  };

  const prevCard = () => {
    setIsFlipped(false); // Flip back to front for the previous card
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const currentCard = savedFlashcards[currentCardIndex];

  return (
    <div className="content-card">
      <h2>Flashcards for Revision</h2>

      <div className="section-block">
        <h3>Create New Flashcard</h3>
        <div className="flashcard-form">
          <textarea
            placeholder="Front of the card (e.g., 'What is the capital of France?')"
            value={frontText}
            onChange={(e) => setFrontText(e.target.value)}
          />
          <textarea
            placeholder="Back of the card (e.g., 'Paris')"
            value={backText}
            onChange={(e) => setBackText(e.target.value)}
          />
          <button onClick={handleCreateFlashcard}>Create Flashcard</button>
        </div>
      </div>

      <div className="section-block">
        <h3>Your Flashcards</h3>
        {savedFlashcards.length === 0 ? (
          <p>No flashcards created yet. Start creating above!</p>
        ) : (
          <>
            <button onClick={startReview} disabled={isReviewing} className="start-review-button">
              {isReviewing ? 'Reviewing...' : 'Start Review'}
            </button>

            {isReviewing && currentCard && (
              <div className="flashcard-review-area">
                <div className={`flashcard-card ${isFlipped ? 'flipped' : ''}`} onClick={flipCard}>
                  <div className="flashcard-front">
                    <p>{currentCard.front}</p>
                  </div>
                  <div className="flashcard-back">
                    <p>{currentCard.back}</p>
                  </div>
                </div>
                <div className="flashcard-navigation">
                  <button onClick={prevCard} disabled={currentCardIndex === 0}>Previous</button>
                  <span>{currentCardIndex + 1} / {savedFlashcards.length}</span>
                  <button onClick={nextCard}>Next</button>
                </div>
                <button onClick={() => setIsReviewing(false)} className="stop-review-button">Stop Review</button>
              </div>
            )}

            <div className="saved-list flashcard-list">
              {savedFlashcards.map(card => (
                <div key={card.id} className="saved-item">
                  <h4>{card.front.substring(0, 50)}...</h4>
                  <p>{card.back.substring(0, 50)}...</p>
                  <div className="item-actions">
                    <button onClick={() => showModal(
                      <div className="full-flashcard-modal">
                        <h4>Front:</h4>
                        <p>{card.front}</p>
                        <h4>Back:</h4>
                        <p>{card.back}</p>
                        <p className="note-timestamp">Created: {card.timestamp?.toDate().toLocaleString() || 'N/A'}</p>
                      </div>
                    )} className="view-button">View</button>
                    <button onClick={() => handleDeleteFlashcard(card.id)} className="delete-button">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
