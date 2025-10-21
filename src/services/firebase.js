// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "AIzaSyDnaBfSht42akyQ4kbrxpjiVgENQJ2kuoY",
  authDomain: "ai-proffessor.firebaseapp.com",
  projectId: "ai-proffessor",
  storageBucket: "ai-proffessor.firebasestorage.app",
  messagingSenderId: "564300105563",
  appId: "1:564300105563:web:15f58a22d98ed86be33c7e",
  measurementId: "G-423BGY76M8"
=======
  apiKey: "AIzaSyAZKlwYEgFRH2-Alx7vrbIRrovRog8Cd4g",
  authDomain: "education-1a7b6.firebaseapp.com",
  projectId: "education-1a7b6",
  storageBucket: "education-1a7b6.firebasestorage.app",
  messagingSenderId: "765145101901",
  appId: "1:765145101901:web:27ee0a2502953c2cafce04",
  measurementId: "G-MVGC0KKRT0"
>>>>>>> e138ed1b01524a51945a24468721cb21e6d8cd70
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
