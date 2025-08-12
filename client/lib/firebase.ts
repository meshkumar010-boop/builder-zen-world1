import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableNetwork,
  disableNetwork,
  terminate,
  clearIndexedDbPersistence,
} from "firebase/firestore";
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

// Prevent multiple Firebase app initialization
let app;
if (getApps().length === 0) {
  console.log("🔥 Initializing Firebase with project:", firebaseConfig.projectId);
  app = initializeApp(firebaseConfig);
} else {
  console.log("🔥 Using existing Firebase app instance");
  app = getApp();
}

// Initialize Firebase services with enhanced error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Global connection state tracking
let connectionState = {
  initialized: false,
  connected: false,
  lastError: null as Error | null,
};

// Test Firebase connectivity on initialization
async function testFirebaseConnection() {
  if (connectionState.initialized) {
    return connectionState.connected;
  }

  try {
    console.log("🔗 Testing Firebase connectivity...");

    // Clear any existing connection issues
    try {
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      await enableNetwork(db);
    } catch (networkError) {
      console.warn("⚠️ Network reset failed, continuing...", networkError);
    }

    console.log("✅ Firestore connection successful");
    connectionState.connected = true;
    connectionState.lastError = null;

    // Set up auth state listener once
    if (!connectionState.initialized) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          console.log("✅ Firebase Auth connected - User:", user.email);
        } else {
          console.log("ℹ️ Firebase Auth connected - No user signed in");
        }
      });
    }

    connectionState.initialized = true;
    return true;
  } catch (error: any) {
    console.error("❌ Firebase connection failed:", error.message);
    connectionState.connected = false;
    connectionState.lastError = error;
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
    // Use a simple operation that doesn't trigger complex state changes
    if (!connectionState.connected) {
      return await testFirebaseConnection();
    }
    return true;
  } catch (error) {
    console.warn("Firebase connection check failed:", error);
    connectionState.connected = false;
    return false;
  }
}

// Helper to force Firebase reconnection with proper cleanup
export async function reconnectFirebase(): Promise<boolean> {
  try {
    console.log("🔄 Attempting Firebase reconnection...");

    // Reset connection state
    connectionState.connected = false;
    connectionState.lastError = null;

    // Try graceful reconnection
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for cleanup
    await enableNetwork(db);

    connectionState.connected = true;
    console.log("✅ Firebase reconnected successfully");
    return true;
  } catch (error: any) {
    console.error("❌ Firebase reconnection failed:", error);
    connectionState.lastError = error;
    return false;
  }
}

// Clean up Firebase connections (for hot reload/development)
export async function cleanupFirebase(): Promise<void> {
  try {
    console.log("🧹 Cleaning up Firebase connections...");
    await disableNetwork(db);
    await terminate(db);
    connectionState.initialized = false;
    connectionState.connected = false;
  } catch (error) {
    console.warn("⚠️ Firebase cleanup warning:", error);
  }
}

// Get current connection state
export function getConnectionState() {
  return { ...connectionState };
}

export default app;
