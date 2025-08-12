import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { checkFirebaseConnection, reconnectFirebase } from '@/lib/firebase';
import { getProducts } from '@/services/products';
import { runFirebaseTests, getFirebaseProjectInfo } from '@/utils/firebaseDebug';
import { Wifi, WifiOff, RefreshCw, Database, AlertCircle, TestTube } from 'lucide-react';

export function FirebaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [testResults, setTestResults] = useState<string>('');

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      setLoading(true);
      console.log("🔍 Checking Firebase connection status...");
      
      const isConnected = await checkFirebaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      // Get product count
      const products = await getProducts();
      setProductCount(products.length);
      
      setLastChecked(new Date());
      console.log(`📊 Connection: ${isConnected ? 'Connected' : 'Disconnected'}, Products: ${products.length}`);
    } catch (error) {
      console.error("❌ Connection check failed:", error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleReconnect = async () => {
    try {
      setLoading(true);
      console.log("🔄 Attempting to reconnect to Firebase...");

      const reconnected = await reconnectFirebase();
      if (reconnected) {
        await checkConnection();
        console.log("✅ Reconnection successful");
      } else {
        console.log("❌ Reconnection failed");
      }
    } catch (error) {
      console.error("❌ Reconnection error:", error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    try {
      setTesting(true);
      setTestResults('Running comprehensive Firebase tests...');

      const results = await runFirebaseTests();
      const projectInfo = getFirebaseProjectInfo();

      let resultsText = `Firebase Tests Completed:\n`;
      resultsText += `• Read Test: ${results.read.success ? 'PASS' : 'FAIL'}\n`;
      resultsText += `• Write Test: ${results.write.success ? 'PASS' : 'FAIL'}\n`;
      resultsText += `• Overall: ${results.overall ? 'PASS' : 'FAIL'}\n\n`;
      resultsText += `Project: ${projectInfo.projectId}\n`;
      resultsText += `Console: ${projectInfo.consoleUrl}`;

      if (!results.overall) {
        resultsText += `\n\nErrors:\n`;
        if (!results.read.success) resultsText += `• Read: ${results.read.error}\n`;
        if (!results.write.success) resultsText += `• Write: ${results.write.error}\n`;
      }

      setTestResults(resultsText);
      console.log("🔬 Firebase tests completed:", results);

      // Update connection status based on test results
      setConnectionStatus(results.overall ? 'connected' : 'disconnected');

    } catch (error) {
      setTestResults(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error("❌ Firebase test error:", error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      default: return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <Card className="border-0 bg-card shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="font-medium text-sm">Firebase</span>
              <Badge 
                variant="outline" 
                className={`${getStatusColor()} text-white border-none`}
              >
                {getStatusText()}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              <span>{productCount} products</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              {lastChecked.toLocaleTimeString()}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={connectionStatus === 'disconnected' ? handleReconnect : checkConnection}
              disabled={loading}
              className="h-8"
            >
              {loading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : connectionStatus === 'disconnected' ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Reconnect
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>

        {connectionStatus === 'disconnected' && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-4 w-4" />
              <span>Using offline mode - products saved locally only</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
