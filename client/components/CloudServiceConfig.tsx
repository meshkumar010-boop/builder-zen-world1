import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { getUploadServiceStatus, UPLOAD_CONFIG_HELP } from '@/services/integratedImageUpload';
import { Info, ExternalLink, Copy, Check } from 'lucide-react';

export default function CloudServiceConfig() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const serviceStatus = getUploadServiceStatus();

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const availableServices = Object.values(serviceStatus).filter(s => s.available).length;
  const totalServices = Object.keys(serviceStatus).length;

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-blue-600" />
          <span>Cloud Upload Configuration</span>
          <Badge variant={availableServices === totalServices ? "default" : "secondary"}>
            {availableServices}/{totalServices} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Service Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Service Status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(serviceStatus).map(([key, service]) => (
              <div 
                key={key}
                className={`p-3 rounded-lg border ${
                  service.available 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    {service.available ? '✅' : '⚠️'} {service.name}
                  </span>
                  {service.requiresConfig && (
                    <Badge variant="outline" className="text-xs">
                      Config Needed
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Instructions */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Optional Configuration (for enhanced performance)</h4>
          
          {/* ImgBB Config */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ImgBB API Key</span>
              <a 
                href="https://api.imgbb.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center space-x-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm">VITE_IMGBB_API_KEY=your_api_key_here</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('VITE_IMGBB_API_KEY=your_api_key_here', 'imgbb')}
                  className="h-6 w-6 p-0"
                >
                  {copiedItem === 'imgbb' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Free tier: 100 images/month, 32MB per image
              </p>
            </div>
          </div>

          {/* Cloudinary Config */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cloudinary Configuration</span>
              <a 
                href="https://cloudinary.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs flex items-center space-x-1"
              >
                <span>Sign Up</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="bg-muted p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <code className="text-sm">VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name', 'cloudinary1')}
                  className="h-6 w-6 p-0"
                >
                  {copiedItem === 'cloudinary1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-sm">VITE_CLOUDINARY_UPLOAD_PRESET=your_preset</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard('VITE_CLOUDINARY_UPLOAD_PRESET=your_preset', 'cloudinary2')}
                  className="h-6 w-6 p-0"
                >
                  {copiedItem === 'cloudinary2' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Free tier: 25GB storage, 25,000 transformations/month
              </p>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>How it works:</strong> The system automatically tries Firebase first, then falls back to Cloudinary, Imgur, and ImgBB. 
            If all cloud services fail, it saves images as Base64. No configuration required - it works out of the box!
          </AlertDescription>
        </Alert>

        {/* Add to .env file instruction */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
            📝 Add to your .env file:
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Copy the environment variables above and add them to your .env file in the project root to enable additional cloud services.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
