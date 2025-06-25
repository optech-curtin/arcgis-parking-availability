import { useRef, useState } from 'react';
import { ArcGISConfig } from '@/types/parking';

// Global flag to prevent multiple map instances (React Strict Mode protection)
let globalMapInitialized = false;

export function useMapInitialization(config: ArcGISConfig) {
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewRef = useRef<__esri.MapView | null>(null);
  const initializedRef = useRef<boolean>(false);
  const mapInstanceRef = useRef<string | null>(null);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);

  const initializeMap = async (mapDiv: HTMLDivElement) => {
    // Create unique instance ID
    const instanceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // If already initialized globally or locally, skip
    if (globalMapInitialized || initializedRef.current || initializationPromiseRef.current) {
      return;
    }
    
    globalMapInitialized = true;
    initializedRef.current = true;
    mapInstanceRef.current = instanceId;

    let view: __esri.MapView | null = null;
    let isMounted = true;

    try {
      // Import ArcGIS modules
      const [
        { default: WebMap },
        { default: MapView }
      ] = await Promise.all([
        import("@arcgis/core/WebMap"),
        import("@arcgis/core/views/MapView")
      ]);

      if (!config.webMapId) {
        throw new Error('WebMap ID is required but not provided');
      }

      // Import Portal for proper WebMap loading
      const { default: Portal } = await import("@arcgis/core/portal/Portal");
      
      // Create portal instance
      let portal;
      try {
        portal = new Portal({
          url: config.portalUrl || "https://www.arcgis.com"
        });
        await portal.load();
      } catch {
        // Portal loading failed, continue without explicit portal
      }

      // Create WebMap using the configured WebMap ID
      const webMap = new WebMap({
        portalItem: {
          id: config.webMapId,
          portal: portal
        }
      });

      // Create map view
      view = new MapView({
        container: mapDiv,
        map: webMap,
        center: [115.894, -32.005],
        zoom: 14,
        popupEnabled: true
      });

      await view.when();
      
      // Wait for WebMap to load with proper error handling
      try {
        await webMap.when();
      } catch {
        // Fall back to basic map if WebMap fails
        const { default: Map } = await import("@arcgis/core/Map");
        const fallbackMap = new Map({ basemap: "gray-vector" });
        view.map = fallbackMap;
      }

      // Update state
      if (isMounted) {
        viewRef.current = view;
        setMapReady(true);
      }

    } catch (error) {
      if (isMounted) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'request:server') {
          setError("Server connection error - please try refreshing the page");
        } else {
          setError("Failed to load map");
        }
        setMapReady(true);
      }
    }

    return () => {
      isMounted = false;
      
      if (view && !view.destroyed) {
        view.destroy();
        view = null;
      }
      viewRef.current = null;
      
      // Only reset initialization if this is the current instance
      if (mapInstanceRef.current === instanceId) {
        globalMapInitialized = false;
        initializedRef.current = false;
        mapInstanceRef.current = null;
        initializationPromiseRef.current = null;
      }
    };
  };

  return {
    mapReady,
    error,
    viewRef,
    initializeMap
  };
} 