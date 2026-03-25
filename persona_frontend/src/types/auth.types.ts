// src/types/auth.types.ts

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  is2faEnabled: boolean;
}

// Login
export interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    requires2fa: boolean;
    userId?: string;
    email?: string;
  }
}

export interface LoginMutationResponse {
  login: {
    success: boolean;
    message: string;
    requires2fa: boolean;
    userId?: string;
    email?: string;
  }
}

export interface LoginVariables {
  email: string;
  password: string;
}

// OTP - VERIFICACIÓN
export interface OTPResponse {
  verifyOtp: {
    success: boolean;
    message: string;
    token?: string;
  }
}

export interface OTPMutationResponse {  
  verifyOtp: {
    success: boolean;
    message: string;
    token?: string;
  }
}

export interface OTPVariables {
  userId: string;
  otpCode: string;
}

// 👇 NUEVOS TIPOS PARA REGISTRO CON OTP
export interface SendOTPResponse {
  sendOtp: {
    success: boolean;
    message: string;
  }
}

export interface SendOTPVariables {
  email: string;
}

export interface VerifyAndRegisterResponse {
  verifyAndRegister: {
    success: boolean;
    message: string;
    userId?: string;
  }
}

export interface VerifyAndRegisterVariables {
  email: string;
  otpCode: string;
  firstName: string;
  lastName: string;
  password: string;
  fechaNacimiento: string;
  telefono?: string;
  direccion?: string;
}


// Persona
export interface Persona {
  id: string;
  email: string;
  firstName: string; 
  lastName: string;   
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
  activo: boolean;
  is2faEnabled: boolean;
}

export interface GetAllPersonasResponse {
  allPersonas: Persona[];
}

export interface CreatePersonaResponse {
  crearPersona: {
    persona: Persona;
  }
}

export interface CreatePersonaVariables {
  firstName: string;  
  lastName: string;  
  email: string;
  password: string;
  fechaNacimiento: string;
  telefono?: string;
  direccion?: string;
}

export interface DeletePersonaResponse {
  eliminarPersona: {
    ok: boolean;
    mensaje: string;
  }
}

export interface DeletePersonaVariables {
  id: string;
}

export interface Enable2FAResponse {
  enable2fa: {
    success: boolean;
    message: string;
    qrCodeUrl?: string;
    secret?: string;
  }
}

export interface Enable2FAVariables {
  password: string;
}

export interface MeResponse {
  me: User | null;
}
// AGREGAR TIPO PARA ME QUERY
export interface MeResponse {
  me: User | null;
}

// ==================== TIPOS PARA CLIENTE ====================
export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  activo?: boolean;  // ← Opcional si no siempre viene
}

export interface GetAllClientesResponse {
  allClientes: Cliente[];
}

export interface CreateClienteResponse {
  crearCliente: {
    ok: boolean;
    mensaje: string;
    // cliente?: Cliente;  // ← Solo si tu backend lo devuelve
  };
}

export interface CreateClienteVariables {
  nombre: string;
  apellido: string;
  telefono?: string;
}

export interface UpdateClienteResponse {
  actualizarCliente: {
    ok: boolean;
    mensaje: string;
    // cliente?: Cliente;  // ← Solo si tu backend lo devuelve
  };
}

export interface UpdateClienteVariables {
  id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface DeleteClienteResponse {
  eliminarCliente: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteClienteVariables {
  id: string;
}

// ==================== TIPOS PARA EMPLEADO ====================
export interface Empleado {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  telefonoEm?: string;
  direccionEm?: string;
  sueldoEm?: number;
  fechaContratacion?: string;
  activo: boolean;
}

export interface GetAllEmpleadosResponse {
  allEmpleados: Empleado[];
}

export interface CreateEmpleadoResponse {
  crearEmpleado: {
    empleado: Empleado;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateEmpleadoVariables {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  telefonoEm?: string;
  direccionEm?: string;
  sueldoEm?: number;
  activo?: boolean;
}

export interface UpdateEmpleadoResponse {
  actualizarEmpleado: {
    empleado: Empleado;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateEmpleadoVariables {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  telefonoEm?: string;
  direccionEm?: string;
  sueldoEm?: number;
  activo?: boolean;
}

export interface DeleteEmpleadoResponse {
  eliminarEmpleado: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteEmpleadoVariables {
  id: string;
}

// ==================== TIPOS PARA CATEGORIA ====================

export interface Categoria {
  id: string;
  nombreCt: string;  // ← Cambiado de nombre_ct
  descripcionCt?: string;  // ← Cambiado de descripcion_ct
}

export interface GetAllCategoriasResponse {
  allCategorias: Categoria[];
}

export interface CreateCategoriaResponse {
  crearCategoria: {
    categoria: Categoria;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateCategoriaVariables {
  nombreCt: string;
  descripcionCt?: string;
}

export interface UpdateCategoriaResponse {
  actualizarCategoria: {
    categoria: Categoria;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateCategoriaVariables {
  id: string;
  nombreCt?: string;
  descripcionCt?: string;
}

export interface DeleteCategoriaResponse {
  eliminarCategoria: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteCategoriaVariables {
  id: string;
}

// ==================== TIPOS PARA PRODUCTO ====================
export interface Producto {
  id: string;
  nombrePr: string;
  nombreTc: string;
  fechaFab: string;
  fechaVenc: string;
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
  categoria: Categoria;
}

export interface GetAllProductosResponse {
  allProductos: Producto[];
}

export interface CreateProductoResponse {
  crearProducto: {
    producto: Producto;
    ok: boolean;
    mensaje: string;
  };
}

// ✅ CORREGIDO: Usar categoriaId en lugar de categoria_id
export interface CreateProductoVariables {
  nombrePr: string;
  nombreTc: string;
  fechaFab: string;
  fechaVenc: string;
  categoriaId: string;  // ← Cambiado de categoria_id
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
}

export interface UpdateProductoResponse {
  actualizarProducto: {
    producto: Producto;
    ok: boolean;
    mensaje: string;
  };
}

// ✅ CORREGIDO: Usar categoriaId en lugar de categoria_id
export interface UpdateProductoVariables {
  id: string;
  nombrePr?: string;
  nombreTc?: string;
  fechaFab?: string;
  fechaVenc?: string;
  categoriaId?: string;  // ← Cambiado de categoria_id
  descripcionPr?: string;
  concentracionQm?: string;
  composicionQm?: string;
}

export interface DeleteProductoResponse {
  eliminarProducto: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteProductoVariables {
  id: string;
}

// ==================== TIPOS PARA ALMACEN ====================
export interface Almacen {
  id: string;
  nombreAm: string;        // ✅ CamelCase
  descripcionAm?: string;  // ✅ CamelCase
  direccionAm: string;     // ✅ CamelCase
}

export interface GetAllAlmacenesResponse {
  allAlmacenes: Almacen[];
}

export interface CreateAlmacenResponse {
  crearAlmacen: {
    almacen: Almacen;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateAlmacenVariables {
  nombreAm: string;        // ✅ CamelCase
  descripcionAm?: string;  // ✅ CamelCase
  direccionAm: string;     // ✅ CamelCase
}

export interface UpdateAlmacenResponse {
  actualizarAlmacen: {
    almacen: Almacen;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateAlmacenVariables {
  id: string;
  nombreAm?: string;        //  CamelCase
  descripcionAm?: string;   //  CamelCase
  direccionAm?: string;     //  CamelCase
}

export interface DeleteAlmacenResponse {
  eliminarAlmacen: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteAlmacenVariables {
  id: string;
}

// ==================== TIPOS PARA VENTA ====================
// ==================== TIPOS PARA VENTA ====================
export interface Venta {
  id: string;
  fechaVe: string;
  montoTotalVe: number;   // En TypeScript sigue siendo number, aunque en GraphQL sea Decimal
  cliente: Cliente;
  empleado: Empleado;
  descripcion?: string;
}

export interface CreateVentaVariables {
  clienteId: string;
  empleadoId: string;
  montoTotalVe: number;   // En TypeScript enviamos number, se convierte automáticamente a Decimal
  descripcion?: string;
}

export interface UpdateVentaVariables {
  id: string;
  montoTotalVe?: number;
  descripcion?: string;
}

// ✅ Las respuestas pueden tener campos opcionales
export interface CreateVentaResponse {
  crearVenta: {
    venta?: Venta;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateVentaResponse {
  actualizarVenta: {
    venta?: Venta;
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteVentaResponse {
  eliminarVenta: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteVentaVariables {
  id: string;
}

export interface GetAllVentasResponse {
  allVentas: Venta[];
}

export interface GetAllClientesResponse {
  allClientes: Cliente[];
}

export interface GetAllEmpleadosResponse {
  allEmpleados: Empleado[];
}

// ==================== TIPOS PARA PRODUCTO ALMACEN ====================
export interface ProductoAlmacen {
  id: string;
  producto: Producto;
  almacen: Almacen;
  stock: number;
}

export interface GetAllProductosAlmacenResponse {
  allProductosAlmacen: ProductoAlmacen[];
}

export interface CreateProductoAlmacenResponse {
  crearProductoAlmacen: {
    productoAlmacen: ProductoAlmacen;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateProductoAlmacenVariables {
  productoId: string;
  almacenId: string;
  stock: number;
}

export interface UpdateProductoAlmacenResponse {
  actualizarProductoAlmacen: {
    productoAlmacen: ProductoAlmacen;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateProductoAlmacenVariables {
  id: string;
  stock?: number;
}

export interface DeleteProductoAlmacenResponse {
  eliminarProductoAlmacen: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteProductoAlmacenVariables {
  id: string;
}

// ==================== TIPOS PARA DETALLE VENTA ====================
export interface DetalleVenta {
  id: string;
  venta: Venta;
  producto: Producto;
  almacen: Almacen;
  cantidadDv: number;
  precioDv: number;
}

export interface GetAllDetallesVentaResponse {
  allDetallesVenta: DetalleVenta[];
}

export interface CreateDetalleVentaResponse {
  crearDetalleVenta: {
    detalleVenta: DetalleVenta;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateDetalleVentaVariables {
  ventaId: string;      // ← camelCase
  productoId: string;   // ← camelCase
  almacenId: string;    // ← camelCase
  cantidadDv: number;   // ← camelCase
  precioDv: number;     // ← camelCase
}

export interface UpdateDetalleVentaResponse {
  actualizarDetalleVenta: {
    detalleVenta: DetalleVenta;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateDetalleVentaVariables {
  id: string;
  cantidadDv?: number;  // ← camelCase
  precioDv?: number;    // ← camelCase
}

export interface DeleteDetalleVentaResponse {
  eliminarDetalleVenta: {
    ok: boolean;
    mensaje: string;
  };
}

export interface DeleteDetalleVentaVariables {
  id: string;
}