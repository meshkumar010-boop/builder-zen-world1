// Firestore Security Rules Helper
// This file provides information about Firebase security rules needed for S2 Wears

export const RECOMMENDED_FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - allow read for everyone, write for authenticated admin users
    match /products/{productId} {
      allow read: if true; // Public read access for store front
      allow write: if request.auth != null 
                   && request.auth.token.email == 's2wearsofficial@gmail.com';
    }
    
    // Users collection - allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders collection - allow users to read/write their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == resource.data.userId;
    }
    
    // Analytics collection - admin only
    match /analytics/{document} {
      allow read, write: if request.auth != null 
                         && request.auth.token.email == 's2wearsofficial@gmail.com';
    }
    
    // Allow read access to all collections for authenticated admin
    match /{document=**} {
      allow read: if request.auth != null 
                  && request.auth.token.email == 's2wearsofficial@gmail.com';
    }
  }
}
`;

export const DEVELOPMENT_FIRESTORE_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development mode - allow all operations
    // ⚠️ WARNING: Only use this during development!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

export function getFirestoreRulesInfo() {
  return {
    projectId: 's2-wear-3f5fe',
    consoleUrl: 'https://console.firebase.google.com/project/s2-wear-3f5fe/firestore/rules',
    adminEmail: 's2wearsofficial@gmail.com',
    rulesDocUrl: 'https://firebase.google.com/docs/firestore/security/get-started'
  };
}

export function checkExpectedErrors(error: string): string {
  if (error.includes('permission-denied')) {
    return `
❌ Permission Denied Error
This usually means:
1. Firestore security rules are blocking the operation
2. User is not authenticated as the admin (s2wearsofficial@gmail.com)
3. Rules need to be updated in Firebase Console

🔧 Fix: Update Firestore rules in Firebase Console:
${getFirestoreRulesInfo().consoleUrl}

For development, you can temporarily use:
${DEVELOPMENT_FIRESTORE_RULES}

For production, use:
${RECOMMENDED_FIRESTORE_RULES}
`;
  }
  
  if (error.includes('unavailable') || error.includes('network')) {
    return `
❌ Network/Connection Error
This usually means:
1. Firebase services are temporarily unavailable
2. Network connectivity issues
3. Browser extensions blocking Firebase
4. CORS issues in development

🔧 Try:
1. Check internet connection
2. Disable browser extensions temporarily
3. Try incognito/private browsing mode
4. Check Firebase status: https://status.firebase.google.com/
`;
  }
  
  if (error.includes('not-found')) {
    return `
❌ Resource Not Found
This usually means:
1. Firebase project doesn't exist
2. Collection/document doesn't exist
3. Incorrect project configuration

🔧 Verify:
1. Project ID: ${getFirestoreRulesInfo().projectId}
2. Check Firebase Console: ${getFirestoreRulesInfo().consoleUrl}
`;
  }
  
  return `
❌ Unknown Firebase Error: ${error}

🔧 General troubleshooting:
1. Check Firebase Console for service status
2. Verify project configuration
3. Check browser console for detailed errors
4. Try refreshing the page
`;
}

export function generateSetupInstructions(): string {
  const info = getFirestoreRulesInfo();
  
  return `
🔥 Firebase Setup Instructions for S2 Wears

1. 📧 Admin Authentication:
   - Sign in with: ${info.adminEmail}
   - Ensure this email is added as admin in Firebase Auth

2. 🔐 Firestore Security Rules:
   - Go to: ${info.consoleUrl}
   - Copy and paste the recommended rules (see firestoreRules.ts)
   - For development, use permissive rules temporarily

3. 🌐 Authorized Domains:
   - Add your deployment domain to Firebase Auth
   - Include localhost for development

4. 📊 Test Connection:
   - Use the Firebase Test Panel in admin dashboard
   - Check browser console for detailed logs

5. 🔍 Debugging:
   - Enable Firebase debug logs: localStorage.debug = 'firebase*'
   - Check network tab for failed requests
   - Verify project ID in firebase.ts matches console

For detailed setup guide: ${info.rulesDocUrl}
`;
}
`;