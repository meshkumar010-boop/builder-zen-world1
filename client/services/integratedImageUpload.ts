// Integrated Image Upload Service
// Combines Firebase Storage with multiple cloud services for maximum reliability

import { uploadProductImage } from "./products";

export interface UploadResult {
  success: boolean;
  url?: string;
  source: "firebase" | "imgbb" | "cloudinary" | "imgur" | "base64" | "error";
  error?: string;
}

export interface UploadOptions {
  preferredService?: "firebase" | "cloud" | "auto";
  maxRetries?: number;
  fallbackToBase64?: boolean;
}

// Environment configuration - users should set these in their .env file
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || null;
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null;
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || null;

/**
 * Upload to ImgBB (Free tier: 100 images/month)
 */
async function uploadToImgBB(file: File): Promise<UploadResult> {
  if (!IMGBB_API_KEY) {
    return {
      success: false,
      source: "error",
      error:
        "ImgBB API key not configured - add VITE_IMGBB_API_KEY to .env for enhanced uploading",
    };
  }

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_API_KEY);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`ImgBB responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data?.url) {
      return {
        success: true,
        url: data.data.url,
        source: "imgbb",
      };
    } else {
      throw new Error(data.error?.message || "ImgBB upload failed");
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "ImgBB upload failed";
    console.warn("ImgBB upload error:", errorMsg);
    return {
      success: false,
      source: "error",
      error: errorMsg.includes("Failed to fetch")
        ? "ImgBB blocked by network/CORS policy"
        : errorMsg,
    };
  }
}

/**
 * Upload to Cloudinary (Free tier: 25GB, 25,000 transformations/month)
 */
async function uploadToCloudinary(file: File): Promise<UploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return {
      success: false,
      source: "error",
      error:
        "Cloudinary configuration not found - add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env",
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        mode: "cors",
      },
    );

    if (!response.ok) {
      throw new Error(`Cloudinary responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.secure_url) {
      return {
        success: true,
        url: data.secure_url,
        source: "cloudinary",
      };
    } else {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Cloudinary upload failed";
    console.warn("Cloudinary upload error:", errorMsg);
    return {
      success: false,
      source: "error",
      error: errorMsg.includes("Failed to fetch")
        ? "Cloudinary blocked by network/CORS policy"
        : errorMsg,
    };
  }
}

/**
 * Upload to Imgur (Free with registration)
 */
async function uploadToImgur(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("https://api.imgur.com/3/upload", {
      method: "POST",
      headers: {
        Authorization: "Client-ID 546c25a59c58ad7", // Anonymous upload client ID
      },
      body: formData,
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`Imgur responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data?.link) {
      return {
        success: true,
        url: data.data.link,
        source: "imgur",
      };
    } else {
      throw new Error(data.data?.error || "Imgur upload failed");
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Imgur upload failed";
    console.warn("Imgur upload error:", errorMsg);

    // Handle specific network/CORS errors
    if (errorMsg.includes("Failed to fetch")) {
      return {
        success: false,
        source: "error",
        error:
          "Imgur blocked by network/CORS policy - trying alternative services",
      };
    }

    return {
      success: false,
      source: "error",
      error: errorMsg,
    };
  }
}

/**
 * Upload to Firebase Storage
 */
async function uploadToFirebase(
  file: File,
  productId: string,
): Promise<UploadResult> {
  try {
    console.log(
      `🔥 Attempting Firebase upload for ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    );
    const url = await uploadProductImage(file, productId);
    console.log(`✅ Firebase upload successful: ${url}`);
    return {
      success: true,
      url,
      source: "firebase",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Firebase upload failed";
    console.warn(`❌ Firebase upload failed: ${errorMessage}`);
    return {
      success: false,
      source: "error",
      error: errorMessage,
    };
  }
}

/**
 * Convert to Base64 as final fallback
 */
async function convertToBase64(file: File): Promise<UploadResult> {
  try {
    const base64 = await fileToBase64(file);
    return {
      success: true,
      url: base64,
      source: "base64",
    };
  } catch (error) {
    return {
      success: false,
      source: "error",
      error:
        error instanceof Error ? error.message : "Base64 conversion failed",
    };
  }
}

/**
 * Helper function to convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

/**
 * Integrated upload function that tries multiple services
 */
export async function uploadImageIntegrated(
  file: File,
  productId: string = `product_${Date.now()}`,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const {
    preferredService = "auto",
    maxRetries = 3,
    fallbackToBase64 = true,
  } = options;

  // Validate file
  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      source: "error",
      error: "File must be an image",
    };
  }

  console.log(
    `🚀 Starting integrated upload for: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
  );

  let uploadServices: Array<() => Promise<UploadResult>> = [];

  // Determine upload strategy based on preference
  if (preferredService === "firebase") {
    uploadServices = [
      () => uploadToFirebase(file, productId),
      () => uploadToCloudinary(file),
      () => uploadToImgBB(file),
      () => uploadToImgur(file),
    ];
  } else if (preferredService === "cloud") {
    uploadServices = [
      () => uploadToCloudinary(file),
      () => uploadToImgBB(file),
      () => uploadToFirebase(file, productId),
      () => uploadToImgur(file), // Imgur last due to CORS issues
    ];
  } else {
    // Auto mode - prioritize most reliable services
    uploadServices = [
      () => uploadToFirebase(file, productId),
      () => uploadToCloudinary(file),
      () => uploadToImgBB(file),
      () => uploadToImgur(file), // Imgur last due to potential CORS/network issues
    ];
  }

  // Try each service with fast fallback
  for (let i = 0; i < uploadServices.length; i++) {
    const uploadService = uploadServices[i];
    const serviceNames = ["Firebase", "Cloudinary", "ImgBB", "Imgur"];
    const serviceName = serviceNames[i] || `Service ${i + 1}`;

    try {
      console.log(
        `📤 Attempting ${serviceName} upload (${i + 1}/${uploadServices.length})...`,
      );

      // Dynamic timeout based on file size and service priority (optimized for speed)
      const baseTimeout = 8000; // 8 seconds base for faster fallbacks
      const sizeBonus = Math.min((file.size / 1024 / 1024) * 3000, 15000); // +3s per MB, max 15s bonus
      const timeout = baseTimeout + sizeBonus;

      console.log(
        `⏱️ ${serviceName} timeout: ${timeout}ms for ${(file.size / 1024 / 1024).toFixed(2)}MB file`,
      );

      const result = await Promise.race([
        uploadService(),
        new Promise<UploadResult>((_, reject) =>
          setTimeout(
            () =>
              reject(new Error(`${serviceName} timeout after ${timeout}ms`)),
            timeout,
          ),
        ),
      ]);

      if (result.success && result.url) {
        console.log(`✅ Upload successful via ${result.source}: ${result.url}`);
        return result;
      } else {
        console.warn(`❌ ${serviceName} upload failed: ${result.error}`);

        // Skip remaining cloud services if this was a network/CORS error
        if (
          result.error?.includes("blocked by network") ||
          result.error?.includes("CORS")
        ) {
          console.warn(
            `🚫 Network restrictions detected, skipping remaining external services`,
          );
          break; // Skip to base64 fallback immediately
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.warn(`⚠️ ${serviceName} upload failed:`, errorMsg);

      // Provide helpful context for common errors
      if (errorMsg.includes("Failed to fetch")) {
        console.warn(
          `🚫 ${serviceName} blocked by network/CORS policy - trying next service`,
        );
      } else if (errorMsg.includes("timeout")) {
        console.warn(
          `⏰ ${serviceName} upload timed out - trying next service`,
        );
      }
    }
  }

  // Final fallback to base64 if enabled
  if (fallbackToBase64) {
    console.log("📝 Falling back to Base64 encoding...");
    const base64Result = await convertToBase64(file);
    if (base64Result.success) {
      console.log("✅ Base64 fallback successful");
      return base64Result;
    }
  }

  return {
    success: false,
    source: "error",
    error: "All upload methods failed",
  };
}

/**
 * Upload multiple files with progress tracking
 */
export async function uploadMultipleImages(
  files: File[],
  productId: string = `product_${Date.now()}`,
  options: UploadOptions = {},
  onProgress?: (completed: number, total: number, currentFile: string) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress?.(i, files.length, file.name);

    const result = await uploadImageIntegrated(
      file,
      `${productId}_${i}`,
      options,
    );
    results.push(result);
  }

  onProgress?.(files.length, files.length, "Complete");
  return results;
}

/**
 * Get upload service status and configuration
 */
export function getUploadServiceStatus() {
  return {
    firebase: {
      available: true,
      name: "Firebase Storage",
      description: "Primary storage service",
    },
    imgbb: {
      available: !!IMGBB_API_KEY,
      name: "ImgBB",
      description: "Free tier: 100 images/month",
      requiresConfig: !IMGBB_API_KEY,
    },
    cloudinary: {
      available: !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
      name: "Cloudinary",
      description: "Free tier: 25GB storage",
      requiresConfig: !(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
    },
    imgur: {
      available: true,
      name: "Imgur",
      description: "Anonymous uploads supported",
      requiresConfig: false,
    },
  };
}

// Popular free image hosting services info
export const FREE_IMAGE_HOSTS = [
  {
    name: "ImgBB",
    url: "https://imgbb.com",
    description: "Free image hosting with API support",
    limits: "32MB per image, no account needed",
  },
  {
    name: "Imgur",
    url: "https://imgur.com",
    description: "Popular image hosting platform",
    limits: "Free with registration",
  },
  {
    name: "Cloudinary",
    url: "https://cloudinary.com",
    description: "Professional image management",
    limits: "25GB free tier",
  },
  {
    name: "Unsplash",
    url: "https://unsplash.com",
    description: "Free stock photos",
    limits: "Free high-quality stock images",
  },
];

// Validate image URL
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const hasValidExtension = validExtensions.some((ext) =>
      urlObj.pathname.toLowerCase().includes(ext),
    );

    return (
      (urlObj.protocol === "http:" || urlObj.protocol === "https:") &&
      (hasValidExtension ||
        urlObj.hostname.includes("imgur") ||
        urlObj.hostname.includes("cloudinary") ||
        urlObj.hostname.includes("pexels") ||
        urlObj.hostname.includes("unsplash") ||
        urlObj.hostname.includes("imgbb"))
    );
  } catch {
    return false;
  }
}

// Export configuration helper
export const UPLOAD_CONFIG_HELP = {
  imgbb: {
    envVar: "VITE_IMGBB_API_KEY",
    instructions: "Get API key from https://api.imgbb.com/",
    example: "VITE_IMGBB_API_KEY=your_api_key_here",
  },
  cloudinary: {
    envVars: ["VITE_CLOUDINARY_CLOUD_NAME", "VITE_CLOUDINARY_UPLOAD_PRESET"],
    instructions:
      "Create account at https://cloudinary.com/ and get cloud name + upload preset",
    examples: [
      "VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name",
      "VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset",
    ],
  },
};
