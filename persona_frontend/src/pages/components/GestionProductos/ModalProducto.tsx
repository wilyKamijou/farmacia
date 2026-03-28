import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

interface Categoria {
  id: string;
  nombre_ct: string;
}

interface Producto {
  id?: string;
  nombre_pr: string;
  nombre_tc: string;
  fecha_fab: string;
  fecha_venc: string;
  descripcion_pr?: string;
  concentracion_qm?: string;
  composicion_qm?: string;
  precio?: number;  // 👈 AGREGAR precio al tipo Producto
  categoria?: { id: string };
}

interface ModalProductoProps {
  isOpen: boolean;
  producto: Producto | null;
  categorias: Categoria[];
  onClose: () => void;
  onSave: (data: any) => void;
}

const ModalProducto = ({ isOpen, producto, categorias, onClose, onSave }: ModalProductoProps) => {
  const [formData, setFormData] = useState({
    nombrePr: '',
    nombreTc: '',
    fechaFab: '',
    fechaVenc: '',
    categoriaId: '',
    descripcionPr: '',
    concentracionQm: '',
    composicionQm: '',
    precio: ''  // 👈 AGREGAR campo precio al estado
  });

  useEffect(() => {
    if (producto) {
      setFormData({
        nombrePr: producto.nombre_pr || '',
        nombreTc: producto.nombre_tc || '',
        fechaFab: producto.fecha_fab || '',
        fechaVenc: producto.fecha_venc || '',
        categoriaId: producto.categoria?.id || '',
        descripcionPr: producto.descripcion_pr || '',
        concentracionQm: producto.concentracion_qm || '',
        composicionQm: producto.composicion_qm || '',
        precio: producto.precio?.toString() || ''  // 👈 Cargar precio si existe
      });
    } else {
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: '',
        precio: ''  // 👈 Resetear precio
      });
    }
  }, [producto]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convertir precio a número antes de enviar
    onSave({
      ...formData,
      precio: parseFloat(formData.precio) || 0
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={producto ? 'Editar Producto' : 'Nuevo Producto'}>
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

        {/* 👈 NUEVO CAMPO DE PRECIO */}
        <div className="form-group">
          <label>Precio de Venta *</label>
          <input
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
            placeholder="Ej: 12.50"
            step="0.01"
            min="0"
            required
          />
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
              <option key={cat.id} value={cat.id}>{cat.nombre_ct}</option>
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
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalProducto;