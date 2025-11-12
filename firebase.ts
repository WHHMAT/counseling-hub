// Import the functions you need from the SDKs you need
// FIX: Switched to Firebase v9 compat syntax to resolve import errors.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  // SICUREZZA: La chiave API viene caricata dalle variabili d'ambiente.
  // FIX: Using a dedicated, client-safe environment variable for the Firebase API Key.
  // The build tool (e.g., Vite, Netlify build) will replace `process.env.VITE_API_KEY` 
  // with the actual value at build time.
  // @ts-ignore
  apiKey: process.env.VITE_API_KEY,
  authDomain: "hub-competenze-counseling.firebaseapp.com",
  projectId: "hub-competenze-counseling",
  storageBucket: "hub-competenze-counseling.appspot.com",
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
export const storage = firebase.storage();

export default firebase;