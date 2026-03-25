import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Venta,
  Cliente,
  Empleado,
  GetAllVentasResponse,
  CreateVentaResponse,
  CreateVentaVariables,
  UpdateVentaResponse,
  UpdateVentaVariables,
  DeleteVentaResponse,
  DeleteVentaVariables,
  GetAllClientesResponse,
  GetAllEmpleadosResponse
} from '../types/auth.types';

// ✅ QUERIES
const GET_ALL_VENTAS = gql`
  query GetAllVentas {
    allVentas {
      id
      fechaVe
      montoTotalVe
      descripcion
      cliente {
        id
        nombre
        apellido
      }
      empleado {
        id
        firstName
        lastName
      }
    }
  }
`;

const GET_ALL_CLIENTES = gql`
  query GetAllClientes {
    allClientes {
      id
      nombre
      apellido
    }
  }
`;

const GET_ALL_EMPLEADOS = gql`
  query GetAllEmpleados {
    allEmpleados {
      id
      firstName
      lastName
    }
  }
`;

// ✅ MUTACIONES - Usar Decimal en lugar de Float
const CREATE_VENTA = gql`
  mutation CrearVenta($clienteId: ID!, $empleadoId: ID!, $montoTotalVe: Decimal!, $descripcion: String) {
    crearVenta(clienteId: $clienteId, empleadoId: $empleadoId, montoTotalVe: $montoTotalVe, descripcion: $descripcion) {
      ok
      mensaje
      venta {
        id
        fechaVe
        montoTotalVe
        cliente {
          id
          nombre
          apellido
        }
        empleado {
          id
          firstName
          lastName
        }
        descripcion
      }
    }
  }
`;

const UPDATE_VENTA = gql`
  mutation ActualizarVenta($id: ID!, $montoTotalVe: Decimal, $descripcion: String) {
    actualizarVenta(id: $id, montoTotalVe: $montoTotalVe, descripcion: $descripcion) {
      ok
      mensaje
      venta {
        id
        fechaVe
        montoTotalVe
        cliente {
          id
          nombre
          apellido
        }
        empleado {
          id
          firstName
          lastName
        }
        descripcion
      }
    }
  }
`;

const DELETE_VENTA = gql`
  mutation EliminarVenta($id: ID!) {
    eliminarVenta(id: $id) {
      ok
      mensaje
    }
  }
`;

export function VentaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    empleadoId: '',
    montoTotalVe: '',
    descripcion: ''
  });

  const { loading: ventasLoading, data: ventasData, refetch: refetchVentas } = 
    useQuery<GetAllVentasResponse>(GET_ALL_VENTAS);
  const { data: clientesData } = 
    useQuery<GetAllClientesResponse>(GET_ALL_CLIENTES);
  const { data: empleadosData } = 
    useQuery<GetAllEmpleadosResponse>(GET_ALL_EMPLEADOS);

  const [createVenta] = useMutation<CreateVentaResponse, CreateVentaVariables>(CREATE_VENTA);
  const [updateVenta] = useMutation<UpdateVentaResponse, UpdateVentaVariables>(UPDATE_VENTA);
  const [deleteVenta] = useMutation<DeleteVentaResponse, DeleteVentaVariables>(DELETE_VENTA);

  const ventas = ventasData?.allVentas || [];
  const clientes = clientesData?.allClientes || [];
  const empleados = empleadosData?.allEmpleados || [];

  const filteredVentas = ventas.filter((v: Venta) =>
    v.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cliente?.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.montoTotalVe?.toString().includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleOpenModal = (venta?: Venta) => {
    if (venta) {
      setEditingId(venta.id);
      setFormData({
        clienteId: venta.cliente?.id || '',
        empleadoId: venta.empleado?.id || '',
        montoTotalVe: venta.montoTotalVe?.toString() || '',
        descripcion: venta.descripcion || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        clienteId: '',
        empleadoId: '',
        montoTotalVe: '',
        descripcion: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const monto = parseFloat(formData.montoTotalVe);
    if (isNaN(monto) || monto <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0');
      return;
    }

    if (!formData.clienteId || !formData.empleadoId) {
      alert('Por favor seleccione un cliente y un empleado');
      return;
    }

    const variables = {
      clienteId: formData.clienteId,
      empleadoId: formData.empleadoId,
      montoTotalVe: monto,
      descripcion: formData.descripcion || undefined  // ← Cambiado de null a undefined
    };
    
    console.log('Variables:', variables);
    
    try {
      let response;
      if (editingId) {
        response = await updateVenta({
          variables: {
            id: editingId,
            montoTotalVe: monto,
            descripcion: formData.descripcion || undefined
          }
        });
        
        if (!response.data?.actualizarVenta?.ok) {
          throw new Error(response.data?.actualizarVenta?.mensaje || 'Error al actualizar');
        }
      } else {
        response = await createVenta({ variables });
        
        if (!response.data?.crearVenta?.ok) {
          throw new Error(response.data?.crearVenta?.mensaje || 'Error al crear');
        }
      }
      
      setShowModal(false);
      setFormData({
        clienteId: '',
        empleadoId: '',
        montoTotalVe: '',
        descripcion: ''
      });
      setEditingId(null);
      refetchVentas();
      
      alert(editingId ? 'Venta actualizada correctamente' : 'Venta creada correctamente');
    } catch (err) {
      console.error('Error:', err);
      alert(err instanceof Error ? err.message : 'Error al guardar venta');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta venta?')) {
      try {
        const response = await deleteVenta({ variables: { id } });
        
        if (!response.data?.eliminarVenta?.ok) {
          throw new Error(response.data?.eliminarVenta?.mensaje || 'Error al eliminar');
        }
        
        refetchVentas();
        alert('Venta eliminada correctamente');
      } catch (err) {
        console.error('Error:', err);
        alert(err instanceof Error ? err.message : 'Error al eliminar venta');
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Ventas</h1>
        <p className="text-gray-600">Gestiona todos los registros de ventas</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente o monto..."
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
            Registrar Venta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Venta #</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cliente</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Empleado</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Monto Total</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredVentas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No hay ventas registradas aún
                </td>
              </tr>
            ) : (
              filteredVentas.map((venta: Venta) => (
                <tr key={venta.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">#{venta.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(venta.fechaVe)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {venta.cliente?.nombre} {venta.cliente?.apellido}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {venta.empleado?.firstName} {venta.empleado?.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    {formatCurrency(venta.montoTotalVe)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(venta)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(venta.id)}
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
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Venta' : 'Registrar Nueva Venta'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                {!editingId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                      <select
                        name="clienteId"
                        value={formData.clienteId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map((cliente: Cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} {cliente.apellido}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Empleado *</label>
                      <select
                        name="empleadoId"
                        value={formData.empleadoId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar empleado</option>
                        {empleados.map((empleado: Empleado) => (
                          <option key={empleado.id} value={empleado.id}>
                            {empleado.firstName} {empleado.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total *</label>
                  <input
                    type="number"
                    name="montoTotalVe"
                    placeholder="0.00"
                    value={formData.montoTotalVe}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    placeholder="Notas o descripción de la venta"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
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
                  {editingId ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}