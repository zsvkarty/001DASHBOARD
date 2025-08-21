import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHzejKRrK4suzeKbBuS_o9IRDDAaL9RRM",
  authDomain: "opravech.firebaseapp.com",
  projectId: "opravech",
  storageBucket: "opravech.firebasestorage.app",
  messagingSenderId: "830392215702",
  appId: "1:830392215702:web:61ef2b6d88991732cffab7",
  measurementId: "G-HFFTJVBEQJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app;