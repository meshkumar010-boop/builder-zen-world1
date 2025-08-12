import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { S2LoaderFullscreen } from '@/components/S2Loader';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen relative">
        <S2LoaderFullscreen text="Verifying admin access..." />
      </div>
    );
  }

  // Redirect to admin login if not authenticated or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render protected admin content
  return <>{children}</>;
}
