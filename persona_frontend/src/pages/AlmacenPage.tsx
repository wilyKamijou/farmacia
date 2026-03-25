import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react'; // ✅ Cambiado a '@apollo/client'
import { gql } from '@apollo/client';
import {
  Almacen,
  GetAllAlmacenesResponse,
  CreateAlmacenResponse,
  CreateAlmacenVariables,
  UpdateAlmacenResponse,
  UpdateAlmacenVariables,
  DeleteAlmacenResponse,
  DeleteAlmacenVariables
} from '../types/auth.types';

// ✅ CORREGIDO: Usar snake_case como en el backend GraphQL
const GET_ALL_ALMACENES = gql`
  query GetAllAlmacenes {
    allAlmacenes {
      id
      nombreAm
      descripcionAm
      direccionAm
    }
  }
`;

const CREATE_ALMACEN = gql`
  mutation CrearAlmacen($nombreAm: String!, $descripcionAm: String, $direccionAm: String!) {
    crearAlmacen(nombreAm: $nombreAm, descripcionAm: $descripcionAm, direccionAm: $direccionAm) {
      almacen {
        id
        nombreAm
        descripcionAm
        direccionAm
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_ALMACEN = gql`
  mutation ActualizarAlmacen($id: ID!, $nombreAm: String, $descripcionAm: String, $direccionAm: String) {
    actualizarAlmacen(id: $id, nombreAm: $nombreAm, descripcionAm: $descripcionAm, direccionAm: $direccionAm) {
      almacen {
        id
        nombreAm
        descripcionAm
        direccionAm
      }
      ok
      mensaje
    }
  }
`;

const DELETE_ALMACEN = gql`
  mutation EliminarAlmacen($id: ID!) {
    eliminar_almacen(id: $id) {
      ok
      mensaje
    }
  }
`;

export function AlmacenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombreAm: '',
    descripcionAm: '',
    direccionAm: ''
  });

  const { loading, data, refetch } = useQuery<GetAllAlmacenesResponse>(GET_ALL_ALMACENES);
  const [createAlmacen] = useMutation<CreateAlmacenResponse, CreateAlmacenVariables>(CREATE_ALMACEN);
  const [updateAlmacen] = useMutation<UpdateAlmacenResponse, UpdateAlmacenVariables>(UPDATE_ALMACEN);
  const [deleteAlmacen] = useMutation<DeleteAlmacenResponse, DeleteAlmacenVariables>(DELETE_ALMACEN);

  // ✅ CORREGIDO: Usar allAlmacenes (camelCase)
  const almacenes = data?.allAlmacenes || [];
  const filteredAlmacenes = almacenes.filter((a: Almacen) =>
    a.nombreAm.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.direccionAm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenModal = (almacen?: Almacen) => {
    if (almacen) {
      setEditingId(almacen.id);
      setFormData({
        nombreAm: almacen.nombreAm,
        descripcionAm: almacen.descripcionAm || '',
        direccionAm: almacen.direccionAm
      });
    } else {
      setEditingId(null);
      setFormData({ nombreAm: '', descripcionAm: '', direccionAm: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAlmacen({
          variables: {
            id: editingId,
            ...formData
          }
        });
      } else {
        await createAlmacen({
          variables: formData
        });
      }
      setShowModal(false);
      setFormData({ nombreAm: '', descripcionAm: '', direccionAm: '' });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar almacén');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este almacén?')) {
      try {
        await deleteAlmacen({
          variables: { id }
        });
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar almacén');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Almacenes</h1>
        <p className="text-gray-600">Gestiona todos los almacenes de la farmacia</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Agregar Almacén
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Dirección</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Descripción</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredAlmacenes.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay almacenes registrados aún
                </td>
              </tr>
            ) : (
              filteredAlmacenes.map((almacen: Almacen) => (
                <tr key={almacen.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{almacen.nombreAm}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{almacen.direccionAm}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{almacen.descripcionAm || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(almacen)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(almacen.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Almacén' : 'Crear Nuevo Almacén'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombreAm"
                    placeholder="Nombre del almacén"
                    value={formData.nombreAm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="direccionAm"
                    placeholder="Dirección del almacén"
                    value={formData.direccionAm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="descripcionAm"
                    placeholder="Descripción del almacén"
                    value={formData.descripcionAm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
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