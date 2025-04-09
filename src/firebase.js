// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3NMJbeW91PQ9ICKN5B0VepaH-hKnZpjY",
  authDomain: "assistente-rotina-3de83.firebaseapp.com",
  projectId: "assistente-rotina-3de83",
  storageBucket: "assistente-rotina-3de83.appspot.com", // Fixed this value
  messagingSenderId: "917619309359",
  appId: "1:917619309359:web:36c5d11c12a16dedf4ffda",
  measurementId: "G-7474GG9GV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;