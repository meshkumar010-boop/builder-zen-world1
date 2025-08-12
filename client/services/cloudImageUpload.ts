// Simple Cloud Image Upload Service
// Uses Cloudinary as primary service with 10MB+ support

export interface CloudUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export interface MultipleUploadProgress {
  current: number;
  total: number;
  fileName: string;
  percentage: number;
}

// Environment configuration
const CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null;
const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || null;

/**
 * Upload single image to Cloudinary (best cloud service with 10MB+ support)
 */
export async function uploadImageToCloud(
  file: File,
): Promise<CloudUploadResult> {
  // Validate file
  if (!file.type.startsWith("image/")) {
    return {
      success: false,
      error: "File must be an image (JPEG, PNG, or WebP)",
    };
  }

  // Check file size (10MB limit)
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      success: false,
      error: `File size must be ${maxSizeMB}MB or less. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  console.log(
    `🚀 Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Cloudinary...`,
  );

  // Check Cloudinary configuration
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET ||
      CLOUDINARY_CLOUD_NAME === 'demo' || CLOUDINARY_UPLOAD_PRESET === 'demo') {
    console.warn("⚠️ Cloudinary not properly configured - using demo mode");

    // Return a demo/mock success for development
    console.log(`🎭 Demo mode: Simulating upload for ${file.name}`);

    // Create a mock URL that looks like Cloudinary but is actually a data URL
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      return new Promise((resolve) => {
        img.onload = () => {
          // Resize for demo
          const maxSize = 400;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

          resolve({
            success: true,
            url: dataUrl, // Use data URL as fallback
          });
        };

        img.onerror = () => {
          resolve({
            success: false,
            error: "Demo mode: Could not process image. Please configure Cloudinary for production use.",
          });
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      return {
        success: false,
        error: "Cloudinary not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET environment variables.",
      };
    }
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "s2wears"); // Organize uploads in a folder

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    // Read response body once and handle both success and error cases
    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ Cloudinary error response:", responseText);
      throw new Error(
        `Cloudinary server error (${response.status}): ${responseText}`,
      );
    }

    // Parse the successful response
    const data = JSON.parse(responseText);

    if (data.secure_url) {
      console.log(`✅ Upload successful: ${data.secure_url}`);
      return {
        success: true,
        url: data.secure_url,
      };
    } else {
      console.error("❌ No secure_url in response:", data);
      throw new Error(data.error?.message || "No URL returned from Cloudinary");
    }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown upload error";
    console.error("❌ Cloudinary upload error:", errorMsg);

    // Provide more helpful error messages
    let userFriendlyError = errorMsg;
    if (errorMsg.includes("Failed to fetch")) {
      userFriendlyError = "Network error: Check your internet connection";
    } else if (errorMsg.includes("401") || errorMsg.includes("403")) {
      userFriendlyError =
        "Cloudinary authentication error: Check configuration";
    } else if (errorMsg.includes("413")) {
      userFriendlyError = "File too large for upload";
    }

    return {
      success: false,
      error: userFriendlyError,
    };
  }
}

/**
 * Upload multiple images to Cloudinary with progress tracking
 */
export async function uploadMultipleImagesToCloud(
  files: File[],
  onProgress?: (progress: MultipleUploadProgress) => void,
): Promise<CloudUploadResult[]> {
  const results: CloudUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const current = i + 1;
    const percentage = (current / files.length) * 100;

    // Report progress
    onProgress?.({
      current,
      total: files.length,
      fileName: file.name,
      percentage,
    });

    try {
      const result = await uploadImageToCloud(file);
      results.push({
        ...result,
        fileName: file.name,
      });
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
        fileName: file.name,
      });
    }
  }

  // Report completion
  onProgress?.({
    current: files.length,
    total: files.length,
    fileName: "Complete",
    percentage: 100,
  });

  return results;
}

/**
 * Get cloud service configuration status
 */
export function getCloudServiceStatus() {
  return {
    configured: !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
    serviceName: "Cloudinary",
    maxSizeMB: 10,
    features: [
      "10MB per file size limit",
      "Multiple image upload support",
      "Professional image optimization",
      "Global CDN delivery",
      "Automatic format conversion",
    ],
    configHelp: {
      steps: [
        "1. Create account at https://cloudinary.com/",
        "2. Get your Cloud Name from dashboard",
        "3. Create an upload preset (unsigned)",
        "4. Add to .env: VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name",
        "5. Add to .env: VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset",
      ],
    },
  };
}
