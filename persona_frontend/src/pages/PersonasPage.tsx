import { Plus, Edit2, Trash2, Search, User, Mail, Phone, DollarSign, Users, UserCheck, UserX, X, UserCircle, Lock, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Empleado,
  GetAllEmpleadosResponse,
  CreateEmpleadoResponse,
  CreateEmpleadoVariables,
  UpdateEmpleadoResponse,
  UpdateEmpleadoVariables,
  DeleteEmpleadoResponse,
  DeleteEmpleadoVariables
} from '../types/auth.types';

// GraphQL queries y mutations
const GET_ALL_EMPLEADOS = gql`
  query {
    allEmpleados {
      id
      firstName
      lastName
      email
      telefonoEm
      sueldoEm
      fechaContratacion
      activo
    }
  }
`;

const CREATE_EMPLEADO = gql`
  mutation CrearEmpleado(
    $username: String!
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
    $telefonoEm: String
    $direccionEm: String
    $sueldoEm: Decimal
    $activo: Boolean
  ) {
    crearEmpleado(
      username: $username
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      telefonoEm: $telefonoEm
      direccionEm: $direccionEm
      sueldoEm: $sueldoEm
      activo: $activo
    ) {
      empleado {
        id
        firstName
        lastName
        email
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_EMPLEADO = gql`
  mutation ActualizarEmpleado(
    $id: ID!
    $email: String
    $firstName: String
    $lastName: String
    $telefonoEm: String
    $direccionEm: String
    $sueldoEm: Decimal
    $activo: Boolean
  ) {
    actualizarEmpleado(
      id: $id
      email: $email
      firstName: $firstName
      lastName: $lastName
      telefonoEm: $telefonoEm
      direccionEm: $direccionEm
      sueldoEm: $sueldoEm
      activo: $activo
    ) {
      empleado {
        id
        firstName
        lastName
        email
      }
      ok
      mensaje
    }
  }
`;

const DELETE_EMPLEADO = gql`
  mutation EliminarEmpleado($id: ID!) {
    eliminarEmpleado(id: $id) {
      ok
      mensaje
    }
  }
`;

export function PersonasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    telefonoEm: '',
    direccionEm: '',
    sueldoEm: '',
    activo: true
  });

  const { loading, data, refetch } = useQuery<GetAllEmpleadosResponse>(GET_ALL_EMPLEADOS);
  const [createPersona] = useMutation<CreateEmpleadoResponse, CreateEmpleadoVariables>(CREATE_EMPLEADO);
  const [updatePersona] = useMutation<UpdateEmpleadoResponse, UpdateEmpleadoVariables>(UPDATE_EMPLEADO);
  const [deletePersona] = useMutation<DeleteEmpleadoResponse, DeleteEmpleadoVariables>(DELETE_EMPLEADO);

  const personas = data?.allEmpleados || [];
  const filteredPersonas = personas.filter((p: Empleado) =>
    p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const total = personas.length;
  const activos = personas.filter(p => p.activo).length;
  const inactivos = total - activos;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleOpenModal = (persona?: Empleado) => {
    if (persona) {
      setEditingId(persona.id);
      setFormData({
        username: '',
        email: persona.email,
        password: '',
        firstName: persona.firstName,
        lastName: persona.lastName,
        telefonoEm: persona.telefonoEm || '',
        direccionEm: persona.direccionEm || '',
        sueldoEm: persona.sueldoEm?.toString() || '',
        activo: persona.activo
      });
    } else {
      setEditingId(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        telefonoEm: '',
        direccionEm: '',
        sueldoEm: '',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const variables: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        telefonoEm: formData.telefonoEm,
        direccionEm: formData.direccionEm,
        sueldoEm: formData.sueldoEm ? parseFloat(formData.sueldoEm) : null,
        activo: formData.activo
      };

      if (editingId) {
        variables.id = editingId;
        await updatePersona({ variables });
      } else {
        variables.username = formData.username;
        variables.password = formData.password;
        await createPersona({ variables });
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar persona');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta persona?')) {
      try {
        await deletePersona({
          variables: { id }
        });
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar persona');
      }
    }
  };

  return (
    <div className="dashboard-main-inner">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Personas</h1>
          <p className="dashboard-subtitle">Gestiona todas las personas registradas en el sistema</p>
        </div>
        <div className="dashboard-topbar-controls">
          <input
            type="text"
            placeholder="Buscar por nombre, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#0f5f37] hover:bg-[#0e3d25] text-white px-4 py-2 rounded-full transition-colors font-medium shadow-md"
          >
            <Plus size={20} />
            Agregar Persona
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Empleados</h3>
          <div className="number">{total}</div>
          <div className="icon-box">
            <Users size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Activos</h3>
          <div className="number">{activos}</div>
          <div className="icon-box">
            <UserCheck size={24} />
          </div>
        </div>
        <div className="stat-card">
          <h3>Inactivos</h3>
          <div className="number">{inactivos}</div>
          <div className="icon-box">
            <UserX size={24} />
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : filteredPersonas.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay personas registradas aún</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona: Empleado) => (
            <div key={persona.id} className="stat-card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                    {persona.firstName?.charAt(0)}{persona.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {persona.firstName} {persona.lastName}
                    </h3>
                    <span className={`badge ${persona.activo ? 'badge-green' : 'badge-red'} mt-1`}>
                      {persona.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(persona)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(persona.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span>{persona.email}</span>
                </div>
                {persona.telefonoEm && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{persona.telefonoEm}</span>
                  </div>
                )}
                {persona.sueldoEm && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span>${persona.sueldoEm.toLocaleString()}</span>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? '✏️ Editar Persona' : '👤 Crear Nueva Persona'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {editingId ? 'Modifica los datos de la persona' : 'Ingresa los datos del nuevo empleado'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                {!editingId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Usuario <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="username"
                          placeholder="ej. juan.perez"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contraseña <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="password"
                          name="password"
                          placeholder="••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre {!editingId && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <UserCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Nombre"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        required={!editingId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Apellido {!editingId && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <UserCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Apellido"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        required={!editingId}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="ej. juan@empresa.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="telefonoEm"
                        placeholder="+56 9 1234 5678"
                        value={formData.telefonoEm}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sueldo
                    </label>
                    <div className="relative">
                      <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="sueldoEm"
                        placeholder="0.00"
                        value={formData.sueldoEm}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="direccionEm"
                      placeholder="Dirección completa"
                      value={formData.direccionEm}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 bg-gray-50 hover:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <input
                    type="checkbox"
                    name="activo"
                    id="activo"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                  />
                  <label htmlFor="activo" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Usuario activo
                  </label>
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
                  {editingId ? 'Actualizar Persona' : 'Crear Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}