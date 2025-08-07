import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class FirebaseErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if it's a Firebase-related error
    const isFirebaseError = error.message?.includes('Firebase') || 
                           error.message?.includes('Failed to fetch') ||
                           error.stack?.includes('firebase');
    
    if (isFirebaseError) {
      // Mark Firebase as blocked in session storage
      sessionStorage.setItem('firebase-blocked', 'true');
      console.warn('Firebase error caught by boundary, marking as blocked:', error.message);
    }

    return { hasError: isFirebaseError, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Firebase Error Boundary caught an error:', error, errorInfo);
    
    // If it's a Firebase error, we'll handle it gracefully
    if (this.state.hasError) {
      // Reset the error state after a short delay to allow the app to continue
      setTimeout(() => {
        this.setState({ hasError: false, error: undefined });
      }, 1000);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Don't render anything for Firebase errors - let the app continue with localStorage
      return null;
    }

    return this.props.children;
  }
}

export default FirebaseErrorBoundary;
