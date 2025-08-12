import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  getStorageInfo, 
  removeBase64Images, 
  removeOldestProducts, 
  clearAllProducts,
  autoCleanup,
  getProductsWithSize,
  type CleanupResult 
} from '@/utils/storageManager';
import { 
  HardDrive, 
  Trash2, 
  ImageOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function StorageCleanup() {
  const [storageInfo, setStorageInfo] = useState(getStorageInfo());
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshStorageInfo = () => {
    setStorageInfo(getStorageInfo());
    setCleanupResult(null);
  };

  const handleCleanup = async (cleanupFunction: () => CleanupResult, description: string) => {
    setLoading(true);
    setCleanupResult(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      const result = cleanupFunction();
      setCleanupResult(result);
      refreshStorageInfo();
      
      if (result.success) {
        console.log(`✅ ${description}:`, result.message);
      } else {
        console.error(`❌ ${description} failed:`, result.message);
      }
    } catch (error) {
      setCleanupResult({
        success: false,
        freedKB: 0,
        removedItems: 0,
        message: `Error during ${description}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getStorageColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'text-red-600 dark:text-red-400';
    if (percentUsed >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (percentUsed: number) => {
    if (percentUsed >= 90) return 'bg-red-500';
    if (percentUsed >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const productsWithSize = getProductsWithSize();
  const totalProducts = productsWithSize.length;
  const base64Count = productsWithSize.reduce((count, product) => 
    count + product.images.filter(img => img.startsWith('data:')).length, 0
  );

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>Storage Management</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshStorageInfo}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Usage Display */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className={`text-sm font-medium ${getStorageColor(storageInfo.percentUsed)}`}>
              {storageInfo.usageKB.toFixed(0)}KB / {storageInfo.limitKB}KB 
              ({storageInfo.percentUsed.toFixed(1)}%)
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={storageInfo.percentUsed} 
              className="h-3"
            />
            <div 
              className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(storageInfo.percentUsed)}`}
              style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
            />
          </div>

          {storageInfo.percentUsed >= 90 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Storage is {storageInfo.percentUsed.toFixed(1)}% full. Consider cleaning up to avoid errors.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Storage Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Total Products</div>
            <div className="text-lg font-bold text-primary">{totalProducts}</div>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium">Base64 Images</div>
            <div className="text-lg font-bold text-orange-600">{base64Count}</div>
          </div>
        </div>

        {/* Cleanup Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Cleanup Options</h4>
          
          <div className="grid gap-3">
            {/* Auto Cleanup */}
            <Button
              onClick={() => handleCleanup(autoCleanup, 'Auto cleanup')}
              disabled={loading}
              className="w-full justify-start"
              variant="default"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Auto Cleanup (Recommended)
            </Button>

            {/* Remove Base64 Images */}
            <Button
              onClick={() => handleCleanup(removeBase64Images, 'Remove base64 images')}
              disabled={loading || base64Count === 0}
              className="w-full justify-start"
              variant="outline"
            >
              <ImageOff className="h-4 w-4 mr-2" />
              Remove Base64 Images ({base64Count} images)
            </Button>

            {/* Remove Old Products */}
            <Button
              onClick={() => handleCleanup(() => removeOldestProducts(1000), 'Remove oldest products')}
              disabled={loading || totalProducts === 0}
              className="w-full justify-start"
              variant="outline"
            >
              <Clock className="h-4 w-4 mr-2" />
              Remove Oldest Products
            </Button>

            {/* Clear All (Emergency) */}
            <Button
              onClick={() => {
                if (confirm('Are you sure you want to delete ALL products? This cannot be undone.')) {
                  handleCleanup(clearAllProducts, 'Clear all products');
                }
              }}
              disabled={loading || totalProducts === 0}
              className="w-full justify-start"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Products (Emergency)
            </Button>
          </div>
        </div>

        {/* Cleanup Result */}
        {cleanupResult && (
          <Alert variant={cleanupResult.success ? "default" : "destructive"}>
            {cleanupResult.success ? 
              <CheckCircle className="h-4 w-4" /> : 
              <AlertTriangle className="h-4 w-4" />
            }
            <AlertDescription>
              {cleanupResult.message}
              {cleanupResult.success && cleanupResult.freedKB > 0 && (
                <div className="mt-1 text-xs">
                  Freed {cleanupResult.freedKB.toFixed(1)}KB of storage space
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Auto Cleanup:</strong> Removes base64 images first, then oldest products if needed</p>
          <p><strong>Base64 Images:</strong> Large embedded images stored locally (fallback when cloud upload fails)</p>
          <p><strong>URL Images:</strong> Cloud-hosted images (Firebase, Cloudinary, etc.) - these are preserved</p>
        </div>
      </CardContent>
    </Card>
  );
}
