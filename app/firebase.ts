// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOWn7TzOaPqyl5Y5C3DfTnFnJ8wgOB1IQ",
  authDomain: "third-firestore.firebaseapp.com",
  databaseURL: "https://third-firestore-default-rtdb.firebaseio.com",
  projectId: "third-firestore",
  storageBucket: "third-firestore.firebasestorage.app",
  messagingSenderId: "792530130881",
  appId: "1:792530130881:web:88cef8189a17d0a65ec140"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export {app}