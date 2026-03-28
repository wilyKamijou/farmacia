import { Plus, Edit2, Trash2, Search, Package, Calendar, Tag, AlertCircle, FlaskConical, FileText, Layers } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
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
} from '../types/producto.types';
import ProductoModal from './components/Producto/ProductoModal';
import ProductoTable from './components/Producto/ProductoTable';
import './styles/ProductoPage.css';

// GraphQL queries
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
      precio
      categoria {
        id
        nombreCt
      }
    }
  }
`;

const GET_ALL_CATEGORIAS = gql`
  query GetAllCategorias {
    allCategorias {
      id
      nombreCt
    }
  }
`;

const CREATE_PRODUCTO = gql`
  mutation crearProducto(
    $nombrePr: String!
    $nombreTc: String!
    $fechaFab: Date!
    $fechaVenc: Date!
    $categoriaId: ID!
    $precio: Float!
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
      precio: $precio
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
        precio
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
    $precio: Float
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
      precio: $precio
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
        precio
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

// ... imports existentes ...

export function ProductoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombrePr: '',
    nombreTc: '',
    fechaFab: '',
    fechaVenc: '',
    categoriaId: '',
    precio: 0,  // ✅ Agregar precio al estado inicial
    descripcionPr: '',
    concentracionQm: '',
    composicionQm: ''
  });

  const { loading: loadingProductos, data: dataProductos, refetch } = useQuery<GetAllProductosResponse>(GET_ALL_PRODUCTOS);
  const { data: dataCategorias, loading: loadingCategorias } = useQuery<GetAllCategoriasResponse>(GET_ALL_CATEGORIAS);
  const [createProducto] = useMutation<CreateProductoResponse, CreateProductoVariables>(CREATE_PRODUCTO);
  const [updateProducto] = useMutation<UpdateProductoResponse, UpdateProductoVariables>(UPDATE_PRODUCTO);
  const [deleteProducto] = useMutation<DeleteProductoResponse, DeleteProductoVariables>(DELETE_PRODUCTO);

  const productos = dataProductos?.allProductos || [];
  const categorias: Categoria[] = dataCategorias?.allCategorias || [];
  
  const filteredProductos = productos.filter((p: Producto) =>
    p.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombreTc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.nombreCt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const total = productos.length;
  const proximosVencer = productos.filter(p => {
    const fechaVenc = new Date(p.fechaVenc);
    const hoy = new Date();
    const diffDays = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }).length;
  const vencidos = productos.filter(p => new Date(p.fechaVenc) < new Date()).length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    // Procesar precio como número
    if (name === 'precio') {
      processedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData({ ...formData, [name]: processedValue });
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
        precio: producto.precio || '0',  // ✅ Agregar precio al editar
        descripcionPr: producto.descripcionPr || '',
        concentracionQm: producto.concentracionQm || '',
        composicionQm: producto.composicionQm || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        precio: 0,  // ✅ Precio por defecto
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (formData.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    
    try {
      if (editingId) {
        await updateProducto({ 
          variables: { 
            id: editingId, 
            ...formData,
            // Asegurar que precio sea número
            precio: parseFloat(formData.precio.toString())
          } 
        });
      } else {
        await createProducto({ 
          variables: {
            ...formData,
            precio: parseFloat(formData.precio.toString())
          }
        });
      }
      setShowModal(false);
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        precio: 0,
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: '',
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

  const getVencimientoStatus = (fechaVenc: string) => {
    const hoy = new Date();
    const venc = new Date(fechaVenc);
    const diffDays = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Vencido', className: 'badge-red' };
    if (diffDays <= 30) return { text: 'Próximo a vencer', className: 'badge-yellow' };
    return { text: 'Vigente', className: 'badge-green' };
  };

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="dashboard-main-inner">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Productos</h1>
          <p className="dashboard-subtitle">Gestiona todos los productos de la farmacia</p>
        </div>
        <div className="dashboard-topbar-controls">
          <input
            type="text"
            placeholder="Buscar por nombre, categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#0f5f37] hover:bg-[#0e3d25] text-white px-4 py-2 rounded-full transition-colors font-medium shadow-md"
          >
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-add">
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Productos</h3>
          <div className="number">{total}</div>
          <div className="icon-box">
            <Package size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Próximos a Vencer</h3>
          <div className="number text-yellow-600">{proximosVencer}</div>
          <div className="icon-box">
            <AlertCircle size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Vencidos</h3>
          <div className="number text-red-600">{vencidos}</div>
          <div className="icon-box">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {loadingProductos ? (
        <div className="text-center py-12 text-gray-500">Cargando productos...</div>
      ) : filteredProductos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay productos registrados aún</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProductos.map((producto: Producto) => {
            const status = getVencimientoStatus(producto.fechaVenc);
            return (
              <div key={producto.id} className="stat-card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {producto.nombrePr}
                      </h3>
                      <span className={`badge ${status.className} mt-1`}>
                        {status.text}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(producto)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="font-medium">Nombre Técnico:</span>
                    <span>{producto.nombreTc}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-gray-400" />
                    <span className="font-medium">Categoría:</span>
                    <span className="text-indigo-600 font-medium">{producto.categoria.nombreCt}</span>
                  </div>
                  
                  {/* ✅ Mostrar precio */}
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-green-600" />
                    <span className="font-medium">Precio:</span>
                    <span className="text-green-600 font-bold text-base">
                      {formatPrice(producto.precio ? parseFloat(producto.precio) : 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">Fabricación:</span>
                    <span>{new Date(producto.fechaFab).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium">Vencimiento:</span>
                    <span className={status.text === 'Vencido' ? 'text-red-600 font-semibold' : ''}>
                      {new Date(producto.fechaVenc).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {producto.concentracionQm && (
                    <div className="flex items-center gap-2">
                      <FlaskConical size={16} className="text-gray-400" />
                      <span className="font-medium">Concentración:</span>
                      <span>{producto.concentracionQm}</span>
                    </div>
                  )}
                  
                  {producto.descripcionPr && (
                    <div className="flex items-start gap-2 mt-2">
                      <FileText size={16} className="text-gray-400 mt-0.5" />
                      <span className="font-medium">Descripción:</span>
                      <span className="text-xs line-clamp-2">{producto.descripcionPr}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? '✏️ Editar Producto' : '📦 Crear Nuevo Producto'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? 'Modifica los datos del producto' : 'Ingresa los datos del nuevo producto'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Comercial <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Package size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="nombrePr"
                        placeholder="Ej. Aspirina"
                        value={formData.nombrePr}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Técnico <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FlaskConical size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="nombreTc"
                        placeholder="Ej. Ácido acetilsalicílico"
                        value={formData.nombreTc}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Layers size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      name="categoriaId"
                      value={formData.categoriaId}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all cursor-pointer"
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
                  </div>
                  {loadingCategorias && (
                    <p className="text-xs text-gray-500 mt-1">Cargando categorías...</p>
                  )}
                </div>

                {/* ✅ Campo de Precio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <input
                      type="number"
                      name="precio"
                      placeholder="0.00"
                      value={formData.precio}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Ingresa el precio del producto en COP</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha Fabricación <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="fechaFab"
                        value={formData.fechaFab}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fecha Vencimiento <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <AlertCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="fechaVenc"
                        value={formData.fechaVenc}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Concentración
                    </label>
                    <div className="relative">
                      <FlaskConical size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="concentracionQm"
                        placeholder="Ej: 500mg"
                        value={formData.concentracionQm}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Composición Química
                    </label>
                    <div className="relative">
                      <FlaskConical size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="composicionQm"
                        placeholder="Composición química"
                        value={formData.composicionQm}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <div className="relative">
                    <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      name="descripcionPr"
                      placeholder="Descripción detallada del producto"
                      value={formData.descripcionPr}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all resize-none"
                    />
                  </div>
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
                  {editingId ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}