// src/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@apollo/client/react';  
import { gql } from '@apollo/client';
import { MeResponse, User } from '../types/auth.types';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      is2faEnabled
    }
  }
`;

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data, loading, refetch } = useQuery<MeResponse>(ME_QUERY, {
    fetchPolicy: 'network-only',
  });

  const user = data?.me || null;
  const isAuthenticated = !!user;

  console.log('AuthProvider - user:', user, 'isAuthenticated:', isAuthenticated);

  const login = async () => {
    console.log('login called - refreshing...');
    await refetch();
  };

  const logout = async () => {
    try {
      await fetch('/graphql', {  // 👈 Usar ruta relativa
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          query: 'mutation { logout { success } }' 
        })
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    await refetch();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};