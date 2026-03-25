import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react'; // ✅ Cambiado a '@apollo/client'
import { gql } from '@apollo/client';
import {
  Categoria,
  GetAllCategoriasResponse,
  CreateCategoriaResponse,
  CreateCategoriaVariables,
  UpdateCategoriaResponse,
  UpdateCategoriaVariables,
  DeleteCategoriaResponse,
  DeleteCategoriaVariables
} from '../types/auth.types';

// ✅ Usar camelCase según el schema de GraphQL
const GET_ALL_CATEGORIAS = gql`
  query GetAllCategorias {
    allCategorias {
      id
      nombreCt
      descripcionCt
    }
  }
`;

const CREATE_CATEGORIA = gql`
  mutation CrearCategoria($nombreCt: String!, $descripcionCt: String) {
    crearCategoria(nombreCt: $nombreCt, descripcionCt: $descripcionCt) {
      categoria {
        id
        nombreCt
        descripcionCt
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_CATEGORIA = gql`
  mutation ActualizarCategoria($id: ID!, $nombreCt: String, $descripcionCt: String) {
    actualizarCategoria(id: $id, nombreCt: $nombreCt, descripcionCt: $descripcionCt) {
      categoria {
        id
        nombreCt
        descripcionCt
      }
      ok
      mensaje
    }
  }
`;

const DELETE_CATEGORIA = gql`
  mutation EliminarCategoria($id: ID!) {
    eliminarCategoria(id: $id) {
      ok
      mensaje
    }
  }
`;

export function CategoriaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    nombreCt: '',
    descripcionCt: ''
  });

  const { loading, data, refetch } = useQuery<GetAllCategoriasResponse>(GET_ALL_CATEGORIAS);
  const [createCategoria] = useMutation<CreateCategoriaResponse, CreateCategoriaVariables>(CREATE_CATEGORIA);
  const [updateCategoria] = useMutation<UpdateCategoriaResponse, UpdateCategoriaVariables>(UPDATE_CATEGORIA);
  const [deleteCategoria] = useMutation<DeleteCategoriaResponse, DeleteCategoriaVariables>(DELETE_CATEGORIA);

  // ✅ Corregido: usar allCategorias en lugar de all_categorias
  const categorias = data?.allCategorias || [];
  const filteredCategorias = categorias.filter((c: Categoria) =>
    c.nombreCt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingId(categoria.id);
      setFormData({ 
        nombreCt: categoria.nombreCt,
        descripcionCt: categoria.descripcionCt || ''
      });
    } else {
      setEditingId(null);
      setFormData({ nombreCt: '', descripcionCt: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategoria({ 
          variables: { 
            id: editingId, 
            ...formData 
          } 
        });
      } else {
        await createCategoria({ 
          variables: formData 
        });
      }
      setShowModal(false);
      setFormData({ nombreCt: '', descripcionCt: '' });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar categoría');
    }
  };

  // ✅ AÑADIDA la función handleDelete que faltaba
  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await deleteCategoria({ variables: { id } });
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar categoría');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categorías</h1>
        <p className="text-gray-600">Gestiona todas las categorías de productos</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Agregar Categoría
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Descripción</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredCategorias.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No hay categorías registradas aún
                </td>
              </tr>
            ) : (
              filteredCategorias.map((categoria: Categoria) => (
                <tr key={categoria.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{categoria.nombreCt}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{categoria.descripcionCt || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(categoria)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(categoria.id)}
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
              {editingId ? 'Editar Categoría' : 'Crear Nueva Categoría'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombreCt"
                    placeholder="Nombre"
                    value={formData.nombreCt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcionCt"
                    placeholder="Descripción"
                    value={formData.descripcionCt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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