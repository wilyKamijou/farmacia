import { Plus, Edit2, Trash2, Search } from 'lucide-react';
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
        direccionEm: '',
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personas</h1>
        <p className="text-gray-600">Gestiona todas las personas registradas en el sistema</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus size={20} />
            Agregar Persona
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Teléfono</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sueldo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : filteredPersonas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay personas registradas aún
                </td>
              </tr>
            ) : (
              filteredPersonas.map((persona: Empleado) => (
                <tr key={persona.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{persona.firstName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{persona.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{persona.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{persona.telefonoEm || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    ${persona.sueldoEm?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      persona.activo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {persona.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(persona)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(persona.id)}
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
          <div className="bg-white p-6 border rounded-lg shadow-lg w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Editar Persona' : 'Crear Nueva Persona'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                {!editingId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                      <input
                        type="text"
                        name="username"
                        placeholder="Usuario"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editingId}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!editingId}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Nombre"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    name="telefonoEm"
                    placeholder="Teléfono"
                    value={formData.telefonoEm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sueldo</label>
                  <input
                    type="number"
                    name="sueldoEm"
                    placeholder="Sueldo"
                    value={formData.sueldoEm}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
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
