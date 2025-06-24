// src/app/page.tsx
"use client";

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ArcGISConfig } from '@/types/parking';

// Dynamically import MapView with SSR disabled
const MapViewComponent = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
});

export default function HomePage() {
  const authConfig = useMemo(() => ({
    portalUrl: process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || "",
    appId: process.env.NEXT_PUBLIC_ARCGIS_APP_ID || ""
  }), []);

  const arcgisConfig: ArcGISConfig = useMemo(() => ({
    portalUrl: process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || "",
    webMapId: process.env.NEXT_PUBLIC_ARCGIS_WEBMAP_ID || "",
    bayLayerUrl: process.env.NEXT_PUBLIC_ARCGIS_BAY_LAYER_URL || "",
    underBayLayerUrl: process.env.NEXT_PUBLIC_ARCGIS_UNDER_BAY_LAYER_URL || "",
    parkingLayerUrl: process.env.NEXT_PUBLIC_ARCGIS_PARKING_LAYER_URL || ""
  }), []);

  const { isAuthenticated, loading } = useAuth(authConfig);

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner 
          size="lg"
          message="Please sign in through the ArcGIS authentication dialog"
        />
      </div>
    );
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
