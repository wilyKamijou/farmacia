import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';

const CREATE_CATEGORIA = gql`
  mutation CreateCategoria($nombreCt: String!, $descripcionCt: String) {
    crearCategoria(
      nombreCt: $nombreCt
      descripcionCt: $descripcionCt
    ) {
      categoria {
        id
        nombre_ct
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_CATEGORIA = gql`
  mutation UpdateCategoria($id: ID!, $nombreCt: String, $descripcionCt: String) {
    actualizarCategoria(
      id: $id
      nombreCt: $nombreCt
      descripcionCt: $descripcionCt
    ) {
      categoria {
        id
        nombre_ct
      }
      ok
      mensaje
    }
  }
`;

const DELETE_CATEGORIA = gql`
  mutation DeleteCategoria($id: ID!) {
    eliminarCategoria(id: $id) {
      ok
      mensaje
    }
  }
`;

interface Categoria {
  id: string;
  nombre_ct: string;
  descripcion_ct?: string;
}

interface TablaCategoriasProps {
  categorias: Categoria[];
  onRefetch: () => void;
}

const TablaCategorias = ({ categorias, onRefetch }: TablaCategoriasProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({ nombreCt: '', descripcionCt: '' });

  const [createCategoria] = useMutation(CREATE_CATEGORIA);
  const [updateCategoria] = useMutation(UPDATE_CATEGORIA);
  const [deleteCategoria] = useMutation(DELETE_CATEGORIA);

  const handleOpenModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditing(categoria);
      setFormData({
        nombreCt: categoria.nombre_ct,
        descripcionCt: categoria.descripcion_ct || ''
      });
    } else {
      setEditing(null);
      setFormData({ nombreCt: '', descripcionCt: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCategoria({ variables: { id: editing.id, ...formData } });
        alert('Categoría actualizada');
      } else {
        await createCategoria({ variables: formData });
        alert('Categoría creada');
      }
      setShowModal(false);
      onRefetch();
    } catch (err) {
      alert('Error al guardar');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Eliminar categoría "${nombre}"?`)) {
      try {
        await deleteCategoria({ variables: { id } });
        alert('Categoría eliminada');
        onRefetch();
      } catch (err) {
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Categorías</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre_ct}</td>
              <td>{c.descripcion_ct || '-'}</td>
              <td className="acciones">
                <button onClick={() => handleOpenModal(c)} className="btn-edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(c.id, c.nombre_ct)} className="btn-delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.nombreCt}
              onChange={(e) => setFormData({ ...formData, nombreCt: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={formData.descripcionCt}
              onChange={(e) => setFormData({ ...formData, descripcionCt: e.target.value })}
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

export default TablaCategorias;