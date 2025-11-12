// Import the functions you need from the SDKs you need
// FIX: Switched to Firebase v9 compat syntax to resolve import errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqOwyCbE7qHGo-jUwH9fJtgijTUseMjAE",
  authDomain: "hub-competenze-counseling.firebaseapp.com",
  projectId: "hub-competenze-counseling",
  storageBucket: "hub-competenze-counseling.firebasestorage.app",
  messagingSenderId: "569840620530",
  appId: "1:569840620530:web:828446d2c371c1a6db916b",
  measurementId: "G-6F3QC3G0KT"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


// Export services for use in other parts of the app
export const auth = firebase.auth();
export const db = firebase.firestore();

export default firebase;
