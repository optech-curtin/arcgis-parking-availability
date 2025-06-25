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
    console.log('Initializing auth with config:', { 
      portalUrl: config.portalUrl ? 'set' : 'missing',
      appId: config.appId ? 'set' : 'missing'
    });

    if (!config.portalUrl || !config.appId) {
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

      console.log('ArcGIS modules loaded successfully');

      // Register OAuth info
      const oauthInfo = new OAuthInfo({
        appId: config.appId,
        portalUrl: config.portalUrl,
        flowType: "auto"
      });
      IdentityManager.registerOAuthInfos([oauthInfo]);

      console.log('OAuth info registered');

      // Check existing credentials
      try {
        console.log('Checking sign-in status...');
        await IdentityManager.checkSignInStatus(`${config.portalUrl}/sharing`);
        
        const portal = new Portal({
          authMode: "immediate",
          url: config.portalUrl
        });
        await portal.load();

        if (portal.user) {
          console.log('User already signed in:', portal.user.username);
          const userInfo: UserInfo = {
            fullName: portal.user.fullName ?? "Unknown User",
            username: portal.user.username ?? "unknown"
          };
          
          setAuthState({
            isAuthenticated: true,
            userInfo,
            loading: false
          });
          return;
        }
      } catch {
        console.log('No existing credentials found, triggering sign-in...');
      }

      // Not signed in yet - automatically trigger sign in
      try {
        console.log('Triggering authentication dialog...');
        IdentityManager.getCredential(`${config.portalUrl}/sharing`);
        setAuthState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
      } catch (error) {
        console.error('Failed to trigger authentication:', error);
        setAuthState({
          isAuthenticated: false,
          userInfo: null,
          loading: false
        });
      }
    } catch (error) {
      console.error("Authentication initialization failed:", error);
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
    try {
      const { default: IdentityManager } = await import("@arcgis/core/identity/IdentityManager");
      IdentityManager.destroyCredentials();
      
      setAuthState({
        isAuthenticated: false,
        userInfo: null,
        loading: false
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  return {
    ...authState,
    signOut
  };
} 