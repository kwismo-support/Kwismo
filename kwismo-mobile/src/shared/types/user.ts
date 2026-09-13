export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  isVerified: boolean;
  biometricEnabled?: boolean;
}
