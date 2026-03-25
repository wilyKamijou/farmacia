// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { client } from './graphql/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterPage } from './pages/RegisterPage';
import { OTPPage } from './pages/OTPPage';
import { DashboardPage } from './pages/DashboardPage';
import { PersonasPage } from './pages/PersonasPage';
import { ClientesPage } from './pages/ClientesPage';
import { CategoriaPage } from './pages/CategoriaPage';
import { ProductoPage } from './pages/ProductoPage';
import { AlmacenPage } from './pages/AlmacenPage';
import { VentaPage } from './pages/VentaPage';
import { ProductoAlmacenPage } from './pages/ProductoAlmacenPage';
import { DetalleVentaPage } from './pages/DetalleVentaPage';
import { Layout } from './components/layout/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="text-center p-8">Verificando sesión...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OTPPage />} />
      
      {/* Dashboard Routes - With Sidebar */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/empleados"
        element={
          <PrivateRoute>
            <Layout>
              <PersonasPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/clientes"
        element={
          <PrivateRoute>
            <Layout>
              <ClientesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/categorias"
        element={
          <PrivateRoute>
            <Layout>
              <CategoriaPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/productos"
        element={
          <PrivateRoute>
            <Layout>
              <ProductoPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/almacenes"
        element={
          <PrivateRoute>
            <Layout>
              <AlmacenPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/ventas"
        element={
          <PrivateRoute>
            <Layout>
              <VentaPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/producto-almacen"
        element={
          <PrivateRoute>
            <Layout>
              <ProductoAlmacenPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard/detalle-venta"
        element={
          <PrivateRoute>
            <Layout>
              <DetalleVentaPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;