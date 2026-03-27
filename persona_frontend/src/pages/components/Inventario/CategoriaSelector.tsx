import { Plus, Tag } from 'lucide-react';

interface Categoria {
  id: string;
  nombreCt: string;
  descripcionCt?: string;
}

interface CategoriaSelectorProps {
  categorias: Categoria[];
  selectedCategoria: Categoria | null;
  onSelectCategoria: (categoria: Categoria | null) => void;
  onNuevaCategoria: () => void;
}

const CategoriaSelector = ({
  categorias,
  selectedCategoria,
  onSelectCategoria,
  onNuevaCategoria
}: CategoriaSelectorProps) => {
  return (
    <div className="selector-card">
      <div className="selector-header">
        <h2>Categorías</h2>
        <button onClick={onNuevaCategoria} className="btn-icon">
          <Plus size={18} /> Nueva
        </button>
      </div>

      <div className="selector-lista">
        {categorias.length === 0 ? (
          <p className="empty-message">No hay categorías</p>
        ) : (
          <>
            <div
              className={`selector-item ${!selectedCategoria ? 'selected' : ''}`}
              onClick={() => onSelectCategoria(null)}
            >
              <Tag size={18} />
              <div>
                <p className="item-titulo">Todas las categorías</p>
              </div>
            </div>
            {categorias.map((c) => (
              <div
                key={c.id}
                className={`selector-item ${selectedCategoria?.id === c.id ? 'selected' : ''}`}
                onClick={() => onSelectCategoria(c)}
              >
                <Tag size={18} />
                <div>
                  <p className="item-titulo">{c.nombreCt}</p>
                  {c.descripcionCt && <p className="item-subtitulo">{c.descripcionCt}</p>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriaSelector;