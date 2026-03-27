import { Plus, Minus, Trash2, Save } from 'lucide-react';

interface ProductoSeleccionado {
  id: string;
  productoId: string;
  nombrePr: string;
  nombreTc: string;
  almacenId: string;
  almacenNombre: string;
  cantidad: number;
}

interface CarritoProductosProps {
  productos: ProductoSeleccionado[];
  onActualizarCantidad: (id: string, cantidad: number) => void;
  onEliminarProducto: (id: string) => void;
  onRegistrarTodos: () => void;
}

const CarritoProductos = ({
  productos,
  onActualizarCantidad,
  onEliminarProducto,
  onRegistrarTodos
}: CarritoProductosProps) => {
  if (productos.length === 0) {
    return (
      <div className="carrito-vacio">
        <p>No hay productos seleccionados</p>
        <p className="text-sm text-gray-500">Selecciona productos y almacenes para agregar stock</p>
      </div>
    );
  }

  const totalProductos = productos.length;

  return (
    <div className="carrito-productos">
      <div className="carrito-header">
        <h3>Productos a Registrar ({totalProductos})</h3>
        <button onClick={onRegistrarTodos} className="btn-registrar-todos">
          <Save size={18} /> Registrar Todos
        </button>
      </div>

      <div className="carrito-lista">
        {productos.map((item) => (
          <div key={item.id} className="carrito-item">
            <div className="carrito-item-info">
              <p className="carrito-item-nombre">{item.nombrePr}</p>
              <p className="carrito-item-desc">{item.nombreTc}</p>
              <p className="carrito-item-almacen">Almacén: {item.almacenNombre}</p>
            </div>
            <div className="carrito-item-cantidad">
              <button
                onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}
                className="cantidad-btn"
                disabled={item.cantidad <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="cantidad-valor">{item.cantidad}</span>
              <button
                onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}
                className="cantidad-btn"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              onClick={() => onEliminarProducto(item.id)}
              className="carrito-item-eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>


    </div>
  );
};

export default CarritoProductos;