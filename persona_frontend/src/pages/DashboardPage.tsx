// src/pages/DashboardPage.tsx
import { Users, UserCheck, UserCog, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  GetTotalesUsuariosResponse,
  GetProductosProximoVencimientoResponse,
  GetReporteCompletoResponse,
  GetVentasPorMesResponse
} from '../types/dashboard.types';

// ==================== QUERIES ====================
const GET_TOTALES_USUARIOS = gql`
  query GetTotalesUsuarios {
    totalesUsuarios {
      totalClientes
      totalEmpleados
      empleadosActivos
    }
  }
`;

// ✅ Añadir campo categoria
const GET_PRODUCTOS_PROXIMO_VENCIMIENTO = gql`
  query GetProductosProximoVencimiento($dias: Int!) {
    productosProximoVencimiento(dias: $dias) {
      id
      nombreComercial
      nombreTecnico
      fechaFabricacion
      fechaVencimiento
      diasFaltantes
      categoria
      stockTotal
      porcentajeUrgencia
      almacenes {
        almacenNombre
        stock
      }
    }
  }
`;

const GET_REPORTE_COMPLETO = gql`
  query GetReporteCompleto {
    reporteCompleto {
      usuarios {
        totalClientes
        totalEmpleados
        empleadosActivos
      }
      inventario {
        totalProductos
        totalCategorias
        totalAlmacenes
        stockTotal
      }
      productosProximoVencer {
        id
        nombreComercial
        nombreTecnico
        fechaFabricacion
        fechaVencimiento
        diasFaltantes
        categoria
        stockTotal
        porcentajeUrgencia
        almacenes {
          almacenNombre
          stock
        }
      }
    }
  }
`;

const GET_VENTAS_POR_MES = gql`
  query GetVentasPorMes($fechaInicio: String, $fechaFin: String) {
    ventasPorMes(fechaInicio: $fechaInicio, fechaFin: $fechaFin) {
      mes
      ano
      totalVentas
      cantidadVendida
      cantidadArticulos
      promedioVenta
    }
  }
`;

// ✅ Función segura para formatear fechas
const formatDateSafe = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES');
  } catch (error) {
    return '-';
  }
};

export function DashboardPage() {
  // Usar reporte completo para tener todos los datos
  const { data: dataReporte, loading: loadingReporte, error: reporteError } = 
    useQuery<GetReporteCompletoResponse>(GET_REPORTE_COMPLETO);
  
  // También podemos mantener las queries individuales como respaldo
  const { data: dataTotales, loading: loadingTotales } = 
    useQuery<GetTotalesUsuariosResponse>(GET_TOTALES_USUARIOS);
  
  const { data: dataProductos, loading: loadingProductos, error: productosError } = 
    useQuery<GetProductosProximoVencimientoResponse>(
      GET_PRODUCTOS_PROXIMO_VENCIMIENTO,
      { variables: { dias: 90 } }
    );

  const { data: dataVentas, loading: loadingVentas, error: ventasError } = 
    useQuery<GetVentasPorMesResponse>(GET_VENTAS_POR_MES, {
      variables: {
        fechaInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        fechaFin: new Date().toISOString().split('T')[0]
      }
    });

  // Usar datos del reporte completo si está disponible, sino usar las queries individuales
  const totales = dataReporte?.reporteCompleto?.usuarios || dataTotales?.totalesUsuarios;
  const productosProximos = dataReporte?.reporteCompleto?.productosProximoVencer || 
                            dataProductos?.productosProximoVencimiento || [];

  const cards = [
    {
      title: 'Productos',
      description: 'Productos dentro del sistema',
      icon: Users,
      link: '/dashboard/productos',
      color: 'from-blue-500 to-blue-600',
      accent: 'blue'
    },
    {
      title: 'Clientes',
      description: 'Clientes sin acceso de login',
      icon: UserCheck,
      link: '/dashboard/clientes',
      color: 'from-green-500 to-green-600',
      accent: 'green'
    },
    {
      title: 'Empleados',
      description: 'Personal con acceso al sistema',
      icon: UserCog,
      link: '/dashboard/empleados',
      color: 'from-purple-500 to-purple-600',
      accent: 'purple'
    },
  ];

  // Manejar errores
  if (reporteError || productosError || ventasError) {
    console.error('Error en queries:', { reporteError, productosError, ventasError });
  }

  return (
    <div className="p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Control</h1>
        <p className="text-gray-600 text-lg">Bienvenido a tu sistema de gestión de farmacia</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link}>
              <div className="h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 overflow-hidden cursor-pointer">
                <div className={`h-32 bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon size={48} className="text-white" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className={`text-sm font-semibold text-${card.accent}-600`}>
                      Ir a {card.title} →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <BarChart3 size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Resumen Rápido</h2>
        </div>
        
        {loadingTotales && !totales ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Clientes</p>
              <p className="text-3xl font-bold text-gray-900">
                {totales?.totalClientes ?? 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Empleados</p>
              <p className="text-3xl font-bold text-gray-900">
                {totales?.totalEmpleados ?? 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <p className="text-gray-600 text-sm font-medium mb-2">Empleados Activos</p>
              <p className="text-3xl font-bold text-gray-900">
                {totales?.empleadosActivos ?? 0}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reporte de Productos Próximos a Vencer */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-4 mb-6">
          <AlertCircle size={28} className="text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Productos Próximos a Vencer (90 días)</h2>
        </div>

        {loadingProductos && productosProximos.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Cargando reporte...</p>
          </div>
        ) : productosProximos.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600">✓ No hay productos próximos a vencer en los próximos 90 días</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre Técnico</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Categoría</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Fabricación</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Vencimiento</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Días</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Urgencia</th>
                </tr>
              </thead>
              <tbody>
                {productosProximos.map((producto) => (
                  <tr key={producto.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {producto.nombreComercial || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {producto.nombreTecnico || '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {producto.categoria || '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {formatDateSafe(producto.fechaFabricacion)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {formatDateSafe(producto.fechaVencimiento)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        producto.diasFaltantes <= 30 
                          ? 'bg-red-100 text-red-800' 
                          : producto.diasFaltantes <= 60 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {producto.diasFaltantes} días
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {producto.stockTotal ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              (producto.porcentajeUrgencia || 0) > 75
                                ? 'bg-red-500'
                                : (producto.porcentajeUrgencia || 0) > 50
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, producto.porcentajeUrgencia || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 min-w-[40px]">
                          {Math.round(producto.porcentajeUrgencia || 0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reporte de Ventas por Mes */}
      <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <div className="flex items-center gap-4 mb-6">
          <TrendingUp size={28} className="text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Ventas por Mes - {new Date().getFullYear()}</h2>
        </div>

        {loadingVentas && (!dataVentas || dataVentas.ventasPorMes.length === 0) ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Cargando reporte de ventas...</p>
          </div>
        ) : !dataVentas || dataVentas.ventasPorMes.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-600">ℹ No hay ventas registradas en el período seleccionado</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mes</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Año</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total de Transacciones</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Cantidad Vendida</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Artículos Diferentes</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Promedio por Venta</th>
                </tr>
              </thead>
              <tbody>
                {dataVentas.ventasPorMes.map((venta, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {venta.mes}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {venta.ano}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {venta.totalVentas}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {venta.cantidadVendida} unidades
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {venta.cantidadArticulos}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      {venta.promedioVenta.toFixed(2)} unidades
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}