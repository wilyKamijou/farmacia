import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  DetalleVenta,
  Venta,
  Producto,
  Almacen,
  GetAllDetallesVentaResponse,
  GetAllVentasResponse,
  GetAllProductosResponse,
  GetAllAlmacenesResponse,
  CreateDetalleVentaResponse,
  CreateDetalleVentaVariables,
  UpdateDetalleVentaResponse,
  UpdateDetalleVentaVariables,
  DeleteDetalleVentaResponse,
  DeleteDetalleVentaVariables
} from '../types/auth.types';

// ✅ QUERIES - Los campos en la respuesta son camelCase
const GET_ALL_DETALLES_VENTA = gql`
  query GetAllDetallesVenta {
    allDetallesVenta {
      id
      cantidadDv
      precioDv
      venta {
        id
        fechaVe
      }
      producto {
        id
        nombrePr
        nombreTc
      }
      almacen {
        id
        nombreAm
      }
    }
  }
`;

const GET_ALL_VENTAS = gql`
  query GetAllVentas {
    allVentas {
      id
      fechaVe
      montoTotalVe
      cliente {
        id
        nombre
        apellido
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
    }
  }
`;

// ✅ MUTACIONES - Usar camelCase en los parámetros (como en tu prueba)
const CREATE_DETALLE_VENTA = gql`
  mutation CrearDetalleVenta(
    $ventaId: ID!
    $productoId: ID!
    $almacenId: ID!
    $cantidadDv: Int!
    $precioDv: Decimal!
  ) {
    crearDetalleVenta(
      ventaId: $ventaId
      productoId: $productoId
      almacenId: $almacenId
      cantidadDv: $cantidadDv
      precioDv: $precioDv
    ) {
      detalleVenta {
        id
        cantidadDv
        precioDv
        venta {
          id
          fechaVe
        }
        producto {
          id
          nombrePr
          nombreTc
        }
        almacen {
          id
          nombreAm
        }
      }
      ok
      mensaje
    }
  }
`;

// ✅ MUTACIONES - Usar camelCase en los parámetros
const UPDATE_DETALLE_VENTA = gql`
  mutation ActualizarDetalleVenta(
    $id: ID!
    $cantidadDv: Int
    $precioDv: Decimal
  ) {
    actualizarDetalleVenta(
      id: $id
      cantidadDv: $cantidadDv
      precioDv: $precioDv
    ) {
      detalleVenta {
        id
        cantidadDv
        precioDv
        venta {
          id
          fechaVe
        }
        producto {
          id
          nombrePr
          nombreTc
        }
        almacen {
          id
          nombreAm
        }
      }
      ok
      mensaje
    }
  }
`;

const DELETE_DETALLE_VENTA = gql`
  mutation EliminarDetalleVenta($id: ID!) {
    eliminarDetalleVenta(id: $id) {
      ok
      mensaje
    }
  }
`;

// ✅ Función auxiliar para convertir precio a número
const toNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  return 0;
};

// ✅ Función para formatear precio
const formatPrice = (value: number | string): string => {
  const num = toNumber(value);
  return num.toFixed(2);
};

export function DetalleVentaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ventaId: '',        // ← camelCase
    productoId: '',     // ← camelCase
    almacenId: '',      // ← camelCase
    cantidadDv: '',     // ← camelCase
    precioDv: ''        // ← camelCase
  });

  const { loading: loadingDetalles, data: dataDetalles, refetch } = 
    useQuery<GetAllDetallesVentaResponse>(GET_ALL_DETALLES_VENTA);
  const { data: dataVentas, loading: loadingVentas } = 
    useQuery<GetAllVentasResponse>(GET_ALL_VENTAS);
  const { data: dataProductos, loading: loadingProductos } = 
    useQuery<GetAllProductosResponse>(GET_ALL_PRODUCTOS);
  const { data: dataAlmacenes, loading: loadingAlmacenes } = 
    useQuery<GetAllAlmacenesResponse>(GET_ALL_ALMACENES);

  const [createDetalleVenta] = useMutation<CreateDetalleVentaResponse, CreateDetalleVentaVariables>(CREATE_DETALLE_VENTA);
  const [updateDetalleVenta] = useMutation<UpdateDetalleVentaResponse, UpdateDetalleVentaVariables>(UPDATE_DETALLE_VENTA);
  const [deleteDetalleVenta] = useMutation<DeleteDetalleVentaResponse, DeleteDetalleVentaVariables>(DELETE_DETALLE_VENTA);

  const detalles = dataDetalles?.allDetallesVenta || [];
  const ventas: Venta[] = dataVentas?.allVentas || [];
  const productos: Producto[] = dataProductos?.allProductos || [];
  const almacenes: Almacen[] = dataAlmacenes?.allAlmacenes || [];

  const filteredDetalles = detalles.filter((d: DetalleVenta) =>
    d.producto.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.venta.id.toString().includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (detalle?: DetalleVenta) => {
    if (detalle) {
      setEditingId(detalle.id);
      setFormData({
        ventaId: detalle.venta.id,
        productoId: detalle.producto.id,
        almacenId: detalle.almacen.id,
        cantidadDv: detalle.cantidadDv.toString(),
        precioDv: toNumber(detalle.precioDv).toString()
      });
    } else {
      setEditingId(null);
      setFormData({
        ventaId: '',
        productoId: '',
        almacenId: '',
        cantidadDv: '',
        precioDv: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cantidad = parseInt(formData.cantidadDv);
    const precio = parseFloat(formData.precioDv);
    
    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Por favor ingrese una cantidad válida mayor a 0');
      return;
    }
    
    if (isNaN(precio) || precio <= 0) {
      alert('Por favor ingrese un precio válido mayor a 0');
      return;
    }
    
    try {
      if (editingId) {
        const response = await updateDetalleVenta({
          variables: {
            id: editingId,
            cantidadDv: cantidad,
            precioDv: precio
          }
        });
        
        if (!response.data?.actualizarDetalleVenta?.ok) {
          throw new Error(response.data?.actualizarDetalleVenta?.mensaje || 'Error al actualizar');
        }
      } else {
        if (!formData.ventaId || !formData.productoId || !formData.almacenId) {
          alert('Por favor seleccione venta, producto y almacén');
          return;
        }
        
        const response = await createDetalleVenta({
          variables: {
            ventaId: formData.ventaId,
            productoId: formData.productoId,
            almacenId: formData.almacenId,
            cantidadDv: cantidad,
            precioDv: precio
          }
        });
        
        if (!response.data?.crearDetalleVenta?.ok) {
          throw new Error(response.data?.crearDetalleVenta?.mensaje || 'Error al crear');
        }
      }
      
      setShowModal(false);
      setFormData({
        ventaId: '',
        productoId: '',
        almacenId: '',
        cantidadDv: '',
        precioDv: ''
      });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este detalle?')) {
      try {
        const response = await deleteDetalleVenta({ variables: { id } });
        
        if (!response.data?.eliminarDetalleVenta?.ok) {
          throw new Error(response.data?.eliminarDetalleVenta?.mensaje || 'Error al eliminar');
        }
        
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert(err instanceof Error ? err.message : 'Error al eliminar');
      }
    }
  };

  const calcularSubtotal = (cantidad: string, precio: string) => {
    const cant = parseInt(cantidad) || 0;
    const prec = parseFloat(precio) || 0;
    return (cant * prec).toFixed(2);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalles de Venta</h1>
        <p className="text-gray-600">Gestiona los detalles de cada venta realizada</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por producto o venta..."
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
            Agregar Detalle
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Venta #</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Producto</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Almacén</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Cantidad</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Precio Unit.</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Subtotal</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingDetalles ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredDetalles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay detalles de venta registrados
                </td>
              </tr>
            ) : (
              filteredDetalles.map((detalle: DetalleVenta) => {
                const precioNum = toNumber(detalle.precioDv);
                const cantidadNum = toNumber(detalle.cantidadDv);
                const subtotal = cantidadNum * precioNum;
                
                return (
                  <tr key={detalle.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      #{detalle.venta.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{detalle.producto.nombrePr}</p>
                        <p className="text-xs text-gray-500">{detalle.producto.nombreTc}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {detalle.almacen.nombreAm}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      {cantidadNum}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">
                      ${formatPrice(precioNum)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-green-600">
                      ${subtotal.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(detalle)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(detalle.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Detalle' : 'Crear Nuevo Detalle'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venta *
                  </label>
                  <select
                    name="ventaId"
                    value={formData.ventaId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={editingId !== null || loadingVentas}
                  >
                    <option value="">Seleccionar venta</option>
                    {ventas.map(venta => (
                      <option key={venta.id} value={venta.id}>
                        Venta #{venta.id} - {new Date(venta.fechaVe).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

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
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    name="cantidadDv"
                    placeholder="Cantidad"
                    value={formData.cantidadDv}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precioDv"
                    placeholder="Precio"
                    value={formData.precioDv}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>

                {formData.cantidadDv && formData.precioDv && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600">Subtotal:</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${calcularSubtotal(formData.cantidadDv, formData.precioDv)}
                    </p>
                  </div>
                )}
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