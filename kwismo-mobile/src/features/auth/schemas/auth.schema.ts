// Schemas et interfaces pour l'authentification
export interface LoginPayload {
  identifier: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface VerifyOtpPayload {
  phoneOrEmail: string;
  code: string;
  purpose?: 'registration' | 'login' | 'email_change';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
}
