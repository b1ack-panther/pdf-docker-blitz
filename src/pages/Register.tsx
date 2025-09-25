import { RegisterForm } from '@/components/auth/RegisterForm';
import { authService } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleRegisterSuccess = () => {
    // Navigation is handled in the RegisterForm component
  };

  return <RegisterForm onRegisterSuccess={handleRegisterSuccess} />;
};

export default Register;