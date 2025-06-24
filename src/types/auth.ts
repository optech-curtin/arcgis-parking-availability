export interface UserInfo {
  fullName: string;
  username: string;
  email?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  loading: boolean;
}

export interface AuthConfig {
  portalUrl: string;
  appId: string;
} 