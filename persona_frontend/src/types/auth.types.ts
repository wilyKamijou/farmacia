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
  activo: boolean;
}

export interface GetAllClientesResponse {
  all_clientes: Cliente[];  // ← Cambiado de allClientes a all_clientes
}

export interface CreateClienteResponse {
  crear_cliente: {  // ← Cambiado de crearCliente a crear_cliente
    cliente: Cliente;
    ok: boolean;
    mensaje: string;
  };
}

export interface CreateClienteVariables {
  nombre: string;
  apellido: string;
  telefono?: string;
}

export interface UpdateClienteResponse {
  actualizar_cliente: {  // ← Cambiado de actualizarCliente a actualizar_cliente
    cliente: Cliente;
    ok: boolean;
    mensaje: string;
  };
}

export interface UpdateClienteVariables {
  id: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
}

export interface DeleteClienteResponse {
  eliminar_cliente: {
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