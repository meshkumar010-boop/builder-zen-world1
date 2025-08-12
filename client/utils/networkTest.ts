// Network connectivity test utilities for Firebase debugging

export interface NetworkTestResult {
  service: string;
  url: string;
  success: boolean;
  responseTime: number;
  error?: string;
  status?: number;
}

// Test basic network connectivity
export async function testNetworkConnectivity(): Promise<NetworkTestResult[]> {
  const tests = [
    {
      service: 'Google DNS',
      url: 'https://8.8.8.8/',
      timeout: 5000
    },
    {
      service: 'Firebase Firestore',
      url: 'https://firestore.googleapis.com/v1/projects/s2-wear-3f5fe/databases/(default)/documents',
      timeout: 10000
    },
    {
      service: 'Firebase Auth',
      url: 'https://identitytoolkit.googleapis.com/v1/projects/s2-wear-3f5fe',
      timeout: 10000
    },
    {
      service: 'Firebase Storage',
      url: 'https://storage.googleapis.com/storage/v1/b/s2-wear-3f5fe.firebasestorage.app',
      timeout: 10000
    }
  ];

  const results: NetworkTestResult[] = [];
  
  for (const test of tests) {
    const startTime = Date.now();
    
    try {
      console.log(`🌐 Testing connectivity to ${test.service}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), test.timeout);
      
      const response = await fetch(test.url, {
        method: 'HEAD',
        mode: 'no-cors', // Avoid CORS issues for basic connectivity test
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      results.push({
        service: test.service,
        url: test.url,
        success: true,
        responseTime,
        status: response.status
      });
      
      console.log(`✅ ${test.service} connectivity OK (${responseTime}ms)`);
      
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      results.push({
        service: test.service,
        url: test.url,
        success: false,
        responseTime,
        error: error.message
      });
      
      console.warn(`❌ ${test.service} connectivity failed:`, error.message);
    }
  }
  
  return results;
}

// Check for common network issues
export function diagnoseNetworkIssues(results: NetworkTestResult[]): string[] {
  const issues: string[] = [];
  
  // Check if all Firebase services are failing
  const firebaseServices = results.filter(r => r.service.includes('Firebase'));
  const allFirebaseFailed = firebaseServices.every(r => !r.success);
  
  if (allFirebaseFailed) {
    issues.push('🚫 All Firebase services are unreachable - likely network/firewall issue');
  }
  
  // Check for timeout issues
  const timeouts = results.filter(r => r.error?.includes('timeout') || r.responseTime > 10000);
  if (timeouts.length > 0) {
    issues.push('⏰ Slow network detected - consider checking connection speed');
  }
  
  // Check for CORS issues
  const corsErrors = results.filter(r => r.error?.includes('CORS') || r.error?.includes('blocked'));
  if (corsErrors.length > 0) {
    issues.push('🔒 CORS/security policy blocking requests - check browser extensions');
  }
  
  // Check for DNS issues
  const dnsTest = results.find(r => r.service === 'Google DNS');
  if (dnsTest && !dnsTest.success) {
    issues.push('🌐 DNS resolution issues detected - check internet connection');
  }
  
  return issues;
}

// Get network environment info
export function getNetworkEnvironmentInfo() {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    connectionType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 'unknown',
    rtt: connection?.rtt || 'unknown',
    chrome: !!(window as any).chrome,
    extensions: !!(window as any).chrome?.runtime,
    timestamp: new Date().toISOString()
  };
}

// Test Firebase specifically
export async function testFirebaseConnectivity(): Promise<{
  firestore: boolean;
  auth: boolean;
  storage: boolean;
  issues: string[];
}> {
  console.log('🔥 Testing Firebase service connectivity...');
  
  const results = await testNetworkConnectivity();
  const firebaseResults = results.filter(r => r.service.includes('Firebase'));
  
  return {
    firestore: firebaseResults.find(r => r.service.includes('Firestore'))?.success || false,
    auth: firebaseResults.find(r => r.service.includes('Auth'))?.success || false,
    storage: firebaseResults.find(r => r.service.includes('Storage'))?.success || false,
    issues: diagnoseNetworkIssues(results)
  };
}
