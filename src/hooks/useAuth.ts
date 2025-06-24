import { useState, useEffect, useCallback } from 'react';
import { AuthState, UserInfo, AuthConfig } from '@/types/auth';

export function useAuth(config: AuthConfig): AuthState & {
  signOut: () => Promise<void>;
} {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userInfo: null,
    loading: true
  });

  const initializeAuth = useCallback(async () => {
    if (!config.portalUrl || !config.appId) {
      // Log error without exposing sensitive data
      console.warn("Missing required authentication configuration");
      setAuthState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Dynamically import ArcGIS modules
      const [{ default: OAuthInfo }, { default: IdentityManager }, { default: Portal }] = await Promise.all([
        import("@arcgis/core/identity/OAuthInfo"),
        import("@arcgis/core/identity/IdentityManager"),
        import("@arcgis/core/portal/Portal")
      ]);

      // Register OAuth info
      const oauthInfo = new OAuthInfo({
        appId: config.appId,
        portalUrl: config.portalUrl,
        flowType: "auto"
      });
      IdentityManager.registerOAuthInfos([oauthInfo]);

      // Check existing credentials
      try {
        await IdentityManager.checkSignInStatus(`${config.portalUrl}/sharing`);
        
        const portal = new Portal({
          authMode: "immediate",
          url: config.portalUrl
        });
        await portal.load();

        if (portal.user) {
          const userInfo: UserInfo = {
            fullName: portal.user.fullName ?? "Unknown User",
            username: portal.user.username ?? "unknown"
          };
          
          setAuthState({
            isAuthenticated: true,
            userInfo,
            loading: false
          });
        }
      } catch {
        // Not signed in yet - automatically trigger sign in
        IdentityManager.getCredential(`${config.portalUrl}/sharing`);
        setAuthState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
      }
    } catch {
      // Log error without exposing sensitive data
      console.warn("Authentication initialization failed");
      setAuthState({
        isAuthenticated: false,
        userInfo: null,
        loading: false
      });
    }
  }, [config.portalUrl, config.appId]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  async function signOut() {
    const { default: IdentityManager } = await import("@arcgis/core/identity/IdentityManager");
    IdentityManager.destroyCredentials();
    
    setAuthState({
      isAuthenticated: false,
      userInfo: null,
      loading: false
    });
  }

  return {
    ...authState,
    signOut
  };
} 