// Image Optimization Utility
// Solves storage quota and Firebase document size limit issues

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG quality
  maxSizeKB?: number; // Maximum file size in KB
  format?: "jpeg" | "webp" | "png" | "auto";
}

export interface OptimizationResult {
  success: boolean;
  file?: File;
  base64?: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  error?: string;
}

const DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.8,
  maxSizeKB: 200, // 200KB max for storage efficiency
  format: "jpeg",
};

/**
 * Check if image optimization is needed
 */
export function needsOptimization(
  file: File,
  options: ImageOptimizationOptions = {},
): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const fileSizeKB = file.size / 1024;

  return (
    fileSizeKB > opts.maxSizeKB ||
    file.type === "image/png" ||
    file.type === "image/bmp"
  );
}

/**
 * Optimize image for storage efficiency
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {},
): Promise<OptimizationResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  try {
    console.log(
      `🖼️ Optimizing image: ${file.name} (${Math.round(originalSize / 1024)}KB)`,
    );

    // Create image element
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Canvas context not available");
    }

    // Load image
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });

    // Calculate new dimensions
    let { width, height } = calculateDimensions(
      img.width,
      img.height,
      opts.maxWidth,
      opts.maxHeight,
    );

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Draw and optimize
    ctx.fillStyle = "#FFFFFF"; // White background for JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Determine output format
    const outputFormat = getOptimalFormat(file.type, opts.format);

    // Convert to blob with compression
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create optimized blob"));
          }
        },
        outputFormat,
        outputFormat === "image/jpeg" ? opts.quality : undefined,
      );
    });

    // Create optimized file
    const optimizedFile = new File(
      [blob],
      generateOptimizedFilename(file.name, outputFormat),
      { type: outputFormat },
    );

    const optimizedSize = optimizedFile.size;
    const compressionRatio =
      ((originalSize - optimizedSize) / originalSize) * 100;

    console.log(
      `✅ Image optimized: ${Math.round(originalSize / 1024)}KB → ${Math.round(optimizedSize / 1024)}KB (${Math.round(compressionRatio)}% reduction)`,
    );

    // Clean up
    URL.revokeObjectURL(img.src);

    // If still too large, create a more aggressive compression
    if (optimizedSize / 1024 > opts.maxSizeKB) {
      console.log(`⚠️ Image still large, applying aggressive compression...`);
      return await optimizeImageAggressive(optimizedFile, opts);
    }

    return {
      success: true,
      file: optimizedFile,
      originalSize,
      optimizedSize,
      compressionRatio,
    };
  } catch (error: any) {
    console.error("❌ Image optimization failed:", error);
    return {
      success: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0,
      error: error.message,
    };
  }
}

/**
 * Aggressive compression for oversized images
 */
async function optimizeImageAggressive(
  file: File,
  options: Required<ImageOptimizationOptions>,
): Promise<OptimizationResult> {
  const originalSize = file.size;

  try {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error("Failed to load image for aggressive compression"));
      img.src = URL.createObjectURL(file);
    });

    // More aggressive dimensions
    const { width, height } = calculateDimensions(
      img.width,
      img.height,
      Math.min(options.maxWidth, 600),
      Math.min(options.maxHeight, 600),
    );

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Lower quality for JPEG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Aggressive compression failed")),
        "image/jpeg",
        Math.max(0.3, options.quality - 0.3), // Reduce quality significantly
      );
    });

    const optimizedFile = new File(
      [blob],
      generateOptimizedFilename(file.name, "image/jpeg"),
      {
        type: "image/jpeg",
      },
    );

    const optimizedSize = optimizedFile.size;
    const compressionRatio =
      ((originalSize - optimizedSize) / originalSize) * 100;

    console.log(
      `🗜️ Aggressive compression: ${Math.round(originalSize / 1024)}KB → ${Math.round(optimizedSize / 1024)}KB`,
    );

    URL.revokeObjectURL(img.src);

    return {
      success: true,
      file: optimizedFile,
      originalSize,
      optimizedSize,
      compressionRatio,
    };
  } catch (error: any) {
    return {
      success: false,
      originalSize,
      optimizedSize: originalSize,
      compressionRatio: 0,
      error: error.message,
    };
  }
}

/**
 * Convert optimized file to base64 with size validation
 */
export async function fileToOptimizedBase64(file: File): Promise<string> {
  const optimized = await optimizeImage(file, { maxSizeKB: 150 }); // Smaller for base64

  if (!optimized.success || !optimized.file) {
    throw new Error(`Image optimization failed: ${optimized.error}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const sizeKB = (base64.length * 0.75) / 1024; // Approximate base64 size

      if (sizeKB > 200) {
        // Still too large for storage
        reject(
          new Error(
            `Image too large for storage: ${Math.round(sizeKB)}KB. Please choose a smaller image.`,
          ),
        );
      } else {
        console.log(`📦 Base64 created: ${Math.round(sizeKB)}KB`);
        resolve(base64);
      }
    };
    reader.onerror = () =>
      reject(new Error("Failed to convert optimized image to base64"));
    reader.readAsDataURL(optimized.file);
  });
}

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (originalWidth > originalHeight) {
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspectRatio),
    };
  } else {
    return {
      width: Math.round(maxHeight * aspectRatio),
      height: maxHeight,
    };
  }
}

/**
 * Determine optimal output format
 */
function getOptimalFormat(inputType: string, preferredFormat: string): string {
  if (preferredFormat !== "auto") {
    return `image/${preferredFormat}`;
  }

  // Always use JPEG for photos to reduce size
  if (inputType.includes("jpeg") || inputType.includes("jpg")) {
    return "image/jpeg";
  }

  // Convert PNG to JPEG for better compression (unless it needs transparency)
  if (inputType.includes("png")) {
    return "image/jpeg"; // Most photos don't need transparency
  }

  return "image/jpeg"; // Default to JPEG for best compression
}

/**
 * Generate filename for optimized image
 */
function generateOptimizedFilename(
  originalName: string,
  outputFormat: string,
): string {
  const extension = outputFormat.split("/")[1];
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  return `${nameWithoutExt}_optimized.${extension}`;
}

/**
 * Check storage capacity and warn user
 */
export function checkStorageCapacity(): {
  available: boolean;
  usageKB: number;
  message?: string;
} {
  try {
    const testKey = "storage_test";
    const testData = "x".repeat(1024); // 1KB test

    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);

    // Estimate current usage
    const currentData = localStorage.getItem("s2-wear-products") || "[]";
    const usageKB = new Blob([currentData]).size / 1024;

    if (usageKB > 4000) {
      // Approaching 5MB limit
      return {
        available: false,
        usageKB,
        message: `Storage almost full (${Math.round(usageKB)}KB/~5MB). Please delete some products or use smaller images.`,
      };
    }

    return { available: true, usageKB };
  } catch (error) {
    return {
      available: false,
      usageKB: 0,
      message:
        "Storage quota exceeded. Please delete some products to continue.",
    };
  }
}
