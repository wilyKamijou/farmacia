import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
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
  categoria: {
    nombreCt: string;
  };
}

interface ClientesData {
  allClientes: Cliente[];
}

interface ProductosData {
  allProductos: Producto[];
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
      categoria {
        nombreCt
      }
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
  const [carrito, setCarrito] = useState<any[]>([]);
  const [descripcion, setDescripcion] = useState('');

  const { data: clientesData, refetch: refetchClientes } = useQuery<ClientesData>(GET_CLIENTES);
  const { data: productosData } = useQuery<ProductosData>(GET_PRODUCTOS);

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const agregarAlCarrito = (producto: any, almacen: any, cantidad: number, precio: number) => {
    const existe = carrito.find(item => item.productoId === producto.id);
    if (existe) {
      setCarrito(carrito.map(item =>
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id: Date.now(),
        productoId: producto.id,
        productoNombre: producto.nombre_pr,
        almacenId: almacen.id,
        cantidad,
        precio,
        stockDisponible: almacen.stock
      }]);
    }
  };

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

  const eliminarDelCarrito = (id: number) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const handleRegistrarVenta = async () => {
    if (!selectedCliente) {
      alert('Debes seleccionar un cliente');
      return;
    }
    if (carrito.length === 0) {
      alert('Debes agregar al menos un producto');
      return;
    }
    alert('Venta registrada exitosamente');
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
        </div>
      </div>
    </div>
  );
};