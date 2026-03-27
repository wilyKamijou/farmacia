import { Link, useLocation } from 'react-router-dom';
import { Users, UserCheck, Tag, Package, LogOut, Shield, Warehouse, ShoppingCart, Boxes, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Enable2FAResponse, Enable2FAVariables } from '../../types/auth.types';
import '../../styles/dashboard.css';

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

const menuItems = [
  { label: 'Empleados', path: '/dashboard/empleados', icon: Users },
  { label: 'Clientes', path: '/dashboard/clientes', icon: UserCheck },
  { label: 'Gestion de Productos', path: '/dashboard/ModuloInventario', icon: Tag },
  { label: 'Categorías', path: '/dashboard/categorias', icon: Tag },
  { label: 'Productos', path: '/dashboard/productos', icon: Package },
  { label: 'Almacenes', path: '/dashboard/almacenes', icon: Warehouse },
  { label: 'Producto Almacén', path: '/dashboard/producto-almacen', icon: Boxes },
  { label: 'Modulo de ventas', path: '/dashboard/ModuloVentas', icon: ClipboardList },
  { label: 'Detalle Venta', path: '/dashboard/detalle-venta', icon: ClipboardList },
  { label: 'Ventas', path: '/dashboard/ventas', icon: ShoppingCart }
];

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

      const { data } = await enable2FA({ variables: { password } });

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
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h1 className="dashboard-sidebar-title">Farmacia</h1>
          <p className="dashboard-sidebar-subtitle">Panel de Control</p>
        </div>

        <nav className="dashboard-nav">
          <h2 className="sidebar-section-title">Navegación</h2>
          {menuItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`sidebar-item ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-action secondary" onClick={handleEnable2FA}>
            <Shield size={14} />
            Activar 2FA
          </button>
          <button className="sidebar-action logout" onClick={handleLogout}>
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {show2FAModal && qrCode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-8 border rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Activar Google Authenticator</h3>
            <div className="text-center">
              <p className="mb-4 text-gray-600">1. Instala Google Authenticator en tu teléfono</p>
              <p className="mb-4 text-gray-600">2. Escanea este código QR:</p>
              <div className="flex justify-center mb-4">
                <QRCodeSVG value={qrCode} size={200} />
              </div>
              <p className="mb-4 text-gray-600 text-sm">O ingresa manualmente este código:</p>
              <div className="bg-gray-100 p-3 rounded mb-4">
                <code className="text-sm break-all font-mono">{qrCode.split('secret=')[1]?.split('&')[0]}</code>
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
