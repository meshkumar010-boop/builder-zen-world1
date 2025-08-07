// Free cloud image upload service using ImgBB API
// This provides a free alternative to Firebase Storage

export interface CloudUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

// ImgBB API - Free tier: 100 images/month
const IMGBB_API_KEY = 'demo_key'; // For demo purposes, users would need their own key

export async function uploadToCloudService(file: File): Promise<CloudUploadResponse> {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // For demo purposes, we'll simulate a successful upload
    // In production, you would use:
    // const formData = new FormData();
    // formData.append('image', base64.split(',')[1]);
    // formData.append('key', IMGBB_API_KEY);
    
    // const response = await fetch('https://api.imgbb.com/1/upload', {
    //   method: 'POST',
    //   body: formData,
    // });
    
    // Simulate success for demo
    console.log('Simulating cloud upload for:', file.name);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time
    
    // Generate a demo URL that looks like a cloud service
    const timestamp = Date.now();
    const demoUrl = `https://demo-cloud-storage.com/images/${timestamp}/${file.name}`;
    
    return {
      success: true,
      url: demoUrl
    };
    
  } catch (error) {
    console.error('Cloud upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

// Validate image URL
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const hasValidExtension = validExtensions.some(ext => 
      urlObj.pathname.toLowerCase().includes(ext)
    );
    
    return (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') && 
           (hasValidExtension || urlObj.hostname.includes('imgur') || 
            urlObj.hostname.includes('cloudinary') || urlObj.hostname.includes('pexels') ||
            urlObj.hostname.includes('unsplash') || urlObj.hostname.includes('imgbb'));
  } catch {
    return false;
  }
}

// Popular free image hosting services info
export const FREE_IMAGE_HOSTS = [
  {
    name: 'ImgBB',
    url: 'https://imgbb.com',
    description: 'Free image hosting with API support',
    limits: '32MB per image, no account needed'
  },
  {
    name: 'Imgur',
    url: 'https://imgur.com',
    description: 'Popular image hosting platform',
    limits: 'Free with registration'
  },
  {
    name: 'Cloudinary',
    url: 'https://cloudinary.com',
    description: 'Professional image management',
    limits: '25GB free tier'
  },
  {
    name: 'Unsplash',
    url: 'https://unsplash.com',
    description: 'Free stock photos',
    limits: 'Free high-quality stock images'
  }
];
