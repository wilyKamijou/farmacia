import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import Modal from '../ui/Modal';  // ← Importa el componente base

const CREATE_CLIENTE = gql`
  mutation CrearCliente($nombre: String!, $apellido: String!, $telefono: String) {
    crearCliente(
      nombre: $nombre
      apellido: $apellido
      telefono: $telefono
    ) {
      cliente {
        id
        nombre
        apellido
        telefono
      }
      ok
      mensaje
    }
  }
`;
// Solo agrega esto antes del componente
interface CrearClienteResponse {
  crearCliente: {
    ok: boolean;
    mensaje: string;
    cliente: {
      id: string;
      nombre: string;
      apellido: string;
      telefono: string;
    };
  };
}



interface ModalClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onClienteCreado: () => void;
}

const ModalCliente = ({ isOpen, onClose, onClienteCreado }: ModalClienteProps) => {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '' });
  const [crearCliente] = useMutation<CrearClienteResponse>(CREATE_CLIENTE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await crearCliente({
        variables: {
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono || null
        }
      });
      
      if (data?.crearCliente?.ok) {
        alert('Cliente creado');
        onClose();
        setFormData({ nombre: '', apellido: '', telefono: '' });
        onClienteCreado();
      }
    } catch (err) {
      alert('Error al crear cliente');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Cliente">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalCliente;