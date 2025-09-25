import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { authService } from '@/lib/auth';
import Dashboard from './Dashboard';

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status on mount and redirect accordingly
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      if (authenticated) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Redirect based on authentication status
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
