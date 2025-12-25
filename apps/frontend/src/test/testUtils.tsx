import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import type { ReactElement } from 'react';
import type { User, Group } from '@home-visit/common';

interface RenderOptions {
  initialUser?: User | null;
  initialGroup?: Group | null;
}

export function render(ui: ReactElement, options?: RenderOptions) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const mockLogin = React.useCallback(async (_username: string) => {
      // Mock implementation
    }, []);

    const mockLogout = React.useCallback(() => {
      // Mock implementation
    }, []);

    const authValue = {
      user: options?.initialUser ?? null,
      group: options?.initialGroup ?? null,
      loading: false,
      error: null,
      login: mockLogin,
      logout: mockLogout,
    };

    return (
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  return rtlRender(ui, { wrapper: Wrapper });
}

export * from '@testing-library/react';

