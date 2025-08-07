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
import { db, storage } from "@/lib/firebase";

// Helper function to check network connectivity
function isOnline(): boolean {
  return navigator.onLine;
}

// Helper function to detect if we're in a problematic environment
function isFirebaseBlocked(): boolean {
  // Check for common signs that Firebase might be blocked
  const userAgent = navigator.userAgent;
  const isChrome = userAgent.includes('Chrome');
  const hasExtensions = window.chrome && window.chrome.runtime;

  return hasExtensions || !isOnline();
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

// Get all products
export async function getProducts(): Promise<Product[]> {
  // First try localStorage (faster and more reliable)
  const localProducts = getLocalProducts();

  // Skip Firebase if we detect blocking or no internet
  if (isFirebaseBlocked() || !isOnline()) {
    console.log("Firebase blocked or offline, using localStorage only");
    return localProducts;
  }

  // Try Firebase with timeout and enhanced error handling
  try {
    console.log("Fetching products from Firebase...");

    // Add timeout wrapper for Firebase calls
    const firebasePromise = (async () => {
      const productsRef = collection(db, PRODUCTS_COLLECTION);
      const q = query(productsRef, orderBy("createdAt", "desc"));
      return await getDocs(q);
    })();

    // Race between Firebase call and timeout (shorter timeout)
    const querySnapshot = await Promise.race([
      firebasePromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Firebase timeout")), 3000)
      ),
    ]) as any;

    const firebaseProducts = querySnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    console.log("Firebase products found:", firebaseProducts.length);

    // Update localStorage with latest Firebase data
    if (firebaseProducts.length > 0) {
      localStorage.setItem(
        "s2-wear-products",
        JSON.stringify(firebaseProducts),
      );
      return firebaseProducts;
    }
  } catch (error: any) {
    console.warn(
      "Firebase connection failed (using localStorage):",
      error?.message || "Unknown error",
    );

    // Log specific error types for debugging
    if (error?.message?.includes("Failed to fetch")) {
      console.warn("Network fetch error - likely blocked by extension or CORS");
    } else if (error?.message?.includes("timeout")) {
      console.warn("Firebase timeout - slow connection");
    }
  }

  // Return localStorage data (includes sample products if empty)
  console.log("Using localStorage products:", localProducts.length);
  return localProducts;
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
  const productData = {
    ...product,
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let productId: string;

  try {
    console.log("Adding product to Firebase:", product.name);
    const docRef = await addDoc(
      collection(db, PRODUCTS_COLLECTION),
      productData,
    );
    productId = docRef.id;
    console.log("Product added to Firebase with ID:", productId);
  } catch (error) {
    console.error(
      "Error adding product to Firebase, using localStorage fallback:",
      error,
    );
    productId = Date.now().toString();
  }

  // Always update localStorage for immediate UI updates
  const productWithId = {
    ...productData,
    id: productId,
  };

  const existingProducts = await getProducts();
  const updatedProducts = [
    productWithId,
    ...existingProducts.filter((p) => p.id !== productId),
  ];
  localStorage.setItem("s2-wear-products", JSON.stringify(updatedProducts));
  console.log(
    "Product saved to localStorage, total products:",
    updatedProducts.length,
  );

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

  try {
    console.log("Updating product in Firebase:", id);
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, updateData);
    console.log("Product updated in Firebase successfully");
  } catch (error) {
    console.error(
      "Error updating product in Firebase, using localStorage fallback:",
      error,
    );
  }

  // Always update localStorage for immediate UI updates
  const existingProducts = await getProducts();
  const updatedProducts = existingProducts.map((p) =>
    p.id === id ? { ...p, ...updateData } : p,
  );
  localStorage.setItem("s2-wear-products", JSON.stringify(updatedProducts));
  console.log("Product updated in localStorage");
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
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

    // Upload file with timeout
    const uploadPromise = uploadBytes(storageRef, file);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Upload timeout")), 30000),
    );

    const snapshot = (await Promise.race([
      uploadPromise,
      timeoutPromise,
    ])) as any;
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
