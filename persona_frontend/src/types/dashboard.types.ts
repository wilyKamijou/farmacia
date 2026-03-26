// src/types/dashboard.types.ts

// ==================== TIPOS PARA ALMACÉN STOCK ====================
export interface AlmacenStock {
  almacenNombre: string;
  stock: number;
}

// ==================== TIPOS PARA PRODUCTO PRÓXIMO A VENCER ====================
export interface ProductoProximoVencer {
  id: string;
  nombreComercial: string;
  nombreTecnico: string;
  fechaFabricacion: string; // ISO date format
  fechaVencimiento: string; // ISO date format
  diasFaltantes: number;
  categoria: string;        // ← Asegurar que está presente
  stockTotal: number;
  almacenes?: AlmacenStock[];
  porcentajeUrgencia: number;
}

// ==================== TIPOS PARA RESUMEN INVENTARIO ====================
export interface ResumenInventario {
  totalProductos: number;
  totalCategorias: number;
  totalAlmacenes: number;
  stockTotal: number;
}

// ==================== TIPOS PARA TOTALES USUARIOS ====================
export interface TotalesUsuarios {
  totalClientes: number;
  totalEmpleados: number;
  empleadosActivos: number;
}

// ==================== TIPOS PARA VENTAS POR MES ====================
export interface VentasPorMes {
  mes: string;
  ano: number;
  totalVentas: number;
  cantidadVendida: number;
  cantidadArticulos: number;
  promedioVenta: number;
}

// ==================== TIPOS PARA FECHA MAYOR VENTA ====================
export interface FechaMayorVenta {
  fecha: string;
  totalVentas: number;
  montoTotal: number;
  mejorProducto: string;
  cantidadProducto: number;
}

// ==================== TIPOS PARA REPORTE VENTAS ====================
export interface ReporteVentas {
  ventasPorMes: VentasPorMes[];
  fechaMayorVenta: FechaMayorVenta | null;
  totalVentasGenerales: number;
  cantidadVentasGenerales: number;
}

// ==================== TIPOS PARA REPORTE COMPLETO ====================
export interface ReporteCompleto {
  usuarios: TotalesUsuarios;
  inventario: ResumenInventario;
  productosProximoVencer: ProductoProximoVencer[];
}

// ==================== TIPOS PARA QUERIES ====================
export interface GetTotalesUsuariosResponse {
  totalesUsuarios: TotalesUsuarios;
}

export interface GetProductosProximoVencimientoResponse {
  productosProximoVencimiento: ProductoProximoVencer[];
}

export interface GetResumenInventarioResponse {
  resumenInventario: ResumenInventario;
}

export interface GetReporteCompletoResponse {
  reporteCompleto: ReporteCompleto;
}

export interface GetVentasPorMesResponse {
  ventasPorMes: VentasPorMes[];
}