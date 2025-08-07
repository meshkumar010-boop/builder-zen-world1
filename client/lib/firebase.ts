import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIiz0yVMeBsTebmfCzJLfI_XTw3AzFyls",
  authDomain: "s2-wear-3f5fe.firebaseapp.com",
  projectId: "s2-wear-3f5fe",
  storageBucket: "s2-wear-3f5fe.firebasestorage.app",
  messagingSenderId: "252559418573",
  appId: "1:252559418573:web:bbf477a1d788c9355b3584",
  measurementId: "G-B5NPFHVCK2",
};

// Initialize Firebase with error handling
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services with error handling
  try {
    auth = getAuth(app);
  } catch (error) {
    console.warn("Firebase Auth initialization failed:", error);
  }

  try {
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase Firestore initialization failed:", error);
  }

  try {
    storage = getStorage(app);
  } catch (error) {
    console.warn("Firebase Storage initialization failed:", error);
  }

  // Initialize Analytics only in browser environment
  try {
    analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
  } catch (error) {
    console.warn("Firebase Analytics initialization failed:", error);
  }

  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed completely:", error);
  // Mark Firebase as unavailable
  if (typeof window !== "undefined") {
    sessionStorage.setItem("firebase-blocked", "true");
  }
}

export { auth, db, storage, analytics };

export default app;
