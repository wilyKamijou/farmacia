import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  ProductoAlmacen,
  Producto,
  Almacen,
  GetAllProductosAlmacenResponse,
  GetAllProductosResponse,
  GetAllAlmacenesResponse,
  CreateProductoAlmacenResponse,
  CreateProductoAlmacenVariables,
  UpdateProductoAlmacenResponse,
  UpdateProductoAlmacenVariables,
  DeleteProductoAlmacenResponse,
  DeleteProductoAlmacenVariables
} from '../types/auth.types';

const GET_ALL_PRODUCTOS_ALMACEN = gql`
  query GetAllProductosAlmacen {
    allProductosAlmacen {
      id
      stock
      producto {
        id
        nombrePr
        nombreTc
      }
      almacen {
        id
        nombreAm
        direccionAm
      }
    }
  }
`;

const GET_ALL_PRODUCTOS = gql`
  query GetAllProductos {
    allProductos {
      id
      nombrePr
      nombreTc
    }
  }
`;

const GET_ALL_ALMACENES = gql`
  query GetAllAlmacenes {
    allAlmacenes {
      id
      nombreAm
      direccionAm
    }
  }
`;

const CREATE_PRODUCTO_ALMACEN = gql`
  mutation CrearProductoAlmacen(
    $productoId: ID!
    $almacenId: ID!
    $stock: Int!
  ) {
    crearProductoAlmacen(
      productoId: $productoId
      almacenId: $almacenId
      stock: $stock
    ) {
      productoAlmacen {
        id
        stock
        producto {
          id
          nombrePr
          nombreTc
        }
        almacen {
          id
          nombreAm
          direccionAm
        }
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_PRODUCTO_ALMACEN = gql`
  mutation ActualizarProductoAlmacen(
    $id: ID!
    $stock: Int
  ) {
    actualizarProductoAlmacen(
      id: $id
      stock: $stock
    ) {
      productoAlmacen {
        id
        stock
        producto {
          id
          nombrePr
          nombreTc
        }
        almacen {
          id
          nombreAm
          direccionAm
        }
      }
      ok
      mensaje
    }
  }
`;

const DELETE_PRODUCTO_ALMACEN = gql`
  mutation EliminarProductoAlmacen($id: ID!) {
    eliminarProductoAlmacen(id: $id) {
      ok
      mensaje
    }
  }
`;

export function ProductoAlmacenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productoId: '',
    almacenId: '',
    stock: ''
  });

  const { loading: loadingProductosAlmacen, data: dataProductosAlmacen, refetch } = 
    useQuery<GetAllProductosAlmacenResponse>(GET_ALL_PRODUCTOS_ALMACEN);
  const { data: dataProductos, loading: loadingProductos } = 
    useQuery<GetAllProductosResponse>(GET_ALL_PRODUCTOS);
  const { data: dataAlmacenes, loading: loadingAlmacenes } = 
    useQuery<GetAllAlmacenesResponse>(GET_ALL_ALMACENES);

  const [createProductoAlmacen] = useMutation<CreateProductoAlmacenResponse, CreateProductoAlmacenVariables>(CREATE_PRODUCTO_ALMACEN);
  const [updateProductoAlmacen] = useMutation<UpdateProductoAlmacenResponse, UpdateProductoAlmacenVariables>(UPDATE_PRODUCTO_ALMACEN);
  const [deleteProductoAlmacen] = useMutation<DeleteProductoAlmacenResponse, DeleteProductoAlmacenVariables>(DELETE_PRODUCTO_ALMACEN);

  const productosAlmacen = dataProductosAlmacen?.allProductosAlmacen || [];
  const productos: Producto[] = dataProductos?.allProductos || [];
  const almacenes: Almacen[] = dataAlmacenes?.allAlmacenes || [];

  const filteredProductosAlmacen = productosAlmacen.filter((pa: ProductoAlmacen) =>
    pa.producto.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pa.almacen.nombreAm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (productoAlmacen?: ProductoAlmacen) => {
    if (productoAlmacen) {
      setEditingId(productoAlmacen.id);
      setFormData({
        productoId: productoAlmacen.producto.id,
        almacenId: productoAlmacen.almacen.id,
        stock: productoAlmacen.stock.toString()
      });
    } else {
      setEditingId(null);
      setFormData({
        productoId: '',
        almacenId: '',
        stock: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProductoAlmacen({
          variables: {
            id: editingId,
            stock: parseInt(formData.stock) || 0
          }
        });
      } else {
        await createProductoAlmacen({
          variables: {
            productoId: formData.productoId,
            almacenId: formData.almacenId,
            stock: parseInt(formData.stock) || 0
          }
        });
      }
      setShowModal(false);
      setFormData({ productoId: '', almacenId: '', stock: '' });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await deleteProductoAlmacen({ variables: { id } });
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Producto Almacén</h1>
        <p className="text-gray-600">Gestiona el stock de productos en cada almacén</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar producto o almacén..."
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
            Agregar Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Producto</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Almacén</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stock</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingProductosAlmacen ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredProductosAlmacen.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No hay registros
                </td>
              </tr>
            ) : (
              filteredProductosAlmacen.map((pa: ProductoAlmacen) => (
                <tr key={pa.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{pa.producto.nombrePr}</p>
                      <p className="text-xs text-gray-500">{pa.producto.nombreTc}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>
                      <p className="font-medium">{pa.almacen.nombreAm}</p>
                      <p className="text-xs text-gray-500">{pa.almacen.direccionAm}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                      {pa.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(pa)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(pa.id)}
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
              {editingId ? 'Editar Registro' : 'Crear Nuevo Registro'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Producto *
                  </label>
                  <select
                    name="productoId"
                    value={formData.productoId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={editingId !== null || loadingProductos}
                  >
                    <option value="">Seleccionar producto</option>
                    {productos.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nombrePr} ({prod.nombreTc})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Almacén *
                  </label>
                  <select
                    name="almacenId"
                    value={formData.almacenId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={editingId !== null || loadingAlmacenes}
                  >
                    <option value="">Seleccionar almacén</option>
                    {almacenes.map(alm => (
                      <option key={alm.id} value={alm.id}>
                        {alm.nombreAm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="Cantidad"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
