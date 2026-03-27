import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Plus, Edit, Trash2 } from 'lucide-react';
import ModalProducto from './ModalProducto';

const CREATE_PRODUCTO = gql`
  mutation CreateProducto(
    $nombrePr: String!
    $nombreTc: String!
    $fechaFab: Date!
    $fechaVenc: Date!
    $categoriaId: ID!
    $descripcionPr: String
    $concentracionQm: String
    $composicionQm: String
  ) {
    crearProducto(
      nombrePr: $nombrePr
      nombreTc: $nombreTc
      fechaFab: $fechaFab
      fechaVenc: $fechaVenc
      categoriaId: $categoriaId
      descripcionPr: $descripcionPr
      concentracionQm: $concentracionQm
      composicionQm: $composicionQm
    ) {
      producto {
        id
        nombre_pr
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_PRODUCTO = gql`
  mutation UpdateProducto(
    $id: ID!
    $nombrePr: String
    $nombreTc: String
    $fechaFab: Date
    $fechaVenc: Date
    $categoriaId: ID
    $descripcionPr: String
    $concentracionQm: String
    $composicionQm: String
  ) {
    actualizarProducto(
      id: $id
      nombrePr: $nombrePr
      nombreTc: $nombreTc
      fechaFab: $fechaFab
      fechaVenc: $fechaVenc
      categoriaId: $categoriaId
      descripcionPr: $descripcionPr
      concentracionQm: $concentracionQm
      composicionQm: $composicionQm
    ) {
      producto {
        id
        nombre_pr
      }
      ok
      mensaje
    }
  }
`;

const DELETE_PRODUCTO = gql`
  mutation DeleteProducto($id: ID!) {
    eliminarProducto(id: $id) {
      ok
      mensaje
    }
  }
`;

interface Producto {
  id: string;
  nombre_pr: string;
  nombre_tc: string;
  fecha_fab: string;
  fecha_venc: string;
  descripcion_pr?: string;
  concentracion_qm?: string;
  composicion_qm?: string;
  categoria: {
    id: string;
    nombre_ct: string;
  };
}

interface Categoria {
  id: string;
  nombre_ct: string;
}

interface TablaProductosProps {
  productos: Producto[];
  categorias: Categoria[];
  onRefetch: () => void;
}

const TablaProductos = ({ productos, categorias, onRefetch }: TablaProductosProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const [createProducto] = useMutation(CREATE_PRODUCTO);
  const [updateProducto] = useMutation(UPDATE_PRODUCTO);
  const [deleteProducto] = useMutation(DELETE_PRODUCTO);

  const handleSave = async (data: any) => {
    try {
      if (editingProducto) {
        await updateProducto({
          variables: { id: editingProducto.id, ...data }
        });
        alert('Producto actualizado');
      } else {
        await createProducto({ variables: data });
        alert('Producto creado');
      }
      setShowModal(false);
      setEditingProducto(null);
      onRefetch();
    } catch (err) {
      alert('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Eliminar producto "${nombre}"?`)) {
      try {
        await deleteProducto({ variables: { id } });
        alert('Producto eliminado');
        onRefetch();
      } catch (err) {
        alert('Error al eliminar producto');
      }
    }
  };

  return (
    <div className="tabla-container">
      <div className="tabla-header">
        <h2>Productos</h2>
        <button onClick={() => { setEditingProducto(null); setShowModal(true); }} className="btn-primary">
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Nombre Comercial</th>
            <th>Categoría</th>
            <th>Fabricación</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre_pr}</td>
              <td>{p.nombre_tc}</td>
              <td>{p.categoria?.nombre_ct}</td>
              <td>{p.fecha_fab}</td>
              <td>{p.fecha_venc}</td>
              <td className="acciones">
                <button onClick={() => { setEditingProducto(p); setShowModal(true); }} className="btn-edit">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(p.id, p.nombre_pr)} className="btn-delete">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ModalProducto
        isOpen={showModal}
        producto={editingProducto}
        categorias={categorias}
        onClose={() => {
          setShowModal(false);
          setEditingProducto(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};

export default TablaProductos;