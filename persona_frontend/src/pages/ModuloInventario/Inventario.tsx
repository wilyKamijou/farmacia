import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import ProductoSelector from '../components/Inventario/ProductoSelector';
import CategoriaSelector from '../components/Inventario/CategoriaSelector';
import AlmacenSelector from '../components/Inventario/AlmacenSelector';
import CarritoProductos from '../components/Inventario/CarritoProductos';
import TablaInventario from '../components/Inventario/TablaInventario';
import ModalProducto from '../components/Inventario/ModalProducto';
import ModalCategoria from '../components/Inventario/ModalCategoria';
import ModalAlmacen from '../components/Inventario/ModalAlmacen';
import './Inventario.css';
import './CarritoProductos.css';

// ==================== QUERIES ====================
const GET_CATEGORIAS = gql`
  query {
    allCategorias {
      id
      nombreCt
      descripcionCt
    }
  }
`;

const GET_ALMACENES = gql`
  query {
    allAlmacenes {
      id
      nombreAm
      direccionAm
      descripcionAm
    }
  }
`;

const GET_PRODUCTOS = gql`
  query {
    allProductos {
      id
      nombrePr
      nombreTc
      fechaFab
      fechaVenc
      descripcionPr
      concentracionQm
      composicionQm
      categoria {
        id
        nombreCt
      }
    }
  }
`;

const GET_PRODUCTOS_ALMACEN = gql`
  query {
    allProductosAlmacen {
      id
      producto {
        id
        nombrePr
        nombreTc
      }
      almacen {
        id
        nombreAm
      }
      stock
    }
  }
`;

// ==================== MUTACIONES ====================
const CREATE_CATEGORIA = gql`
  mutation CreateCategoria($nombreCt: String!, $descripcionCt: String) {
    crearCategoria(
      nombreCt: $nombreCt
      descripcionCt: $descripcionCt
    ) {
      categoria {
        id
        nombreCt
      }
      ok
      mensaje
    }
  }
`;

const CREATE_ALMACEN = gql`
  mutation CreateAlmacen($nombreAm: String!, $direccionAm: String!, $descripcionAm: String) {
    crearAlmacen(
      nombreAm: $nombreAm
      direccionAm: $direccionAm
      descripcionAm: $descripcionAm
    ) {
      almacen {
        id
        nombreAm
      }
      ok
      mensaje
    }
  }
`;

const CREATE_PRODUCTO = gql`
  mutation crearProducto(
    $nombrePr: String!
    $nombreTc: String!
    $fechaFab: Date!
    $fechaVenc: Date!
    $categoriaId: ID!
    $precio: Decimal!
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
        precio
      }
      ok
      mensaje
    }
  }
`;

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

const UPDATE_PRODUCTO_ALMACEN = gql`
  mutation UpdateProductoAlmacen($id: ID!, $stock: Int!) {
    actualizarProductoAlmacen(id: $id, stock: $stock) {
      productoAlmacen {
        stock
      }
      ok
      mensaje
    }
  }
`;

// ==================== TIPOS ====================
interface Categoria {
  id: string;
  nombreCt: string;
  descripcionCt?: string;
}

interface Almacen {
  id: string;
  nombreAm: string;
  direccionAm: string;
  descripcionAm?: string;
}

// Tipo simplificado para el selector
interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  categoria: {
    id: string;
    nombreCt: string;
  };
}

// Tipo completo para la base de datos
interface ProductoCompleto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  fechaFab: string;
  fechaVenc: string;
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
  categoria: {
    id: string;
    nombreCt: string;
  };
}

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

interface ProductoSeleccionado {
  id: string;
  productoId: string;
  nombrePr: string;
  nombreTc: string;
  almacenId: string;
  almacenNombre: string;
  cantidad: number;
}

// ==================== TIPOS PARA MUTACIONES ====================
interface CrearProductoResponse {
  crearProducto: {
    ok: boolean;
    mensaje: string;
    producto: {
      id: string;
      nombrePr: string;
    };
  };
}

interface CrearCategoriaResponse {
  crearCategoria: {
    ok: boolean;
    mensaje: string;
    categoria: {
      id: string;
      nombreCt: string;
    };
  };
}

interface CrearAlmacenResponse {
  crearAlmacen: {
    ok: boolean;
    mensaje: string;
    almacen: {
      id: string;
      nombreAm: string;
    };
  };
}

interface StockData {
  allProductosAlmacen: StockItem[];
}

interface CategoriasData {
  allCategorias: Categoria[];
}

interface AlmacenesData {
  allAlmacenes: Almacen[];
}

interface ProductosData {
  allProductos: ProductoCompleto[];  // Usa el tipo completo
}

// ==================== COMPONENTE PRINCIPAL ====================
export const Inventario = () => {
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [showModal, setShowModal] = useState<'producto' | 'categoria' | 'almacen' | null>(null);

  // Queries
  const { data: categoriasData, refetch: refetchCategorias } = useQuery<CategoriasData>(GET_CATEGORIAS);
  const { data: almacenesData, refetch: refetchAlmacenes } = useQuery<AlmacenesData>(GET_ALMACENES);
  const { data: productosData, refetch: refetchProductos } = useQuery<ProductosData>(GET_PRODUCTOS);
  const { data: stockData, refetch: refetchStock } = useQuery<StockData>(GET_PRODUCTOS_ALMACEN);

  // Mutations
const [createCategoria] = useMutation<CrearCategoriaResponse>(CREATE_CATEGORIA);
const [createAlmacen] = useMutation<CrearAlmacenResponse>(CREATE_ALMACEN);
const [createProducto] = useMutation<CrearProductoResponse>(CREATE_PRODUCTO);

  const [createProductoAlmacen] = useMutation(CREATE_PRODUCTO_ALMACEN);
  const [updateStock] = useMutation(UPDATE_PRODUCTO_ALMACEN);

  // Buscar stock existente
  const findExistingStock = (productoId: string, almacenId: string) => {
    return stockData?.allProductosAlmacen?.find(
      (s: StockItem) => s.producto.id === productoId && s.almacen.id === almacenId
    );
  };

  // Convierte ProductoCompleto a Producto
// Se elimina la variable no utilizada productosSimplificados para evitar warning TS6192.


  // Guardar categoría
  const handleSaveCategoria = async (data: any) => {
    try {
      await createCategoria({ variables: data });
      alert('Categoría creada');
      refetchCategorias();
      setShowModal(null);
    } catch (err) {
      alert('Error al crear categoría');
    }
  };

  // Guardar almacén
  const handleSaveAlmacen = async (data: any) => {
    try {
      await createAlmacen({ variables: data });
      alert('Almacén creado');
      refetchAlmacenes();
      setShowModal(null);
    } catch (err) {
      alert('Error al crear almacén');
    }
  };

  // Guardar producto
 const handleSaveProducto = async (data: any) => {
  console.log('=== DATOS A ENVIAR AL BACKEND ===');
  console.log(JSON.stringify(data, null, 2));
  console.log('Tipo de precio:', typeof data.precio);
  
  try {
    const { data: result } = await createProducto({ variables: data });
    console.log('Respuesta:', result);
    if (result?.crearProducto?.ok) {
      alert('Producto creado');
      refetchProductos();
      setShowModal(null);
    } else {
      alert(result?.crearProducto?.mensaje || 'Error al crear producto');
    }
  } catch (err) {
    console.error('Error detallado:', err);
    alert('Error al crear producto');
  }
};  

  // Elimina la variable nextId y usa esto en su lugar:

// Agregar producto a la lista
const handleAgregarProducto = (producto: Producto, almacen: Almacen, cantidad: number) => {
  const nuevoId = `${Date.now()}-${Math.random()}`;  // ID único garantizado
  
  setProductosSeleccionados(prev => [...prev, {
    id: nuevoId,
    productoId: producto.id,
    nombrePr: producto.nombrePr,
    nombreTc: producto.nombreTc,
    almacenId: almacen.id,
    almacenNombre: almacen.nombreAm,
    cantidad
  }]);
};

// Actualizar cantidad de un producto en la lista
const handleActualizarCantidad = (id: string, nuevaCantidad: number) => {
  setProductosSeleccionados(prev =>
    prev.map(p =>
      p.id === id ? { ...p, cantidad: Math.max(1, nuevaCantidad) } : p
    )
  );
};

// Eliminar producto de la lista
const handleEliminarProducto = (id: string) => {
  setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
};

// Registrar todos los productos de la lista
const handleRegistrarTodos = async () => {
  if (productosSeleccionados.length === 0) {
    alert('No hay productos para registrar');
    return;
  }

  let registrados = 0;
  let errores = 0;

  for (const item of productosSeleccionados) {
    const existing = findExistingStock(item.productoId, item.almacenId);

    try {
      if (existing) {
        const nuevoStock = existing.stock + item.cantidad;
        await updateStock({ variables: { id: existing.id, stock: nuevoStock } });
        console.log(`✅ Stock actualizado: ${item.nombrePr} +${item.cantidad}`);
      } else {
        await createProductoAlmacen({
          variables: {
            productoId: item.productoId,
            almacenId: item.almacenId,
            stock: item.cantidad
          }
        });
        console.log(`✅ Producto agregado: ${item.nombrePr}`);
      }
      registrados++;
    } catch (err) {
      console.error(`❌ Error con ${item.nombrePr}:`, err);
      errores++;
    }
  }

  alert(`Registro completado: ${registrados} registrados, ${errores} errores`);
  setProductosSeleccionados([]);  // Limpiar lista
  refetchStock();
};

  return (
    <div className="inventario-container">
      <h1 className="inventario-title">Gestión de Inventario</h1>

      <div className="inventario-grid">
        {/* Columna izquierda - Selectores */}
        <div className="inventario-col-left">
          <CategoriaSelector
            categorias={categoriasData?.allCategorias || []}
            selectedCategoria={selectedCategoria}
            onSelectCategoria={setSelectedCategoria}
            onNuevaCategoria={() => setShowModal('categoria')}
          />

          <ProductoSelector
            productos={productosData?.allProductos || []}
            almacenes={almacenesData?.allAlmacenes || []}
            categorias={categoriasData?.allCategorias || []}
            selectedCategoria={selectedCategoria}
            onAgregarProducto={handleAgregarProducto}
            onNuevoProducto={() => setShowModal('producto')}
            onNuevoAlmacen={() => setShowModal('almacen')}
          />
        </div>

        {/* Columna derecha - Lista de productos seleccionados */}
        <div className="inventario-col-right">
          <CarritoProductos
            productos={productosSeleccionados}
            onActualizarCantidad={handleActualizarCantidad}
            onEliminarProducto={handleEliminarProducto}
            onRegistrarTodos={handleRegistrarTodos}
          />
        </div>
      </div>

      {/* Tabla de inventario actual */}
      <TablaInventario
        stock={stockData?.allProductosAlmacen || []}
        onRefetch={refetchStock}
      />

      {/* Modales */}
      <ModalCategoria
        isOpen={showModal === 'categoria'}
        onClose={() => setShowModal(null)}
        onSave={handleSaveCategoria}
      />
      <ModalAlmacen
        isOpen={showModal === 'almacen'}
        onClose={() => setShowModal(null)}
        onSave={handleSaveAlmacen}
      />
      <ModalProducto
        isOpen={showModal === 'producto'}
        onClose={() => setShowModal(null)}
        categorias={categoriasData?.allCategorias || []}
        onSave={handleSaveProducto}
      />
    </div>
  );
};