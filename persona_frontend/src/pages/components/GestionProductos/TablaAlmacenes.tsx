import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';

const CREATE_ALMACEN = gql`
  mutation CreateAlmacen($nombreAm: String!, $direccionAm: String!, $descripcionAm: String) {
    crearAlmacen(
      nombreAm: $nombreAm
      direccionAm: $direccionAm
      descripcionAm: $descripcionAm
    ) {
      almacen {
        id
        nombre_am
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_ALMACEN = gql`
  mutation UpdateAlmacen($id: ID!, $nombreAm: String, $direccionAm: String, $descripcionAm: String) {
    actualizarAlmacen(
      id: $id
      nombreAm: $nombreAm
      direccionAm: $direccionAm
      descripcionAm: $descripcionAm
    ) {
      almacen {
        id
        nombre_am
      }
      ok
      mensaje
    }
  }
`;

const DELETE_ALMACEN = gql`
  mutation DeleteAlmacen($id: ID!) {
    eliminarAlmacen(id: $id) {
      ok
      mensaje
    }
  }
`;

interface Almacen {
  id: string;
  nombre_am: string;
  descripcion_am?: string;
  direccion_am: string;
}

interface TablaAlmacenesProps {
  almacenes: Almacen[];
  onRefetch: () => void;
}

const TablaAlmacenes = ({ almacenes, onRefetch }: TablaAlmacenesProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Almacen | null>(null);
  const [formData, setFormData] = useState({ nombreAm: '', direccionAm: '', descripcionAm: '' });

  const [createAlmacen] = useMutation(CREATE_ALMACEN);
  const [updateAlmacen] = useMutation(UPDATE_ALMACEN);
  const [deleteAlmacen] = useMutation(DELETE_ALMACEN);

  const handleOpenModal = (almacen?: Almacen) => {
    if (almacen) {
      setEditing(almacen);
      setFormData({
        nombreAm: almacen.nombre_am,
        direccionAm: almacen.direccion_am,
        descripcionAm: almacen.descripcion_am || ''
      });
    } else {
      setEditing(null);
      setFormData({ nombreAm: '', direccionAm: '', descripcionAm: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateAlmacen({ variables: { id: editing.id, ...formData } });
        alert('Almacén actualizado');
      } else {
        await createAlmacen({ variables: formData });
        alert('Almacén creado');
      }
      setShowModal(false);
      onRefetch();
    } catch (err) {
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Eliminar almacén "${nombre}"?`)) {
      try {
        await deleteAlmacen({ variables: { id } });
        alert('Almacén eliminado');
        onRefetch();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Almacenes</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={18} /> Nuevo Almacén
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {almacenes.map((a) => (
            <tr key={a.id}>
              <td>{a.nombre_am}</td>
              <td>{a.direccion_am}</td>
              <td>{a.descripcion_am || '-'}</td>
              <td className="acciones">
                <button onClick={() => handleOpenModal(a)} className="btn-edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(a.id, a.nombre_am)} className="btn-delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Almacén' : 'Nuevo Almacén'}>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.nombreAm}
              onChange={(e) => setFormData({ ...formData, nombreAm: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Dirección *</label>
            <input
              type="text"
              value={formData.direccionAm}
              onChange={(e) => setFormData({ ...formData, direccionAm: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcionAm}
              onChange={(e) => setFormData({ ...formData, descripcionAm: e.target.value })}
              rows={2}
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TablaAlmacenes;