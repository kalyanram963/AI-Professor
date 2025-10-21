// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyDnaBfSht42akyQ4kbrxpjiVgENQJ2kuoY",
  authDomain: "ai-proffessor.firebaseapp.com",
  projectId: "ai-proffessor",
  storageBucket: "ai-proffessor.firebasestorage.app",
  messagingSenderId: "564300105563",
  appId: "1:564300105563:web:15f58a22d98ed86be33c7e",
  measurementId: "G-423BGY76M8"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
