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
      error: 'File must be an image'
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
    return {
      success: false,
      error: 'Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your environment variables.'
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.secure_url) {
      console.log(`✅ Upload successful: ${data.secure_url}`);
      return {
        success: true,
        url: data.secure_url
      };
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Upload failed';
    console.error('❌ Cloudinary upload error:', errorMsg);
    
    return {
      success: false,
      error: `Upload failed: ${errorMsg}`
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
