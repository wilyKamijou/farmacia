import { Edit2, Trash2 } from 'lucide-react';
import { Producto } from '../../../types/producto.types';

interface ProductoTableProps {
  productos: Producto[];
  loading: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
}

const ProductoTable = ({ productos, loading, onEdit, onDelete }: ProductoTableProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8 text-center text-gray-500">Cargando productos...</div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8 text-center text-gray-500">No hay productos registrados aún</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre Comercial</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre Técnico</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Categoría</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Precio</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vencimiento</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{producto.nombrePr}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{producto.nombreTc}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{producto.categoria.nombreCt}</td>
              <td className="px-6 py-4 text-sm font-semibold text-green-600">
                Bs. {producto.precio?.toFixed(2) || '0.00'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(producto.fechaVenc).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(producto)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(producto.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductoTable;