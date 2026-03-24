// src/graphql/mutations/auth.mutations.ts
import { gql } from '@apollo/client/core';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
      requires2fa
      userId
      email
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($userId: ID!, $otpCode: String!) {
    verifyOtp(userId: $userId, otpCode: $otpCode) {
      success
      message
      token
    }
  }
`;

export const ENABLE_2FA_MUTATION = gql`
  mutation Enable2FA($password: String!) {
    enable2fa(password: $password) {
      success
      message
      qrCodeUrl
      secret
    }
  }
`;

export const VERIFY_AND_ENABLE_2FA_MUTATION = gql`
  mutation VerifyAndEnable2FA($otpCode: String!) {
    verifyAndEnable2fa(otpCode: $otpCode) {
      success
      message
    }
  }
`;