import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';

const CREATE_PRODUCTO_ALMACEN = gql`
  mutation CreateProductoAlmacen($productoId: ID!, $almacenId: ID!, $stock: Int!) {
    crearProductoAlmacen(
      productoId: $productoId
      almacenId: $almacenId
      stock: $stock
    ) {
      productoAlmacen {
        id
        stock
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_STOCK = gql`
  mutation UpdateStock($id: ID!, $stock: Int!) {
    actualizarProductoAlmacen(id: $id, stock: $stock) {
      productoAlmacen {
        stock
      }
      ok
      mensaje
    }
  }
`;

const DELETE_PRODUCTO_ALMACEN = gql`
  mutation DeleteProductoAlmacen($id: ID!) {
    eliminarProductoAlmacen(id: $id) {
      ok
      mensaje
    }
  }
`;

interface StockItem {
  id: string;
  producto: {
    id: string;
    nombre_pr: string;
    nombre_tc: string;
  };
  almacen: {
    id: string;
    nombre_am: string;
  };
  stock: number;
}

interface Producto {
  id: string;
  nombre_pr: string;
  nombre_tc: string;
}

interface Almacen {
  id: string;
  nombre_am: string;
}

interface TablaProductoAlmacenProps {
  stock: StockItem[];
  productos: Producto[];
  almacenes: Almacen[];
  onRefetch: () => void;
}

const TablaProductoAlmacen = ({ stock, productos, almacenes, onRefetch }: TablaProductoAlmacenProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({ productoId: '', almacenId: '', stock: 0 });

  const [createProductoAlmacen] = useMutation(CREATE_PRODUCTO_ALMACEN);
  const [updateStock] = useMutation(UPDATE_STOCK);
  const [deleteProductoAlmacen] = useMutation(DELETE_PRODUCTO_ALMACEN);

  const handleOpenModal = (item?: StockItem) => {
    if (item) {
      setEditing(item);
      setFormData({
        productoId: item.producto.id,
        almacenId: item.almacen.id,
        stock: item.stock
      });
    } else {
      setEditing(null);
      setFormData({ productoId: '', almacenId: '', stock: 0 });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateStock({ variables: { id: editing.id, stock: formData.stock } });
        alert('Stock actualizado');
      } else {
        await createProductoAlmacen({ variables: formData });
        alert('Producto agregado al almacén');
      }
      setShowModal(false);
      onRefetch();
    } catch (err: any) {
      console.error('Error:', err);
      alert(err?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string, producto: string, almacen: string) => {
    if (confirm(`¿Eliminar "${producto}" del almacén "${almacen}"?`)) {
      try {
        await deleteProductoAlmacen({ variables: { id } });
        alert('Registro eliminado');
        onRefetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar');
      }
    }
  };

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Stock por Almacén</h2>
        <button onClick={() => handleOpenModal()} className="btn-primary">
          <Plus size={18} /> Agregar Producto a Almacén
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Almacén</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stock.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">No hay registros de stock</td>
            </tr>
          ) : (
            stock.map((s) => (
              <tr key={s.id}>
                <td>{s.producto.nombre_pr} ({s.producto.nombre_tc})</td>
                <td>{s.almacen.nombre_am}</td>
                <td>{s.stock}</td>
                <td className="acciones">
                  <button onClick={() => handleOpenModal(s)} className="btn-edit">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id, s.producto.nombre_pr, s.almacen.nombre_am)} 
                    className="btn-delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Stock' : 'Agregar Producto a Almacén'}>
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label>Producto *</label>
            <select
              value={formData.productoId}
              onChange={(e) => setFormData({ ...formData, productoId: e.target.value })}
              required
              disabled={!!editing}
            >
              <option value="">Seleccionar producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre_pr} ({p.nombre_tc})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Almacén *</label>
            <select
              value={formData.almacenId}
              onChange={(e) => setFormData({ ...formData, almacenId: e.target.value })}
              required
              disabled={!!editing}
            >
              <option value="">Seleccionar almacén</option>
              {almacenes.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre_am}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Stock *</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {editing ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TablaProductoAlmacen;