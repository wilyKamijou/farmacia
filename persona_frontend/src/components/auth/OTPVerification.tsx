// src/components/auth/OTPVerification.tsx
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield } from 'lucide-react';
import { OTPMutationResponse, OTPVariables } from '../../types/auth.types';

const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($userId: ID!, $otpCode: String!) {
    verifyOtp(userId: $userId, otpCode: $otpCode) {
      success
      message
      token
    }
  }
`;

export const OTPVerification = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const { userId, email } = location.state || {};

  // 👇 TIPAR LA MUTACIÓN
  const [verifyOTP, { loading }] = useMutation<OTPMutationResponse, OTPVariables>(VERIFY_OTP_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Error: Usuario no identificado');
      return;
    }

    try {
      const { data } = await verifyOTP({
        variables: { userId, otpCode }
      });
      
      // 👇 AHORA data tiene el tipo OTPMutationResponse
      if (data?.verifyOtp?.success) {
        authLogin();
        navigate('/dashboard');
      } else {
        setError(data?.verifyOtp?.message || 'Código inválido');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al verificar el código');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <div className="flex justify-center mb-6">
          <Shield className="text-blue-500" size={48} />
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Verificación de Doble Factor
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Ingresa el código de 6 dígitos de Google Authenticator
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="000000"
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
          
          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
      </div>
    </div>
  );
};