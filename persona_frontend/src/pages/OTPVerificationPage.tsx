// src/pages/OTPVerificationPage.tsx
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { gql } from '@apollo/client';
import { 
  SendOTPResponse, 
  SendOTPVariables,
  VerifyAndRegisterResponse,
  VerifyAndRegisterVariables 
} from '../types/auth.types';

const SEND_OTP_MUTATION = gql`
  mutation SendOTP($email: String!) {
    sendOtp(email: $email) {
      success
      message
    }
  }
`;

const VERIFY_AND_REGISTER_MUTATION = gql`
  mutation VerifyAndRegister(
    $email: String!
    $otpCode: String!
    $firstName: String!
    $lastName: String!
    $password: String!
    $fechaNacimiento: Date!
    $telefono: String
    $direccion: String
  ) {
    verifyAndRegister(
      email: $email
      otpCode: $otpCode
      firstName: $firstName
      lastName: $lastName
      password: $password
      fechaNacimiento: $fechaNacimiento
      telefono: $telefono
      direccion: $direccion
    ) {
      success
      message
      userId
    }
  }
`;

export const OTPVerificationPage = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state || {};

  // 👇 AGREGAR TIPOS A LOS MUTATIONS
  const [sendOTP, { loading: sending }] = useMutation<SendOTPResponse, SendOTPVariables>(SEND_OTP_MUTATION);
  const [verifyAndRegister, { loading: verifying }] = useMutation<VerifyAndRegisterResponse, VerifyAndRegisterVariables>(VERIFY_AND_REGISTER_MUTATION);

  const handleSendOTP = async () => {
    if (!userData.email) {
      setError('Email no encontrado');
      return;
    }

    try {
      const { data } = await sendOTP({
        variables: { email: userData.email }
      });

      if (data?.sendOtp?.success) {
        setSuccess('Código enviado a tu correo electrónico');
        setResendDisabled(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setResendDisabled(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data?.sendOtp?.message || 'Error al enviar código');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al enviar código');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otpCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos');
      return;
    }

    try {
      const { data } = await verifyAndRegister({
        variables: {
          email: userData.email,
          otpCode: otpCode,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
          fechaNacimiento: userData.fechaNacimiento,
          telefono: userData.telefono,
          direccion: userData.direccion
        }
      });

      if (data?.verifyAndRegister?.success) {
        setSuccess('¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data?.verifyAndRegister?.message || 'Error al verificar código');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al verificar código');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="flex justify-center mb-6">
          <Shield className="text-blue-500" size={48} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Verificación de Email
        </h2>
        
        <p className="text-gray-600 text-center mb-4">
          Se enviará un código de verificación a:
        </p>
        <p className="text-blue-600 text-center font-semibold mb-6">
          {userData.email}
        </p>
        
        <button
          onClick={handleSendOTP}
          disabled={sending || resendDisabled}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 mb-6"
        >
          {sending ? 'Enviando...' : resendDisabled ? `Reenviar en ${countdown}s` : 'Enviar Código'}
        </button>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Código de 6 dígitos"
              maxLength={6}
              className="w-full px-3 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded text-center">
              {success}
            </div>
          )}
          
          <button
            type="submit"
            disabled={verifying || otpCode.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {verifying ? 'Verificando...' : 'Verificar y Registrarse'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Volver al registro
          </button>
        </div>
      </div>
    </div>
  );
};