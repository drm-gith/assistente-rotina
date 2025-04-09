
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyC3NMJbeW91PQ9ICKN5B0VepaH-hKnZpjY',
  authDomain: 'assistente-rotina-3de83.firebaseapp.com',
  projectId: 'assistente-rotina-3de83',
  storageBucket: 'assistente-rotina-3de83.appspot.com',
  messagingSenderId: '917619309359',
  appId: '1:917619309359:web:36c5d11c12a16dedf4ffda'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
