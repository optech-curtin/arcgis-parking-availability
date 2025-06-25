// src/app/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { useAuthConfig, useArcGISConfig } from '@/hooks/useConfig';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthFallback from '@/components/auth/AuthFallback';

// Dynamically import MapView with SSR disabled
const MapViewComponent = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
});

export default function HomePage() {
  const authConfig = useAuthConfig();
  const arcgisConfig = useArcGISConfig();
  const { isAuthenticated, loading, signOut } = useAuth(authConfig);

  const handleRetryAuth = () => {
    signOut().then(() => {
      window.location.reload();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner 
          size="lg"
          message="Connecting to ArcGIS..."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthFallback onRetry={handleRetryAuth} />;
  }

  // Signed in: show the parking map
  return (
    <div className="min-h-screen">
      <MapViewComponent 
        key="single-map-instance" 
        config={arcgisConfig} 
      />
    </div>
  );
}
