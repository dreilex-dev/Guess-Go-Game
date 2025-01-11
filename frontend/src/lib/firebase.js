// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnZtdfLsPe0c201h6jxpMj1tIxgQvuT6Q",
  authDomain: "guessandgochat.firebaseapp.com",
  projectId: "guessandgochat",
  storageBucket: "guessandgochat.firebasestorage.app",
  messagingSenderId: "882826771963",
  appId: "1:882826771963:web:45df61ecdabc8c99145f5e",
  measurementId: "G-T25G1XLYLV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth =getAuth(app);
export const db= getFirestore(app)