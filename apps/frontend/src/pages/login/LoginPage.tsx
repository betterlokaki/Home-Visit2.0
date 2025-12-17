import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginHeader } from '../../components/login/LoginHeader';
import { LoginForm } from '../../components/login/LoginForm';

export const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username: string) => {
    await login(username);
    navigate('/sites');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        <LoginHeader />
        <LoginForm onSubmit={handleLogin} loading={loading} />
      </div>
    </div>
  );
};

