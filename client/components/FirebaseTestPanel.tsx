import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { runFirebaseTests, getFirebaseProjectInfo } from '@/utils/firebaseDebug';
import { addProduct, getProducts, deleteProduct } from '@/services/products';
import { checkExpectedErrors, generateSetupInstructions } from '@/utils/firestoreRules';
import { testFirebaseConnectivity, getNetworkEnvironmentInfo } from '@/utils/networkTest';
import { TestTube, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function FirebaseTestPanel() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState(false);

  const runComprehensiveTest = async () => {
    setTesting(true);
    setError('');
    setResults(null);

    try {
      console.log('🔬 Starting comprehensive Firebase test...');

      // Step 0: Network connectivity test
      const networkResults = await testFirebaseConnectivity();
      const networkEnv = getNetworkEnvironmentInfo();

      // Step 1: Basic connectivity tests
      const debugResults = await runFirebaseTests();
      
      // Step 2: Real product operations test
      let productTestResults = {
        add: false,
        read: false,
        delete: false,
        productId: ''
      };

      try {
        // Test adding a product
        console.log('➕ Testing product creation...');
        const testProduct = {
          name: `Firebase Test Product ${Date.now()}`,
          price: 99.99,
          originalPrice: 149.99,
          description: 'This is a test product to verify Firebase connectivity',
          category: 'Test',
          sizes: ['M', 'L'],
          colors: [{ name: 'Test Color', value: '#ff0000' }],
          images: ['/placeholder.svg'],
          features: ['Firebase Test', 'Connectivity Check']
        };

        const productId = await addProduct(testProduct);
        productTestResults.productId = productId;
        productTestResults.add = true;
        console.log('✅ Product creation successful:', productId);

        // Test reading products
        console.log('📖 Testing product retrieval...');
        const products = await getProducts();
        const testProductFound = products.find(p => p.id === productId);
        productTestResults.read = !!testProductFound;
        console.log('✅ Product retrieval successful:', products.length, 'products found');

        // Test deleting the test product
        console.log('🗑️ Testing product deletion...');
        await deleteProduct(productId);
        productTestResults.delete = true;
        console.log('✅ Product deletion successful');

      } catch (error) {
        console.error('❌ Product operations test failed:', error);
      }

      // Compile results
      const overallSuccess = debugResults.overall && 
                           productTestResults.add && 
                           productTestResults.read && 
                           productTestResults.delete;

      setResults({
        debug: debugResults,
        products: productTestResults,
        network: networkResults,
        environment: networkEnv,
        overall: overallSuccess,
        timestamp: new Date(),
        projectInfo: getFirebaseProjectInfo()
      });

      console.log('🏁 Comprehensive Firebase test completed:', overallSuccess ? 'PASS' : 'FAIL');

    } catch (error: any) {
      console.error('❌ Comprehensive test failed:', error);
      const errorMessage = error.message || 'Test failed with unknown error';
      const troubleshooting = checkExpectedErrors(errorMessage);
      setError(`${errorMessage}\n\n${troubleshooting}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusBadge = (success: boolean, label: string) => (
    <Badge variant={success ? "default" : "destructive"} className="mr-2 mb-2">
      {success ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
      {label}: {success ? 'PASS' : 'FAIL'}
    </Badge>
  );

  return (
    <Card className="border-0 bg-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-5 w-5" />
          <span>Firebase Database Test</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runComprehensiveTest}
              disabled={testing}
              className="flex-1"
            >
              {testing ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-pulse" />
                  Testing Firebase Connection...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Run Complete Firebase Test
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowInstructions(!showInstructions)}
              disabled={testing}
            >
              Setup Guide
            </Button>
          </div>

          {showInstructions && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Firebase Setup Instructions</h4>
              <pre className="text-xs text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                {generateSetupInstructions()}
              </pre>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2 text-sm text-red-800 dark:text-red-200">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
                <h4 className="font-medium mb-3 flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Test Results - {results.overall ? '✅ PASS' : '❌ FAIL'}
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Basic Connectivity:</h5>
                    <div className="flex flex-wrap">
                      {getStatusBadge(results.debug.read.success, 'Firestore Read')}
                      {getStatusBadge(results.debug.write.success, 'Firestore Write')}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Product Operations:</h5>
                    <div className="flex flex-wrap">
                      {getStatusBadge(results.products.add, 'Add Product')}
                      {getStatusBadge(results.products.read, 'Read Products')}
                      {getStatusBadge(results.products.delete, 'Delete Product')}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Network Connectivity:</h5>
                    <div className="flex flex-wrap">
                      {getStatusBadge(results.network.firestore, 'Firestore Access')}
                      {getStatusBadge(results.network.auth, 'Auth Access')}
                      {getStatusBadge(results.network.storage, 'Storage Access')}
                    </div>
                    {results.network.issues.length > 0 && (
                      <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                        Network Issues: {results.network.issues.join(', ')}
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="text-sm font-medium mb-2">Project Info:</h5>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Project ID: <code>{results.projectInfo.projectId}</code></div>
                      <div>Auth Domain: <code>{results.projectInfo.authDomain}</code></div>
                      <div>Test Time: {results.timestamp.toLocaleString()}</div>
                    </div>
                  </div>

                  {!results.overall && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <div className="text-xs text-yellow-800 dark:text-yellow-200">
                        <strong>Troubleshooting:</strong> If tests are failing, check:
                        <ul className="mt-1 ml-4 list-disc">
                          <li>Firebase project permissions and Firestore rules</li>
                          <li>Network connectivity and browser extensions</li>
                          <li>Browser console for detailed error messages</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
