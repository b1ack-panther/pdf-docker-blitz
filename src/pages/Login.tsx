import { LoginForm } from '@/components/auth/LoginForm';
import { authService } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    // Navigation is handled in the LoginForm component
  };

  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
};

export default Login;