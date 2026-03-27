// src/components/inventario/AlmacenSelector.tsx
import { Plus, Warehouse } from 'lucide-react';

interface Almacen {
  id: string;
  nombreAm: string;      // ← Cambiado de nombre_am a nombreAm
  direccionAm: string;   // ← Cambiado de direccion_am a direccionAm
  descripcionAm?: string; // ← Cambiado de descripcion_am a descripcionAm
}

interface AlmacenSelectorProps {
  almacenes: Almacen[];
  selectedAlmacen: Almacen | null;
  onSelectAlmacen: (almacen: Almacen | null) => void;
  onNuevoAlmacen: () => void;
}

const AlmacenSelector = ({
  almacenes,
  selectedAlmacen,
  onSelectAlmacen,
  onNuevoAlmacen
}: AlmacenSelectorProps) => {
  return (
    <div className="selector-card">
      <div className="selector-header">
        <h2>Almacenes</h2>
        <button onClick={onNuevoAlmacen} className="btn-icon">
          <Plus size={18} /> Nuevo
        </button>
      </div>

      <div className="selector-lista">
        {almacenes.length === 0 ? (
          <p className="empty-message">No hay almacenes</p>
        ) : (
          almacenes.map((a) => (
            <div
              key={a.id}
              className={`selector-item ${selectedAlmacen?.id === a.id ? 'selected' : ''}`}
              onClick={() => onSelectAlmacen(a)}
            >
              <Warehouse size={18} />
              <div>
                <p className="item-titulo">{a.nombreAm}</p>           {/* ← Cambiado */}
                <p className="item-subtitulo">{a.direccionAm}</p>     {/* ← Cambiado */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlmacenSelector;