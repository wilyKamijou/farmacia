import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Search, Package } from 'lucide-react';
import ModalProducto from './ModalProducto';

// ==================== TIPOS ====================
interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  categoria: {
    nombreCt: string;
  };
}

interface ProductoSelectorProps {
  productos: Producto[];
  onAgregarProducto: (producto: any, almacen: any, cantidad: number, precio: number) => void;
}

// ✅ Tipado para la respuesta del stock
interface StockResponse {
  productosAlmacenPorProducto: {
    id: string;
    almacen: {
      id: string;
      nombreAm: string;
    };
    stock: number;
  }[];
}

// ==================== QUERY ====================
const GET_STOCK_PRODUCTO = gql`
  query GetStock($productoId: ID!) {
    productosAlmacenPorProducto(productoId: $productoId) {
      id
      almacen {
        id
        nombre_am
      }
      stock
    }
  }
`;

// ==================== COMPONENTE ====================
const ProductoSelector = ({ productos, onAgregarProducto }: ProductoSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<any>(null);
  
  // ✅ Query tipada
  const { data: stockData, refetch: refetchStock } = useQuery<StockResponse>(GET_STOCK_PRODUCTO, {
    variables: { productoId: selectedProducto?.id || '' },
    skip: !selectedProducto
  });

  const filteredProductos = productos.filter((producto: Producto) =>
    producto.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.nombreTc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProducto = (producto: Producto) => {
    setSelectedProducto(producto);
    refetchStock({ productoId: producto.id });
    setShowModal(true);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Agregar Productos</h2>
      
      {/* Buscador */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar producto por nombre o nombre comercial..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Lista de productos */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredProductos.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No se encontraron productos</p>
        ) : (
          filteredProductos.slice(0, 10).map((producto: Producto) => (
            <div
              key={producto.id}
              onClick={() => handleSelectProducto(producto)}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <Package className="text-gray-400 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-800">{producto.nombrePr}</p>
                  <p className="text-sm text-gray-500">{producto.nombreTc}</p>
                  <p className="text-xs text-gray-400">{producto.categoria?.nombreCt}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para seleccionar cantidad y almacén */}
      <ModalProducto
        isOpen={showModal}
        producto={selectedProducto}
        stockInfo={stockData?.productosAlmacenPorProducto || []}
        onClose={() => {
          setShowModal(false);
          setSelectedProducto(null);
        }}
        onAgregar={onAgregarProducto}
      />
    </div>
  );
};

export default ProductoSelector;