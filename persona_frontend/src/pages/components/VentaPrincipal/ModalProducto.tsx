import { useState } from 'react';
import Modal from '../ui/Modal';

interface Almacen {
  id: string;
  nombreAm: string;
}

interface StockInfo {
  id: string;
  almacen: Almacen;
  stock: number;
}

interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  precio?: number;  // ← Precio opcional
}

interface ModalProductoProps {
  isOpen: boolean;
  producto: Producto | null;
  stockInfo: StockInfo[];
  onClose: () => void;
  onAgregar: (producto: Producto, almacen: Almacen, cantidad: number, precio: number) => void;
}

const ModalProducto = ({ isOpen, producto, stockInfo, onClose, onAgregar }: ModalProductoProps) => {
  const [cantidad, setCantidad] = useState<number>(1);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<Almacen | null>(null);

  if (!isOpen || !producto) return null;

  const handleAgregar = (): void => {
    if (!almacenSeleccionado) {
      alert('Selecciona un almacén');
      return;
    }
    if (cantidad < 1) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }
    
    const stockActual = stockInfo.find(s => s.almacen.id === almacenSeleccionado.id)?.stock || 0;
    if (cantidad > stockActual) {
      alert(`Stock insuficiente. Solo hay ${stockActual} unidades disponibles`);
      return;
    }
    
    const precioProducto = producto.precio || 0;
    onAgregar(producto, almacenSeleccionado, cantidad, precioProducto);
    onClose();
    setCantidad(1);
    setAlmacenSeleccionado(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Producto">
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-lg">{producto.nombrePr}</p>
          <p className="text-sm text-gray-500">{producto.nombreTc}</p>
          {producto.precio && (
            <p className="text-sm text-green-600 font-medium mt-1">
              Precio: Bs. {producto.precio.toFixed(2)}
            </p>
          )}
        </div>
        
        {stockInfo.length === 0 ? (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-center">
            ⚠️ No hay stock disponible de este producto
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Almacén</label>
              <select
                value={almacenSeleccionado?.id || ''}
                onChange={(e) => {
                  const selected = stockInfo.find(s => s.almacen.id === e.target.value);
                  setAlmacenSeleccionado(selected?.almacen || null);
                }}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar almacén</option>
                {stockInfo.map((stock) => (
                  <option key={stock.id} value={stock.almacen.id}>
                    {stock.almacen.nombreAm} - Stock: {stock.stock} unidades
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                max={stockInfo.find(s => s.almacen.id === almacenSeleccionado?.id)?.stock || 0}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Stock disponible: {stockInfo.find(s => s.almacen.id === almacenSeleccionado?.id)?.stock || 0} unidades
              </p>
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAgregar}
            disabled={stockInfo.length === 0 || !almacenSeleccionado}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalProducto;