// src/components/inventario/StockForm.tsx
import { Package, Warehouse, RefreshCw } from 'lucide-react';

interface Producto {
  id: string;
  nombrePr: string;      // ← Cambiado de nombre_pr a nombrePr
  nombreTc: string;      // ← Cambiado de nombre_tc a nombreTc
}

interface Almacen {
  id: string;
  nombreAm: string;      // ← Cambiado de nombre_am a nombreAm
}

interface StockFormProps {
  producto: Producto | null;
  almacen: Almacen | null;
  cantidad: number;
  onCantidadChange: (cantidad: number) => void;
  onRegistrar: () => void;
}

const StockForm = ({ producto, almacen, cantidad, onCantidadChange, onRegistrar }: StockFormProps) => {
  const canSubmit = producto && almacen && cantidad > 0;

  return (
    <div className="stock-card">
      <h2>Registrar Stock</h2>

      <div className="stock-info">
        <div className="info-row">
          <Package size={18} />
          <span>Producto: {producto ? `${producto.nombrePr} (${producto.nombreTc})` : 'No seleccionado'}</span>
        </div>
        <div className="info-row">
          <Warehouse size={18} />
          <span>Almacén: {almacen ? almacen.nombreAm : 'No seleccionado'}</span>
        </div>
      </div>

      <div className="stock-cantidad">
        <label>Cantidad a agregar</label>
        <input
          type="number"
          min="1"
          value={cantidad}
          onChange={(e) => onCantidadChange(parseInt(e.target.value) || 1)}
          disabled={!producto || !almacen}
        />
      </div>

      <button
        onClick={onRegistrar}
        disabled={!canSubmit}
        className="btn-primary"
      >
        <RefreshCw size={18} /> Registrar Stock
      </button>

      {producto && almacen && (
        <p className="info-text">
          Al registrar, si el producto ya existe en este almacén, se sumará la cantidad al stock actual.
        </p>
      )}
    </div>
  );
};

export default StockForm;