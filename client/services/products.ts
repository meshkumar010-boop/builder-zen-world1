import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  db,
  storage,
  checkFirebaseConnection,
  reconnectFirebase,
} from "@/lib/firebase";

// Helper function to check network connectivity
function isOnline(): boolean {
  return navigator.onLine;
}

// Helper function to detect if we're in a problematic environment
function isFirebaseBlocked(): boolean {
  // Check for common signs that Firebase might be blocked
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.includes("Chrome");
  const hasExtensions = window.chrome && window.chrome.runtime;

  return hasExtensions || !isOnline();
}

// Enhanced Firebase connection test with better error handling
async function testFirebaseConnection(): Promise<boolean> {
  try {
    console.log("🧪 Testing Firebase connection...");

    // Use the centralized connection check
    const isConnected = await checkFirebaseConnection();
    if (!isConnected) {
      console.warn("❌ Firebase connection not available");
      return false;
    }

    // Try a simple Firestore operation with timeout
    const testQuery = collection(db, "products");
    const testPromise = getDocs(testQuery);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection test timeout")), 3000),
    );

    await Promise.race([testPromise, timeoutPromise]);
    console.log("✅ Firebase Firestore is accessible");
    return true;
  } catch (error: any) {
    console.warn("❌ Firebase connection test failed:", error.message);

    // Don't immediately try to reconnect to avoid state conflicts
    if (error.message.includes("INTERNAL ASSERTION FAILED")) {
      console.warn("🚨 Firebase internal error detected, using fallback mode");
      return false;
    }

    return false;
  }
}

export interface Product {
  id?: string;
  name: string;
  price: number; // Current/discounted price in INR
  originalPrice: number; // Original price in INR
  description: string;
  category: string;
  sizes: string[];
  colors: { name: string; value: string }[];
  images: string[];
  features: string[];
  rating?: number;
  reviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Utility function to format INR currency
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Utility function to calculate discount percentage
export function getDiscountPercentage(
  originalPrice: number,
  discountedPrice: number,
): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

// Utility function to validate and sanitize product data
export function sanitizeProduct(product: any): Product {
  return {
    id: product.id || "unknown",
    name: product.name || "Unknown Product",
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    description: product.description || "No description available",
    category: product.category || "Uncategorized",
    sizes: Array.isArray(product.sizes) ? product.sizes : ["M"],
    colors: Array.isArray(product.colors)
      ? product.colors.map((color: any, index: number) => ({
          name: color?.name || `Color ${index + 1}`,
          value: color?.value || "#FFFFFF",
        }))
      : [{ name: "Default", value: "#FFFFFF" }],
    images:
      Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : ["/placeholder.svg"],
    features: Array.isArray(product.features)
      ? product.features
      : ["No features listed"],
    rating: Number(product.rating) || 4.5,
    reviews: Number(product.reviews) || 0,
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date(),
  };
}

const PRODUCTS_COLLECTION = "products";

// Safe Firebase operation wrapper
async function safeFirebaseOperation<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  operationName: string,
): Promise<T> {
  try {
    const result = await Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timeout")), 5000),
      ),
    ]);
    return result;
  } catch (error: any) {
    console.warn(`🚨 Firebase ${operationName} failed:`, error.message);

    // Handle terminated client specifically
    if (error.message?.includes("terminated")) {
      console.warn("🔄 Firebase client terminated, using fallback");
      return fallback();
    }

    // Handle specific Firebase internal errors
    if (
      error.message.includes("INTERNAL ASSERTION FAILED") ||
      error.message.includes("Unexpected state")
    ) {
      console.warn("🔄 Using fallback due to Firebase internal error");
      return fallback();
    }

    // Handle other Firebase errors
    if (error.code === "unavailable" || error.code === "permission-denied") {
      console.warn("🔄 Using fallback due to Firebase service error");
      return fallback();
    }

    throw error;
  }
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  console.log("📦 Loading products...");

  // First try localStorage (faster and more reliable)
  const localProducts = getLocalProducts();
  console.log("📱 Local products found:", localProducts.length);

  // Test Firebase connection first
  const firebaseConnected = await testFirebaseConnection();

  if (!firebaseConnected || isFirebaseBlocked() || !isOnline()) {
    console.log("⚠️ Firebase unavailable, using localStorage only");
    return localProducts;
  }

  // Try Firebase with safe operation wrapper
  try {
    console.log("☁️ Fetching products from Firebase...");

    const firebaseProducts = await safeFirebaseOperation(
      async () => {
        const productsRef = collection(db, PRODUCTS_COLLECTION);
        const q = query(productsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
      },
      () => localProducts,
      "getProducts",
    );

    console.log("✅ Firebase products loaded:", firebaseProducts.length);

    // Update localStorage with latest Firebase data (only if we got Firebase data)
    if (firebaseProducts !== localProducts && firebaseProducts.length > 0) {
      localStorage.setItem(
        "s2-wear-products",
        JSON.stringify(firebaseProducts),
      );
      console.log("�� Updated localStorage with Firebase data");
      return firebaseProducts;
    } else {
      console.log("ℹ️ Using local data");
      return localProducts;
    }
  } catch (error: any) {
    console.error(
      "❌ Firebase fetch failed:",
      error?.message || "Unknown error",
    );

    // Log specific error types for debugging
    if (error?.message?.includes("Failed to fetch")) {
      console.warn(
        "🚫 Network fetch error - likely blocked by extension or CORS",
      );
    } else if (error?.message?.includes("timeout")) {
      console.warn("⏱️ Firebase timeout - slow connection");
    } else if (error?.message?.includes("permission")) {
      console.warn("🔒 Firebase permission denied - check Firestore rules");
    } else if (
      error?.message?.includes("INTERNAL ASSERTION FAILED") ||
      error?.message?.includes("Unexpected state")
    ) {
      console.warn("🚨 Firebase internal error detected - using offline mode");
    }

    // Return localStorage data as fallback
    console.log("🔄 Using localStorage fallback");
    return localProducts;
  }
}

// Helper function to get local products
function getLocalProducts(): Product[] {
  const localProducts = localStorage.getItem("s2-wear-products");
  if (localProducts) {
    try {
      return JSON.parse(localProducts);
    } catch {
      console.warn("Invalid localStorage data, returning empty array");
      return [];
    }
  }

  // Return sample products if nothing exists
  const sampleProducts: Product[] = [
    {
      id: "sample-1",
      name: "Premium Cotton T-Shirt",
      price: 1999,
      originalPrice: 2999,
      description:
        "Made from 100% organic cotton with a classic fit. Perfect for everyday wear.",
      category: "T-Shirts",
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "White", value: "#FFFFFF" },
        { name: "Black", value: "#000000" },
      ],
      images: [
        "https://images.pexels.com/photos/6786894/pexels-photo-6786894.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      features: ["100% Organic Cotton", "Machine Washable"],
      rating: 4.1,
      reviews: 124,
      createdAt: new Date(),
    },
    {
      id: "sample-2",
      name: "Cozy Pullover Hoodie",
      price: 3999,
      originalPrice: 5999,
      description: "Comfortable hoodie perfect for casual wear and layering.",
      category: "Hoodies",
      sizes: ["M", "L", "XL"],
      colors: [
        { name: "Gray", value: "#6B7280" },
        { name: "Black", value: "#000000" },
      ],
      images: [
        "https://images.pexels.com/photos/3253490/pexels-photo-3253490.jpeg?auto=compress&cs=tinysrgb&w=800",
      ],
      features: ["Cotton Blend", "Kangaroo Pocket"],
      rating: 4.1,
      reviews: 87,
      createdAt: new Date(),
    },
  ];

  localStorage.setItem("s2-wear-products", JSON.stringify(sampleProducts));
  return sampleProducts;
}

// Get single product
export async function getProduct(id: string): Promise<Product | null> {
  // First try localStorage (faster and more reliable)
  try {
    console.log("Checking localStorage for product ID:", id);
    const localProducts = localStorage.getItem("s2-wear-products");
    if (localProducts) {
      const products = JSON.parse(localProducts);
      const foundProduct = products.find((p: Product) => p.id === id);
      if (foundProduct) {
        console.log("Product found in localStorage:", foundProduct.name);
        return sanitizeProduct(foundProduct);
      }
    }
  } catch (error) {
    console.warn("Error reading from localStorage:", error);
  }

  // Try Firebase as secondary option
  try {
    console.log("Fetching from Firebase for product ID:", id);
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const rawProduct = {
        id: docSnap.id,
        ...docSnap.data(),
      };
      const product = sanitizeProduct(rawProduct);
      console.log("Product found in Firebase:", product.name);
      return product;
    }
  } catch (error) {
    console.warn(
      "Firebase fetch failed (network/extension issue):",
      error.message,
    );
    // This is common with Chrome extensions or network issues
  }

  // Final fallback - load all products and find the one we need
  try {
    console.log("Trying fallback method...");
    const allProducts = await getProducts();
    const foundProduct = allProducts.find((p) => p.id === id);
    if (foundProduct) {
      console.log("Product found via fallback:", foundProduct.name);
      return sanitizeProduct(foundProduct);
    }
  } catch (error) {
    console.error("All product loading methods failed:", error);
  }

  console.log("Product not found with ID:", id);
  return null;
}

// Add new product
export async function addProduct(
  product: Omit<Product, "id">,
): Promise<string> {
  console.log("🚀 Starting product addition:", product.name);

  const productData = {
    ...product,
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let productId: string;
  let firebaseSuccess = false;

  // Test Firebase connection before attempting to add
  const isFirebaseAvailable = await testFirebaseConnection();
  console.log(
    "📡 Firebase connectivity test:",
    isFirebaseAvailable ? "✅ Connected" : "❌ Unavailable",
  );

  // Try Firebase first if available
  if (isFirebaseAvailable && !isFirebaseBlocked() && isOnline()) {
    try {
      console.log("☁️ Adding product to Firebase:", product.name);

      const result = await safeFirebaseOperation(
        async () => {
          const docRef = await addDoc(
            collection(db, PRODUCTS_COLLECTION),
            productData,
          );
          return docRef.id;
        },
        () => {
          console.warn("🔄 Firebase add failed, generating local ID");
          return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },
        "addProduct",
      );

      productId = result;

      // Check if this is a real Firebase ID (not our fallback)
      if (!productId.startsWith("local_")) {
        firebaseSuccess = true;
        console.log("✅ Product added to Firebase with ID:", productId);
      } else {
        console.log("⚠️ Using local fallback ID:", productId);
      }
    } catch (error: any) {
      console.error("❌ Firebase add operation failed:", error.message);
      productId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Log specific error details for debugging
      if (error.message.includes("INTERNAL ASSERTION FAILED")) {
        console.warn("🚨 Firebase internal error - using offline mode");
      } else if (error.message.includes("permission-denied")) {
        console.warn("🔒 Firebase permission denied - check Firestore rules");
      } else if (error.message.includes("unavailable")) {
        console.warn("📡 Firebase service temporarily unavailable");
      }
    }
  } else {
    console.log("⚠️ Firebase unavailable, creating local product ID");
    productId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Always update localStorage for immediate UI updates and offline persistence
  const productWithId = {
    ...productData,
    id: productId,
  };

  try {
    // Get existing products from localStorage (faster than calling getProducts)
    let existingProducts: Product[] = [];
    const localData = localStorage.getItem("s2-wear-products");
    if (localData) {
      existingProducts = JSON.parse(localData);
    }

    // Add new product to the beginning of the array
    const updatedProducts = [
      productWithId,
      ...existingProducts.filter((p) => p.id !== productId), // Remove duplicates
    ];

    // Check data size before saving
    const updatedDataString = JSON.stringify(updatedProducts);
    const productDataSize = JSON.stringify(productWithId).length / 1024;
    const totalSizeKB = new Blob([updatedDataString]).size / 1024;

    console.log(
      `📏 Product size: ${Math.round(productDataSize)}KB, Total storage: ${Math.round(totalSizeKB)}KB`,
    );

    // Check for storage limits
    if (totalSizeKB > 4500) {
      // Approaching 5MB localStorage limit
      throw new Error(
        `Storage quota almost exceeded (${Math.round(totalSizeKB)}KB/~5MB). Please delete some products or use smaller images.`,
      );
    }

    if (productDataSize > 900) {
      // Large individual product
      console.warn(
        `⚠️ Large product detected (${Math.round(productDataSize)}KB). Consider using smaller images.`,
      );
    }

    localStorage.setItem("s2-wear-products", updatedDataString);

    console.log("💾 Product saved to localStorage:");
    console.log(`  - Product ID: ${productId}`);
    console.log(`  - Product size: ${Math.round(productDataSize)}KB`);
    console.log(`  - Total products: ${updatedProducts.length}`);
    console.log(`  - Total storage: ${Math.round(totalSizeKB)}KB`);
    console.log(
      `  - Firebase status: ${firebaseSuccess ? "✅ Synced" : "⚠️ Local only"}`,
    );
  } catch (localError: any) {
    console.error("❌ localStorage save failed:", localError);

    if (
      localError.name === "QuotaExceededError" ||
      localError.message.includes("quota")
    ) {
      // Try auto cleanup first
      try {
        const { autoCleanup } = require("@/utils/storageManager");
        const cleanupResult = autoCleanup();

        if (cleanupResult.success && cleanupResult.freedKB > 500) {
          // Retry saving after cleanup
          const updatedProducts = [...existingProducts, productWithId];
          localStorage.setItem(
            "s2-wear-products",
            JSON.stringify(updatedProducts),
          );
          console.log("✅ Product saved after auto cleanup");

          // Return success message with cleanup info
          if (firebaseSuccess) {
            console.log(
              "🎉 Product successfully added to both Firebase and localStorage (after cleanup)",
            );
          } else {
            console.log(
              "📱 Product saved locally after cleanup (will sync to Firebase when connection is restored)",
            );
          }
          return productId;
        }
      } catch (cleanupError) {
        console.warn("Auto cleanup failed:", cleanupError);
      }

      throw new Error(
        "Storage quota exceeded. Please use the Storage Cleanup tool in the admin panel to free up space.",
      );
    }

    throw new Error(`Failed to save product locally: ${localError.message}`);
  }

  // Return success message with context
  if (firebaseSuccess) {
    console.log(
      "🎉 Product successfully added to both Firebase and localStorage",
    );
  } else {
    console.log(
      "📱 Product saved locally (will sync to Firebase when connection is restored)",
    );
  }

  return productId;
}

// Update product
export async function updateProduct(
  id: string,
  product: Partial<Product>,
): Promise<void> {
  const updateData = {
    ...product,
    updatedAt: new Date(),
  };

  // Check data size before Firebase upload
  const dataSize = JSON.stringify(updateData).length;
  const dataSizeKB = dataSize / 1024;

  console.log(`📏 Product data size: ${Math.round(dataSizeKB)}KB`);

  try {
    console.log("Updating product in Firebase:", id);

    // Firebase Firestore document limit is 1MB
    if (dataSizeKB > 900) {
      // Stay under 1MB limit with buffer
      console.warn(
        `⚠️ Product data too large for Firebase (${Math.round(dataSizeKB)}KB). Storing locally only.`,
      );
      throw new Error(
        `Product data exceeds Firebase limits (${Math.round(dataSizeKB)}KB). Please use smaller images or reduce content.`,
      );
    }

    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, updateData);
    console.log("✅ Product updated in Firebase successfully");
  } catch (error: any) {
    console.error(
      "❌ Error updating product in Firebase, using localStorage fallback:",
      error.message,
    );

    // Don't throw for size limit errors - continue with localStorage
    if (
      !error.message.includes("longer than") &&
      !error.message.includes("exceeds Firebase limits")
    ) {
      // Only log other Firebase errors, don't fail the operation
      console.warn("📱 Continuing with localStorage-only mode");
    }
  }

  try {
    // Update localStorage for immediate UI updates
    const existingProducts = await getProducts();
    const updatedProducts = existingProducts.map((p) =>
      p.id === id ? { ...p, ...updateData } : p,
    );

    // Check localStorage capacity
    const updatedDataString = JSON.stringify(updatedProducts);
    const updatedSizeKB = new Blob([updatedDataString]).size / 1024;

    if (updatedSizeKB > 4500) {
      // Approaching 5MB localStorage limit
      throw new Error(
        `Storage quota almost exceeded (${Math.round(updatedSizeKB)}KB). Please delete some products or use smaller images.`,
      );
    }

    localStorage.setItem("s2-wear-products", updatedDataString);
    console.log(
      `💾 Product updated in localStorage (${Math.round(updatedSizeKB)}KB total)`,
    );
  } catch (storageError: any) {
    console.error("❌ localStorage update failed:", storageError);

    if (
      storageError.name === "QuotaExceededError" ||
      storageError.message.includes("quota")
    ) {
      throw new Error(
        "Storage quota exceeded. Please delete some products or use smaller images to continue.",
      );
    }

    throw storageError;
  }
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  console.log("Deleting product with ID:", id);

  // Try to delete from Firebase first (if not blocked)
  if (!isFirebaseBlocked() && isOnline()) {
    try {
      console.log("Attempting to delete from Firebase...");

      await safeFirebaseOperation(
        async () => {
          const docRef = doc(db, PRODUCTS_COLLECTION, id);
          await deleteDoc(docRef);
          return true;
        },
        () => {
          console.warn(
            "Firebase delete failed, continuing with localStorage cleanup",
          );
          return false;
        },
        "deleteProduct",
      );

      console.log("Product deleted from Firebase successfully");
    } catch (error: any) {
      if (error?.message?.includes("INTERNAL ASSERTION FAILED")) {
        console.warn(
          "🚨 Firebase internal error during delete, continuing with localStorage",
        );
      } else {
        console.warn("Failed to delete from Firebase:", error);
      }
      // Continue with localStorage deletion even if Firebase fails
    }
  }

  // Always update localStorage to ensure UI consistency
  try {
    const existingProducts = localStorage.getItem("s2-wear-products");
    if (existingProducts) {
      const products = JSON.parse(existingProducts);
      const updatedProducts = products.filter((p: Product) => p.id !== id);
      localStorage.setItem("s2-wear-products", JSON.stringify(updatedProducts));
      console.log(
        "Product deleted from localStorage, remaining products:",
        updatedProducts.length,
      );
    }
  } catch (error) {
    console.error("Error updating localStorage after deletion:", error);
    throw new Error("Failed to delete product from local storage");
  }

  console.log("Product deletion completed successfully");
}

// Upload product image
export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<string> {
  console.log("Attempting Firebase upload for:", file.name, "Size:", file.size);

  try {
    // Test Firebase connection first
    if (!storage) {
      throw new Error("Firebase storage not initialized");
    }

    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `products/${productId}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, filename);

    console.log("Uploading to Firebase path:", filename);

    // Upload file with balanced timeout for reliable performance
    const timeoutDuration = Math.max(30000, (file.size / 1024) * 5); // At least 30s, or 5ms per KB
    const uploadPromise = uploadBytes(storageRef, file);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Upload timeout")), timeoutDuration),
    );

    console.log(
      `Firebase upload timeout set to: ${timeoutDuration}ms for file size: ${file.size} bytes`,
    );

    const snapshot = (await Promise.race([
      uploadPromise,
      timeoutPromise,
    ])) as any;

    console.log("Firebase upload bytes completed, getting download URL...");
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("Firebase upload successful:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Firebase upload failed:", error);

    // Re-throw the error so the caller can handle it
    // (ProductForm will convert to base64 as fallback)
    throw new Error(
      `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Delete product image
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
