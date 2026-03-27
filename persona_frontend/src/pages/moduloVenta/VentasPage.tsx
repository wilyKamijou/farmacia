import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ClienteSelector from '../components/VentaPrincipal/ClienteSelector';
import ProductoSelector from '../components/VentaPrincipal/ProductoSelector';
import CarritoCompras from '../components/VentaPrincipal/CarritoCompras';
import '../styles/VentaPage.css';

// ==================== TIPOS ====================
interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  precio?: number;
  categoria: {
    nombreCt: string;
  };
}

interface CarritoItem {
  id: number;
  productoId: string;
  productoNombre: string;
  almacenId: string;
  productoAlmacenId: string;
  cantidad: number;
  precio: number;
  stockDisponible: number;
}

interface ClientesData {
  allClientes: Cliente[];
}

interface ProductosData {
  allProductos: Producto[];
}

// ==================== TIPOS PARA MUTACIONES ====================
interface CrearVentaResponse {
  crearVenta: {
    venta: {
      id: string;
      fechaVe: string;
      montoTotalVe: number;
    };
    ok: boolean;
    mensaje: string;
  };
}

interface CrearDetalleVentaResponse {
  crearDetalleVenta: {
    detalleVenta: {
      id: string;
    };
    ok: boolean;
    mensaje: string;
  };
}

interface CrearVentaVariables {
  clienteId: string;
  empleadoId: string;
  montoTotalVe: number;
  descripcion?: string | null;
}

interface CrearDetalleVentaVariables {
  ventaId: string;
  productoId: string;
  almacenId: string;
  cantidadDv: number;
  precioDv: number;
}

interface UpdateStockResponse {
  actualizarProductoAlmacen: {
    productoAlmacen: {
      stock: number;
    };
    ok: boolean;
    mensaje: string;
  };
}

interface UpdateStockVariables {
  id: string;
  stock: number;
}

// ==================== QUERIES ====================
const GET_CLIENTES = gql`
  query {
    allClientes {
      id
      nombre
      apellido
      telefono
    }
  }
`;

const GET_PRODUCTOS = gql`
  query {
    allProductos {
      id
      nombrePr
      nombreTc
      precio
      categoria {
        nombreCt
      }
    }
  }
`;

// ==================== MUTACIONES ====================
const CREATE_VENTA = gql`
  mutation CreateVenta(
    $clienteId: ID!
    $empleadoId: ID!
    $montoTotalVe: Decimal!
    $descripcion: String
  ) {
    crearVenta(
      clienteId: $clienteId
      empleadoId: $empleadoId
      montoTotalVe: $montoTotalVe
      descripcion: $descripcion
    ) {
      venta {
        id
        fechaVe
        montoTotalVe
      }
      ok
      mensaje
    }
  }
`;

const CREATE_DETALLE_VENTA = gql`
  mutation CreateDetalleVenta(
    $ventaId: ID!
    $productoId: ID!
    $almacenId: ID!
    $cantidadDv: Int!
    $precioDv: Decimal!
  ) {
    crearDetalleVenta(
      ventaId: $ventaId
      productoId: $productoId
      almacenId: $almacenId
      cantidadDv: $cantidadDv
      precioDv: $precioDv
    ) {
      detalleVenta {
        id
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

// ==================== COMPONENTE PRINCIPAL ====================
export const VentasPage = () => {
  // ✅ Verificar useAuth
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    console.error('Error en useAuth:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error de Autenticación</h1>
        <p className="mt-4">No se puede acceder al contexto de autenticación.</p>
      </div>
    );
  }

  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: clientesData, refetch: refetchClientes } = useQuery<ClientesData>(GET_CLIENTES);
  const { data: productosData } = useQuery<ProductosData>(GET_PRODUCTOS);
  
  // Mutations
  const [createVenta] = useMutation<CrearVentaResponse, CrearVentaVariables>(CREATE_VENTA);
  const [createDetalleVenta] = useMutation<CrearDetalleVentaResponse, CrearDetalleVentaVariables>(CREATE_DETALLE_VENTA);
  const [updateStock] = useMutation<UpdateStockResponse, UpdateStockVariables>(UPDATE_STOCK);

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: any, almacen: any, cantidad: number, precio: number) => {
    console.log('➕ Producto recibido:', producto);
    console.log('🏪 Almacen recibido:', almacen);
    
    const existe = carrito.find(item => item.productoId === producto.id);
    
    if (existe) {
      setCarrito(carrito.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      const nuevoItem: CarritoItem = {
        id: Date.now(),
        productoId: producto.id,
        productoNombre: producto.nombrePr,
        almacenId: almacen.id,
        productoAlmacenId: almacen.idRegistro,
        cantidad,
        precio,
        stockDisponible: almacen.stock
      };
      console.log('🛒 Nuevo item:', nuevoItem);
      setCarrito([...carrito, nuevoItem]);
    }
  };

  // Actualizar cantidad en el carrito
  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    const item = carrito.find(i => i.id === id);
    if (item && nuevaCantidad > item.stockDisponible) {
      alert(`Stock insuficiente. Solo hay ${item.stockDisponible} unidades disponibles`);
      return;
    }
    setCarrito(carrito.map(item =>
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Registrar venta
  const handleRegistrarVenta = async () => {
    if (!selectedCliente) {
      alert('Debes seleccionar un cliente');
      return;
    }
    if (carrito.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }
    if (!user?.id) {
      alert('Error: Usuario no identificado');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Crear la venta
      const { data: ventaData } = await createVenta({
        variables: {
          clienteId: selectedCliente.id,
          empleadoId: user.id,
          montoTotalVe: total,
          descripcion: descripcion || null
        }
      });

      if (!ventaData?.crearVenta?.ok) {
        alert(ventaData?.crearVenta?.mensaje || 'Error al crear la venta');
        setLoading(false);
        return;
      }

      const ventaId = ventaData.crearVenta.venta.id;
      let errores = 0;
      let stockActualizado = 0;

      // 2. Crear los detalles de venta y actualizar stock
      for (const item of carrito) {
        try {
          // Crear detalle de venta
          await createDetalleVenta({
            variables: {
              ventaId: ventaId,
              productoId: item.productoId,
              almacenId: item.almacenId,
              cantidadDv: item.cantidad,
              precioDv: item.precio
            }
          });

          // Actualizar stock (restar la cantidad vendida)
          const nuevoStock = item.stockDisponible - item.cantidad;
          
          await updateStock({
            variables: {
              id: item.productoAlmacenId,
              stock: nuevoStock
            }
          });
          
          stockActualizado++;
          
        } catch (err) {
          console.error(`Error al procesar ${item.productoNombre}:`, err);
          errores++;
        }
      }

      if (errores === 0) {
        alert(`✅ Venta #${ventaId} registrada exitosamente\n📦 Stock actualizado: ${stockActualizado} productos`);
        setCarrito([]);
        setSelectedCliente(null);
        setDescripcion('');
      } else {
        alert(`⚠️ Venta registrada con ${errores} errores en los detalles`);
      }
      
    } catch (err) {
      console.error('Error al registrar venta:', err);
      alert('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ventas-container">
      <div className="ventas-header">
        <h1 className="ventas-title">
          <ShoppingCart className="ventas-title-icon" />
          Nueva Venta
        </h1>
        <div className="ventas-empleado">
          Empleado: {user?.firstName} {user?.lastName}
        </div>
      </div>

      <div className="ventas-grid">
        <div className="ventas-col-left">
          <ClienteSelector
            clientes={clientesData?.allClientes || []}
            selectedCliente={selectedCliente}
            onSelectCliente={setSelectedCliente}
            onClienteCreado={refetchClientes}
          />
          
          <ProductoSelector
            productos={productosData?.allProductos || []}
            onAgregarProducto={agregarAlCarrito}
          />
        </div>

        <div className="ventas-col-right">
          <CarritoCompras
            carrito={carrito}
            total={total}
            descripcion={descripcion}
            onDescripcionChange={setDescripcion}
            onActualizarCantidad={actualizarCantidad}
            onEliminarProducto={eliminarDelCarrito}
            onRegistrarVenta={handleRegistrarVenta}
          />
          {loading && (
            <div className="text-center mt-4">
              <p className="text-blue-600">Registrando venta...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};