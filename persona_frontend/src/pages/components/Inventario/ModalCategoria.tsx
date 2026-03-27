import { useState } from 'react';
import Modal from '../ui/Modal';

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ModalCategoria = ({ isOpen, onClose, onSave }: ModalCategoriaProps) => {
  const [formData, setFormData] = useState({ nombreCt: '', descripcionCt: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Categoría">
      <form onSubmit={handleSubmit} className="modal-form">
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
            rows={3}
          />
        </div>
        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalCategoria;