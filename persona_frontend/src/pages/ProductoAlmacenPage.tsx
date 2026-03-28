import { Plus, Edit2, Trash2, Search, Package, Warehouse, Box, TrendingUp, TrendingDown, AlertCircle, Building2, MapPin, X } from 'lucide-react';
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
    pa.producto.nombreTc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pa.almacen.nombreAm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const totalRegistros = productosAlmacen.length;
  const stockTotal = productosAlmacen.reduce((sum, pa) => sum + pa.stock, 0);
  const productosConStock = productosAlmacen.filter(pa => pa.stock > 0).length;
  const productosSinStock = productosAlmacen.filter(pa => pa.stock === 0).length;
  const productosBajoStock = productosAlmacen.filter(pa => pa.stock > 0 && pa.stock < 10).length;

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

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Sin Stock', className: 'badge-red' };
    if (stock < 10) return { text: 'Stock Bajo', className: 'badge-yellow' };
    return { text: 'Stock Normal', className: 'badge-green' };
  };

  return (
    <div className="dashboard-main-inner">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Inventario por Almacén</h1>
          <p className="dashboard-subtitle">Gestiona el stock de productos en cada almacén</p>
        </div>
        <div className="dashboard-topbar-controls">
          <input
            type="text"
            placeholder="Buscar producto o almacén..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#0f5f37] hover:bg-[#0e3d25] text-white px-4 py-2 rounded-full transition-colors font-medium shadow-md"
          >
            <Plus size={20} />
            Agregar Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Registros Totales</h3>
          <div className="number">{totalRegistros}</div>
          <div className="icon-box">
            <Box size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Stock Total</h3>
          <div className="number">{stockTotal}</div>
          <div className="icon-box">
            <Package size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Con Stock</h3>
          <div className="number">{productosConStock}</div>
          <div className="icon-box">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Sin Stock</h3>
          <div className="number" style={{ color: '#a12f2e' }}>{productosSinStock}</div>
          <div className="icon-box">
            <TrendingDown size={24} />
          </div>
        </div>
      </div>

      {/* Alerta de bajo stock */}
      {productosBajoStock > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">{productosBajoStock}</span> productos tienen stock bajo (menos de 10 unidades)
          </p>
        </div>
      )}

      {/* Grid de Tarjetas */}
      {loadingProductosAlmacen ? (
        <div className="text-center py-12 text-gray-500">Cargando inventario...</div>
      ) : filteredProductosAlmacen.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay registros de inventario</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductosAlmacen.map((pa: ProductoAlmacen) => {
            const status = getStockStatus(pa.stock);
            return (
              <div key={pa.id} className="stat-card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-[#0f5f37]">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {pa.producto.nombrePr}
                      </h3>
                      <p className="text-xs text-gray-500">{pa.producto.nombreTc}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(pa)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(pa.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 size={16} className="text-gray-400" />
                    <span className="font-medium">Almacén:</span>
                    <span>{pa.almacen.nombreAm}</span>
                  </div>
                  
                  {pa.almacen.direccionAm && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-medium">Dirección:</span>
                      <span className="text-xs">{pa.almacen.direccionAm}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Stock:</span>
                    <span className={`text-2xl font-bold ${
                      status.className === 'badge-green' ? 'text-[#0e6d3f]' :
                      status.className === 'badge-yellow' ? 'text-[#886f22]' :
                      'text-[#a12f2e]'
                    }`}>
                      {pa.stock}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <span className={`badge ${status.className}`}>
                      {status.text}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Editar Stock' : 'Agregar Stock'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? 'Modifica la cantidad de stock' : 'Registra un nuevo producto en el almacén'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Producto <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="productoId"
                    value={formData.productoId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#63d889] focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all cursor-pointer"
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
                  {loadingProductos && (
                    <p className="text-xs text-gray-500 mt-1">Cargando productos...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Almacén <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="almacenId"
                    value={formData.almacenId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#63d889] focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all cursor-pointer"
                    required
                    disabled={editingId !== null || loadingAlmacenes}
                  >
                    <option value="">Seleccionar almacén</option>
                    {almacenes.map(alm => (
                      <option key={alm.id} value={alm.id}>
                        {alm.nombreAm} {alm.direccionAm ? `- ${alm.direccionAm}` : ''}
                      </option>
                    ))}
                  </select>
                  {loadingAlmacenes && (
                    <p className="text-xs text-gray-500 mt-1">Cargando almacenes...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    placeholder="Cantidad de unidades"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#63d889] focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                    required
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Ingresa la cantidad de unidades disponibles</p>
                </div>

                {!editingId && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">ℹ️ Nota:</span> Este registro vinculará el producto con el almacén seleccionado.
                    </p>
                  </div>
                )}
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
                  className="px-5 py-2.5 bg-[#0f5f37] hover:bg-[#0e3d25] text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg"
                  disabled={(!formData.productoId || !formData.almacenId || !formData.stock) && !editingId}
                >
                  {editingId ? 'Actualizar Stock' : 'Agregar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}