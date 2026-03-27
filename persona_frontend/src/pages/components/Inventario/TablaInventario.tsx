import { Package, Warehouse } from 'lucide-react';

interface StockItem {
  id: string;
  producto: {
    id: string;
    nombrePr: string;
    nombreTc: string;
  };
  almacen: {
    id: string;
    nombreAm: string;
  };
  stock: number;
}

interface TablaInventarioProps {
  stock: StockItem[];
  onRefetch: () => void;
}

const TablaInventario = ({ stock }: TablaInventarioProps) => {
  return (
    <div className="tabla-inventario">
      <h2>Inventario Actual</h2>
      <div className="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Almacén</th>
              <th>Stock</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">No hay registros de inventario</td>
              </tr>
            ) : (
              stock.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="producto-info">
                      <Package size={16} />
                      <span>{item.producto.nombrePr} ({item.producto.nombreTc})</span>
                    </div>
                  </td>
                  <td>
                    <div className="almacen-info">
                      <Warehouse size={16} />
                      <span>{item.almacen.nombreAm}</span>
                    </div>
                  </td>
                  <td className="stock-cantidad">{item.stock}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaInventario;