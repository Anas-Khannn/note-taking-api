export interface AuthUser {
  user_id: string;
  name: string;
  email: string;
  profile_image_url?: string | null;
}

export interface UpdateProfileInput {
  name?: string;
  profileImage?: File | null;
  removeProfileImage?: boolean;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface ForgotPasswordResult {
  message: string;
}

export interface ResetPasswordResult {
  message: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (session: AuthSession) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}
