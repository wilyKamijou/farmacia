import { useState } from 'react';
import { Search, Package, Plus, Check } from 'lucide-react';

interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  categoria: {
    id: string;
    nombreCt: string;
  };
}

interface Almacen {
  id: string;
  nombreAm: string;
  direccionAm: string;
  descripcionAm?: string;
}

interface ProductoSeleccionado {
  id: string;
  productoId: string;
  nombrePr: string;
  nombreTc: string;
  almacenId: string;
  almacenNombre: string;
  cantidad: number;
}

interface ProductoSelectorProps {
  productos: Producto[];
  almacenes: Almacen[];
  categorias: { id: string; nombreCt: string }[];
  selectedCategoria: { id: string; nombreCt: string } | null;
  onAgregarProducto: (producto: Producto, almacen: Almacen, cantidad: number) => void;
  onNuevoProducto: () => void;
  onNuevoAlmacen: () => void;
}

const ProductoSelector = ({
  productos,
  almacenes,
  categorias,
  selectedCategoria,
  onAgregarProducto,
  onNuevoProducto,
  onNuevoAlmacen
}: ProductoSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);
  const [cantidad, setCantidad] = useState(1);

  const filteredProductos = productos.filter((p) => {
    const matchCategoria = selectedCategoria ? p.categoria.id === selectedCategoria.id : true;
    const matchSearch = p.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.nombreTc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const handleAgregar = () => {
    if (selectedProducto && selectedAlmacen && cantidad > 0) {
      onAgregarProducto(selectedProducto, selectedAlmacen, cantidad);
      setSelectedProducto(null);
      setSelectedAlmacen(null);
      setCantidad(1);
    }
  };

  return (
    <div className="selector-card producto-multiple">
      <div className="selector-header">
        <h2>Agregar Productos</h2>
        <button onClick={onNuevoProducto} className="btn-icon">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {selectedCategoria && (
        <p className="categoria-filtro">
          Filtrando por: <strong>{selectedCategoria.nombreCt}</strong>
        </p>
      )}

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="productos-lista">
        {filteredProductos.length === 0 ? (
          <p className="empty-message">No hay productos</p>
        ) : (
          filteredProductos.map((p) => (
            <div
              key={p.id}
              className={`producto-item ${selectedProducto?.id === p.id ? 'selected' : ''}`}
              onClick={() => setSelectedProducto(p)}
            >
              <Package size={18} />
              <div>
                <p className="item-titulo">{p.nombrePr}</p>
                <p className="item-subtitulo">{p.nombreTc}</p>
              </div>
              {selectedProducto?.id === p.id && <Check size={16} className="check-icon" />}
            </div>
          ))
        )}
      </div>

      {selectedProducto && (
        <div className="selector-acciones">
          <div className="almacen-select">
            <label>Almacén:</label>
            <div className="select-with-button">
              <select
                value={selectedAlmacen?.id || ''}
                onChange={(e) => setSelectedAlmacen(almacenes.find(a => a.id === e.target.value) || null)}
              >
                <option value="">Seleccionar almacén</option>
                {almacenes.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombreAm}</option>
                ))}
              </select>
              <button type="button" onClick={onNuevoAlmacen} className="btn-icon-small">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="cantidad-select">
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            />
          </div>

          <button
            onClick={handleAgregar}
            disabled={!selectedAlmacen}
            className="btn-agregar"
          >
            Agregar a la lista
          </button>
        </div>
      )}

      <style>{`
        .producto-multiple .productos-lista {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 1rem;
        }

        .producto-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .producto-item:hover {
          background-color: #f9fafb;
          border-color: #3b82f6;
        }

        .producto-item.selected {
          background-color: #eff6ff;
          border-color: #3b82f6;
        }

        .check-icon {
          margin-left: auto;
          color: #3b82f6;
        }

        .selector-acciones {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .almacen-select,
        .cantidad-select {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .almacen-select label,
        .cantidad-select label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          width: 60px;
        }

        .almacen-select select {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .cantidad-select input {
          width: 80px;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }

        .select-with-button {
          display: flex;
          flex: 1;
          gap: 0.5rem;
        }

        .btn-icon-small {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-icon-small:hover {
          background-color: #2563eb;
        }

        .btn-agregar {
          padding: 0.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }

        .btn-agregar:hover:not(:disabled) {
          background-color: #2563eb;
        }

        .btn-agregar:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
      
    </div>
  );
};

export default ProductoSelector;