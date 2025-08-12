// Simple Cloud Image Upload Service
// Uses Cloudinary as primary service with 10MB+ support

export interface CloudUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Environment configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || null;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || null;

/**
 * Upload single image to Cloudinary (best cloud service with 10MB+ support)
 */
export async function uploadImageToCloud(file: File): Promise<CloudUploadResult> {
  // Validate file
  if (!file.type.startsWith('image/')) {
    return {
      success: false,
      error: 'File must be an image (JPEG, PNG, or WebP)'
    };
  }

  // Check file size (10MB limit)
  const maxSizeMB = 10;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      success: false,
      error: `File size must be ${maxSizeMB}MB or less. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
    };
  }

  console.log(`🚀 Uploading ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB) to Cloudinary...`);

  // Check Cloudinary configuration
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.error('❌ Cloudinary not configured');
    return {
      success: false,
      error: 'Cloudinary not configured. Please restart the dev server after setting environment variables.'
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 's2wears'); // Organize uploads in a folder

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Cloudinary error response:', errorText);
      throw new Error(`Cloudinary server error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.secure_url) {
      console.log(`✅ Upload successful: ${data.secure_url}`);
      return {
        success: true,
        url: data.secure_url
      };
    } else {
      console.error('❌ No secure_url in response:', data);
      throw new Error(data.error?.message || 'No URL returned from Cloudinary');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown upload error';
    console.error('❌ Cloudinary upload error:', errorMsg);

    // Provide more helpful error messages
    let userFriendlyError = errorMsg;
    if (errorMsg.includes('Failed to fetch')) {
      userFriendlyError = 'Network error: Check your internet connection';
    } else if (errorMsg.includes('401') || errorMsg.includes('403')) {
      userFriendlyError = 'Cloudinary authentication error: Check configuration';
    } else if (errorMsg.includes('413')) {
      userFriendlyError = 'File too large for upload';
    }

    return {
      success: false,
      error: userFriendlyError
    };
  }
}

/**
 * Get cloud service configuration status
 */
export function getCloudServiceStatus() {
  return {
    configured: !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET),
    serviceName: 'Cloudinary',
    maxSizeMB: 10,
    features: [
      '10MB file size limit',
      'Professional image optimization',
      'Global CDN delivery',
      'Automatic format conversion'
    ],
    configHelp: {
      steps: [
        '1. Create account at https://cloudinary.com/',
        '2. Get your Cloud Name from dashboard',
        '3. Create an upload preset (unsigned)',
        '4. Add to .env: VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name',
        '5. Add to .env: VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset'
      ]
    }
  };
}
