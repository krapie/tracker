import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gh-canvas-default dark:bg-gh-canvas-default-dark flex items-center justify-center font-gh">
        <div className="text-center">
          <div className="text-gh-3xl mb-gh-4">🚦</div>
          <p className="text-gh-fg-muted dark:text-gh-fg-muted-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
