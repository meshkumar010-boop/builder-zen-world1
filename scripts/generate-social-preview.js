/**
 * S2 Wears Social Media Preview Image Generator
 * This script creates a beautiful social media preview image
 * using HTML Canvas to be displayed when sharing links
 */

// Create a simple social preview image as a data URL
function generateS2WearsPreview() {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions for social media (1200x630 is optimal)
  canvas.width = 1200;
  canvas.height = 630;
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#ff6b00');
  gradient.addColorStop(0.5, '#ff8533');
  gradient.addColorStop(1, '#ffaa66');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add decorative circles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.arc(1000, 100, 100, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(200, 500, 75, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(300, 150, 40, 0, 2 * Math.PI);
  ctx.fill();
  
  // Add main text - S2 Logo
  ctx.fillStyle = 'white';
  ctx.font = 'bold 120px "Poppins", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.fillText('S2', canvas.width / 2, 280);
  
  // Add tagline
  ctx.font = 'bold 36px "Inter", Arial, sans-serif';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fillText('Fashion That Defines You', canvas.width / 2, 350);
  
  // Add description
  ctx.font = '24px "Inter", Arial, sans-serif';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 1;
  ctx.fillText('Premium Clothing • Modern Style • Quality Guaranteed', canvas.width / 2, 400);
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

// If running in browser, automatically generate and download
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const imageData = generateS2WearsPreview();
    
    // Create download link
    const link = document.createElement('a');
    link.download = 's2wears-social-preview.jpg';
    link.href = imageData;
    
    // Auto download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('S2 Wears social preview image generated and downloaded!');
  });
}

module.exports = { generateS2WearsPreview };
