import { Plus, Minus, Trash2, Save } from 'lucide-react';

interface CarritoItem {
  id: number;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precio: number;
  stockDisponible: number;
}

interface CarritoComprasProps {
  carrito: CarritoItem[];
  total: number;
  descripcion: string;
  onDescripcionChange: (desc: string) => void;
  onActualizarCantidad: (id: number, cantidad: number) => void;
  onEliminarProducto: (id: number) => void;
  onRegistrarVenta: () => void;
}

const CarritoCompras = ({
  carrito,
  total,
  descripcion,
  onDescripcionChange,
  onActualizarCantidad,
  onEliminarProducto,
  onRegistrarVenta
}: CarritoComprasProps) => {
  return (
    <div className="carrito">
      <h2 className="carrito-title">Carrito de Compras</h2>
      
      {carrito.length === 0 ? (
        <p className="carrito-vacio">No hay productos agregados</p>
      ) : (
        <>
          <div className="carrito-lista">
            {carrito.map((item) => (
              <div key={item.id} className="carrito-item">
                <div className="carrito-item-info">
                  <p className="carrito-item-nombre">{item.productoNombre}</p>
                  <div className="carrito-item-cantidad">
                    <button
                      onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}
                      className="carrito-cantidad-btn"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="carrito-cantidad-valor">{item.cantidad}</span>
                    <button
                      onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}
                      className="carrito-cantidad-btn"
                    >
                      <Plus size={14} />
                    </button>
                    <span className="carrito-item-precio-unitario">
                      x Q{item.precio.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="carrito-item-acciones">
                  <p className="carrito-item-total">Q{(item.precio * item.cantidad).toFixed(2)}</p>
                  <button
                    onClick={() => onEliminarProducto(item.id)}
                    className="carrito-item-eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="carrito-footer">
            <div className="carrito-total">
              <span className="carrito-total-label">Total:</span>
              <span className="carrito-total-valor">Q{total.toFixed(2)}</span>
            </div>
            
            <textarea
              placeholder="Observaciones (opcional)"
              value={descripcion}
              onChange={(e) => onDescripcionChange(e.target.value)}
              className="carrito-observaciones"
              rows={2}
            />
            
            <button
              onClick={onRegistrarVenta}
              className="carrito-registrar-btn"
            >
              <Save size={20} />
              Registrar Venta
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CarritoCompras;