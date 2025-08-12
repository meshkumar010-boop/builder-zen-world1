import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
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

// Initialize Firebase
console.log("🔥 Initializing Firebase with project:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with enhanced error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Test Firebase connectivity on initialization
async function testFirebaseConnection() {
  try {
    console.log("🔗 Testing Firebase connectivity...");

    // Test Firestore connection
    await enableNetwork(db);
    console.log("✅ Firestore connection successful");

    // Test Auth connection
    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ Firebase Auth connected - User:", user.email);
      } else {
        console.log("ℹ️ Firebase Auth connected - No user signed in");
      }
    });

    return true;
  } catch (error: any) {
    console.error("❌ Firebase connection failed:", error.message);
    console.log("🔄 Falling back to offline mode");
    return false;
  }
}

// Initialize Analytics only in browser environment
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

// Test connection when Firebase is initialized
if (typeof window !== "undefined") {
  testFirebaseConnection();
}

// Export helper function to check connection status
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    console.warn("Firebase connection check failed:", error);
    return false;
  }
}

// Helper to force Firebase reconnection
export async function reconnectFirebase(): Promise<boolean> {
  try {
    console.log("🔄 Attempting Firebase reconnection...");
    await disableNetwork(db);
    await enableNetwork(db);
    console.log("✅ Firebase reconnected successfully");
    return true;
  } catch (error) {
    console.error("❌ Firebase reconnection failed:", error);
    return false;
  }
}

export default app;
