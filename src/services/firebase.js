// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZKlwYEgFRH2-Alx7vrbIRrovRog8Cd4g",
  authDomain: "education-1a7b6.firebaseapp.com",
  projectId: "education-1a7b6",
  storageBucket: "education-1a7b6.firebasestorage.app",
  messagingSenderId: "765145101901",
  appId: "1:765145101901:web:27ee0a2502953c2cafce04",
  measurementId: "G-MVGC0KKRT0"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
