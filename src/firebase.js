// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4TI1ZrUpkYuMxn8XXFlOUVP-jWAS5q4Y",
  authDomain: "confetti-3b50f.firebaseapp.com",
  databaseURL: "https://confetti-3b50f-default-rtdb.firebaseio.com", // Add your Realtime Database URL here
  projectId: "confetti-3b50f",
  storageBucket: "confetti-3b50f.firebasestorage.app",
  messagingSenderId: "230118608667",
  appId: "1:230118608667:web:8620a4f314492700ab4dbe",
  measurementId: "G-BKHNX8WHX9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Database instances
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
