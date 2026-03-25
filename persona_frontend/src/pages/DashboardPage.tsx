// src/pages/DashboardPage.tsx
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, UserPlus, Trash2, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// ==================== TIPOS ====================
interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
}

interface GetAllClientesResponse {
  allClientes: Cliente[];
}

interface CreateClienteResponse {
  crearCliente: {
    cliente: Cliente;
    ok: boolean;
    mensaje: string;
  };
}

interface CreateClienteVariables {
  nombre: string;
  apellido: string;
  telefono?: string;
}

interface DeleteClienteResponse {
  eliminarCliente: {
    ok: boolean;
    mensaje: string;
  };
}

interface DeleteClienteVariables {
  id: string;
}

interface Enable2FAResponse {
  enable2fa: {
    success: boolean;
    message: string;
    qrCodeUrl: string;
    secret: string;
  };
}

interface Enable2FAVariables {
  password: string;
}

// ==================== QUERIES Y MUTACIONES ====================
const GET_ALL_CLIENTES = gql`
  query {
    allClientes {
      id
      nombre
      apellido
      telefono
    }
  }
`;

const CREATE_CLIENTE = gql`
  mutation CreateCliente($nombre: String!, $apellido: String!, $telefono: String) {
    crearCliente(
      nombre: $nombre
      apellido: $apellido
      telefono: $telefono
    ) {
      cliente {
        id
        nombre
        apellido
        telefono
      }
      ok
      mensaje
    }
  }
`;

const DELETE_CLIENTE = gql`
  mutation DeleteCliente($id: ID!) {
    eliminarCliente(id: $id) {
      ok
      mensaje
    }
  }
`;

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

// ==================== COMPONENTE PRINCIPAL ====================
export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });

  const { loading, error, data, refetch } = useQuery<GetAllClientesResponse>(GET_ALL_CLIENTES);
  const [createCliente] = useMutation<CreateClienteResponse, CreateClienteVariables>(CREATE_CLIENTE);
  const [deleteCliente] = useMutation<DeleteClienteResponse, DeleteClienteVariables>(DELETE_CLIENTE);
  const [enable2FA] = useMutation<Enable2FAResponse, Enable2FAVariables>(ENABLE_2FA);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCliente({
        variables: {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono
        }
      });
      setShowModal(false);
      setFormData({ nombre: '', apellido: '', telefono: '' });
      refetch();
    } catch (err) {
      console.error('Error al crear cliente:', err);
      alert('Error al crear cliente');
    }
  };

  const handleDeleteCliente = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await deleteCliente({
          variables: { id }
        });
        refetch();
      } catch (err) {
        console.error('Error al eliminar:', err);
      }
    }
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
    }
  };

  if (loading) return <div className="text-center p-8">Cargando...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">
                Gestión de Clientes
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {user?.email}
              </span>
              {!user?.is2faEnabled && (
                <button
                  onClick={handleEnable2FA}
                  className="flex items-center text-purple-600 hover:text-purple-800"
                >
                  <Shield size={20} className="mr-1" />
                  Activar 2FA
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center text-red-600 hover:text-red-800"
              >
                <LogOut size={20} className="mr-1" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Botón para crear cliente */}
          <div className="mb-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
            >
              <UserPlus size={20} className="mr-2" />
              Nuevo Cliente
            </button>
          </div>

          {/* Tabla de clientes */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.allClientes?.map((cliente: Cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{cliente.nombre} {cliente.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cliente.telefono || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cliente.activo ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactivo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleDeleteCliente(cliente.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal para crear cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Crear Nuevo Cliente</h3>
            <form onSubmit={handleCreateCliente}>
              <div className="space-y-3">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para mostrar QR de 2FA */}
      {show2FAModal && qrCode && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
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
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};