import { useState } from 'react';
import Modal from '../ui/Modal';

interface ModalAlmacenProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ModalAlmacen = ({ isOpen, onClose, onSave }: ModalAlmacenProps) => {
  const [formData, setFormData] = useState({ nombreAm: '', direccionAm: '', descripcionAm: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Almacén">
      <form onSubmit={handleSubmit} className="modal-form">
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
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalAlmacen;