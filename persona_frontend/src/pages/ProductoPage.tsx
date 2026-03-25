import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react'; //   Cambiado a '@apollo/client'
import { gql } from '@apollo/client';
import {
  Producto,
  Categoria,
  GetAllProductosResponse,
  GetAllCategoriasResponse,
  CreateProductoResponse,
  CreateProductoVariables,
  UpdateProductoResponse,
  UpdateProductoVariables,
  DeleteProductoResponse,
  DeleteProductoVariables
} from '../types/auth.types';

//   CORREGIDO: Usar camelCase
const GET_ALL_PRODUCTOS = gql`
  query GetAllProductos {
    allProductos {
      id
      nombrePr
      nombreTc
      fechaFab
      fechaVenc
      descripcionPr
      concentracionQm
      composicionQm
      categoria {
        id
        nombreCt
      }
    }
  }
`;

//   CORREGIDO: Usar camelCase para categorías también
const GET_ALL_CATEGORIAS = gql`
  query GetAllCategorias {
    allCategorias {
      id
      nombreCt
    }
  }
`;

const CREATE_PRODUCTO = gql`
  mutation CrearProducto(
    $nombrePr: String!
    $nombreTc: String!
    $fechaFab: Date!
    $fechaVenc: Date!
    $categoriaId: ID!
    $descripcionPr: String
    $concentracionQm: String
    $composicionQm: String
  ) {
    crearProducto(
      nombrePr: $nombrePr
      nombreTc: $nombreTc
      fechaFab: $fechaFab
      fechaVenc: $fechaVenc
      categoriaId: $categoriaId
      descripcionPr: $descripcionPr
      concentracionQm: $concentracionQm
      composicionQm: $composicionQm
    ) {
      producto {
        id
        nombrePr
        nombreTc
        fechaFab
        fechaVenc
        descripcionPr
        concentracionQm
        composicionQm
        categoria {
          id
          nombreCt
        }
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_PRODUCTO = gql`
  mutation ActualizarProducto(
    $id: ID!
    $nombrePr: String
    $nombreTc: String
    $fechaFab: Date
    $fechaVenc: Date
    $categoriaId: ID
    $descripcionPr: String
    $concentracionQm: String
    $composicionQm: String
  ) {
    actualizarProducto(
      id: $id
      nombrePr: $nombrePr
      nombreTc: $nombreTc
      fechaFab: $fechaFab
      fechaVenc: $fechaVenc
      categoriaId: $categoriaId
      descripcionPr: $descripcionPr
      concentracionQm: $concentracionQm
      composicionQm: $composicionQm
    ) {
      producto {
        id
        nombrePr
        nombreTc
        fechaFab
        fechaVenc
        descripcionPr
        concentracionQm
        composicionQm
        categoria {
          id
          nombreCt
        }
      }
      ok
      mensaje
    }
  }
`;

const DELETE_PRODUCTO = gql`
  mutation EliminarProducto($id: ID!) {
    eliminarProducto(id: $id) {
      ok
      mensaje
    }
  }
`;

export function ProductoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombrePr: '',        //   Cambiado de nombre_pr
    nombreTc: '',        //   Cambiado de nombre_tc
    fechaFab: '',        //   Cambiado de fecha_fab
    fechaVenc: '',       //   Cambiado de fecha_venc
    categoriaId: '',     //   Cambiado de categoria_id
    descripcionPr: '',   //   Cambiado de descripcion_pr
    concentracionQm: '', //   Cambiado de concentracion_qm
    composicionQm: ''    //   Cambiado de composicion_qm
  });

  const { loading: loadingProductos, data: dataProductos, refetch } = useQuery<GetAllProductosResponse>(GET_ALL_PRODUCTOS);
  const { data: dataCategorias, loading: loadingCategorias } = useQuery<GetAllCategoriasResponse>(GET_ALL_CATEGORIAS);
  const [createProducto] = useMutation<CreateProductoResponse, CreateProductoVariables>(CREATE_PRODUCTO);
  const [updateProducto] = useMutation<UpdateProductoResponse, UpdateProductoVariables>(UPDATE_PRODUCTO);
  const [deleteProducto] = useMutation<DeleteProductoResponse, DeleteProductoVariables>(DELETE_PRODUCTO);

  //   Corregido: usar allProductos y allCategorias
  const productos = dataProductos?.allProductos || [];
  const categorias: Categoria[] = dataCategorias?.allCategorias || [];
  
  const filteredProductos = productos.filter((p: Producto) =>
    p.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombreTc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingId(producto.id);
      setFormData({
        nombrePr: producto.nombrePr,
        nombreTc: producto.nombreTc,
        fechaFab: producto.fechaFab,
        fechaVenc: producto.fechaVenc,
        categoriaId: producto.categoria.id,
        descripcionPr: producto.descripcionPr || '',
        concentracionQm: producto.concentracionQm || '',
        composicionQm: producto.composicionQm || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProducto({ 
          variables: { 
            id: editingId, 
            ...formData 
          } 
        });
      } else {
        await createProducto({ 
          variables: formData 
        });
      }
      setShowModal(false);
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: ''
      });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto({ variables: { id } });
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar producto');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos</h1>
        <p className="text-gray-600">Gestiona todos los productos de la farmacia</p>
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
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre Comercial</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre Técnico</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoría</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vencimiento</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingProductos ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredProductos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No hay productos registrados aún
                </td>
              </tr>
            ) : (
              filteredProductos.map((producto: Producto) => (
                <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{producto.nombrePr}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.nombreTc}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria.nombreCt}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(producto.fechaVenc).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(producto)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
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
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    name="nombrePr"
                    placeholder="Nombre Comercial"
                    value={formData.nombrePr}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Técnico *
                  </label>
                  <input
                    type="text"
                    name="nombreTc"
                    placeholder="Nombre Técnico"
                    value={formData.nombreTc}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={loadingCategorias}
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombreCt}
                      </option>
                    ))}
                  </select>
                  {loadingCategorias && (
                    <p className="text-xs text-gray-500 mt-1">Cargando categorías...</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fabricación *
                  </label>
                  <input
                    type="date"
                    name="fechaFab"
                    value={formData.fechaFab}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Vencimiento *
                  </label>
                  <input
                    type="date"
                    name="fechaVenc"
                    value={formData.fechaVenc}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concentración
                  </label>
                  <input
                    type="text"
                    name="concentracionQm"
                    placeholder="Ej: 500mg"
                    value={formData.concentracionQm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcionPr"
                    placeholder="Descripción del producto"
                    value={formData.descripcionPr}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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