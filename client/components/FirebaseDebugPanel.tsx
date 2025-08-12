import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  checkFirebaseConnection,
  reconnectFirebase,
  getConnectionState,
} from "@/lib/firebase";
import { addProduct, getProducts } from "@/services/products";
import {
  Bug,
  Wifi,
  WifiOff,
  Database,
  TestTube,
  RefreshCw,
} from "lucide-react";

export default function FirebaseDebugPanel() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
    console.log("🐛 Debug:", message);
  };

  const testFirebaseConnection = async () => {
    setTesting(true);
    setResults([]);
    addResult("Starting Firebase connection test...");

    try {
      // Test basic connection
      const isConnected = await checkFirebaseConnection();
      addResult(
        `Firebase connection test: ${isConnected ? "✅ SUCCESS" : "❌ FAILED"}`,
      );

      // Get connection state
      const state = getConnectionState();
      setConnectionStatus(state);
      addResult(
        `Connection state: initialized=${state.initialized}, connected=${state.connected}`,
      );

      if (state.lastError) {
        addResult(`Last error: ${state.lastError.message}`);
      }

      // Test Firestore operations
      try {
        addResult("Testing Firestore read operation...");
        const products = await getProducts();
        addResult(
          `✅ Firestore read successful: ${products.length} products found`,
        );
      } catch (error: any) {
        addResult(`❌ Firestore read failed: ${error.message}`);
      }

      // Test a simple product add
      try {
        addResult("Testing Firestore write operation...");
        const testProduct = {
          name: `Debug Test Product ${Date.now()}`,
          price: 1999,
          originalPrice: 2999,
          description: "This is a test product created by the debug panel",
          category: "T-Shirts",
          sizes: ["M", "L"],
          colors: [{ name: "Blue", value: "#0000FF" }],
          images: ["https://via.placeholder.com/400x400?text=Debug+Test"],
          features: ["Debug Test", "Auto-generated"],
        };

        const productId = await addProduct(testProduct);
        addResult(
          `✅ Firestore write successful: Product created with ID ${productId}`,
        );
      } catch (error: any) {
        addResult(`❌ Firestore write failed: ${error.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const attemptReconnection = async () => {
    setTesting(true);
    addResult("Attempting Firebase reconnection...");

    try {
      const success = await reconnectFirebase();
      addResult(`Reconnection ${success ? "✅ SUCCESS" : "❌ FAILED"}`);

      if (success) {
        const state = getConnectionState();
        setConnectionStatus(state);
      }
    } catch (error: any) {
      addResult(`❌ Reconnection failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setConnectionStatus(null);
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          <Bug className="h-5 w-5" />
          Firebase Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        {connectionStatus && (
          <Alert>
            <AlertDescription>
              <div className="flex items-center gap-2 mb-2">
                {connectionStatus.connected ? (
                  <Badge variant="default" className="bg-green-500">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
                <Badge variant="outline">
                  <Database className="h-3 w-3 mr-1" />
                  {connectionStatus.initialized
                    ? "Initialized"
                    : "Not Initialized"}
                </Badge>
              </div>
              {connectionStatus.lastError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Error: {connectionStatus.lastError.message}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={testFirebaseConnection}
            disabled={testing}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? "Testing..." : "Run Full Test"}
          </Button>

          <Button
            onClick={attemptReconnection}
            disabled={testing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconnect
          </Button>

          <Button onClick={clearResults} size="sm" variant="ghost">
            Clear Log
          </Button>
        </div>

        {/* Environment Info */}
        <div className="text-xs space-y-1 p-3 bg-gray-50 dark:bg-gray-800 rounded">
          <p>
            <strong>Environment:</strong>{" "}
            {import.meta.env.DEV ? "Development" : "Production"}
          </p>
          <p>
            <strong>Host:</strong> {window.location.hostname}
          </p>
          <p>
            <strong>Online:</strong> {navigator.onLine ? "Yes" : "No"}
          </p>
          <p>
            <strong>User Agent:</strong>{" "}
            {navigator.userAgent.includes("Chrome") ? "Chrome" : "Other"}
          </p>
        </div>

        {/* Results Log */}
        {results.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Debug Log:</h4>
            <div className="max-h-40 overflow-y-auto bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
              {results.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            💡 <strong>Tip:</strong> If the test fails, it might be due to:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Browser extensions blocking Firebase</li>
              <li>Network connectivity issues</li>
              <li>Firestore security rules</li>
              <li>Firebase service temporarily down</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
