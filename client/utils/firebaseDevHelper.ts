// Firebase Development Helper
// Helps prevent and resolve Firebase internal state issues during development

import { cleanupFirebase, getConnectionState } from "@/lib/firebase";

// Clean up Firebase state on hot reload (development only)
export function setupFirebaseDevHelper() {
  if (typeof window === "undefined" || import.meta.env.PROD) {
    return;
  }

  console.log("🔧 Setting up Firebase development helper...");

  // Clean up on page unload (only in production to avoid termination errors)
  const handleBeforeUnload = () => {
    try {
      if (import.meta.env.PROD) {
        cleanupFirebase();
      } else {
        console.log("🔥 Skipping Firebase cleanup during development");
      }
    } catch (error) {
      console.warn("⚠️ Firebase cleanup warning:", error);
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  // Handle hot module replacement (HMR) - DON'T cleanup to prevent "client terminated" errors
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      console.log(
        "🔥 HMR: Skipping Firebase cleanup to prevent termination errors",
      );
      // Don't cleanup during HMR - it causes "client terminated" errors
      // cleanupFirebase();
    });
  }

  // Monitor for Firebase internal errors
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(" ");

    if (
      message.includes("FIRESTORE") &&
      message.includes("INTERNAL ASSERTION FAILED")
    ) {
      console.warn(
        "🚨 Firebase internal error detected, recommend page refresh",
      );

      // Show user-friendly notification
      if (
        window.confirm(
          "Firebase connection issue detected. Refresh page to fix?",
        )
      ) {
        window.location.reload();
      }
    }

    // Handle termination errors
    if (message.includes("terminated")) {
      console.warn(
        "🔥 Firebase client terminated - this is expected during development HMR",
      );
      return; // Don't show termination errors in console during development
    }

    originalConsoleError.apply(console, args);
  };

  // Periodic connection health check
  const healthCheckInterval = setInterval(() => {
    const state = getConnectionState();
    if (state.lastError?.message?.includes("INTERNAL ASSERTION FAILED")) {
      console.warn(
        "🔧 Firebase internal error in connection state, suggesting cleanup...",
      );
    }
    if (state.lastError?.message?.includes("terminated")) {
      console.log(
        "🔥 Firebase client terminated detected in health check - resetting state",
      );
      // Don't cleanup, just reset connection state
      state.connected = false;
      state.initialized = false;
    }
  }, 30000); // Check every 30 seconds

  console.log("✅ Firebase development helper initialized");

  // Return cleanup function
  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    clearInterval(healthCheckInterval);
    console.log("🧹 Firebase development helper cleaned up");
  };
}

// Reset Firebase state manually (for debugging)
export async function resetFirebaseState() {
  console.log("🔄 Manually resetting Firebase state...");

  try {
    // Only cleanup in production
    if (import.meta.env.PROD) {
      await cleanupFirebase();
    }

    // Clear any cached Firebase data
    if (typeof window !== "undefined") {
      // Clear IndexedDB if possible
      try {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name?.includes("firestore") || db.name?.includes("firebase")) {
            console.log(`🗑️ Clearing Firebase database: ${db.name}`);
            indexedDB.deleteDatabase(db.name);
          }
        }
      } catch (error) {
        console.warn("Could not clear Firebase IndexedDB:", error);
      }
    }

    console.log("✅ Firebase state reset complete");

    // Reload page to reinitialize cleanly
    if (window.confirm("Firebase state reset. Reload page to apply changes?")) {
      window.location.reload();
    }
  } catch (error) {
    console.error("❌ Firebase state reset failed:", error);
  }
}

// Check if we're in a problematic Firebase state
export function checkFirebaseHealth(): {
  healthy: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  const state = getConnectionState();

  if (state.lastError) {
    if (state.lastError.message.includes("INTERNAL ASSERTION FAILED")) {
      issues.push("Firebase internal assertion failure detected");
      suggestions.push("Try refreshing the page or clearing browser cache");
    }

    if (state.lastError.message.includes("Unexpected state")) {
      issues.push("Firebase unexpected state error");
      suggestions.push("Close other tabs with this app and refresh");
    }

    if (state.lastError.message.includes("terminated")) {
      issues.push("Firebase client terminated (common during development)");
      suggestions.push(
        "This usually resolves automatically during development",
      );
    }
  }

  if (!state.connected && state.initialized) {
    issues.push("Firebase initialized but not connected");
    suggestions.push("Check network connection and Firebase console");
  }

  return {
    healthy: issues.length === 0,
    issues,
    suggestions,
  };
}
