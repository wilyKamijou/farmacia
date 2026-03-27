import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is2faEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay token guardado al cargar la app
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Aquí podrías cargar los datos del usuario desde el backend
      setIsAuthenticated(true);
      // Simular datos de usuario (reemplazar con datos reales del backend)
      setUser({
        id: '1',
        email: 'usuario@ejemplo.com',
        first_name: 'Usuario',
        last_name: 'Demo',
        is2faEnabled: false
      });
    }
    setLoading(false);
  }, []);

  const login = async () => {
    // Esta función se llama después de login exitoso
    setIsAuthenticated(true);
    localStorage.setItem('auth_token', 'authenticated');
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};