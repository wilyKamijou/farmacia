import { Categoria, Producto } from '../../../types/producto.types';

interface ProductoModalProps {
  isOpen: boolean;
  editingId: string | null;
  formData: {
    nombrePr: string;
    nombreTc: string;
    fechaFab: string;
    fechaVenc: string;
    categoriaId: string;
    descripcionPr: string;
    concentracionQm: string;
    composicionQm: string;
    precio: number;
  };
  categorias: Categoria[];
  loadingCategorias: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

const ProductoModal = ({
  isOpen,
  editingId,
  formData,
  categorias,
  loadingCategorias,
  onInputChange,
  onSubmit,
  onClose
}: ProductoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white p-6 border rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {editingId ? 'Editar Producto' : 'Crear Nuevo Producto'}
        </h3>
        <form onSubmit={onSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Comercial *
              </label>
              <input
                type="text"
                name="nombrePr"
                placeholder="Nombre Comercial"
                value={formData.nombrePr}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Técnico *
              </label>
              <input
                type="text"
                name="nombreTc"
                placeholder="Nombre Técnico"
                value={formData.nombreTc}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                name="precio"
                placeholder="Precio del producto"
                value={formData.precio}
                onChange={onInputChange}
                step="0.1"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loadingCategorias}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombreCt}
                  </option>
                ))}
              </select>
              {loadingCategorias && (
                <p className="text-xs text-gray-500 mt-1">Cargando categorías...</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fabricación *
                </label>
                <input
                  type="date"
                  name="fechaFab"
                  value={formData.fechaFab}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Vencimiento *
                </label>
                <input
                  type="date"
                  name="fechaVenc"
                  value={formData.fechaVenc}
                  onChange={onInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Concentración
              </label>
              <input
                type="text"
                name="concentracionQm"
                placeholder="Ej: 500mg"
                value={formData.concentracionQm}
                onChange={onInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
             
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                name="descripcionPr"
                placeholder="Descripción del producto"
                value={formData.descripcionPr}
                onChange={onInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductoModal;