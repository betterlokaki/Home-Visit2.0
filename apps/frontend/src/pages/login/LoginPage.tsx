import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginHeader } from '../../components/login/LoginHeader';
import { LoginForm } from '../../components/login/LoginForm';

export const LoginPage: React.FC = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/sites', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (username: string) => {
    await login(username);
    navigate('/sites');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="text-text">טוען...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        <LoginHeader />
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
};

