// src/pages/DashboardPage.tsx
import { Users, UserCheck, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  GetTotalesUsuariosResponse,
  GetProductosProximoVencimientoResponse,
  GetReporteCompletoResponse,
  GetVentasPorMesResponse
} from '../types/dashboard.types';
import '../styles/dashboard.css';

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
  const isLoadingGlobal = loadingReporte || loadingTotales || loadingProductos || loadingVentas;

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
    <div className="dashboard-main">
      <div className="dashboard-main-inner">
        <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Panel administrativo moderno</h1>
          <p className="dashboard-subtitle">Tablero SaaS de farmacia con métricas clave e inventario</p>
        </div>

        <div className="dashboard-topbar-controls">
          <input className="dashboard-search" placeholder="Buscar pacientes, productos o ventas..." />
          <button className="dashboard-avatar" title="Cuenta">
            <span>👤</span>
            <span>Admin</span>
          </button>
        </div>
      </header>

      {isLoadingGlobal && (
        <div className="table-card" style={{ marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: '#41736b', fontWeight: 600 }}>
            Cargando datos, por favor espera...
          </p>
        </div>
      )}

      <section className="stats-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link} className="stat-card" title={card.description}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3>{card.title}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#637a81', margin: '0.35rem 0 0 0' }}>{card.description}</p>
                </div>
                <div className="stat-card-icon" style={{ background: '#edf7f3' }}>
                  <Icon size={24} color="#238060" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="table-card">
        <div className="card-row">
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1f4c45' }}>Resumen rápido</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card" style={{ borderLeft: '4px solid #5dcd8d' }}>
            <h3>Total Clientes</h3>
            <p className="number">{totales?.totalClientes ?? 0}</p>
            <span className="badge badge-green">Activo</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #f4c959' }}>
            <h3>Total Empleados</h3>
            <p className="number">{totales?.totalEmpleados ?? 0}</p>
            <span className="badge badge-yellow">Normal</span>
          </div>
          <div className="stat-card" style={{ borderLeft: '4px solid #f06f5a' }}>
            <h3>Empleados Activos</h3>
            <p className="number">{totales?.empleadosActivos ?? 0}</p>
            <span className="badge badge-red">Monitorear</span>
          </div>
        </div>
      </section>

      <section className="table-card">
        <div className="table-panel">
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1f4c45' }}>
            Productos próximos a vencer (90 días)
          </h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button type="button">Filtrar</button>
            <select defaultValue="90">
              <option value="30">30 días</option>
              <option value="60">60 días</option>
              <option value="90">90 días</option>
              <option value="120">120 días</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Nombre Técnico</th>
                <th>Categoría</th>
                <th>Fabricación</th>
                <th>Vencimiento</th>
                <th>Días</th>
                <th>Stock</th>
                <th>Urgencia</th>
              </tr>
            </thead>
            <tbody>
              {productosProximos.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.nombreComercial || '-'}</td>
                  <td>{producto.nombreTecnico || '-'}</td>
                  <td>{producto.categoria || '-'}</td>
                  <td>{formatDateSafe(producto.fechaFabricacion)}</td>
                  <td>{formatDateSafe(producto.fechaVencimiento)}</td>
                  <td>
                    <span
                      className={`badge ${
                        producto.diasFaltantes <= 30
                          ? 'badge-red'
                          : producto.diasFaltantes <= 60
                          ? 'badge-yellow'
                          : 'badge-green'
                      }`}
                    >
                      {producto.diasFaltantes} días
                    </span>
                  </td>
                  <td>{producto.stockTotal ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <div className="progress-bar" style={{ width: '140px', background: '#ebf4f2', borderRadius: '99px', overflow: 'hidden', height: '8px' }}>
                        <div
                          style={{
                            width: `${Math.min(100, producto.porcentajeUrgencia || 0)}%`,
                            height: '100%',
                            background: (producto.porcentajeUrgencia || 0) > 75 ? '#e25f4f' : (producto.porcentajeUrgencia || 0) > 50 ? '#f2b84b' : '#4bb27f'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#4d6d6b', fontWeight: 700 }}>
                        {Math.round(producto.porcentajeUrgencia || 0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="table-card" style={{ marginTop: '1rem' }}>
        <div className="table-panel">
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#1f4c45' }}>
            Ventas por mes - {new Date().getFullYear()}
          </h2>
          <p style={{ color: '#607e85', margin: 0, fontSize: '0.86rem' }}>
            Datos actualizados al momento
          </p>
        </div>

        <div className="table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Año</th>
                <th>Total Transacciones</th>
                <th>Cantidad Vendida</th>
                <th>Artículos</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              {dataVentas?.ventasPorMes.map((venta, index) => (
                <tr key={String(index)}>
                  <td>{venta.mes}</td>
                  <td>{venta.ano}</td>
                  <td>
                    <span className="badge badge-green">{venta.totalVentas}</span>
                  </td>
                  <td>{venta.cantidadVendida}</td>
                  <td>{venta.cantidadArticulos}</td>
                  <td>{venta.promedioVenta.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
  );
}