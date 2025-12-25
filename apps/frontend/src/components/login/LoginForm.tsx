import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import Cookies from 'js-cookie';
import { ErrorMessage } from './ErrorMessage';

const USERNAME_COOKIE_NAME = 'home-visit-username';
const USERNAME_COOKIE_EXPIRATION_DAYS = 365;

interface LoginFormProps {
  onSubmit: (username: string) => Promise<void>;
  loading: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUsername = Cookies.get(USERNAME_COOKIE_NAME);
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      await onSubmit(username);
      Cookies.set(USERNAME_COOKIE_NAME, username, { expires: USERNAME_COOKIE_EXPIRATION_DAYS });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text mb-2">
          שם משתמש
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 bg-container border border-border rounded-lg text-text-solid focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          placeholder="הכנס שם משתמש"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'מתחבר...' : 'התחבר'}
      </button>
    </form>
  );
};

