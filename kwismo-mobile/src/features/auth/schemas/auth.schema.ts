// Schemas et interfaces pour l'authentification alignés avec FastAPI backend
export interface LoginPayload {
  email: string;
  mot_de_passe: string;
  device_id: string;
  device_name: string;
}

export interface RegisterPayload {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface AuthUserOut {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface TokenOut {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUserOut;
}

export interface DeviceVerificationRequiredOut {
  requires_device_verification: boolean;
  message_fr?: string;
  message_en?: string;
}

