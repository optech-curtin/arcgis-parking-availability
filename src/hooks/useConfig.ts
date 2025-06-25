import { useMemo } from 'react';
import { ArcGISConfig } from '@/types/parking';
import { AuthConfig } from '@/types/auth';

export function useArcGISConfig(): ArcGISConfig {
  return useMemo(() => ({
    portalUrl: process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || "https://arcgis.curtin.edu.au/portal",
    webMapId: process.env.NEXT_PUBLIC_ARCGIS_WEBMAP_ID || "3402fc5486cf41f2a9e77e4459c1d58c",
    bayLayerUrl: process.env.NEXT_PUBLIC_ARCGIS_BAY_LAYER_URL || "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays/FeatureServer/0",
    underBayLayerUrl: process.env.NEXT_PUBLIC_ARCGIS_UNDER_BAY_LAYER_URL || "https://arcgis.curtin.edu.au/arcgis/rest/services/Hosted/Park_Aid_Bays_Under/FeatureServer/0",
    parkingLayerUrl: process.env.NEXT_PUBLIC_ARCGIS_PARKING_LAYER_URL || "https://arcgis.curtin.edu.au/arcgis/rest/services/ParKam/ParKam/FeatureServer/4"
  }), []);
}

export function useAuthConfig(): AuthConfig {
  return useMemo(() => ({
    portalUrl: process.env.NEXT_PUBLIC_ARCGIS_PORTAL_URL || "https://arcgis.curtin.edu.au/portal",
    appId: process.env.NEXT_PUBLIC_ARCGIS_APP_ID || "iE6Peb7aGPZ0U6yo"
  }), []);
} 