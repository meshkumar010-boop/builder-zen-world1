import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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
  measurementId: "G-B5NPFHVCK2"
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

// Firebase connection status
export let isFirebaseConnected = false;

try {
  console.log("Initializing Firebase...");
  app = initializeApp(firebaseConfig);

  // Initialize Firebase services with error handling
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize Analytics only in browser environment
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (analyticsError) {
      console.warn("Analytics initialization failed:", analyticsError);
    }
  }

  isFirebaseConnected = true;
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.log("App will work in offline mode with localStorage");
  isFirebaseConnected = false;
}

// Export with null checks
export { auth, db, storage, analytics };
export default app;

// Utility function to check if Firebase is available
export function checkFirebaseConnection(): boolean {
  return isFirebaseConnected && db !== null;
}

// Graceful Firebase operation wrapper
export async function safeFirebaseOperation<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  operationName: string = "Firebase operation"
): Promise<T> {
  if (!checkFirebaseConnection()) {
    console.log(`${operationName}: Using fallback (Firebase not available)`);
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    console.warn(`${operationName} failed, using fallback:`, error);
    return fallback();
  }
}
