import { Plus, Edit2, Trash2, Search } from 'lucide-react';
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

// ✅ USAR EXACTAMENTE LO QUE DEVUELVE EL BACKEND SEGÚN TU EJEMPLO
const GET_ALL_CLIENTES = gql`
  query GetAllClientes {
    allClientes {
      id
      nombre
      apellido
      telefono
      # activo  # ← Comenta esto si el backend no lo devuelve
    }
  }
`;

const CREATE_CLIENTE = gql`
  mutation CrearCliente($nombre: String!, $apellido: String!, $telefono: String) {
    crearCliente(nombre: $nombre, apellido: $apellido, telefono: $telefono) {
      ok
      mensaje
      # cliente {  # ← Comenta esto si no viene en la respuesta
      #   id
      #   nombre
      #   apellido
      #   telefono
      # }
    }
  }
`;

const UPDATE_CLIENTE = gql`
  mutation ActualizarCliente($id: ID!, $nombre: String, $apellido: String, $telefono: String) {
    actualizarCliente(id: $id, nombre: $nombre, apellido: $apellido, telefono: $telefono) {
      ok
      mensaje
      # cliente {  # ← Comenta esto si no viene en la respuesta
      #   id
      #   nombre
      #   apellido
      #   telefono
      # }
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

  // Verificar qué está llegando del backend
  console.log('Datos recibidos:', data);

  const clientes = data?.allClientes || [];
  const filteredClientes = clientes.filter((c: Cliente) =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        
        console.log('Update response:', response);
        
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
        
        console.log('Create response:', response);
        
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
        
        console.log('Delete response:', response);
        
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Clientes</h1>
        <p className="text-gray-600">Gestiona todos los clientes (no requieren login)</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Apellido</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teléfono</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredClientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay clientes registrados aún
                </td>
              </tr>
            ) : (
              filteredClientes.map((cliente: Cliente) => (
                <tr key={cliente.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{cliente.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cliente.apellido}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.telefono || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      Activo
                    </span>
                    {/* Si no tienes el campo activo, muestra siempre Activo o comenta esta columna */}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(cliente)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}