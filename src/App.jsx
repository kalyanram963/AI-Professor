import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, serverTimestamp, addDoc, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Chart from 'chart.js/auto'; // For Progress Analytics
import * as THREE from 'three'; // Import THREE.js as a module

// Import all new feature components
import Vocabulary from './pages/Vocabulary';
import Flashcards from './pages/Flashcards';
import DailyChallenges from './pages/DailyChallenges';
import HistoryCulture from './pages/HistoryCulture';
import ScienceLab from './pages/ScienceLab';

// Import Lucide React icons - ONLY NECESSARY ICONS ARE NOW EXPLICITLY IMPORTED
import { MessageSquare, FileText, HelpCircle, Calendar, Edit, BookOpen, CreditCard, Globe, Settings, LogOut, LogIn, UserPlus, Mic, MicOff, Volume2, VolumeX, Upload, Trash2, Eye, Plus, ChevronRight, XCircle, CheckCircle, Clock, Award, TrendingUp, Sun, Moon, User, Key, Mail, Lock, Zap, BarChart2, Puzzle, Atom, Landmark, ClipboardCheck, LayoutDashboard, Camera, VideoOff, Bell, RefreshCcw } from 'lucide-react';

// Polyfill for SpeechRecognition and SpeechSynthesis for broader compatibility
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesis = window.speechSynthesis;

// --- Global Variables Injected by Canvas Environment ---
// These variables are provided by the Canvas environment at runtime.
// For local development, you would typically use environment variables (e.g., from a .env file).
const CANVAS_FIREBASE_CONFIG = window.__firebase_config;
const CANVAS_APP_ID = window.__app_id;
const CANVAS_INITIAL_AUTH_TOKEN = window.__initial_auth_token;

// --- Firebase Configuration and Initialization ---
// Use Canvas-provided config if available, otherwise fall back to placeholders for local dev.
// IMPORTANT: For local development, if running outside of Canvas, you MUST replace
// "YOUR_FIREBASE_API_KEY", "YOUR_AUTH_DOMAIN", "YOUR_PROJECT_ID", etc., with your actual Firebase project credentials.
const firebaseConfig = typeof CANVAS_FIREBASE_CONFIG !== 'undefined'
  ? JSON.parse(CANVAS_FIREBASE_CONFIG)
  : {
<<<<<<< HEAD
      // Cleaned indentation here to fix the SyntaxError: Unexpected character ''
      apiKey: "AIzaSyDnaBfSht42akyQ4kbrxpjiVgENQJ2kuoY",
      authDomain: "ai-proffessor.firebaseapp.com",
      projectId: "ai-proffessor",
      storageBucket: "ai-proffessor.firebasestorage.app",
      messagingSenderId: "564300105563",
      appId: "1:564300105563:web:15f58a22d98ed86be33c7e",
      measurementId: "G-423BGY76M8"
=======
      apiKey: "AIzaSyAZKlwYEgFRH2-Alx7vrbIRrovRog8Cd4g", // Replace with your actual API Key for local development
      authDomain: "education-1a7b6.firebaseapp.com", // Replace with your actual Auth Domain for local development
      projectId: "education-1a7b6", // Replace with your actual Project ID for local development
      storageBucket: "education-1a7b6.firebasestorage.app",
      messagingSenderId: "765145101901",
      appId: "1:765145101901:web:27ee0a2502953c2cafce04",
      measurementId: "G-MVGC0KKRT0"
>>>>>>> e138ed1b01524a51945a24468721cb21e6d8cd70
    };

// Use Canvas-provided app ID if available, otherwise fall back to a default project ID.
const APP_ID_FOR_FIRESTORE = typeof CANVAS_APP_ID !== 'undefined' ? CANVAS_APP_ID : 'education-1a7b6';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

// --- Custom Modal Component (to replace alert) ---
const Modal = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {typeof message === 'string' ? <p>{message}</p> : message}
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

// --- Helper for Markdown Rendering ---
const renderMarkdown = (markdownText) => {
  if (!markdownText) return null;
  let html = markdownText;

  // Headings (H1, H2, H3)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

  // Italic text
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Unordered lists (bullet points)
  html = html.replace(/^\s*[-*] (.*$)/gim, '<li>$1</li>');
  if (html.includes('<li>')) {
    html = `<ul>${html}</ul>`;
    html = html.replace(/<\/li>\s*<li>/g, '</li><li>'); // Clean up extra newlines
  }

  // Paragraphs for remaining text (ensure newlines become <p> tags)
  // This is a very basic paragraph conversion. A full markdown parser handles this better.
  html = html.split('\n\n').map(p => {
    if (p.startsWith('<h1>') || p.startsWith('<h2>') || p.startsWith('<h3>') || p.startsWith('<ul>') || p.startsWith('<li>')) {
      return p; // Don't wrap already formatted blocks
    }
    return `<p>${p}</p>`;
  }).join('');

  // Remove empty paragraphs that might result from splitting
  html = html.replace(/<p>\s*<\/p>/g, '');

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


// --- API Service (geminiApi.js equivalent, now integrated directly or as helper) ---
const askGemini = async (promptText, imageBase64 = null) => {
<<<<<<< HEAD
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyACy4GggMOa9330dZrWSyzxs3bFyP8OyKg"; // Use process.env for local .env files, or empty for Canvas
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
=======
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyBgyaHYxKaUruNAD1mt-x5I28ChQ2n_lFM"; // Use process.env for local .env files, or empty for Canvas
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
>>>>>>> e138ed1b01524a51945a24468721cb21e6d8cd70
  const headers = { 'Content-Type': 'application/json' };
  let payload;

  if (imageBase64) {
    payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/png", // Assuming PNG, adjust if needed
                data: imageBase64
              }
            }
          ]
        }
      ],
    };
  } else {
    payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText }
          ]
        }
      ],
    };
  }

  const MAX_RETRIES = 5;
  let retryCount = 0;
  let delay = 1000; // Start with 1 second delay

  while (retryCount < MAX_RETRIES) {
    try {
      const response = await fetch(`${geminiEndpoint}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        console.warn(`Rate limit exceeded (429). Retrying in ${delay / 1000} seconds...`);
        await new Promise(res => setTimeout(res, delay));
        retryCount++;
        delay *= 2; // Exponential backoff
        continue; // Try again
      }

      // Check for other non-2xx status codes (e.g., 400, 500) that aren't 429
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`API Error ${response.status}:`, errorData);
        // For non-retryable errors, break the loop and return an error message
        return `Gemini API Error (${response.status}): ${errorData.error?.message || 'Unknown error'}`;
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected API response structure:', result);
        return "No response from Gemini AI.";
      }
    } catch (error) {
      // This catch block handles network errors (e.g., no internet, DNS issues)
      console.error("Gemini API fetch error:", error);
      console.warn(`Network error. Retrying in ${delay / 1000} seconds...`);
      await new Promise(res => setTimeout(res, delay));
      retryCount++;
      delay *= 2; // Exponential backoff
    }
  }

  // If all retries fail
  console.error(`Gemini API Error: Failed after ${MAX_RETRIES} retries.`);
  return "Sorry, I couldn't process your request after multiple attempts due to persistent issues.";
};



// --- Component: DashboardContent (src/pages/Dashboard.jsx equivalent) ---
const DashboardContent = ({ userProfile }) => (
  <div className="content-card dashboard-card">
    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Welcome to AI Professor!</h2>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Your personal learning assistant is here to help you excel.</p>
    <div className="dashboard-grid">
      <div className="dashboard-item bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900">
        <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2"><BookOpen className="w-6 h-6" /> Daily Recommended Learning</h3>
        <p className="text-blue-700 dark:text-blue-300">No recommendations yet. Start exploring the sections!</p>
      </div>
      <div className="dashboard-item bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900">
        <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-3 flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Progress Snapshot</h3>
        <p className="text-purple-700 dark:text-purple-300">No progress to display. Start your learning journey!</p>
      </div>
      {userProfile && (
        <div className="dashboard-item profile-summary bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800 dark:to-green-900">
          <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2"><User className="w-6 h-6" /> Your Profile</h3>
          <p className="text-green-700 dark:text-green-300">XP: <span className="font-semibold text-green-900 dark:text-green-100">{userProfile.xp || 0}</span></p>
          <p className="text-green-700 dark:text-green-300">Badges: <span className="font-semibold text-green-900 dark:text-green-100">{userProfile.badges?.length || 0}</span></p>
          <div className="badges-list mt-3 flex flex-wrap gap-2">
            {userProfile.badges?.length === 0 ? (
              <span className="text-green-600 dark:text-green-400 italic">No badges yet. Keep learning!</span>
            ) : (
              userProfile.badges?.map((badge, index) => (
                <span key={index} className="badge-item bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center gap-1">
                  <Award className="w-4 h-4" /> {badge}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

// --- Component: AskProfessorChat (src/pages/ProfessorChat.jsx equivalent) ---
const AskProfessorChat = ({ userId, db, appId, updateXP, showModal }) => {
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatHistoryRef = useRef(null);
  const recognitionRef = useRef(null); // Ref for SpeechRecognition
  const synthRef = useRef(null); // Ref for SpeechSynthesis
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Auto-scroll chat history
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  // Initialize Speech Recognition and Synthesis
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
        recognition.stop();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showModal(`Speech recognition error: ${event.error}`);
        setIsListening(false);
        recognition.stop();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Web Speech API (SpeechRecognition) not supported in this browser.');
    }

    if (SpeechSynthesis) {
      synthRef.current = SpeechSynthesis;
      synthRef.current.onend = () => {
        setIsSpeaking(false);
      };
      synthRef.current.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
    } else {
      console.warn('Web Speech API (SpeechSynthesis) not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel(); // Stop any ongoing speech
      }
    };
  }, [showModal]);

  const speakText = useCallback((text) => {
    if (synthRef.current && text) {
      if (synthRef.current.speaking) {
        synthRef.current.cancel(); // Stop any ongoing speech
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      synthRef.current.speak(utterance);
      setIsSpeaking(true);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Handle sending question to AI (Chat Feature)
  const handleAskQuestion = async () => {
    if (!question.trim() || !userId) {
      showModal("Please type a question to ask the Professor.");
      return;
    }

    const userQuestion = question;
    setQuestion('');
    setIsChatLoading(true);

    // Optimistically update chat history for immediate UI feedback
    setChatHistory(prev => [...prev, { role: 'user', text: userQuestion, id: Date.now() + '_user' }]);

    // Add user message to Firestore
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), {
        role: 'user',
        text: userQuestion,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving user message to Firestore:", error);
      showModal("Error saving your message. Please try again.");
    }

    try {
      const aiResponseText = await askGemini(userQuestion);

      // Add AI response to chat history
      setChatHistory(prev => [...prev, { role: 'ai', text: aiResponseText, id: Date.now() + '_ai' }]);

      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), {
        role: 'ai',
        text: aiResponseText,
        timestamp: serverTimestamp(),
      });
      updateXP(10); // Award XP for asking a question

    } catch (error) {
      console.error('Error fetching AI response or saving to Firestore:', error);
      showModal('An error occurred while connecting to the AI. Please try again.');
      // Add error message to chat history
      setChatHistory(prev => [...prev, { role: 'ai', text: 'An error occurred while connecting to the AI. Please try again.', id: Date.now() + '_error' }]);
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), {
        role: 'ai',
        text: 'An error occurred while connecting to the AI. Please try again.',
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setQuestion(''); // Clear previous input
        recognitionRef.current.start();
        setIsListening(true);
      }
    } else {
      showModal("Speech recognition is not supported in your browser.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isChatLoading) {
      handleAskQuestion();
    }
  };

  return (
    <div className="content-card chat-container">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Ask the Professor</h2>
      <div ref={chatHistoryRef} className="chat-history">
        {chatHistory.length === 0 ? (
          <div className="empty-chat-message">
            Ask me anything! I'm here to help you learn.
          </div>
        ) : (
          chatHistory.map((message, index) => (
            <div
              key={message.id || index}
              className={`chat-message ${message.role}`}
            >
              <p className="role-label">
                {message.role === 'user' ? 'You:' : 'AI Professor:'}
              </p>
              <div className="message-content-with-speak">
                {renderMarkdown(message.text)}
                {message.role === 'ai' && (
                  <button
                    onClick={() => speakText(message.text)}
                    className="speak-chat-button"
                    disabled={isSpeaking}
                  >
                    <Volume2 className="w-4 h-4" />
                    Speak
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {isChatLoading && (
          <div className="chat-message ai loading-message">
            <p className="role-label">AI Professor:</p>
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => e.target.value.length <= 500 && setQuestion(e.target.value)} // Limit input length
          onKeyPress={handleKeyPress}
          disabled={isChatLoading}
        />
        <button
          onClick={toggleListening}
          className={`chat-button voice-button ${isListening ? 'listening' : ''}`}
          disabled={isChatLoading}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={stopSpeaking}
          className="chat-button stop-speak-button"
          disabled={!isSpeaking}
        >
          <VolumeX className="w-6 h-6" />
          Stop Speak
        </button>
      </div>
      {isListening && <div className="listening-indicator">Listening...</div>}
    </div>
  );
};

// --- Component: NotesSummarizer (src/pages/Notes.jsx equivalent) ---
const NotesSummarizer = ({ userId, db, appId, updateXP, showModal }) => {
  const [inputText, setInputText] = useState('');
  const [summarizedNote, setSummarizedNote] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [userNotes, setUserNotes] = useState([]); // To store user's saved notes
  const [viewingNote, setViewingNote] = useState(null); // State to view full note
  const synthRef = useRef(null); // Ref for SpeechSynthesis
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize Speech Synthesis for Notes Summarizer
  useEffect(() => {
    if (SpeechSynthesis) {
      synthRef.current = SpeechSynthesis;
      synthRef.current.onend = () => {
        setIsSpeaking(false);
      };
      synthRef.current.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
    } else {
      console.warn('Web Speech API (SpeechSynthesis) not supported in this browser for Notes.');
    }

    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel(); // Stop any ongoing speech when component unmounts
      }
    };
  }, []);

  const speakSummary = useCallback(() => {
    if (synthRef.current && summarizedNote) {
      if (synthRef.current.speaking) {
        synthRef.current.cancel(); // Stop any ongoing speech
      }
      const utterance = new SpeechSynthesisUtterance(summarizedNote);
      utterance.lang = 'en-US'; // Set language
      synthRef.current.speak(utterance);
      setIsSpeaking(true);
    } else if (!summarizedNote) {
      showModal("No summary to speak. Please generate a summary first.");
    } else {
      showModal("Text-to-speech is not supported in your browser.");
    }
  }, [summarizedNote, showModal]);

  const stopSpeakingNotes = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const notesCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/summarizedNotes`);
      const q = query(notesCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        notes.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setUserNotes(notes);
      }, (error) => {
        console.error("Error fetching user notes:", error);
        showModal("Error loading your saved notes.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      showModal("Please paste some text to summarize.");
      return;
    }

    setIsSummarizing(true);
    setSummarizedNote(''); // Clear previous summary
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel(); // Stop any ongoing speech when a new summary is requested
    }

    try {
      const prompt = `Summarize the following text concisely and clearly. Use Markdown for headings, subheadings, and bullet points to organize the information effectively:\n\n${inputText}`;
      const result = await askGemini(prompt);
      setSummarizedNote(result);

      // Save the original note and summary to Firestore
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/summarizedNotes`), {
        originalText: inputText,
        summary: result, // Save the Markdown formatted summary
        timestamp: serverTimestamp(),
      });
      updateXP(20); // Award XP for summarizing notes

    } catch (error) {
      console.error('Error summarizing note or saving to Firestore:', error);
      showModal('An error occurred while summarizing. Please try again.');
      setSummarizedNote('An error occurred while summarizing. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
      ];

      if (!allowedTypes.includes(file.type)) {
        showModal("Unsupported file type. Please upload a .txt, .pdf, .doc, .docx, .xls, or .xlsx file. Note: Only plain text content will be processed from non-text files.");
      } else if (file.type !== 'text/plain') {
        showModal("You've uploaded a non-text file. The content will be read as plain text, which might result in garbled or incomplete summaries for structured documents like PDFs or Word files.");
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
      };
      reader.readAsText(file); // Always read as text for simplicity, as full parsing is complex
    }
  };

  const handleDeleteNote = async (noteId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this note?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/summarizedNotes`, noteId));
              showModal(null); // Close the confirmation modal
            } catch (error) {
              console.error("Error deleting note:", error);
              showModal("Error deleting note. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };


  return (
    <div className="content-card">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Notes Summarizer</h2>
      <textarea
        className="notes-textarea"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste your notes or text here, or upload a .txt, .pdf, .doc, .docx, or .xlsx file..."
        disabled={isSummarizing}
      />
      <div className="notes-actions">
        <input
          type="file"
          id="file-upload"
          accept=".txt, .pdf, .doc, .docx, .xls, .xlsx"
          onChange={handleFileUpload}
          disabled={isSummarizing}
        />
        <label htmlFor="file-upload" className="file-upload-label">
          <Upload className="w-5 h-5 mr-2" /> Upload File
        </label>
        <button
          onClick={handleSummarize}
          className="summarize-button"
          disabled={isSummarizing || !inputText.trim()}
        >
          {isSummarizing ? 'Summarizing...' : 'Summarize'}
        </button>
      </div>

      {isSummarizing && <p>Loading summary...</p>}

      {summarizedNote && (
        <div className="summarized-output">
          <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">Generated Summary:</h4>
          {renderMarkdown(summarizedNote)}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={speakSummary}
              className="speak-summary-button"
              disabled={!summarizedNote || isSpeaking || isSummarizing}
            >
              <Volume2 className="w-5 h-5" />
              Speak Summary
            </button>
            <button
              onClick={stopSpeakingNotes}
              className="speak-summary-button stop-speak-button"
              disabled={!isSpeaking}
            >
              <VolumeX className="w-5 h-5" />
              Stop Speak
            </button>
          </div>
        </div>
      )}

      <div className="saved-list">
        <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-3">Your Saved Notes</h3>
        {userNotes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 italic">No notes saved yet. Summarize something!</p>
        ) : (
          userNotes.map(note => (
            <div key={note.id} className="saved-note-item">
              <p className="note-timestamp text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 inline-block mr-1" /> {note.timestamp?.toDate().toLocaleString() || 'N/A'}
              </p>
              <p className="note-content text-gray-800 dark:text-gray-200">
                {note.summary.substring(0, 150)}...
              </p>
              <div className="item-actions">
                <button
                  className="view-button"
                  onClick={() => setViewingNote(note)}
                >
                  <Eye className="w-4 h-4 mr-1" /> View Full
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {viewingNote && (
        <Modal
          message={
            <div className="full-note-modal">
              <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-3 border-b border-gray-300 dark:border-gray-600 pb-2">Original Text:</h4>
              {renderMarkdown(viewingNote.originalText)}
              <h4 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-3 mt-6 border-b border-gray-300 dark:border-gray-600 pb-2">Summary:</h4>
              {renderMarkdown(viewingNote.summary)}
            </div>
          }
          onClose={() => setViewingNote(null)}
        />
      )}
    </div>
  );
};

// --- Component: QuizAndTests (src/pages/Quiz.jsx equivalent) ---
const QuizAndTests = ({ userId, db, appId, updateXP, showModal }) => {
  const [topic, setTopic] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // To highlight selected option
  const [quizResults, setQuizResults] = useState([]); // To store past quiz results
  const [numQuestions, setNumQuestions] = useState(3);
  const [difficulty, setDifficulty] = useState('Medium');

  useEffect(() => {
    if (userId) {
      const resultsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/quizResults`);
      const q = query(resultsCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setQuizResults(results);
      }, (error) => {
        console.error("Error fetching quiz results:", error);
        showModal("Error loading past quiz results.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const generateQuiz = async () => {
    if (!topic.trim()) {
      showModal("Please enter a topic to generate a quiz.");
      return;
    }
    if (numQuestions < 1 || numQuestions > 10) {
      showModal("Please select between 1 and 10 questions.");
      return;
    }

    setLoading(true);
    setQuizQuestions([]); // Clear previous quiz
    setSelectedOption(null); // Clear selected option

    const prompt = `
Generate ${numQuestions} multiple choice questions on "${topic}" with "${difficulty}" difficulty.
Each question should have 4 options (A, B, C, D) and one correct answer.
Format output as a strict JSON array like this:

[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "answer": "Paris"
  }
]

Return only JSON. No explanation, no markdown backticks outside the JSON.`;

    const response = await askGemini(prompt);

    try {
      // Safely extract JSON array from response
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        const parsedQuiz = JSON.parse(jsonMatch[0]);
        if (parsedQuiz.length > 0 && parsedQuiz[0].question) { // Basic validation
          setQuizQuestions(parsedQuiz);
          setCurrentQ(0);
          setScore(0);
          setShowScore(false);
        } else {
          showModal("AI generated an invalid quiz. Please try a different topic or regenerate.");
        }
      } else {
        showModal("Could not parse quiz questions from AI response. Please try again.");
      }
    } catch (err) {
      console.error("JSON parsing error:", err);
      showModal("Error parsing quiz data. The AI might have returned an unexpected format.");
    }
    setLoading(false);
  };

  const handleAnswer = async (option) => {
    setSelectedOption(option); // Highlight selected option
    const isCorrect = option === quizQuestions[currentQ].answer;
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    // Small delay to show selected option before moving to next question
    setTimeout(() => {
      const nextQ = currentQ + 1;
      if (nextQ < quizQuestions.length) {
        setCurrentQ(nextQ);
        setSelectedOption(null); // Reset selected option for next question
      } else {
        setShowScore(true);
        updateXP(score * 5 + (isCorrect ? 5 : 0)); // Award XP based on score
        // Save quiz result to Firestore
        try {
          addDoc(collection(db, `artifacts/${appId}/users/${userId}/quizResults`), {
            topic: topic,
            score: score + (isCorrect ? 1 : 0), // Add current question's score
            totalQuestions: quizQuestions.length,
            timestamp: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error saving quiz result:", error);
          showModal("Error saving quiz result.");
        }
      }
    }, 500); // 0.5 second delay
  };

  // Delete quiz result
  const handleDeleteQuizResult = async (resultId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this quiz result?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/quizResults`, resultId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting quiz result:", error);
              showModal("Error deleting quiz result. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };


  return (
    <div className="content-card">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">AI-Generated Quiz</h2>
      <div className="quiz-controls">
        <input
          type="text"
          placeholder="Enter quiz topic (e.g., Machine Learning)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
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
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          disabled={loading}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <button onClick={generateQuiz} disabled={loading || !topic.trim()}>
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {loading && <p>Generating quiz...</p>}

      {quizQuestions.length > 0 && !showScore && (
        <div className="quiz-question-card">
          <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{quizQuestions[currentQ].question}</h4>
          <div className="quiz-options-grid">
            {quizQuestions[currentQ].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt)}
                className={`quiz-option-button ${selectedOption === opt ? 'selected' : ''}`}
                disabled={selectedOption !== null}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {showScore && (
        <div className="quiz-score-card">
          <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">Quiz Completed!</h3>
          <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">Your Score: <span className="font-semibold">{score} / {quizQuestions.length}</span></p>
          <button onClick={() => { setQuizQuestions([]); setTopic(''); setShowScore(false); setCurrentQ(0); setScore(0); setSelectedOption(null); }}>
            Take Another Quiz
          </button>
        </div>
      )}

      <div className="saved-list" style={{marginTop: '40px'}}>
        <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-3">Past Quiz Results</h3>
        {quizResults.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 italic">No quiz results saved yet. Take a quiz!</p>
        ) : (
          quizResults.map(result => (
            <div key={result.id} className="saved-note-item"> {/* Reused saved-note-item class for consistent styling */}
              <p className="text-gray-800 dark:text-gray-200"><strong>Topic:</strong> <span className="font-medium">{result.topic}</span></p>
              <p className="text-gray-800 dark:text-gray-200"><strong>Score:</strong> <span className="font-medium">{result.score} / {result.totalQuestions}</span></p>
              <p className="note-timestamp text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 inline-block mr-1" /> {result.timestamp?.toDate().toLocaleString() || 'N/A'}
              </p>
              <div className="item-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteQuizResult(result.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Component: PersonalStudyPlan ---
const PersonalStudyPlan = ({ userId, db, appId, showModal }) => {
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [studyPlans, setStudyPlans] = useState([]);

  useEffect(() => {
    if (userId) {
      const plansCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/studyPlans`);
      const q = query(plansCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        plans.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setStudyPlans(plans);
      }, (error) => {
        console.error("Error fetching study plans:", error);
        showModal("Error loading your study plans.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);

  const handleCreatePlan = async () => {
    if (!planTitle.trim() || !planDescription.trim() || !planDate) {
      showModal("Please fill in all fields for the study plan.");
      return;
    }

    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/studyPlans`), {
        title: planTitle,
        description: planDescription,
        date: planDate,
        timestamp: serverTimestamp(),
      });
      setPlanTitle('');
      setPlanDescription('');
      setPlanDate('');
      showModal("Study plan created successfully!");
    } catch (error) {
      console.error("Error creating study plan:", error);
      showModal("Error creating study plan. Please try again.");
    }
  };

  const handleDeletePlan = async (planId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this study plan?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/studyPlans`, planId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting study plan:", error);
              showModal("Error deleting study plan. Please try again.");
            }
          }} className="confirm-yes">Yes</button>
          <button onClick={() => showModal(null)} className="confirm-no">No</button>
        </div>
      </div>
    );
  };

  const generateGoogleCalendarLink = (plan) => {
    const startDate = new Date(plan.date);
    // Check if startDate is a valid date object
    if (isNaN(startDate.getTime())) {
      console.warn("Invalid date for Google Calendar link:", plan.date);
      return null; // Return null if the date is invalid
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Assume 1 hour duration for simplicity
    const formatDateTime = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');

    const title = encodeURIComponent(plan.title);
    const description = encodeURIComponent(plan.description);
    const dates = `${formatDateTime(startDate)}/${formatDateTime(endDate)}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${dates}`;
  };

  return (
    <div className="content-card">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Personal Study Plan</h2>
      <div className="study-plan-form">
        <input
          type="text"
          placeholder="Plan Title (e.g., Math Chapter 5 Review)"
          value={planTitle}
          onChange={(e) => setPlanTitle(e.target.value)}
        />
        <textarea
          placeholder="Plan Description (e.g., Solve problems 1-10, read theory)"
          value={planDescription}
          onChange={(e) => setPlanDescription(e.target.value)}
        />
        <input
          type="date"
          value={planDate}
          onChange={(e) => setPlanDate(e.target.value)}
        />
        <button onClick={handleCreatePlan}>
          <Plus className="w-5 h-5 mr-2" /> Create Study Plan
        </button>
      </div>

      <div className="saved-list">
        <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-3">Your Study Plans</h3>
        {studyPlans.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 italic">No study plans created yet.</p>
        ) : (
          studyPlans.map(plan => (
            <div key={plan.id} className="saved-note-item"> {/* Reused saved-note-item class */}
              <h4 className="text-xl font-bold text-purple-600 dark:text-purple-300">{plan.title}</h4>
              <p className="text-gray-800 dark:text-gray-200">{plan.description}</p>
              <p className="text-gray-800 dark:text-gray-200">Date: <span className="font-medium">{plan.date}</span></p>
              <div className="item-actions">
                {generateGoogleCalendarLink(plan) && ( // Only render button if link is valid
                  <a
                    href={generateGoogleCalendarLink(plan)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="calendar-link-button bg-yellow-500 hover:bg-yellow-600">
                      <Calendar className="w-4 h-4 mr-1" /> Add to Google Calendar
                    </button>
                  </a>
                )}
                <button
                  className="delete-button"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Component: DoubtSolver ---
const DoubtSolver = ({ userId, db, appId, updateXP, showModal }) => {
  const [questionText, setQuestionText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [solution, setSolution] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);

  // Effect to set video srcObject when stream and videoRef are ready
  useEffect(() => {
    // Only access videoRef.current inside the effect, not in the dependency array
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]); // Removed videoRef.current from dependencies

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImageBase64(null);
    }
  };

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream); // Set stream, useEffect will handle srcObject
      setIsCameraActive(true);
      setSelectedImage(null); // Clear any previously uploaded image
      setImageBase64(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      showModal(`Could not access camera: ${err.message}. Please ensure you have given camera permissions.`);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null); // Clear stream, useEffect will handle srcObject
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/png');
      setSelectedImage(imageDataUrl);
      setImageBase64(imageDataUrl.split(',')[1]);
      stopCamera(); // Stop camera after capturing
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup camera stream on component unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleSolveDoubt = async () => {
    if (!questionText.trim() && !imageBase64) {
      showModal("Please enter text or upload an image for your doubt.");
      return;
    }

    setIsSolving(true);
    setSolution('');

    let prompt = "Solve the following doubt. Provide a clear solution and explanation. Use Markdown for headings, subheadings, and bullet points to organize the information effectively.";
    if (questionText.trim()) {
      prompt += `: ${questionText}`;
    }

    try {
      const result = await askGemini(prompt, imageBase64);
      setSolution(result);
      updateXP(25); // Award XP for solving a doubt
    } catch (error) {
      console.error("Error solving doubt:", error);
      showModal("An error occurred while solving your doubt. Please try again.");
      setSolution("An error occurred while solving your doubt. Please try again.");
    } finally {
      setIsSolving(false);
    }
  };

  const handleClearOutput = () => {
    setSolution('');
    setQuestionText('');
    setSelectedImage(null);
    setImageBase64(null);
    stopCamera();
  };

  return (
    <div className="content-card">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Doubt Solver (Image + Text + Camera)</h2>
      <div className="doubt-solver-input">
        <textarea
          placeholder="Describe your doubt here..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          disabled={isSolving}
        />
        <div className="camera-controls">
          {!isCameraActive ? (
            <button onClick={startCamera} disabled={isSolving}>
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </button>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline className="camera-feed"></video>
              <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              <button onClick={capturePhoto} disabled={isSolving}>
                <Camera className="w-5 h-5 mr-2" />
                Capture Photo
              </button>
              <button onClick={stopCamera} disabled={isSolving} className="stop-camera-button">
                <VideoOff className="w-5 h-5 mr-2" />
                Stop Camera
              </button>
            </>
          )}
        </div>
        <input
          type="file"
          id="doubt-image-upload"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isSolving || isCameraActive}
        />
        <label htmlFor="doubt-image-upload" className="file-upload-label">
          <Upload className="w-5 h-5 mr-2" /> Upload Image (Optional)
        </label>
        {selectedImage && (
          <img src={selectedImage} alt="Selected for doubt" className="uploaded-image" />
        )}
        <button onClick={handleSolveDoubt} disabled={isSolving || (!questionText.trim() && !selectedImage)}>
          {isSolving ? 'Solving...' : 'Solve Doubt'}
        </button>
      </div>

      {isSolving && <p>Solving your doubt...</p>}

      {solution && (
        <div className="doubt-solution">
          <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">Solution:</h4>
          {renderMarkdown(solution)}
          <div className="item-actions" style={{justifyContent: 'flex-start', marginTop: '15px'}}>
            <button
              className="clear-output-button"
              onClick={handleClearOutput}
            >
              <XCircle className="w-4 h-4 mr-1" /> Clear Output
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Component: ProgressAnalytics ---
const ProgressAnalytics = ({ userId, db, appId, showModal }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [progressData, setProgressData] = useState({
    labels: [],
    quizScores: [],
    notesSummarized: [],
    chatInteractions: [],
  });

  useEffect(() => {
    if (userId) {
      const unsubscribeQuiz = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/quizResults`), (snapshot) => {
        const scores = snapshot.docs.map(doc => ({ ...doc.data(), date: doc.data().timestamp?.toDate() || new Date() }));
        const sortedScores = scores.sort((a, b) => a.date - b.date);

        const labels = sortedScores.map(s => s.date.toLocaleDateString());
        const quizScores = sortedScores.map(s => (s.score / s.totalQuestions) * 100); // Percentage

        setProgressData(prev => ({ ...prev, labels, quizScores }));
      }, (error) => {
        console.error("Error fetching quiz results for analytics:", error);
        showModal("Error loading quiz data for analytics.");
      });

      const unsubscribeNotes = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/summarizedNotes`), (snapshot) => {
        const notesCount = snapshot.docs.length;
        setProgressData(prev => ({ ...prev, notesSummarized: Array(prev.labels.length).fill(notesCount) }));
      }, (error) => {
        console.error("Error fetching notes for analytics:", error);
      });

      const unsubscribeChat = onSnapshot(collection(db, `artifacts/${appId}/users/${userId}/chatHistory`), (snapshot) => {
        const chatCount = snapshot.docs.length;
        setProgressData(prev => ({ ...prev, chatInteractions: Array(prev.labels.length).fill(chatCount) }));
      }, (error) => {
        console.error("Error fetching chat history for analytics:", error);
      });

      return () => {
        unsubscribeQuiz();
        unsubscribeNotes();
        unsubscribeChat();
      };
    }
  }, [userId, db, appId, showModal]);

  useEffect(() => {
    if (chartRef.current && progressData.labels.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy old chart instance
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: progressData.labels,
          datasets: [
            {
              label: 'Quiz Scores (%)',
              data: progressData.quizScores,
              borderColor: 'var(--primary-color)',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              tension: 0.3,
              fill: true,
            },
            {
              label: 'Notes Summarized',
              data: progressData.notesSummarized,
              borderColor: '#34d399', // Green
              backgroundColor: 'rgba(52, 211, 153, 0.2)',
              tension: 0.3,
              hidden: true, // Hide by default
            },
            {
              label: 'Chat Interactions',
              data: progressData.chatInteractions,
              borderColor: '#f4b400', // Yellow
              backgroundColor: 'rgba(244, 180, 0, 0.2)',
              tension: 0.3,
              hidden: true, // Hide by default
            }
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: getComputedStyle(document.body).getPropertyValue('--text-color'), // Dynamic color
              }
            },
            title: {
              display: true,
              text: 'Your Learning Progress Over Time',
              font: {
                size: 18,
                weight: 'bold',
              },
              color: getComputedStyle(document.body).getPropertyValue('--text-color'), // Dynamic color
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Value',
                color: getComputedStyle(document.body).getPropertyValue('--text-light'),
              },
              ticks: {
                color: getComputedStyle(document.body).getPropertyValue('--text-light'),
              },
              grid: {
                color: 'rgba(0,0,0,0.05)',
              }
            },
            x: {
              title: {
                display: true,
                text: 'Date',
                color: getComputedStyle(document.body).getPropertyValue('--text-light'),
              },
              ticks: {
                color: getComputedStyle(document.body).getPropertyValue('--text-light'),
              },
              grid: {
                color: 'rgba(0,0,0,0.05)',
              }
            }
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [progressData]);

  return (
    <div className="content-card">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Progress Analytics</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">Track your topics covered, quiz scores, and improvement areas here.</p>
      <div className="chart-container" style={{height: '400px'}}>
        <canvas ref={chartRef}></canvas>
      </div>
      {progressData.labels.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400 italic">No data to display yet. Start using the app to see your progress!</p>
      )}
    </div>
  );
};

// --- Component: ProfileAndSettings ---
const ProfileAndSettings = ({ userProfile, showModal, handleLogout }) => {
  // Initialize isDarkMode to true (dark mode by default)
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    // If no theme is saved or if it's explicitly 'dark', apply dark mode
    if (savedTheme === 'dark' || savedTheme === null) {
      document.body.classList.add('dark-mode');
      setIsDarkMode(true);
    } else { // If it's explicitly 'light'
      document.body.classList.remove('dark-mode');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="content-card settings-card">
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Profile & Settings</h2>

      <div className="settings-section profile-display">
        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 flex items-center gap-2"><User className="w-6 h-6" /> Your Profile</h3>
        <div className="profile-info-grid">
          <div className="info-item">
            <strong className="text-gray-800 dark:text-gray-200 flex items-center gap-1"><User className="w-4 h-4" /> User ID:</strong>
            <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">{userProfile.id || 'N/A'}</span>
          </div>
          <div className="info-item">
            <strong className="text-gray-800 dark:text-gray-200 flex items-center gap-1"><Zap className="w-4 h-4" /> XP:</strong>
            <span className="text-gray-600 dark:text-gray-400 font-semibold">{userProfile.xp || 0}</span>
          </div>
          <div className="info-item full-width">
            <strong className="text-gray-800 dark:text-gray-200 flex items-center gap-1"><Award className="w-4 h-4" /> Badges:</strong>
            <div className="badges-list flex flex-wrap gap-2 mt-2">
              {userProfile.badges?.length === 0 ? (
                <span className="text-gray-500 dark:text-gray-400 italic">No badges yet. Keep learning!</span>
              ) : (
                userProfile.badges?.map((badge, index) => (
                  <span key={index} className="badge-item bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center gap-1">
                    <Award className="w-4 h-4" /> {badge}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section app-settings">
        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 flex items-center gap-2"><Settings className="w-6 h-6" /> App Settings</h3>
        <div className="setting-item">
          <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1"><Sun className="w-4 h-4" /> / <Moon className="w-4 h-4" /> Theme:</span>
          <button onClick={toggleTheme} className="theme-toggle-button">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="setting-item">
          <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1"><Globe className="w-4 h-4" /> Language:</span>
          <p className="setting-value text-gray-600 dark:text-gray-400">English (Default)</p>
        </div>
        <div className="setting-item">
          <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1"><Bell className="w-4 h-4" /> Notifications:</span>
          <p className="setting-value text-gray-600 dark:text-gray-400">Coming Soon</p>
        </div>
      </div>

      <div className="settings-section account-actions">
        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4 border-b border-gray-300 dark:border-gray-600 pb-2 flex items-center gap-2"><Key className="w-6 h-6" /> Account Actions</h3>
        <button onClick={handleLogout} className="logout-button">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};


// --- Component: Aptitude (src/pages/Aptitude.jsx equivalent) ---
const Aptitude = ({ userId, db, appId, updateXP, showModal }) => {
  const [aptitudeTopic, setAptitudeTopic] = useState('');
  const [aptitudeType, setAptitudeType] = useState('Logical Reasoning');
  const [numQuestions, setNumQuestions] = useState(1); // New state for number of questions
  const [aptitudeQuestions, setAptitudeQuestions] = useState([]); // Stores array of questions
  const [currentQIndex, setCurrentQIndex] = useState(0); // Tracks current question index
  const [selectedOption, setSelectedOption] = useState(''); // Stores the selected option for current question
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [aptitudeHistory, setAptitudeHistory] = useState([]); // To store past aptitude questions/attempts
  const [showScore, setShowScore] = useState(false); // New state to show final score
  const [score, setScore] = useState(0); // Tracks score for the current session

  useEffect(() => {
    if (userId) {
      const historyCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/aptitudeHistory`);
      const q = query(historyCollectionRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        history.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0));
        setAptitudeHistory(history);
      }, (error) => {
        console.error("Error fetching aptitude history:", error);
        showModal("Error loading your aptitude history.");
      });
      return () => unsubscribe();
    }
  }, [userId, db, appId, showModal]);


  const generateAptitudeQuestion = async () => {
    if (!aptitudeTopic.trim()) {
      showModal("Please enter a topic for the aptitude question.");
      return;
    }
    if (numQuestions < 1 || numQuestions > 10) {
      showModal("Please select between 1 and 10 questions.");
      return;
    }

    setIsLoading(true);
    setAptitudeQuestions([]); // Clear previous questions
    setCurrentQIndex(0); // Reset to first question
    setSelectedOption('');
    setFeedback('');
    setShowSolution(false);
    setShowScore(false); // Hide score screen
    setScore(0); // Reset score

    const prompt = `Generate ${numQuestions} multiple choice questions on the topic "${aptitudeTopic}" of "${aptitudeType}" type.
    Each question should have 4 distinct options (A, B, C, D) and one correct answer.
    Provide a detailed explanation for the solution.
    Format output as a strict JSON array like this:

    [
      {
        "question": "If a train travels at 60 km/h, how long does it take to travel 300 km?",
        "options": ["A) 4 hours", "B) 5 hours", "C) 6 hours", "D) 7 hours"],
        "answer": "B) 5 hours",
        "explanation": "Time = Distance / Speed = 300 km / 60 km/h = 5 hours."
      },
      {
        "question": "What is the capital of France?",
        "options": ["A) Berlin", "B) Madrid", "C) Paris", "D) Rome"],
        "answer": "C) Paris",
        "explanation": "Paris is the capital and most populous city of France."
      }
    ]

    Return only JSON. No explanation, no markdown backticks outside the JSON.`;

    try {
      const response = await askGemini(prompt);
      console.log("Raw AI response for Aptitude (inside App.jsx):", response); // Log raw response for debugging

      let parsedQuestions = [];
      try {
        // First, try to find a JSON array wrapped in markdown code blocks (```json ... ```)
        const jsonCodeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonCodeBlockMatch && jsonCodeBlockMatch[1]) {
          parsedQuestions = JSON.parse(jsonCodeBlockMatch[1]);
        } else {
          // If not found, try to find a direct JSON array pattern
          const jsonArrayMatch = response.match(/\[\s*\{[\s\S]*?\}\s*\]/);
          if (jsonArrayMatch && jsonArrayMatch[0]) {
            parsedQuestions = JSON.parse(jsonArrayMatch[0]);
          } else {
            // As a last resort, try to parse the whole response directly
            parsedQuestions = JSON.parse(response);
          }
        }
      } catch (parseError) {
        console.error("JSON parsing error in Aptitude (inside App.jsx):", parseError);
        console.error("Raw AI response that caused parsing error:", response);
        showModal("Error parsing AI response. The AI might have returned an unexpected format. Please try again or refine your topic.");
        return; // Exit if parsing fails
      }

      console.log("Parsed Aptitude Questions (inside App.jsx):", parsedQuestions); // Log parsed questions for debugging

      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0 && parsedQuestions[0].question) { // Basic validation
        setAptitudeQuestions(parsedQuestions);
      } else {
        showModal("AI generated an invalid or empty set of questions. Please try a different topic or regenerate.");
      }
    } catch (error) {
      console.error("Error generating aptitude question:", error);
      showModal("An error occurred while generating the aptitude question. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    const currentQuestion = aptitudeQuestions[currentQIndex];
    if (!currentQuestion || !selectedOption) {
      showModal("Please select an option before checking the answer.");
      return;
    }

    const isCorrect = selectedOption === currentQuestion.answer;
    let feedbackMessage = '';
    if (isCorrect) {
      feedbackMessage = 'Correct! Well done.';
      setScore(prevScore => prevScore + 1); // Increment score
      updateXP(15); // Award XP for correct answer
    } else {
      feedbackMessage = 'Incorrect. Review the explanation.';
    }
    setFeedback(feedbackMessage);
    setShowSolution(true);

    // Save attempt to Firestore history
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/aptitudeHistory`), {
        topic: aptitudeTopic,
        question: currentQuestion.question,
        options: currentQuestion.options,
        userAnswer: selectedOption,
        correctAnswer: currentQuestion.answer,
        explanation: currentQuestion.explanation,
        isCorrect: isCorrect,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving aptitude attempt:", error);
      showModal("Error saving your aptitude attempt.");
    }
  };

  const handleNextQuestion = () => {
    const nextIndex = currentQIndex + 1;
    if (nextIndex < aptitudeQuestions.length) {
      setCurrentQIndex(nextIndex);
      setSelectedOption('');
      setFeedback('');
      setShowSolution(false);
    } else {
      setShowScore(true); // All questions answered, show score
    }
  };

  const handleResetSession = () => {
    setAptitudeTopic('');
    setNumQuestions(1);
    setAptitudeQuestions([]);
    setCurrentQIndex(0);
    setSelectedOption('');
    setFeedback('');
    setShowSolution(false);
    setShowScore(false);
    setScore(0);
  };

  const handleDeleteAptitudeHistoryItem = async (itemId) => {
    showModal(
      <div className="confirm-modal-content">
        <p>Are you sure you want to delete this aptitude history item?</p>
        <div className="confirm-buttons">
          <button onClick={async () => {
            try {
              await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/aptitudeHistory`, itemId));
              showModal(null);
            } catch (error) {
              console.error("Error deleting aptitude history item:", error);
              showModal("Error deleting item. Please try again.");
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
      <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">Aptitude & Reasoning</h2>
      <div className="section-block">
        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mb-4 flex items-center gap-2"><Puzzle className="w-6 h-6" /> Generate Aptitude Question(s)</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter topic (e.g., Time & Work, Logical Puzzles)"
            value={aptitudeTopic}
            onChange={(e) => setAptitudeTopic(e.target.value)}
            disabled={isLoading}
          />
          <select
            value={aptitudeType}
            onChange={(e) => setAptitudeType(e.target.value)}
            disabled={isLoading}
          >
            <option value="Logical Reasoning">Logical Reasoning</option>
            <option value="Quantitative Aptitude">Quantitative Aptitative</option>
            <option value="Verbal Ability">Verbal Ability</option>
          </select>
          <input
            type="number"
            placeholder="No. of Questions (1-10)"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
            disabled={isLoading}
            className="w-full md:w-auto" // Tailwind for responsiveness
          />
          <button onClick={generateAptitudeQuestion} disabled={isLoading || !aptitudeTopic.trim()}>
            {isLoading ? 'Generating...' : <><Plus className="w-5 h-5 mr-2" /> Generate Question(s)</>}
          </button>
        </div>

        {isLoading && <p>Generating question(s)...</p>}

        {aptitudeQuestions.length > 0 && !showScore && currentQuestion && (
          <div className="aptitude-question-card">
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Question {currentQIndex + 1} of {aptitudeQuestions.length}:</h4>
            <p className="question-text">{currentQuestion.question}</p>
            <div className="options-list">
              {currentQuestion.options.map((opt, idx) => (
                <label key={idx} className="option-item">
                  <input
                    type="radio"
                    name="aptitude-option"
                    value={opt}
                    checked={selectedOption === opt}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    disabled={feedback !== ''} // Disable options after checking answer
                  />
                  {opt}
                </label>
              ))}
            </div>
            <div className="answer-area">
              {feedback === '' ? (
                <button onClick={handleCheckAnswer} disabled={!selectedOption || isLoading}>
                  <CheckCircle className="w-5 h-5 mr-2" /> Check Answer
                </button>
              ) : (
                <button onClick={handleNextQuestion}>
                  {currentQIndex < aptitudeQuestions.length - 1 ? <><ChevronRight className="w-5 h-5 mr-2" /> Next Question</> : <><ClipboardCheck className="w-5 h-5 mr-2" /> Finish Session</>}
                </button>
              )}
            </div>
            {feedback && <p className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>{feedback}</p>}
            {showSolution && currentQuestion.explanation && (
              <div className="solution-display">
                <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mb-3">Explanation:</h4>
                {renderMarkdown(currentQuestion.explanation)}
              </div>
            )}
          </div>
        )}

        {showScore && (
          <div className="quiz-score-card"> {/* Reusing quiz-score-card for consistent styling */}
            <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-4">Aptitude Session Completed!</h3>
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-6">Your Score: <span className="font-semibold">{score} / {aptitudeQuestions.length}</span></p>
            <button onClick={handleResetSession}>
              <RefreshCcw className="w-5 h-5 mr-2" /> Start New Session
            </button>
          </div>
        )}
      </div>

      <div className="saved-list">
        <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mb-5 border-b-2 border-gray-200 dark:border-gray-700 pb-3">Aptitude History</h3>
        {aptitudeHistory.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 italic">No aptitude questions attempted yet.</p>
        ) : (
          aptitudeHistory.map(item => (
            <div key={item.id} className="saved-note-item">
              <h4 className="text-xl font-bold text-purple-600 dark:text-purple-300">Question: {item.question}</h4>
              <p className="text-gray-800 dark:text-gray-200">Your Answer: <span className="font-medium">{item.userAnswer}</span></p>
              <p className="text-gray-800 dark:text-gray-200">Correct Answer: <span className="font-medium">{item.correctAnswer}</span></p>
              <p className={`feedback ${item.isCorrect ? 'correct' : 'incorrect'}`}>
                Result: {item.isCorrect ? <><CheckCircle className="w-4 h-4 inline-block mr-1" /> Correct</> : <><XCircle className="w-4 h-4 inline-block mr-1" /> Incorrect</>}
              </p>
              <p className="text-gray-800 dark:text-gray-200">Explanation: {renderMarkdown(item.explanation)}</p>
              <p className="note-timestamp text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 inline-block mr-1" /> {item.timestamp?.toDate().toLocaleString() || 'N/A'}
              </p>
              <div className="item-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteAptitudeHistoryItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Component: RegisterPage ---
const RegisterPage = ({ showModal, onRegisterSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showModal("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create a user profile in Firestore immediately after registration
      const userRef = doc(db, `artifacts/${APP_ID_FOR_FIRESTORE}/users/${userCredential.user.uid}/profile/data`);
      await setDoc(userRef, {
        xp: 0,
        badges: [],
        createdAt: serverTimestamp(),
        email: userCredential.user.email,
      });
      showModal("Registration successful! Please log in.");
      onRegisterSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      showModal(`Registration failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 flex items-center justify-center gap-2"><UserPlus className="w-8 h-8" /> Register</h2>
        <form onSubmit={handleRegister}>
          <div className="input-with-icon">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : <><UserPlus className="w-5 h-5 mr-2" /> Register</>}
          </button>
        </form>
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="link-button">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

// --- Component: LoginPage ---
const LoginPage = ({ showModal, onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showModal("Login successful!");
      onLoginSuccess();
    } catch (error) {
      console.error("Login error:", error);
      showModal(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6 flex items-center justify-center gap-2"><LogIn className="w-8 h-8" /> Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-with-icon">
            <Mail className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : <><LogIn className="w-5 h-5 mr-2" /> Login</>}
          </button>
        </form>
        <p className="text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} className="link-button">
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

// --- Component: ThreeDBackground (for subtle 3D effect) ---
const ThreeDBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 10; // Start a bit further back

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000; // More particles for a denser field
    const posArray = new Float32Array(particlesCount * 3); // x, y, z for each particle

    for (let i = 0; i < particlesCount * 3; i++) {
      // Random positions within a cube
      posArray[i] = (Math.random() - 0.5) * 20; // -10 to 10
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material for particles
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05, // Smaller particles
      color: 0x8b5cf6, // Light purple/indigo color
      transparent: true,
      blending: THREE.AdditiveBlending, // For glowing effect
      depthWrite: false, // Prevents particles from obscuring each other incorrectly
      sizeAttenuation: true, // Particles closer to camera appear larger
      opacity: 0.8 // Slightly more opaque than the sphere
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lights (minimal for particles)
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Subtle particle movement (e.g., floating upwards or slight oscillation)
      // This creates a "level movement" feeling
      particles.position.y = Math.sin(elapsedTime * 0.1) * 0.5;
      particles.position.x = Math.cos(elapsedTime * 0.05) * 0.3;

      // Subtle camera orbit
      camera.position.x = Math.sin(elapsedTime * 0.03) * 12;
      camera.position.z = Math.cos(elapsedTime * 0.03) * 12;
      camera.lookAt(scene.position); // Always look at the center

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
      }
    };
  }, []);

  return <div ref={mountRef} className="three-d-background"></div>;
};


// --- Main App Component ---
const App = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userProfile, setUserProfile] = useState({ id: null, xp: 0, badges: [] }); // Added 'id' to userProfile
  const [modalMessage, setModalMessage] = useState(null);
  const [authPage, setAuthPage] = useState('login'); // Start with login page by default

  const showModal = useCallback((message) => {
    setModalMessage(message);
  }, []);

  const closeModal = useCallback(() => {
    setModalMessage(null);
  }, []);

  // Firebase Authentication and User Profile Management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        console.log("User signed in:", currentUser.uid);

        // Fetch or create user profile
        const profileRef = doc(db, `artifacts/${APP_ID_FOR_FIRESTORE}/users/${currentUser.uid}/profile/data`);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setUserProfile({ id: currentUser.uid, ...profileSnap.data() }); // Include uid in profile
        } else {
          // Create a new profile if it doesn't exist (e.g., for new registrations or anonymous Canvas users)
          // Note: signInAnonymously is no longer used, so this path is primarily for new email/password registrations
          await setDoc(profileRef, { xp: 0, badges: [], createdAt: serverTimestamp(), email: currentUser.email || 'anonymous' });
          setUserProfile({ id: currentUser.uid, xp: 0, badges: [], email: currentUser.email || 'anonymous' });
        }
        setIsAuthReady(true); // Auth is ready, user is logged in
      } else {
        setUser(null);
        setUserId(null);
        setUserProfile({ id: null, xp: 0, badges: [] });
        // Only attempt custom token sign-in if running in Canvas environment and token is provided
        if (typeof CANVAS_INITIAL_AUTH_TOKEN !== 'undefined' && CANVAS_INITIAL_AUTH_TOKEN) {
          try {
            await signInWithCustomToken(auth, CANVAS_INITIAL_AUTH_TOKEN);
            console.log("Signed in with custom token.");
            // onAuthStateChanged will re-trigger and set user/profile
          } catch (error) {
            console.error("Error signing in with custom token:", error);
            showModal(`Authentication Error (Custom Token): ${error.message}`);
            setIsAuthReady(true); // Auth failed, show login/register
          }
        } else {
          setIsAuthReady(true); // No token, proceed to login/register
        }
      }
    });

    return () => unsubscribe();
  }, [showModal]);

  // Function to update XP and potentially award badges
  const updateXP = useCallback(async (amount) => {
    if (!userId) return;

    const profileRef = doc(db, `artifacts/${APP_ID_FOR_FIRESTORE}/users/${userId}/profile/data`);
    try {
      const profileSnap = await getDoc(profileRef);
      let currentXP = 0;
      let currentBadges = [];

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        currentXP = data.xp || 0;
        currentBadges = data.badges || [];
      }

      const newXP = currentXP + amount;
      const newBadges = [...currentBadges];

      // Simple badge logic (can be expanded)
      if (newXP >= 50 && !newBadges.includes('Novice Learner')) {
        newBadges.push('Novice Learner');
        showModal("Congratulations! You earned the 'Novice Learner' badge!");
      }
      if (newXP >= 200 && !newBadges.includes('Active Scholar')) {
        newBadges.push('Active Scholar');
        showModal("Congratulations! You earned the 'Active Scholar' badge!");
      }
      if (newXP >= 500 && !newBadges.includes('Professor Apprentice')) {
        newBadges.push('Professor Apprentice');
        showModal("Congratulations! You earned the 'Professor Apprentice' badge!");
      }

      await updateDoc(profileRef, {
        xp: newXP,
        badges: newBadges,
        lastUpdated: serverTimestamp(),
      });
      setUserProfile(prev => ({ ...prev, xp: newXP, badges: newBadges })); // Update local state
    } catch (error) {
      console.error("Error updating XP or badges:", error);
      showModal("Error updating your progress.");
    }
  }, [userId, showModal]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserId(null);
      setUserProfile({ id: null, xp: 0, badges: [] }); // Reset profile on logout
      setCurrentPage('dashboard'); // Go back to dashboard or default page
      setAuthPage('login'); // Show login page after logout
      showModal("You have been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
      showModal("Error logging out. Please try again.");
    }
  };

  const handleRegisterSuccess = useCallback(() => {
    setAuthPage('login'); // After register, go to login
  }, []);

  const handleLoginSuccess = useCallback(() => {
    // onAuthStateChanged will handle setting user and profile, and then isAuthReady will become true
    // No explicit page change needed here, as the useEffect will handle it.
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setAuthPage('login');
  }, []);

  const handleSwitchToRegister = useCallback(() => {
    setAuthPage('register');
  }, []);


  if (!isAuthReady) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading AI Professor...</p>
      </div>
    );
  }

  // If not logged in, show auth pages
  if (!user) {
    return (
      <>
        <style>{`
          /* Auth-specific styles */
          .auth-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #2a0050, #000000); /* Darker, more dramatic gradient */
            padding: 20px;
          }
          .auth-card {
            background: rgba(255, 255, 255, 0.05); /* Semi-transparent white for frosted glass effect */
            backdrop-filter: blur(10px); /* Frosted glass effect */
            border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
            padding: 50px; /* Increased padding */
            border-radius: 20px; /* More rounded corners */
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 60px rgba(79, 70, 229, 0.3); /* Stronger, more vibrant shadow */
            width: 100%;
            max-width: 480px; /* Slightly wider */
            text-align: center;
            transition: all 0.5s ease;
            position: relative;
            overflow: hidden;
            color: white; /* Default text color for auth card */
          }
          body.dark-mode .auth-card {
            background: rgba(0, 0, 0, 0.2); /* Darker semi-transparent for dark mode */
            border-color: rgba(255, 255, 255, 0.15);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 80px rgba(99, 102, 241, 0.4);
          }
          .auth-card h2 {
            font-size: 38px; /* Larger heading */
            font-weight: 800;
            color: #fff; /* White for heading */
            margin-bottom: 40px; /* More space */
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px; /* More space around icon */
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
          }
          .auth-card h2 .lucide { /* Style for Lucide icons inside H2 */
            color: #a78bfa; /* Light purple accent for icons */
            filter: drop-shadow(0 0 5px rgba(167, 139, 250, 0.5));
          }
          .auth-card form {
            display: flex;
            flex-direction: column;
            gap: 20px; /* Increased gap */
            margin-bottom: 30px;
          }
          .input-with-icon {
            position: relative;
            width: 100%;
          }
          .input-with-icon .input-icon {
            position: absolute;
            left: 20px; /* More padding for icon */
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.6); /* Lighter icon color */
            width: 22px; /* Slightly larger icon */
            height: 22px;
          }
          .auth-card input {
            padding: 15px 20px 15px 55px; /* Adjust padding for larger icon */
            border: 1px solid rgba(255, 255, 255, 0.2); /* Lighter border */
            border-radius: 12px; /* More rounded */
            font-size: 17px; /* Slightly larger font */
            color: white;
            background: rgba(255, 255, 255, 0.1); /* Subtle transparent background */
            transition: all 0.4s ease;
            width: 100%;
            outline: none;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3); /* Inner shadow for depth */
          }
          .auth-card input::placeholder {
            color: rgba(255, 255, 255, 0.5); /* Lighter placeholder */
          }
          .auth-card input:focus {
            border-color: #8b5cf6; /* Stronger focus border (purple) */
            background: rgba(255, 255, 255, 0.15); /* Slightly less transparent on focus */
            box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(139, 92, 246, 0.6); /* Glowing effect on focus */
          }
          .auth-card button[type="submit"] {
            background: linear-gradient(90deg, #8b5cf6, #a78bfa); /* New vibrant gradient */
            color: white;
            padding: 15px 30px; /* Larger button */
            border-radius: 12px; /* More rounded */
            font-weight: 700; /* Bolder text */
            cursor: pointer;
            transition: all 0.4s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4); /* Stronger shadow */
            border: none;
            font-size: 19px; /* Larger font */
            margin-top: 20px; /* More space */
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            letter-spacing: 0.5px;
          }
          .auth-card button[type="submit"]:hover:not(:disabled) {
            background: linear-gradient(90deg, #a78bfa, #8b5cf6); /* Reverse gradient on hover */
            transform: translateY(-3px) scale(1.02); /* More pronounced hover effect */
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6), 0 0 30px rgba(167, 139, 250, 0.7); /* Enhanced glow on hover */
          }
          .auth-card button[type="submit"]:disabled {
            background: #4a5568; /* Darker disabled color */
            cursor: not-allowed;
            opacity: 0.6;
            box-shadow: none;
            transform: none;
          }
          .auth-card p {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.7); /* Lighter text */
            margin-top: 25px;
          }
          .auth-card .link-button {
            background: none;
            border: none;
            color: #a78bfa; /* Accent color for links */
            font-weight: 600;
            cursor: pointer;
            text-decoration: none; /* No underline by default */
            font-size: 16px;
            padding: 0;
            transition: color 0.3s ease, text-decoration 0.3s ease;
          }
          .auth-card .link-button:hover {
            color: #c4b5fd; /* Lighter accent on hover */
            text-decoration: underline; /* Underline on hover */
          }
        `}</style>
        {authPage === 'register' ? (
          <RegisterPage
            showModal={showModal}
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        ) : (
          <LoginPage
            showModal={showModal}
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}
        <Modal message={modalMessage} onClose={closeModal} />
      </>
    );
  }

  // If logged in, show the main app
  return (
    <div className="app-container">
      <style>{`
        /* --- Variables --- */
        :root {
          --primary-color: #4f46e5; /* Indigo 600 */
          --secondary-color: #6366f1; /* Indigo 500 */
          --accent-color: #34d399; /* Emerald 500 (for success/upload) */
          --warning-color: #f4b400; /* Google Calendar Yellow */
          --error-color: #ef4444; /* Red 500 */

          --gradient-start: #667eea; /* Light Indigo */
          --gradient-end: #764ba2; /* Purple */

          --text-color: #333;
          --text-light: #666;
          --text-dark: #e2e8f0; /* for dark mode text */

          --bg-light: #f3f4f6; /* Gray 100 */
          --bg-card: #ffffff;
          --bg-dark-mode: #1a202c; /* Dark mode background */
          --bg-dark-card: #2d3748; /* Dark mode card background */

          --border-color: #e2e8f0; /* Gray 200 */
          --border-dark-mode: #4a5568; /* Dark mode border */

          --shadow-light: rgba(0, 0, 0, 0.05);
          --shadow-medium: rgba(0, 0, 0, 0.1);
          --shadow-xl: rgba(0, 0, 0, 0.25);

          --transition-speed: 0.3s;
        }

        /* --- Base Styles --- */
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg-light);
          margin: 0;
          padding: 0;
          color: var(--text-color);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: background-color var(--transition-speed) ease, color var(--transition-speed) ease;
        }

        /* Dark Mode */
        body.dark-mode {
          background: var(--bg-dark-mode);
          color: var(--text-dark);
        }

        #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* --- Layout --- */
        .app-container {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          position: relative; /* For 3D background */
          overflow: hidden; /* Ensure 3D background doesn't overflow */
        }

        @media (min-width: 1024px) {
          .app-container {
            flex-direction: row;
          }
        }

        .three-d-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1; /* Behind all content */
          pointer-events: none; /* Allow clicks to pass through */
          opacity: 0.1; /* Subtle effect */
        }

        /* --- Sidebar Navigation --- */
        .sidebar {
          background: var(--bg-card);
          padding: 24px;
          box-shadow: var(--shadow-medium);
          width: 100%;
          border-radius: 0 0 16px 16px;
          z-index: 10;
          flex-shrink: 0;
          background: linear-gradient(180deg, var(--primary-color), var(--secondary-color));
        }

        body.dark-mode .sidebar {
          background: linear-gradient(180deg, #1a202c, #2d3748);
          box-shadow: rgba(0, 0, 0, 0.3) 0px 4px 12px;
        }

        @media (min-width: 1024px) {
          .sidebar {
            width: 280px;
            border-radius: 0 16px 16px 0;
            min-height: 100vh;
          }
        }

        .sidebar-title {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin-bottom: 32px;
          text-align: center;
          letter-spacing: -0.5px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .nav-button {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all var(--transition-speed) ease;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
        }

        body.dark-mode .nav-button {
          color: rgba(255, 255, 255, 0.7);
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transform: translateX(5px);
        }

        body.dark-mode .nav-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-button.active {
          background: rgba(255, 255, 255, 0.25);
          color: white;
          box-shadow: var(--shadow-medium);
          transform: translateY(-2px);
          font-weight: 600;
        }

        .nav-button.active:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
        }

        .nav-button svg {
          width: 20px;
          height: 20px;
          stroke: currentColor;
          flex-shrink: 0;
        }

        .user-info {
          margin-top: 32px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          display: none; /* Hide this section as logout is now in settings */
        }

        body.dark-mode .user-info {
          border-top-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
        }

        .user-id-display {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          font-size: 12px;
          word-break: break-all;
          margin-bottom: 8px;
          opacity: 0.8;
        }

        /* --- Main Content Area --- */
        .main-content {
          flex-grow: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          overflow-y: auto;
          position: relative;
          z-index: 1; /* Ensure content is above 3D background */
        }

        /* --- Content Cards --- */
        .content-card {
          background: var(--bg-card);
          padding: 32px;
          border-radius: 16px;
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 900px;
          text-align: center;
          margin-bottom: 24px;
          transition: background-color var(--transition-speed) ease, box-shadow var(--transition-speed) ease;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .content-card {
          background: var(--bg-dark-card);
          box-shadow: rgba(0, 0, 0, 0.4) 0px 8px 24px;
          color: var(--text-dark);
          border-color: var(--border-dark-mode);
        }

        .content-card h2 {
          font-size: 36px;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 24px;
          text-align: center;
          letter-spacing: -0.5px;
        }

        body.dark-mode .content-card h2 {
          color: var(--primary-color);
        }

        .content-card p {
          font-size: 18px;
          color: var(--text-light);
          margin-bottom: 32px;
        }

        body.dark-mode .content-card p {
          color: rgba(255, 255, 255, 0.8);
        }

        /* --- Dashboard Specific --- */
        .dashboard-card {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .dashboard-item {
          padding: 24px;
          border-radius: 12px;
          box-shadow: var(--shadow-light);
          text-align: left;
          transition: all var(--transition-speed) ease;
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
          z-index: 1;
          background-size: 150% 150%; /* For gradient animation */
          animation: gradientShift 10s ease infinite alternate; /* Subtle animation */
        }

        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }

        .dashboard-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.0));
          z-index: -1;
          opacity: 0;
          transition: opacity var(--transition-speed) ease;
        }

        .dashboard-item:hover::before {
          opacity: 1;
        }

        body.dark-mode .dashboard-item {
          box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 8px;
          border-color: rgba(255,255,255,0.1);
        }

        .dashboard-item:hover {
          transform: translateY(-8px); /* More pronounced lift */
          box-shadow: var(--shadow-xl); /* Stronger shadow on hover */
        }

        .dashboard-item h3 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .dashboard-item p {
          font-size: 16px;
          margin-bottom: 0;
        }

        .profile-summary .badges-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .profile-summary .badge-item {
          background-color: var(--secondary-color);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: var(--shadow-light);
        }

        /* --- Chat Specific --- */
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 80vh;
        }

        .chat-history {
          flex-grow: 1;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          background: #f9fafb;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        body.dark-mode .chat-history {
          background: #283445;
          border-color: var(--border-dark-mode);
        }

        .chat-history::-webkit-scrollbar {
          width: 8px;
        }

        .chat-history::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        body.dark-mode .chat-history::-webkit-scrollbar-track {
          background: #3a475a;
        }

        .chat-history::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
          border: 2px solid #f9fafb;
        }

        body.dark-mode .chat-history::-webkit-scrollbar-thumb {
          background-color: #5a6b83;
          border: 2px solid #283445;
        }

        .chat-message {
          margin-bottom: 16px;
          padding: 12px;
          border-radius: 8px;
          max-width: 85%;
          box-shadow: var(--shadow-light);
          word-wrap: break-word;
          white-space: pre-wrap;
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        body.dark-mode .chat-message {
          box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 8px;
        }

        .chat-message.user {
          background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
          color: white;
          margin-left: auto;
          border-bottom-right-radius: 0;
        }

        .chat-message.ai {
          background: var(--bg-light);
          color: var(--text-color);
          margin-right: auto;
          border-bottom-left-radius: 0;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .chat-message.ai {
          background: #4a5568;
          color: white;
          border-color: var(--border-dark-mode);
        }

        .chat-message .role-label {
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 4px;
          opacity: 0.9;
        }

        .empty-chat-message {
          text-align: center;
          color: var(--text-light);
          font-style: italic;
          margin-top: 40px;
        }

        body.dark-mode .empty-chat-message {
          color: rgba(255, 255, 255, 0.6);
        }

        .loading-message {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        .chat-input-area {
          display: flex;
          gap: 16px;
        }

        .chat-input {
          flex-grow: 1;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          outline: none;
          transition: all var(--transition-speed) ease;
          color: var(--text-color);
          background: var(--bg-card);
        }

        body.dark-mode .chat-input {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .chat-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .chat-button {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          color: white;
          transition: all var(--transition-speed) ease;
          transform: scale(1);
          box-shadow: var(--shadow-medium);
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .chat-button:hover:not(:disabled) {
          transform: scale(1.05);
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
        }

        .chat-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }

        .chat-button svg {
          width: 20px;
          height: 20px;
        }

        .voice-button {
          padding: 12px;
        }

        .voice-button.listening {
          background: linear-gradient(45deg, var(--error-color), #c23333);
        }

        .voice-button.listening:hover {
          background: linear-gradient(45deg, #c23333, var(--error-color));
        }

        .listening-indicator {
          background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          margin-top: 10px;
          animation: pulse 1.5s infinite;
          text-align: center;
        }

        .stop-speak-button {
          background: linear-gradient(45deg, #ef4444, #dc2626);
        }

        .stop-speak-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #dc2626, #ef4444);
        }

        .message-content-with-speak {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
        }

        .chat-message.ai .message-content-with-speak {
            align-items: flex-start;
        }

        .chat-message.user .message-content-with-speak {
            align-items: flex-end;
        }


        .speak-chat-button {
          background: var(--secondary-color);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          font-size: 14px;
          align-self: flex-end;
          box-shadow: var(--shadow-light);
        }

        .chat-message.user .speak-chat-button {
            align-self: flex-start;
        }

        .speak-chat-button:hover:not(:disabled) {
          background: #4a4fc2;
          transform: translateY(-1px);
        }
        .speak-chat-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }
        .speak-chat-button svg {
          width: 16px;
          height: 16px;
        }


        /* --- Notes Summarizer Specific --- */
        .notes-textarea {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 16px;
          color: var(--text-color);
          resize: vertical;
          outline: none;
          transition: border-color var(--transition-speed) ease;
          background: var(--bg-card);
        }

        body.dark-mode .notes-textarea {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .notes-textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .notes-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .notes-actions input[type="file"] {
          display: none;
        }

        .notes-actions .file-upload-label {
          background: var(--accent-color);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notes-actions .file-upload-label:hover {
          background: #279e75;
          transform: scale(1.05);
        }

        .notes-actions .summarize-button {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          border: none;
        }

        .notes-actions .summarize-button:hover:not(:disabled) {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: scale(1.05);
        }

        .notes-actions .summarize-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }

        .summarized-output {
          text-align: left;
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          margin-top: 24px;
          box-shadow: var(--shadow-light);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .summarized-output {
          background: #283445;
          color: white;
          border-color: var(--border-dark-mode);
        }

        .summarized-output h4 {
          color: var(--primary-color);
          margin-bottom: 10px;
        }

        .summarized-output p {
          color: var(--text-color);
          font-size: 15px;
          margin-bottom: 15px;
          white-space: pre-wrap;
          flex-grow: 1;
        }

        body.dark-mode .summarized-output p {
          color: rgba(255, 255, 255, 0.9);
        }

        .speak-summary-button {
          align-self: flex-end;
          background: var(--secondary-color);
          color: white;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          box-shadow: var(--shadow-light);
        }
        .speak-summary-button:hover:not(:disabled) {
          background: #4a4fc2;
          transform: translateY(-1px);
        }
        .speak-summary-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }
        .speak-summary-button svg {
          width: 16px;
          height: 16px;
        }


        /* --- Quiz Specific --- */
        .quiz-controls {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
          align-items: center;
        }

        .quiz-controls input[type="text"],
        .quiz-controls input[type="number"],
        .quiz-controls select {
          width: 100%;
          max-width: 400px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text-color);
          background: var(--bg-card);
          transition: border-color var(--transition-speed) ease;
        }

        body.dark-mode .quiz-controls input[type="text"],
        body.dark-mode .quiz-controls input[type="number"],
        body.dark-mode .quiz-controls select {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .quiz-controls input[type="text"]:focus,
        .quiz-controls input[type="number"]:focus,
        .quiz-controls select:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .quiz-controls button {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          border: none;
        }

        .quiz-controls button:hover:not(:disabled) {
          transform: scale(1.05);
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
        }

        .quiz-controls button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }

        .quiz-question-card {
          background: var(--bg-card);
          padding: 25px;
          border-radius: 12px;
          box-shadow: var(--shadow-medium);
          margin-top: 20px;
          text-align: left;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .quiz-question-card {
          background: var(--bg-dark-card);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
          border-color: var(--border-dark-mode);
        }

        .quiz-question-card h4 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-color);
        }

        body.dark-mode .quiz-question-card h4 {
          color: white;
        }

        .quiz-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }

        @media (min-width: 640px) {
          .quiz-options-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .quiz-option-button {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-light);
          color: var(--text-color);
          font-size: 16px;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          text-align: left;
          font-weight: 500;
        }

        body.dark-mode .quiz-option-button {
          background: #3a475a;
          border-color: var(--border-dark-mode);
          color: white;
        }

        .quiz-option-button:hover {
          background: #e0f2f7;
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-light);
        }

        body.dark-mode .quiz-option-button:hover {
          background: #4a5568;
          border-color: var(--primary-color);
        }

        .quiz-option-button.selected {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          color: white;
          border-color: var(--secondary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }

        .quiz-score-card {
          background: var(--bg-card);
          padding: 30px;
          border-radius: 16px;
          box-shadow: var(--shadow-medium);
          margin-top: 30px;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .quiz-score-card {
          background: var(--bg-dark-card);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
          border-color: var(--border-dark-mode);
        }

        .quiz-score-card h3 {
          font-size: 28px;
          color: var(--primary-color);
          margin-bottom: 15px;
        }

        .quiz-score-card p {
          font-size: 18px;
          color: var(--text-color);
        }

        body.dark-mode .quiz-score-card p {
          color: rgba(255, 255, 255, 0.9);
        }

        /* --- Progress Analytics Specific --- */
        .chart-container {
          width: 100%;
          max-width: 800px;
          margin: 20px auto;
          background: var(--bg-card);
          padding: 20px;
          border-radius: 12px;
          box-shadow: var(--shadow-medium);
          border: 1px solid var(--border-color);
        }

        body.dark-mode .chart-container {
          background: var(--bg-dark-card);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
          border-color: var(--border-dark-mode);
        }

        /* --- Study Plan Specific --- */
        .study-plan-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .study-plan-form input[type="text"],
        .study-plan-form input[type="date"],
        .study-plan-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text-color);
          background: var(--bg-card);
          transition: border-color var(--transition-speed) ease;
        }

        body.dark-mode .study-plan-form input,
        body.dark-mode .study-plan-form textarea {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .study-plan-form input:focus,
        .study-plan-form textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .study-plan-form button {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .study-plan-form button:hover {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: scale(1.02);
        }

        /* --- Doubt Solver Specific --- */
        .doubt-solver-input {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .doubt-solver-input textarea {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text-color);
          resize: vertical;
          background: var(--bg-card);
          transition: border-color var(--transition-speed) ease;
        }

        body.dark-mode .doubt-solver-input textarea {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .doubt-solver-input textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .doubt-solver-input input[type="file"] {
          display: none;
        }

        .doubt-solver-input .file-upload-label {
          background: #1e90ff;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          display: inline-flex; /* Changed to inline-flex for icon alignment */
          align-items: center;
          justify-content: center;
        }

        .doubt-solver-input .file-upload-label:hover {
          background: #007bff;
          transform: scale(1.05);
        }

        .doubt-solver-input button {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .doubt-solver-input button:hover:not(:disabled) {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: scale(1.05);
        }

        .doubt-solver-input button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }

        .doubt-solution {
          text-align: left;
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          margin-top: 24px;
          box-shadow: var(--shadow-light);
          border: 1px solid var(--border-color);
        }

        body.dark-mode .doubt-solution {
          background: #3a475a;
          color: white;
          border-color: var(--border-dark-mode);
        }

        .doubt-solution h4 {
          font-size: 20px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 12px;
        }

        .doubt-solution p {
          font-size: 16px;
          color: var(--text-color);
          white-space: pre-wrap;
        }

        body.dark-mode .doubt-solution p {
          color: rgba(255, 255, 255, 0.9);
        }

        .doubt-solution img.uploaded-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin-top: 15px;
          border: 1px solid var(--border-color);
          object-fit: contain;
        }

        .camera-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 15px;
        }

        .camera-controls video {
          width: 100%;
          max-width: 400px;
          height: auto;
          border-radius: 8px;
          background-color: black;
          margin-bottom: 10px;
          box-shadow: var(--shadow-medium);
          display: block; /* Ensure it's block when active */
        }

        .camera-controls video.hidden {
            display: none; /* Hide when not active */
        }

        .camera-controls button {
          flex: 1 1 auto;
          max-width: 180px;
          padding: 10px 15px;
          font-size: 15px;
        }

        .camera-controls .stop-camera-button {
          background: linear-gradient(45deg, var(--error-color), #c23333);
        }

        .camera-controls .stop-camera-button:hover {
          background: linear-gradient(45deg, #c23333, var(--error-color));
        }

        /* --- Placeholder Sections (Coming Soon) --- */
        .coming-soon-card {
          background: var(--bg-card);
          padding: 32px;
          border-radius: 16px;
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 900px;
          text-align: center;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .coming-soon-card {
          background: var(--bg-dark-card);
          box-shadow: rgba(0, 0, 0, 0.4) 0px 8px 24px;
          border-color: var(--border-dark-mode);
        }

        .coming-soon-card h2 {
          font-size: 36px;
          font-weight: 800;
          color: var(--primary-color);
          margin-bottom: 24px;
        }

        .coming-soon-card p {
          font-size: 18px;
          color: var(--text-light);
          margin-bottom: 0;
        }

        body.dark-mode .coming-soon-card p {
          color: rgba(255, 255, 255, 0.7);
        }

        /* --- Modal Styles --- */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .modal-content {
          background: var(--bg-card);
          padding: 30px;
          border-radius: 16px;
          box-shadow: var(--shadow-medium);
          text-align: center;
          max-width: 600px;
          width: 90%;
          transition: background-color var(--transition-speed) ease;
          max-height: 80vh;
          overflow-y: auto;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .modal-content {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
        }

        .modal-content p {
          font-size: 18px;
          color: var(--text-color);
          margin-bottom: 20px;
        }

        body.dark-mode .modal-content p {
          color: white;
        }

        .modal-content button {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color var(--transition-speed) ease, transform var(--transition-speed) ease;
          font-weight: 500;
        }

        .modal-content button:hover {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: translateY(-1px);
        }

        .confirm-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }

        .confirm-buttons .confirm-yes {
          background: linear-gradient(45deg, var(--error-color), #c23333);
        }

        .confirm-buttons .confirm-yes:hover {
          background: linear-gradient(45deg, #c23333, var(--error-color));
        }

        .confirm-buttons .confirm-no {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        }

        .confirm-buttons .confirm-no:hover {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
        }


        /* --- Loading Screen --- */
        .loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
          color: white;
          font-size: 24px;
          font-weight: 600;
        }

        body.dark-mode .loading-screen {
          background: linear-gradient(135deg, #1a202c, #2d3748);
          color: white;
        }

        .loading-spinner {
          border: 6px solid rgba(255, 255, 255, 0.3);
          border-top: 6px solid var(--primary-color);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        body.dark-mode .loading-spinner {
          border: 6px solid rgba(255, 255, 255, 0.1);
          border-top: 6px solid var(--primary-color);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* --- Shared Styles for New Sections (Vocabulary, Aptitude, Flashcards, Daily Challenges, History & Culture, Science Lab) --- */
        .section-block {
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          box-shadow: var(--shadow-light);
          text-align: left;
          width: 100%;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .section-block {
          background: #3a475a;
          border-color: var(--border-dark-mode);
        }

        .section-block h3 {
          color: var(--primary-color);
          margin-bottom: 15px;
          font-size: 24px;
        }

        .input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
          flex-wrap: wrap;
          align-items: center;
        }

        .input-group label {
          font-weight: 600;
          color: var(--text-color);
          flex-shrink: 0;
        }
        body.dark-mode .input-group label {
          color: var(--text-dark);
        }

        .input-group input[type="text"],
        .input-group select,
        .section-block textarea {
          flex-grow: 1;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text-color);
          background: var(--bg-card);
          transition: border-color var(--transition-speed) ease;
        }

        body.dark-mode .input-group input[type="text"],
        body.dark-mode .input-group select,
        body.dark-mode .section-block textarea {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .input-group input[type="text"]:focus,
        .input-group select:focus,
        .section-block textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .input-group button,
        .section-block button {
          padding: 10px 20px;
          border-radius: 8px;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all var(--transition-speed) ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-group button:hover:not(:disabled),
        .section-block button:hover:not(:disabled) {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: translateY(-1px);
        }

        .input-group button:disabled,
        .section-block button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .vocabulary-output,
        .grammar-output,
        .exploration-output,
        .experiment-output {
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          margin-top: 15px;
          box-shadow: var(--shadow-light);
          border: 1px solid var(--border-color);
        }

        body.dark-mode .vocabulary-output,
        body.dark-mode .grammar-output,
        body.dark-mode .exploration-output,
        body.dark-mode .experiment-output {
          background: #283445;
          color: white;
          border-color: var(--border-dark-mode);
        }

        .vocabulary-output h4,
        .grammar-output h4,
        .exploration-output h4,
        .experiment-output h4 {
          color: var(--primary-color);
          margin-bottom: 10px;
        }

        .vocabulary-output p,
        .grammar-output p,
        .exploration-output p,
        .experiment-output p {
          color: var(--text-color);
          font-size: 15px;
          margin-bottom: 5px;
          white-space: pre-wrap;
        }

        body.dark-mode .vocabulary-output p,
        body.dark-mode .grammar-output p,
        body.dark-mode .exploration-output p,
        body.dark-mode .experiment-output p {
          color: rgba(255, 255, 255, 0.9);
        }
        .experiment-output pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          background-color: rgba(0,0,0,0.05);
          padding: 10px;
          border-radius: 5px;
          color: var(--text-color);
        }
        body.dark-mode .experiment-output pre {
          background-color: rgba(255,255,255,0.1);
          color: white;
        }


        .vocabulary-output .save-button {
          margin-top: 10px;
          background: var(--accent-color);
        }

        .vocabulary-output .save-button:hover {
          background: #279e75;
        }

        .saved-list {
          margin-top: 30px;
        }

        .saved-list h3 {
          color: var(--text-color);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
          margin-bottom: 15px;
        }

        body.dark-mode .saved-list h3 {
          color: white;
          border-bottom-color: var(--border-dark-mode);
        }

        .saved-list p {
          color: var(--text-light);
        }

        body.dark-mode .saved-list p {
          color: rgba(255, 255, 255, 0.7);
        }

        .saved-item {
          background: var(--bg-card);
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 10px;
          box-shadow: var(--shadow-light);
          display: flex;
          flex-direction: column;
          gap: 5px;
          transition: all var(--transition-speed) ease;
          position: relative;
        }

        body.dark-mode .saved-item {
          background: #283445;
        }

        .saved-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-medium);
        }

        .saved-item h4 {
          color: var(--secondary-color);
          margin-bottom: 5px;
        }

        .saved-item p {
          font-size: 14px;
          color: var(--text-light);
          margin-bottom: 5px;
        }

        body.dark-mode .saved-item p {
          color: rgba(255, 255, 255, 0.7);
        }

        .item-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }

        .item-actions button {
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color var(--transition-speed) ease, transform var(--transition-speed) ease;
          border: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-actions button:hover {
          transform: translateY(-1px);
        }

        .item-actions .view-button {
          background-color: var(--secondary-color);
          color: white;
        }
        .item-actions .view-button:hover {
          background-color: #4a4fc2;
        }
        .item-actions .delete-button {
          background-color: var(--error-color);
          color: white;
        }
        .item-actions .delete-button:hover {
          background-color: #c23333;
        }

        .item-actions .clear-output-button { /* New style for clear output button */
          background-color: #607d8b; /* Blue-grey */
          color: white;
        }
        .item-actions .clear-output-button:hover {
          background-color: #455a64; /* Darker blue-grey */
        }


        /* --- Full Modal Content Styles (for "View Full" option) --- */
        .full-word-modal,
        .full-flashcard-modal,
        .full-challenge-modal,
        .full-exploration-modal,
        .full-experiment-modal,
        .full-note-modal {
          text-align: left;
          padding: 10px;
        }
        .full-word-modal h4,
        .full-flashcard-modal h4,
        .full-challenge-modal h4,
        .full-exploration-modal h4,
        .full-experiment-modal h4,
        .full-note-modal h4 {
          color: var(--primary-color);
          font-size: 22px;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 5px;
        }
        body.dark-mode .full-word-modal h4,
        body.dark-mode .full-flashcard-modal h4,
        body.dark-mode .full-challenge-modal h4,
        body.dark-mode .full-exploration-modal h4,
        body.dark-mode .full-experiment-modal h4,
        body.dark-mode .full-note-modal h4 {
          border-bottom-color: var(--border-dark-mode);
        }

        .full-word-modal p,
        .full-flashcard-modal p,
        .full-challenge-modal p,
        .full-exploration-modal p,
        .full-experiment-modal p,
        .full-note-modal p {
          color: var(--text-color);
          font-size: 16px;
          margin-bottom: 8px;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
        }
        body.dark-mode .full-word-modal p,
        body.dark-mode .full-flashcard-modal p,
        body.dark-mode .full-challenge-modal p,
        body.dark-mode .full-exploration-modal p,
        body.dark-mode .full-experiment-modal p,
        body.dark-mode .full-note-modal p {
          color: rgba(255, 255, 255, 0.9);
        }
        .full-word-modal .note-timestamp,
        .full-flashcard-modal .note-timestamp,
        .full-challenge-modal .note-timestamp,
        .full-exploration-modal .note-timestamp,
        .full-experiment-modal .note-timestamp,
        .full-note-modal .note-timestamp {
          font-size: 12px;
          color: var(--text-light);
          text-align: right;
          margin-top: 15px;
        }
        body.dark-mode .full-word-modal .note-timestamp,
        body.dark-mode .full-flashcard-modal .note-timestamp,
        body.dark-mode .full-challenge-modal .note-timestamp,
        body.dark-mode .full-exploration-modal .note-timestamp,
        body.dark-mode .full-experiment-modal .note-timestamp,
        body.dark-mode .full-note-modal .note-timestamp {
          color: rgba(255, 255, 255, 0.6);
        }
        .full-experiment-modal pre {
          background-color: rgba(0,0,0,0.05);
          padding: 10px;
          border-radius: 5px;
          color: var(--text-color);
        }
        body.dark-mode .full-experiment-modal pre {
          background-color: rgba(255,255,255,0.1);
          color: white;
        }
        /* Styles for Markdown rendering within modals */
        .modal-content h1, .modal-content h2, .modal-content h3 {
            color: var(--primary-color);
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: bold;
            line-height: 1.2;
        }
        .modal-content h1 { font-size: 1.8em; }
        .modal-content h2 { font-size: 1.5em; }
        .modal-content h3 { font-size: 1.3em; }

        .modal-content ul {
            list-style-type: disc;
            margin-left: 20px;
            margin-bottom: 1em;
            padding-left: 0;
        }
        .modal-content ol {
            list-style-type: decimal;
            margin-left: 20px;
            margin-bottom: 1em;
            padding-left: 0;
        }
        .modal-content li {
            margin-bottom: 0.5em;
            color: var(--text-color);
            font-size: 16px;
        }
        body.dark-mode .modal-content li {
            color: rgba(255, 255, 255, 0.9);
        }

        .modal-content strong {
            font-weight: bold;
        }
        .modal-content em {
            font-style: italic;
        }


        /* --- Aptitude Specific Styles --- */
        .aptitude-question-card {
          background: var(--bg-card);
          padding: 25px;
          border-radius: 12px;
          box-shadow: var(--shadow-medium);
          margin-top: 20px;
          text-align: left;
          border: 1px solid var(--border-color);
        }

        body.dark-mode .aptitude-question-card {
          background: var(--bg-dark-card);
          box-shadow: rgba(0, 0, 0, 0.2) 0px 4px 12px;
          border-color: var(--border-dark-mode);
        }

        .aptitude-question-card h4 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-color);
        }

        body.dark-mode .aptitude-question-card h4 {
          color: white;
        }

        .aptitude-question-card .question-text {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--text-color);
        }

        body.dark-mode .aptitude-question-card .question-text {
          color: rgba(255, 255, 255, 0.9);
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-light);
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all var(--transition-speed) ease;
        }
        body.dark-mode .option-item {
          background: #3a475a;
          border-color: var(--border-dark-mode);
        }

        .option-item:hover {
          background: #e0f2f7;
          border-color: var(--primary-color);
          transform: translateY(-2px);
          box-shadow: var(--shadow-light);
        }
        body.dark-mode .option-item:hover {
          background: #4a5568;
          border-color: var(--primary-color);
        }

        .option-item input[type="radio"] {
          cursor: pointer;
        }

        .option-item label {
          flex-grow: 1;
          cursor: pointer;
          font-size: 16px;
          color: var(--text-color);
        }
        body.dark-mode .option-item label {
          color: rgba(255, 255, 255, 0.9);
        }

        .answer-area {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .answer-area input[type="text"] { /* This might not be needed if using radio buttons */
          flex-grow: 1;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text-color);
          background: var(--bg-card);
          transition: border-color var(--transition-speed) ease;
        }
        body.dark-mode .answer-area input[type="text"] {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .answer-area input[type="text"]:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .answer-area button {
          padding: 10px 20px;
          border-radius: 8px;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all var(--transition-speed) ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .answer-area button:hover:not(:disabled) {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: translateY(-1px);
        }

        .answer-area button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .feedback {
          margin-top: 15px;
          padding: 10px;
          border-radius: 8px;
          font-size: 15px;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .feedback.correct {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #34d399;
        }
        body.dark-mode .feedback.correct {
          background-color: #1a4d3a;
          color: #9fe6b8;
          border-color: #34d399;
        }

        .feedback.incorrect {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        }
        body.dark-mode .feedback.incorrect {
          background-color: #4d1a1a;
          color: #fca5a5;
          border-color: #ef4444;
        }

        .solution-display {
          margin-top: 20px;
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          box-shadow: var(--shadow-light);
          border: 1px solid var(--border-color);
        }
        body.dark-mode .solution-display {
          background: #283445;
          border-color: var(--border-dark-mode);
        }
        .solution-display h4 {
          color: var(--primary-color);
          margin-bottom: 10px;
        }
        .solution-display p {
          font-size: 15px;
          color: var(--text-color);
          white-space: pre-wrap;
        }
        body.dark-mode .solution-display p {
          color: rgba(255, 255, 255, 0.9);
        }

        /* --- Flashcards Specific Styles --- */
        .flashcard-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }
        .flashcard-form textarea {
          min-height: 80px;
        }

        .start-review-button {
          background: linear-gradient(45deg, var(--accent-color), #279e75);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          box-shadow: var(--shadow-medium);
          border: none;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .start-review-button:hover:not(:disabled) {
          background: linear-gradient(45deg, #279e75, var(--accent-color));
          transform: scale(1.05);
        }
        .start-review-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }

        .flashcard-review-area {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .flashcard-card {
          width: 100%;
          max-width: 400px;
          height: 200px;
          perspective: 1000px;
          cursor: pointer;
        }

        .flashcard-card > div {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-shadow: var(--shadow-medium);
          text-align: center;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-color);
          border: 1px solid var(--border-color);
        }
        body.dark-mode .flashcard-card > div {
          color: white;
        }

        .flashcard-front {
          background-color: #e0f7fa;
          transform: rotateY(0deg);
        }
        body.dark-mode .flashcard-front {
          background-color: #2a3b4c;
        }

        .flashcard-back {
          background-color: #f7e0fa;
          transform: rotateY(180deg);
        }
        body.dark-mode .flashcard-back {
          background-color: #3b2a4c;
        }

        .flashcard-card.flipped .flashcard-front {
          transform: rotateY(-180deg);
        }

        .flashcard-card.flipped .flashcard-back {
          transform: rotateY(0deg);
        }

        .flashcard-navigation {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          width: 100%;
          max-width: 400px;
        }

        .flashcard-navigation button {
          padding: 10px 20px;
          border-radius: 8px;
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          color: white;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all var(--transition-speed) ease;
        }
        .flashcard-navigation button:hover:not(:disabled) {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        }
        .flashcard-navigation button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .flashcard-navigation span {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-color);
        }
        body.dark-mode .flashcard-navigation span {
          color: white;
        }

        .stop-review-button {
          background: linear-gradient(45deg, var(--error-color), #c23333);
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          border: none;
        }
        .stop-review-button:hover {
          background: linear-gradient(45deg, #c23333, var(--error-color));
        }

        /* --- Daily Challenges Specific Styles --- */
        .challenge-display {
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          margin-top: 15px;
          box-shadow: var(--shadow-light);
          text-align: left;
          border: 1px solid var(--border-color);
        }
        body.dark-mode .challenge-display {
          background: #283445;
          border-color: var(--border-dark-mode);
        }

        .challenge-display h4 {
          color: var(--primary-color);
          margin-bottom: 10px;
        }
        .challenge-display .challenge-description {
          font-size: 16px;
          color: var(--text-color);
          margin-bottom: 15px;
          white-space: pre-wrap;
        }
        body.dark-mode .challenge-display .challenge-description {
          color: rgba(255, 255, 255, 0.9);
        }

        .challenge-display textarea {
          width: 100%;
          min-height: 100px;
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 16px;
          color: var(--text-color);
          resize: vertical;
          background: var(--bg-card);
          transition: border-color var(--transition-speed) ease;
          margin-bottom: 15px;
        }
        body.dark-mode .challenge-display textarea {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          color: white;
        }

        .challenge-display textarea:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }

        .challenge-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }
        .challenge-actions button {
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          transition: all var(--transition-speed) ease;
          border: none;
          cursor: pointer;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          color: white;
        }
        .challenge-actions button:hover:not(:disabled) {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          transform: translateY(-1px);
        }
        .challenge-actions button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .challenge-actions button:last-child {
          background: linear-gradient(45deg, var(--accent-color), #279e75);
        }
        .challenge-actions button:last-child:hover:not(:disabled) {
          background: linear-gradient(45deg, #279e75, var(--accent-color));
        }

        .feedback-display {
          background: var(--bg-light);
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
          box-shadow: var(--shadow-light);
          text-align: left;
          border: 1px solid var(--border-color);
        }
        body.dark-mode .feedback-display {
          background: #2a3b4c;
          border-color: var(--border-dark-mode);
        }
        .feedback-display h4 {
          color: #0c4a6e;
          margin-bottom: 10px;
        }
        body.dark-mode .feedback-display h4 {
          color: white;
        }
        .feedback-display p {
          font-size: 15px;
          color: var(--text-color);
          white-space: pre-wrap;
        }
        body.dark-mode .feedback-display p {
          color: rgba(255, 255, 255, 0.9);
        }
        .solution-toggle {
          margin-top: 15px;
          text-align: right;
        }
        .solution-toggle button {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          color: white;
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          border: none;
        }
        .solution-toggle button:hover {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          transform: translateY(-1px);
        }

        /* NEW/IMPROVED STYLES FOR SAVED LISTS (Notes, Daily Challenges, etc.) */
        .saved-list {
          margin-top: 32px;
          text-align: left;
        }

        .saved-list h3 {
          font-size: 26px;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 20px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 10px;
          text-align: center;
        }

        body.dark-mode .saved-list h3 {
          color: var(--primary-color);
          border-bottom-color: var(--border-dark-mode);
        }

        .saved-list p {
          color: var(--text-light);
          font-style: italic;
          text-align: center;
          margin-top: 20px;
        }

        body.dark-mode .saved-list p {
          color: rgba(255, 255, 255, 0.6);
        }

        /* Unified style for individual saved items */
        .saved-note-item,
        .saved-challenge-item,
        .saved-flashcard-item,
        .saved-vocabulary-item,
        .saved-aptitude-item /* Added for Aptitude history */
        {
          background: var(--bg-card);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-medium);
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all var(--transition-speed) ease;
          position: relative;
        }

        body.dark-mode .saved-note-item,
        body.dark-mode .saved-challenge-item,
        body.dark-mode .saved-flashcard-item,
        body.dark-mode .saved-vocabulary-item,
        body.dark-mode .saved-aptitude-item
        {
          background: var(--bg-dark-card);
          border-color: var(--border-dark-mode);
          box-shadow: rgba(0, 0, 0, 0.25) 0px 6px 16px;
        }

        .saved-note-item:hover,
        .saved-challenge-item:hover,
        .saved-flashcard-item:hover,
        .saved-vocabulary-item:hover,
        .saved-aptitude-item:hover
        {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .saved-note-item h4,
        .saved-challenge-item h4,
        .saved-flashcard-item h4,
        .saved-vocabulary-item h4,
        .saved-aptitude-item h4 {
          font-size: 20px;
          font-weight: 700;
          color: var(--secondary-color);
          margin-bottom: 8px;
        }

        .saved-note-item p,
        .saved-challenge-item p,
        .saved-flashcard-item p,
        .saved-vocabulary-item p,
        .saved-aptitude-item p {
          font-size: 16px;
          color: var(--text-color);
          line-height: 1.5;
          margin-bottom: 5px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        body.dark-mode .saved-note-item p,
        body.dark-mode .saved-challenge-item p,
        body.dark-mode .saved-flashcard-item p,
        body.dark-mode .saved-vocabulary-item p,
        body.dark-mode .saved-aptitude-item p {
          color: rgba(255, 255, 255, 0.9);
        }

        .saved-note-item .note-timestamp,
        .saved-challenge-item .challenge-timestamp,
        .saved-flashcard-item .flashcard-timestamp,
        .saved-vocabulary-item .vocabulary-timestamp,
        .saved-aptitude-item .note-timestamp /* Reusing note-timestamp for aptitude */
        {
          font-size: 13px;
          color: var(--text-light);
          text-align: right;
          opacity: 0.8;
          margin-top: 10px;
        }

        body.dark-mode .saved-note-item .note-timestamp,
        body.dark-mode .saved-challenge-item .challenge-timestamp,
        body.dark-mode .saved-flashcard-item .flashcard-timestamp,
        body.dark-mode .saved-vocabulary-item .vocabulary-timestamp,
        body.dark-mode .saved-aptitude-item .note-timestamp {
          color: rgba(255, 255, 255, 0.7);
        }

        .item-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 15px;
        }

        .item-actions button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color var(--transition-speed) ease, transform var(--transition-speed) ease;
          border: none;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-actions button:hover {
          transform: translateY(-1px);
        }

        .item-actions .view-button {
          background-color: var(--secondary-color);
          color: white;
        }
        .item-actions .view-button:hover {
          background-color: #4a4fc2;
        }
        .item-actions .delete-button {
          background-color: var(--error-color);
          color: white;
        }
        .item-actions .delete-button:hover {
          background-color: #c23333;
        }

        /* --- History & Culture Specific Styles --- */
        .exploration-output {
          text-align: left;
        }

        /* --- Science Lab Specific Styles --- */
        .experiment-output {
          text-align: left;
        }
        .experiment-output pre {
          background-color: #f8f8f8;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 5px;
          white-space: pre-wrap;
          word-break: break-word;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          font-size: 14px;
          color: #333;
        }
        body.dark-mode .experiment-output pre {
          background-color: #3a475a;
          border-color: #4a5568;
          color: #e2e8f0;
        }

        /* Settings Block Improvements */
        .settings-card {
          text-align: left; /* Align content left within the card */
        }

        .settings-section {
          background: var(--bg-light);
          padding: 25px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-light);
          border: 1px solid var(--border-color);
        }

        body.dark-mode .settings-section {
          background: #3a475a;
          border-color: var(--border-dark-mode);
        }

        .settings-section h3 {
          color: var(--primary-color);
          font-size: 24px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
        }
        body.dark-mode .settings-section h3 {
          border-bottom-color: var(--border-dark-mode);
        }

        .profile-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 15px;
        }

        @media (min-width: 640px) {
          .profile-info-grid {
            grid-template-columns: 1fr 1fr;
          }
          .profile-info-grid .full-width {
            grid-column: span 2;
          }
        }

        .info-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .info-item strong {
          font-size: 16px;
          color: var(--text-color);
          margin-bottom: 5px;
        }
        body.dark-mode .info-item strong {
          color: white;
        }

        .info-item span, .info-item p.setting-value {
          font-size: 15px;
          color: var(--text-light);
          word-break: break-all;
        }
        body.dark-mode .info-item span, body.dark-mode .info-item p.setting-value {
          color: rgba(255, 255, 255, 0.8);
        }

        .settings-section .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px dashed var(--border-color);
        }
        body.dark-mode .settings-section .setting-item {
          border-bottom-color: var(--border-dark-mode);
        }
        .settings-section .setting-item:last-child {
          border-bottom: none;
        }

        .settings-section .setting-item span {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-color);
        }
        body.dark-mode .settings-section .setting-item span {
          color: white;
        }

        .theme-toggle-button {
          background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
          color: white;
          padding: 8px 15px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          border: none;
        }
        .theme-toggle-button:hover {
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          transform: translateY(-1px);
        }

        .account-actions button { /* Specific style for logout button in settings */
          background: linear-gradient(45deg, var(--error-color), #c23333);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          border: none;
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          width: auto; /* Allow button to size to content */
          margin-top: 15px;
        }
        .account-actions button:hover {
          background: linear-gradient(45deg, #c23333, var(--error-color));
          transform: translateY(-2px);
        }
      `}</style>
      <ThreeDBackground />
      <nav className="sidebar">
        <div className="sidebar-title">AI Professor</div>
        <ul className="nav-list">
          <li>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('chat')}
              className={`nav-button ${currentPage === 'chat' ? 'active' : ''}`}
            >
              <MessageSquare className="w-5 h-5" />
              Ask Professor
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('notes')}
              className={`nav-button ${currentPage === 'notes' ? 'active' : ''}`}
            >
              <FileText className="w-5 h-5" />
              Notes
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('quizzes')}
              className={`nav-button ${currentPage === 'quizzes' ? 'active' : ''}`}
            >
              <HelpCircle className="w-5 h-5" />
              Quizzes
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('study-plan')}
              className={`nav-button ${currentPage === 'study-plan' ? 'active' : ''}`}
            >
              <Calendar className="w-5 h-5" />
              Study Plan
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('doubt-solver')}
              className={`nav-button ${currentPage === 'doubt-solver' ? 'active' : ''}`}
            >
              <Edit className="w-5 h-5" />
              Doubt Solver
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('progress')}
              className={`nav-button ${currentPage === 'progress' ? 'active' : ''}`}
            >
              <BarChart2 className="w-5 h-5" />
              Progress
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('vocabulary')}
              className={`nav-button ${currentPage === 'vocabulary' ? 'active' : ''}`}
            >
              <BookOpen className="w-5 h-5" />
              Vocabulary
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('aptitude')}
              className={`nav-button ${currentPage === 'aptitude' ? 'active' : ''}`}
            >
              <Puzzle className="w-5 h-5" />
              Aptitude
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('science-lab')}
              className={`nav-button ${currentPage === 'science-lab' ? 'active' : ''}`}
            >
              <Atom className="w-5 h-5" />
              Science Lab
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('history-culture')}
              className={`nav-button ${currentPage === 'history-culture' ? 'active' : ''}`}
            >
              <Landmark className="w-5 h-5" />
              History & Culture
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('daily-challenges')}
              className={`nav-button ${currentPage === 'daily-challenges' ? 'active' : ''}`}
            >
              <ClipboardCheck className="w-5 h-5" />
              Daily Challenges
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('flashcards')}
              className={`nav-button ${currentPage === 'flashcards' ? 'active' : ''}`}
            >
              <CreditCard className="w-5 h-5" />
              Flashcards
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {currentPage === 'dashboard' && <DashboardContent userProfile={userProfile} />}
        {currentPage === 'chat' && (
          <AskProfessorChat
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'notes' && (
          <NotesSummarizer
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'quizzes' && (
          <QuizAndTests
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'study-plan' && (
          <PersonalStudyPlan
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            showModal={showModal}
          />
        )}
        {currentPage === 'doubt-solver' && (
          <DoubtSolver
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'progress' && (
          <ProgressAnalytics
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            showModal={showModal}
          />
        )}
        {currentPage === 'vocabulary' && (
          <Vocabulary
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'aptitude' && (
          <Aptitude
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'science-lab' && (
          <ScienceLab
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'history-culture' && (
          <HistoryCulture
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'daily-challenges' && (
          <DailyChallenges
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'flashcards' && (
          <Flashcards
            userId={userId}
            db={db}
            appId={APP_ID_FOR_FIRESTORE}
            updateXP={updateXP}
            showModal={showModal}
          />
        )}
        {currentPage === 'settings' && (
          <ProfileAndSettings
            userProfile={userProfile}
            updateXP={updateXP}
            showModal={showModal}
            handleLogout={handleLogout}
          />
        )}
      </main>

      <Modal message={modalMessage} onClose={closeModal} />
    </div>
  );
};

export default App;
