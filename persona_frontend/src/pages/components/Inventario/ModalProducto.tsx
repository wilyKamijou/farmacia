import { useState } from 'react';
import Modal from '../ui/Modal';

interface Categoria {
  id: string;
  nombreCt: string;
}

interface ModalProductoProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: Categoria[];
  onSave: (data: any) => void;
}

const ModalProducto = ({ isOpen, onClose, categorias, onSave }: ModalProductoProps) => {
  const [formData, setFormData] = useState({
    nombrePr: '',
    nombreTc: '',
    fechaFab: '',
    fechaVenc: '',
    categoriaId: '',
    descripcionPr: '',
    concentracionQm: '',
    composicionQm: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Producto">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              value={formData.nombrePr}
              onChange={(e) => setFormData({ ...formData, nombrePr: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre Comercial *</label>
            <input
              type="text"
              value={formData.nombreTc}
              onChange={(e) => setFormData({ ...formData, nombreTc: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha Fabricación *</label>
            <input
              type="date"
              value={formData.fechaFab}
              onChange={(e) => setFormData({ ...formData, fechaFab: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha Vencimiento *</label>
            <input
              type="date"
              value={formData.fechaVenc}
              onChange={(e) => setFormData({ ...formData, fechaVenc: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <select
            value={formData.categoriaId}
            onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
            required
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nombreCt}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            value={formData.descripcionPr}
            onChange={(e) => setFormData({ ...formData, descripcionPr: e.target.value })}
            rows={2}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Concentración</label>
            <input
              type="text"
              value={formData.concentracionQm}
              onChange={(e) => setFormData({ ...formData, concentracionQm: e.target.value })}
              placeholder="Ej: 500mg"
            />
          </div>
          <div className="form-group">
            <label>Composición</label>
            <input
              type="text"
              value={formData.composicionQm}
              onChange={(e) => setFormData({ ...formData, composicionQm: e.target.value })}
              placeholder="Ej: Paracetamol"
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button type="submit">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalProducto;