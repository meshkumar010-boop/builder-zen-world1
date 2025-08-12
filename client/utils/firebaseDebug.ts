import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirebaseDebugResult {
  success: boolean;
  message: string;
  error?: string;
  timestamp: Date;
}

// Test Firebase Firestore read operation
export async function testFirestoreRead(): Promise<FirebaseDebugResult> {
  try {
    console.log("🧪 Testing Firestore read operation...");

    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const count = snapshot.docs.length;
    console.log(`✅ Firestore read successful - ${count} documents found`);

    return {
      success: true,
      message: `Successfully read ${count} products from Firestore`,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("❌ Firestore read failed:", error);
    return {
      success: false,
      message: "Failed to read from Firestore",
      error: error.message,
      timestamp: new Date(),
    };
  }
}

// Test Firebase Firestore write operation
export async function testFirestoreWrite(): Promise<FirebaseDebugResult> {
  try {
    console.log("🧪 Testing Firestore write operation...");

    const testData = {
      name: `Test Product ${Date.now()}`,
      price: 99.99,
      description: "This is a test product for Firebase connectivity",
      category: "Test",
      createdAt: new Date(),
      isTest: true,
    };

    const docRef = await addDoc(collection(db, "products"), testData);
    console.log(`✅ Firestore write successful - Document ID: ${docRef.id}`);

    // Clean up test document
    await deleteDoc(doc(db, "products", docRef.id));
    console.log("🧹 Test document cleaned up");

    return {
      success: true,
      message: `Successfully wrote and deleted test document ${docRef.id}`,
      timestamp: new Date(),
    };
  } catch (error: any) {
    console.error("❌ Firestore write failed:", error);
    return {
      success: false,
      message: "Failed to write to Firestore",
      error: error.message,
      timestamp: new Date(),
    };
  }
}

// Comprehensive Firebase test
export async function runFirebaseTests(): Promise<{
  read: FirebaseDebugResult;
  write: FirebaseDebugResult;
  overall: boolean;
}> {
  console.log("🔬 Running comprehensive Firebase tests...");

  const readResult = await testFirestoreRead();
  const writeResult = await testFirestoreWrite();

  const overall = readResult.success && writeResult.success;

  console.log(
    `📋 Firebase tests completed - Overall: ${overall ? "PASS" : "FAIL"}`,
  );
  console.log(`   Read: ${readResult.success ? "PASS" : "FAIL"}`);
  console.log(`   Write: ${writeResult.success ? "PASS" : "FAIL"}`);

  return {
    read: readResult,
    write: writeResult,
    overall,
  };
}

// Export helper to get Firebase project info
export function getFirebaseProjectInfo() {
  return {
    projectId: "s2-wear-3f5fe",
    authDomain: "s2-wear-3f5fe.firebaseapp.com",
    storageBucket: "s2-wear-3f5fe.firebasestorage.app",
    consoleUrl: "https://console.firebase.google.com/project/s2-wear-3f5fe",
    firestoreUrl:
      "https://console.firebase.google.com/project/s2-wear-3f5fe/firestore",
  };
}
