// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmIGNOUhV7jdL4ehviuWG79GOwhLk20rg",
  authDomain: "mths-f8f60.firebaseapp.com",
  projectId: "mths-f8f60",
  storageBucket: "mths-f8f60.firebasestorage.app",
  messagingSenderId: "818181227065",
  appId: "1:818181227065:web:5e7631e043215b96a903e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
