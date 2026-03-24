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
