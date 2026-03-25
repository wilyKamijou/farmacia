import { Link, useLocation } from 'react-router-dom';
import { Users, UserCheck, Tag, Package, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Enable2FAResponse, Enable2FAVariables } from '../../types/auth.types';

const ENABLE_2FA = gql`
  mutation Enable2FA($password: String!) {
    enable2fa(password: $password) {
      success
      message
      qrCodeUrl
      secret
    }
  }
`;

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const [enable2FA] = useMutation<Enable2FAResponse, Enable2FAVariables>(ENABLE_2FA);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const handleEnable2FA = async () => {
    try {
      const password = prompt('Ingresa tu contraseña para activar 2FA:');
      if (!password) return;
      
      const { data } = await enable2FA({
        variables: { password }
      });
      
      if (data?.enable2fa?.success) {
        setQrCode(data.enable2fa.qrCodeUrl || '');
        setShow2FAModal(true);
      } else {
        alert(data?.enable2fa?.message || 'Error al activar 2FA');
      }
    } catch (err) {
      console.error('Error al activar 2FA:', err);
      alert('Error al activar 2FA');
    }
  };

  return (
    <>
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed left-0 top-0 shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-blue-700">
          <h1 className="text-2xl font-bold">Farmacia</h1>
          <p className="text-blue-200 text-sm mt-1">Panel de Control</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          <h2 className="px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
            Gestión
          </h2>

          {/* Empleados */}
          <Link
            to="/dashboard/empleados"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/personas') || isActive('/dashboard/empleados')
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <Users size={20} />
            <span>Empleados</span>
          </Link>

          {/* Clientes */}
          <Link
            to="/dashboard/clientes"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/clientes')
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <UserCheck size={20} />
            <span>Clientes</span>
          </Link>

          <h2 className="px-4 py-2 text-xs font-semibold text-blue-300 uppercase tracking-wider mt-4">
            Inventario
          </h2>

          {/* Categorías */}
          <Link
            to="/dashboard/categorias"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/categorias')
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <Tag size={20} />
            <span>Categorías</span>
          </Link>

          {/* Productos */}
          <Link
            to="/dashboard/productos"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/dashboard/productos')
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <Package size={20} />
            <span>Productos</span>
          </Link>
        </nav>

        {/* Security & Logout Section */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <button
            onClick={handleEnable2FA}
            className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-white font-medium"
          >
            <Shield size={20} />
            <span>Activar 2FA</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Modal para mostrar QR de 2FA */}
      {show2FAModal && qrCode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-8 border rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Activar Google Authenticator
            </h3>
            <div className="text-center">
              <p className="mb-4 text-gray-600">
                1. Instala Google Authenticator en tu teléfono
              </p>
              <p className="mb-4 text-gray-600">
                2. Escanea este código QR:
              </p>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={qrCode} size={200} />
              </div>
              <p className="mb-4 text-gray-600 text-sm">
                O ingresa manualmente este código:
              </p>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <code className="text-sm break-all font-mono">
                  {qrCode.split('secret=')[1]?.split('&')[0]}
                </code>
              </div>
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
