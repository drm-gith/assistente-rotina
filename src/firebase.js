// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3NMJbeW91PQ9ICKN5B0VepaH-hKnZpjY",
  authDomain: "assistente-rotina-3de83.firebaseapp.com",
  projectId: "assistente-rotina-3de83",
  storageBucket: "assistente-rotina-3de83.firebasestorage.app",
  messagingSenderId: "917619309359",
  appId: "1:917619309359:web:36c5d11c12a16dedf4ffda",
  measurementId: "G-7474GG9GV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);