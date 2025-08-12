// Storage Management Utility
// Handles localStorage quota issues and provides cleanup functions

import type { Product } from "@/services/products";

export interface StorageInfo {
  usageKB: number;
  limitKB: number;
  percentUsed: number;
  available: boolean;
  message?: string;
}

export interface CleanupResult {
  success: boolean;
  freedKB: number;
  removedItems: number;
  message: string;
}

/**
 * Check current localStorage usage and capacity
 */
export function getStorageInfo(): StorageInfo {
  try {
    // Estimate localStorage usage
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }

    const usageKB = totalSize / 1024;
    const limitKB = 5120; // 5MB typical limit
    const percentUsed = (usageKB / limitKB) * 100;

    return {
      usageKB,
      limitKB,
      percentUsed,
      available: percentUsed < 90, // Consider 90% as threshold
      message:
        percentUsed > 90
          ? `Storage ${percentUsed.toFixed(1)}% full (${usageKB.toFixed(0)}KB/${limitKB}KB)`
          : undefined,
    };
  } catch (error) {
    return {
      usageKB: 0,
      limitKB: 5120,
      percentUsed: 0,
      available: false,
      message: "Could not check storage capacity",
    };
  }
}

/**
 * Get products from localStorage with size information
 */
export function getProductsWithSize(): Array<Product & { sizeKB: number }> {
  try {
    const productsData = localStorage.getItem("s2-wear-products");
    if (!productsData) return [];

    const products: Product[] = JSON.parse(productsData);

    return products.map((product) => {
      const productString = JSON.stringify(product);
      const sizeKB = new Blob([productString]).size / 1024;
      return { ...product, sizeKB };
    });
  } catch (error) {
    console.error("Error getting products with size:", error);
    return [];
  }
}

/**
 * Remove base64 images from products to free up space
 */
export function removeBase64Images(): CleanupResult {
  try {
    const products = getProductsWithSize();
    let freedKB = 0;
    let modifiedCount = 0;

    const cleanedProducts = products.map((product) => {
      const originalSize = product.sizeKB;

      // Remove base64 images (keep URLs)
      const cleanedImages = product.images.filter((image) => {
        if (image.startsWith("data:")) {
          freedKB += (image.length * 0.75) / 1024; // Approximate base64 size
          return false;
        }
        return true;
      });

      if (cleanedImages.length !== product.images.length) {
        modifiedCount++;
        return { ...product, images: cleanedImages };
      }

      return product;
    });

    // Save cleaned products
    localStorage.setItem("s2-wear-products", JSON.stringify(cleanedProducts));

    return {
      success: true,
      freedKB,
      removedItems: modifiedCount,
      message: `Removed base64 images from ${modifiedCount} products, freed ${freedKB.toFixed(1)}KB`,
    };
  } catch (error) {
    return {
      success: false,
      freedKB: 0,
      removedItems: 0,
      message: `Failed to clean base64 images: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Remove oldest products to free up space
 */
export function removeOldestProducts(targetKB: number = 1000): CleanupResult {
  try {
    const products = getProductsWithSize();

    // Sort by creation date (assuming id contains timestamp or we use a heuristic)
    const sortedProducts = products.sort((a, b) => {
      // Try to extract timestamp from ID or use name as fallback
      const aTime = parseInt(a.id) || a.id.localeCompare(b.id);
      const bTime = parseInt(b.id) || b.id.localeCompare(a.id);
      return aTime - bTime; // Oldest first
    });

    let freedKB = 0;
    let removedCount = 0;
    const remainingProducts: Product[] = [];

    for (const product of sortedProducts) {
      if (freedKB < targetKB) {
        freedKB += product.sizeKB;
        removedCount++;
      } else {
        remainingProducts.push(product);
      }
    }

    // Save remaining products
    localStorage.setItem("s2-wear-products", JSON.stringify(remainingProducts));

    return {
      success: true,
      freedKB,
      removedItems: removedCount,
      message: `Removed ${removedCount} oldest products, freed ${freedKB.toFixed(1)}KB`,
    };
  } catch (error) {
    return {
      success: false,
      freedKB: 0,
      removedItems: 0,
      message: `Failed to remove old products: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Clear all product data (emergency cleanup)
 */
export function clearAllProducts(): CleanupResult {
  try {
    const storageInfo = getStorageInfo();
    const productsData = localStorage.getItem("s2-wear-products");
    const freedKB = productsData ? new Blob([productsData]).size / 1024 : 0;

    localStorage.removeItem("s2-wear-products");

    return {
      success: true,
      freedKB,
      removedItems: 0, // We don't count individual products
      message: `Cleared all product data, freed ${freedKB.toFixed(1)}KB`,
    };
  } catch (error) {
    return {
      success: false,
      freedKB: 0,
      removedItems: 0,
      message: `Failed to clear products: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Auto cleanup when storage is full
 */
export function autoCleanup(): CleanupResult {
  const storageInfo = getStorageInfo();

  if (storageInfo.percentUsed < 90) {
    return {
      success: true,
      freedKB: 0,
      removedItems: 0,
      message: "No cleanup needed",
    };
  }

  // Try base64 cleanup first
  const base64Result = removeBase64Images();
  if (base64Result.freedKB > 500) {
    // If we freed enough space
    return base64Result;
  }

  // If still not enough, remove old products
  const oldProductsResult = removeOldestProducts(1000);

  return {
    success: base64Result.success && oldProductsResult.success,
    freedKB: base64Result.freedKB + oldProductsResult.freedKB,
    removedItems: base64Result.removedItems + oldProductsResult.removedItems,
    message: `${base64Result.message}; ${oldProductsResult.message}`,
  };
}

/**
 * Check if storage can accommodate new data
 */
export function canStoreData(dataSizeKB: number): boolean {
  const storageInfo = getStorageInfo();
  return storageInfo.usageKB + dataSizeKB < storageInfo.limitKB * 0.9;
}
