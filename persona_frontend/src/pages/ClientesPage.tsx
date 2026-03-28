import { Plus, Edit2, Trash2, Search, Users, Phone, User, UserCircle, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Cliente,
  GetAllClientesResponse,
  CreateClienteResponse,
  CreateClienteVariables,
  UpdateClienteResponse,
  UpdateClienteVariables,
  DeleteClienteResponse,
  DeleteClienteVariables
} from '../types/auth.types';

// GraphQL queries
const GET_ALL_CLIENTES = gql`
  query GetAllClientes {
    allClientes {
      id
      nombre
      apellido
      telefono
    }
  }
`;

const CREATE_CLIENTE = gql`
  mutation CrearCliente($nombre: String!, $apellido: String!, $telefono: String) {
    crearCliente(nombre: $nombre, apellido: $apellido, telefono: $telefono) {
      ok
      mensaje
    }
  }
`;

const UPDATE_CLIENTE = gql`
  mutation ActualizarCliente($id: ID!, $nombre: String, $apellido: String, $telefono: String) {
    actualizarCliente(id: $id, nombre: $nombre, apellido: $apellido, telefono: $telefono) {
      ok
      mensaje
    }
  }
`;

const DELETE_CLIENTE = gql`
  mutation EliminarCliente($id: ID!) {
    eliminarCliente(id: $id) {
      ok
      mensaje
    }
  }
`;

export function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: ''
  });

  const { loading, data, refetch } = useQuery<GetAllClientesResponse>(GET_ALL_CLIENTES);
  const [createCliente] = useMutation<CreateClienteResponse, CreateClienteVariables>(CREATE_CLIENTE);
  const [updateCliente] = useMutation<UpdateClienteResponse, UpdateClienteVariables>(UPDATE_CLIENTE);
  const [deleteCliente] = useMutation<DeleteClienteResponse, DeleteClienteVariables>(DELETE_CLIENTE);

  const clientes = data?.allClientes || [];
  
  const filteredClientes = clientes.filter((c: Cliente) =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telefono?.includes(searchTerm)
  );

  // Estadísticas
  const total = clientes.length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingId(cliente.id);
      setFormData({
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        telefono: cliente.telefono || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nombre: '', apellido: '', telefono: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const response = await updateCliente({
          variables: {
            id: editingId,
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono || undefined
          }
        });
        
        if (!response.data?.actualizarCliente?.ok) {
          throw new Error(response.data?.actualizarCliente?.mensaje || 'Error al actualizar');
        }
      } else {
        const response = await createCliente({
          variables: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            telefono: formData.telefono || undefined
          }
        });
        
        if (!response.data?.crearCliente?.ok) {
          throw new Error(response.data?.crearCliente?.mensaje || 'Error al crear');
        }
      }
      
      setShowModal(false);
      setFormData({ nombre: '', apellido: '', telefono: '' });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert(err instanceof Error ? err.message : 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        const response = await deleteCliente({
          variables: { id }
        });
        
        if (!response.data?.eliminarCliente?.ok) {
          throw new Error(response.data?.eliminarCliente?.mensaje || 'Error al eliminar');
        }
        
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert(err instanceof Error ? err.message : 'Error al eliminar cliente');
      }
    }
  };

  return (
    <div className="dashboard-main-inner">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Clientes</h1>
          <p className="dashboard-subtitle">Gestiona todos los clientes registrados en el sistema</p>
        </div>
        <div className="dashboard-topbar-controls">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#0f5f37] hover:bg-[#0e3d25] text-white px-4 py-2 rounded-full transition-colors font-medium shadow-md"
          >
            <Plus size={20} />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Clientes</h3>
          <div className="number">{total}</div>
          <div className="icon-box">
            <Users size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Activos</h3>
          <div className="number">{total}</div>
          <div className="icon-box">
            <UserCheck size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Clientes</h3>
          <div className="number">{total}</div>
          <div className="icon-box">
            <User size={24} />
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando clientes...</div>
      ) : filteredClientes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay clientes registrados aún</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente: Cliente) => (
            <div key={cliente.id} className="stat-card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                    {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {cliente.nombre} {cliente.apellido}
                    </h3>
                    <span className="badge badge-green mt-1">
                      Activo
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(cliente)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cliente.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mt-3 text-sm text-gray-600">
                {cliente.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                {!cliente.telefono && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone size={16} />
                    <span className="text-sm">Sin teléfono registrado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? '✏️ Editar Cliente' : '👤 Crear Nuevo Cliente'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? 'Modifica los datos del cliente' : 'Ingresa los datos del nuevo cliente'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Ej. Juan"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="apellido"
                      placeholder="Ej. Pérez"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="telefono"
                      placeholder="+56 9 1234 5678"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Opcional</p>
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg"
                >
                  {editingId ? 'Actualizar Cliente' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares para las estadísticas
function UserCheck({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}