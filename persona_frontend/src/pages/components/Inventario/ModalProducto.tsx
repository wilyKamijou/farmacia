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
    composicionQm: '',
    precio: ''  // String para el input
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar precio
    const precioNumerico = parseFloat(formData.precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      alert('El precio debe ser un número mayor a 0');
      return;
    }
    
    console.log('Precio a enviar:', precioNumerico);
    console.log('Tipo de precio:', typeof precioNumerico);
    
    // Enviar el precio como número
    onSave({
      nombrePr: formData.nombrePr,
      nombreTc: formData.nombreTc,
      fechaFab: formData.fechaFab,
      fechaVenc: formData.fechaVenc,
      categoriaId: formData.categoriaId,
      descripcionPr: formData.descripcionPr || undefined,
      concentracionQm: formData.concentracionQm || undefined,
      composicionQm: formData.composicionQm || undefined,
      precio: precioNumerico  // ← Enviar como número
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Producto">
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-row">
          <div className="form-group">
            <label>Nombre Comercial *</label>
            <input
              type="text"
              name="nombrePr"
              value={formData.nombrePr}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nombre Técnico *</label>
            <input
              type="text"
              name="nombreTc"
              value={formData.nombreTc}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Precio de Venta *</label>
          <input
            type="number"
            name="precio"
            value={formData.precio}
            onChange={handleInputChange}
            placeholder="Ej: 12.50"
            step="0.01"
            min="0"
            required
          />
          <small className="text-gray-500">Ingresa el precio en COP</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Fecha Fabricación *</label>
            <input
              type="date"
              name="fechaFab"
              value={formData.fechaFab}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha Vencimiento *</label>
            <input
              type="date"
              name="fechaVenc"
              value={formData.fechaVenc}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Categoría *</label>
          <select
            name="categoriaId"
            value={formData.categoriaId}
            onChange={handleInputChange}
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
            name="descripcionPr"
            value={formData.descripcionPr}
            onChange={handleInputChange}
            rows={2}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Concentración</label>
            <input
              type="text"
              name="concentracionQm"
              value={formData.concentracionQm}
              onChange={handleInputChange}
              placeholder="Ej: 500mg"
            />
          </div>
          <div className="form-group">
            <label>Composición</label>
            <input
              type="text"
              name="composicionQm"
              value={formData.composicionQm}
              onChange={handleInputChange}
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