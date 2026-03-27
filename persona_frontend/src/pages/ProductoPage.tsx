import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Search, Plus } from 'lucide-react';
import {
  Producto,
  Categoria,
  GetAllProductosResponse,
  GetAllCategoriasResponse,
  CreateProductoResponse,
  CreateProductoVariables,
  UpdateProductoResponse,
  UpdateProductoVariables,
  DeleteProductoResponse,
  DeleteProductoVariables
} from '../types/producto.types';
import ProductoModal from './components/Producto/ProductoModal';
import ProductoTable from './components/Producto/ProductoTable';
import './styles/ProductoPage.css';


// ==================== QUERIES ====================
const GET_ALL_PRODUCTOS = gql`
  query GetAllProductos {
    allProductos {
      id
      nombrePr
      nombreTc
      fechaFab
      fechaVenc
      descripcionPr
      concentracionQm
      composicionQm
      precio
      categoria {
        id
        nombreCt
      }
    }
  }
`;

const GET_ALL_CATEGORIAS = gql`
  query GetAllCategorias {
    allCategorias {
      id
      nombreCt
    }
  }
`;

const CREATE_PRODUCTO = gql`
  mutation CrearProducto(
    $nombrePr: String!
    $nombreTc: String!
    $fechaFab: Date!
    $fechaVenc: Date!
    $categoriaId: ID!
    $precio: Float!
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
      precio: $precio
      descripcionPr: $descripcionPr
      concentracionQm: $concentracionQm
      composicionQm: $composicionQm
    ) {
      producto {
        id
        nombrePr
        nombreTc
        fechaFab
        fechaVenc
        descripcionPr
        concentracionQm
        composicionQm
        precio
        categoria {
          id
          nombreCt
        }
      }
      ok
      mensaje
    }
  }
`;

const UPDATE_PRODUCTO = gql`
  mutation ActualizarProducto(
    $id: ID!
    $nombrePr: String
    $nombreTc: String
    $fechaFab: Date
    $fechaVenc: Date
    $categoriaId: ID
    $precio: Float
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
      precio: $precio
      descripcionPr: $descripcionPr
      concentracionQm: $concentracionQm
      composicionQm: $composicionQm
    ) {
      producto {
        id
        nombrePr
        nombreTc
        fechaFab
        fechaVenc
        descripcionPr
        concentracionQm
        composicionQm
        precio
        categoria {
          id
          nombreCt
        }
      }
      ok
      mensaje
    }
  }
`;

const DELETE_PRODUCTO = gql`
  mutation EliminarProducto($id: ID!) {
    eliminarProducto(id: $id) {
      ok
      mensaje
    }
  }
`;

export function ProductoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombrePr: '',
    nombreTc: '',
    fechaFab: '',
    fechaVenc: '',
    categoriaId: '',
    descripcionPr: '',
    concentracionQm: '',
    composicionQm: '',
    precio: 0
  });

  const { loading: loadingProductos, data: dataProductos, refetch } = useQuery<GetAllProductosResponse>(GET_ALL_PRODUCTOS);
  const { data: dataCategorias, loading: loadingCategorias } = useQuery<GetAllCategoriasResponse>(GET_ALL_CATEGORIAS);
  const [createProducto] = useMutation<CreateProductoResponse, CreateProductoVariables>(CREATE_PRODUCTO);
  const [updateProducto] = useMutation<UpdateProductoResponse, UpdateProductoVariables>(UPDATE_PRODUCTO);
  const [deleteProducto] = useMutation<DeleteProductoResponse, DeleteProductoVariables>(DELETE_PRODUCTO);

  const productos = dataProductos?.allProductos || [];
  const categorias: Categoria[] = dataCategorias?.allCategorias || [];
  
  const filteredProductos = productos.filter((p: Producto) =>
    p.nombrePr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nombreTc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === 'precio' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingId(producto.id);
      setFormData({
        nombrePr: producto.nombrePr,
        nombreTc: producto.nombreTc,
        fechaFab: producto.fechaFab,
        fechaVenc: producto.fechaVenc,
        categoriaId: producto.categoria.id,
        descripcionPr: producto.descripcionPr || '',
        concentracionQm: producto.concentracionQm || '',
        composicionQm: producto.composicionQm || '',
        precio: producto.precio || 0
      });
    } else {
      setEditingId(null);
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: '',
        precio: 0
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProducto({ 
          variables: { 
            id: editingId, 
            ...formData 
          } 
        });
      } else {
        await createProducto({ 
          variables: formData 
        });
      }
      setShowModal(false);
      setFormData({
        nombrePr: '',
        nombreTc: '',
        fechaFab: '',
        fechaVenc: '',
        categoriaId: '',
        descripcionPr: '',
        concentracionQm: '',
        composicionQm: '',
        precio: 0
      });
      setEditingId(null);
      refetch();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar producto');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProducto({ variables: { id } });
        refetch();
      } catch (err) {
        console.error('Error:', err);
        alert('Error al eliminar producto');
      }
    }
  };

  return (
    <div className="producto-page-container">
      <div className="producto-page-header">
        <h1 className="producto-page-title">Productos</h1>
        <p className="producto-page-subtitle">Gestiona todos los productos de la farmacia</p>
      </div>

      <div className="producto-search-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre comercial o técnico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={() => handleOpenModal()} className="btn-add">
          <Plus size={20} />
          Agregar Producto
        </button>
      </div>

      <ProductoTable
        productos={filteredProductos}
        loading={loadingProductos}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <ProductoModal
        isOpen={showModal}
        editingId={editingId}
        formData={formData}
        categorias={categorias}
        loadingCategorias={loadingCategorias}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}