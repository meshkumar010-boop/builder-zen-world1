import { useState, useEffect, createContext, useContext } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, checkFirebaseConnection } from '@/lib/firebase';

// Authorized admin emails - only these emails can access admin panel
const AUTHORIZED_ADMIN_EMAILS = [
  'admin@s2wears.com',
  'additya@s2wears.com',
  // Add more admin emails here
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!checkFirebaseConnection() || !auth) {
      console.log('Firebase auth not available, using demo mode');
      // In offline mode, create a mock admin user for demo purposes
      const mockUser = {
        uid: 'demo-admin',
        email: 'admin@s2wears.com',
        displayName: 'Demo Admin'
      } as User;

      setUser(mockUser);
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // Normal Firebase auth flow
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAdmin(user ? AUTHORIZED_ADMIN_EMAILS.includes(user.email || '') : false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Check if email is authorized for admin access
      if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
        throw new Error('Unauthorized: This email is not authorized for admin access');
      }

      if (!checkFirebaseConnection() || !auth) {
        // Offline mode: simple demo authentication
        if (email === 'admin@s2wears.com' && password === 'admin123') {
          const mockUser = {
            uid: 'demo-admin',
            email: 'admin@s2wears.com',
            displayName: 'Demo Admin'
          } as User;
          setUser(mockUser);
          setIsAdmin(true);
          return;
        } else {
          throw new Error('Invalid credentials. Use admin@s2wears.com / admin123 for demo mode');
        }
      }

      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Check if email is authorized for admin access
      if (!AUTHORIZED_ADMIN_EMAILS.includes(email)) {
        throw new Error('Unauthorized: This email is not authorized for admin access');
      }

      if (!checkFirebaseConnection() || !auth) {
        throw new Error('Firebase is not available. Admin accounts can only be created when online.');
      }

      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!checkFirebaseConnection() || !auth) {
        // Offline mode logout
        setUser(null);
        setIsAdmin(false);
        return;
      }

      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
