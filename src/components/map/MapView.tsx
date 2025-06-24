"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { MapViewProps, ArcGISConfig } from '@/types/parking';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ParkingLegend from './ParkingLegend';

// Parking data structure for current and future API integration
interface ParkingData {
  zone: string;
  vacant: number;
  total: number;
  vacantPercentage: number;
  lastUpdated: Date;
}

// Generate random parking data (to be replaced with API call)
function generateRandomParkingData(zones: string[]): ParkingData[] {
  return zones.map(zone => {
    const total = Math.floor(Math.random() * 200) + 50; // 50-250 spaces
    const vacant = Math.floor(Math.random() * total);
    const vacantPercentage = Math.round((vacant / total) * 100);
    
    return {
      zone,
      vacant,
      total,
      vacantPercentage,
      lastUpdated: new Date()
    };
  });
}

// Get status color based on vacancy percentage
function getVacancyColor(percentage: number): string {
  if (percentage >= 50) return '#10B981'; // Green - plenty
  if (percentage >= 20) return '#F59E0B'; // Yellow - limited  
  return '#EF4444'; // Red - almost full
}

interface MapViewWithConfigProps extends MapViewProps {
  config: ArcGISConfig;
}

// Global flag to prevent multiple map instances (React Strict Mode protection)
let globalMapInitialized = false;

// Utility function to clean parking lot names of hidden characters
function cleanParkingLotName(name: string): string {
  if (!name) return '';
  
  // Remove zero-width spaces and other invisible characters
  const cleanedName = name
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width spaces
    .replace(/[\u00AD]/g, '') // Soft hyphen
    .replace(/[\u2060]/g, '') // Word joiner
    .replace(/[\u2061]/g, '') // Function application
    .replace(/[\u2062]/g, '') // Invisible times
    .replace(/[\u2063]/g, '') // Invisible separator
    .replace(/[\u2064]/g, '') // Invisible plus
    .replace(/[\u200E\u200F]/g, '') // Left-to-right and right-to-left marks
    .replace(/[\u202A-\u202E]/g, '') // Directional formatting characters
    .replace(/[\u2066-\u2069]/g, '') // Directional isolate characters
    .replace(/[\uFFF9-\uFFFB]/g, '') // Interlinear annotation characters
    .replace(/[\u2028\u2029]/g, '') // Line and paragraph separators
    .trim(); // Remove leading/trailing whitespace
  
  // Normalize whitespace (replace multiple spaces with single space)
  const normalizedName = cleanedName.replace(/\s+/g, ' ');
  
  return normalizedName;
}

// Manual exclusion list for specific parking lots
const EXCLUDED_PARKING_LOTS = ['B418', 'PL2'];

export default function MapView({ 
  config,
  initialCenter,
  initialZoom = 14,
  className = "w-full h-full min-h-screen"
}: MapViewWithConfigProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bayLayersVisible, setBayLayersVisible] = useState(true);
  const viewRef = useRef<__esri.MapView | null>(null);
  const markersLayerRef = useRef<__esri.GraphicsLayer | null>(null);
  const bayLayersRef = useRef<__esri.FeatureLayer[]>([]);
  const initializedRef = useRef<boolean>(false);
  const mapInstanceRef = useRef<string | null>(null);
  const initializationPromiseRef = useRef<Promise<void> | null>(null);
  
  // Memoize center to prevent re-renders
  const center = useMemo(() => initialCenter || [115.894, -32.005], [initialCenter]);

  // Function to toggle bay layers visibility
  const toggleBayLayers = () => {
    const newVisibility = !bayLayersVisible;
    setBayLayersVisible(newVisibility);
    
    bayLayersRef.current.forEach(layer => {
      if (layer) {
        layer.visible = newVisibility;
      }
    });
  };

        useEffect(() => {
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

    async function identifyBayLayers(view: __esri.MapView) {
      const bayLayers: __esri.FeatureLayer[] = [];
      
      if (view.map && view.map.layers) {
        view.map.layers.forEach((layer) => {
          if (layer.type === 'feature') {
            const featureLayer = layer as __esri.FeatureLayer;
            const layerUrl = (featureLayer as unknown as { url?: string }).url || '';
            const layerTitle = featureLayer.title || '';
            
            // Check if this is a bay layer (underground or parking bays)
            const isBayLayer = layerUrl === config.bayLayerUrl || 
                              layerUrl === config.underBayLayerUrl ||
                              layerTitle.toLowerCase().includes('bay') ||
                              layerTitle.toLowerCase().includes('underground') ||
                              layerUrl.includes('bay') ||
                              layerUrl.includes('underground');
            
            if (isBayLayer) {
              bayLayers.push(featureLayer);
            }
          }
        });
      }
      
      // Store bay layers for toggling
      bayLayersRef.current = bayLayers;
    }

    async function initializeMap() {
      if (!mapDivRef.current) {
        setError('Map container not available - DOM element not found');
        return;
      }
      
      if (!config.webMapId) {
        setError('WebMap ID not available - check environment variables');
        return;
      }

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
        
        // Create portal instance - try to use the same portal as authentication
        let portal;
        try {
          // Try to use the same portal as configured in environment
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
            portal: portal  // Explicitly set the portal
          }
        });

        // Create map view
        view = new MapView({
          container: mapDivRef.current,
          map: webMap,
          center: center,
          zoom: initialZoom,
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

        // Find and store bay layers (underground and parking bays)
        try {
          await identifyBayLayers(view);
        } catch {
          // Continue without bay layer toggling
        }

        // Initialize parking markers using WebMap's existing layers
        try {
          await initializeParkingMarkers(view);
        } catch {
          // Continue without markers rather than failing completely
        }

        // Update state
        if (isMounted) {
          viewRef.current = view;
          setMapReady(true);
        }

      } catch (error) {
        if (isMounted) {
          // Check if it's a server request error
          if (error && typeof error === 'object' && 'name' in error && error.name === 'request:server') {
            setError("Server connection error - please try refreshing the page");
          } else {
            setError("Failed to load map");
          }
          setMapReady(true);
        }
      }
    }





     async function initializeParkingMarkers(view: __esri.MapView) {
       const [
         { default: GraphicsLayer },
         { default: Graphic }
       ] = await Promise.all([
         import("@arcgis/core/layers/GraphicsLayer"),
         import("@arcgis/core/Graphic")
       ]);



       // Create graphics layer for parking markers
       const markersLayer = new GraphicsLayer({
         title: "Parking Markers",
         id: "parking-markers"
       });
       
       if (view.map) {
         view.map.add(markersLayer);
         markersLayerRef.current = markersLayer;
       }

       // Find parking layer from WebMap's layers
       let parkingLayer: __esri.FeatureLayer | null = null;
       const allLayers: __esri.FeatureLayer[] = [];
       
       if (view.map && view.map.layers) {
         view.map.layers.forEach((layer) => {
           if (layer.type === 'feature') {
             const featureLayer = layer as __esri.FeatureLayer;
             allLayers.push(featureLayer);
           }
         });
         
         // First: exact URL match
         parkingLayer = allLayers.find(layer => (layer as unknown as { url?: string }).url === config.parkingLayerUrl) || null;
         
         if (!parkingLayer) {
           // Second: look for layer with /4 in URL
           parkingLayer = allLayers.find(layer => {
             const url = (layer as unknown as { url?: string }).url || '';
             return url.includes('ParKam') && url.includes('/4');
           }) || null;
         }
         
         if (!parkingLayer) {
           // Third: look for any layer with parking in title
           parkingLayer = allLayers.find(layer => {
             const title = layer.title || '';
             return title.toLowerCase().includes('parking') || title.toLowerCase().includes('parkam');
           }) || null;
         }
         
         if (!parkingLayer) {
           parkingLayer = allLayers[0] || null;
         }
       }

       if (!parkingLayer) {
         // Use fallback data if no parking layer is found
         if (isMounted) {
           // No need to store parking data since we removed the stats component
         }
         return;
       }

       // Ensure we have a valid FeatureLayer
       const featureLayer = parkingLayer as __esri.FeatureLayer;
       
       try {
         await featureLayer.load();
         
         // Query parking lot polygons
         const query = featureLayer.createQuery();
         query.where = "1=1";
         query.outFields = ['*'];
         query.returnGeometry = true;
         query.num = 100; // Increased to 100 to get more features
         
         const results = await featureLayer.queryFeatures(query);
         
         if (results.features && results.features.length > 0) {
         // Extract zones and generate random data - try multiple field names, excluding closed and unmonitored lots
         const zones = results.features
           .filter((f: unknown) => {
             const attrs = (f as { attributes: Record<string, unknown> }).attributes;
             
             // Filter out closed parking lots
             if (attrs.status === "Closed" || attrs.Status === "Closed" || 
                 attrs.STATUS === "CLOSED" || attrs.state === "Closed" ||
                 attrs.State === "Closed" || attrs.STATE === "CLOSED") {
               return false;
             }
             // Filter out unmonitored parking lots
             if (attrs.isMonitored === false || attrs.isMonitored === "false" || 
                 attrs.isMonitored === "False" || attrs.IsMonitored === false ||
                 attrs.IsMonitored === "false" || attrs.IsMonitored === "False" ||
                 attrs.IS_MONITORED === false || attrs.IS_MONITORED === "false" ||
                 attrs.IS_MONITORED === "False") {
               return false;
             }
             return true;
           })
           .map((f: unknown) => {
             const attrs = (f as { attributes: Record<string, unknown> }).attributes;
             const rawName = attrs.Zone || attrs.NAME || attrs.Name || attrs.name || 
                            attrs.ZONE || attrs.ID || attrs.OBJECTID || `Zone ${attrs.OBJECTID}`;
             return cleanParkingLotName(rawName as string);
           })
           .filter(Boolean)
           .filter(zone => !EXCLUDED_PARKING_LOTS.includes(zone));
         
         const randomParkingData = generateRandomParkingData(zones);
         
         // Create markers for each parking lot
         for (const feature of results.features) {
           const attrs = feature.attributes;
           
           // Skip closed parking lots and unmonitored lots
           if (attrs.status === "Closed" || attrs.Status === "Closed" || 
               attrs.STATUS === "CLOSED" || attrs.state === "Closed" ||
               attrs.State === "Closed" || attrs.STATE === "CLOSED") {
             continue;
           }
           
           // Skip unmonitored parking lots
           if (attrs.isMonitored === false || attrs.isMonitored === "false" || 
               attrs.isMonitored === "False" || attrs.IsMonitored === false ||
               attrs.IsMonitored === "false" || attrs.IsMonitored === "False" ||
               attrs.IS_MONITORED === false || attrs.IS_MONITORED === "false" ||
               attrs.IS_MONITORED === "False") {
             continue;
           }
           
           // Get the zone/name using the same flexible approach as before
           const rawZone = attrs.Zone || attrs.NAME || attrs.Name || attrs.name || 
                          attrs.ZONE || attrs.ID || attrs.OBJECTID || `Zone ${attrs.OBJECTID}`;
           const zone = cleanParkingLotName(rawZone);
           if (!zone) continue;
           
           // Additional validation: ensure zone name is meaningful
           if (zone.length < 2 || zone === 'undefined' || zone === 'null') {
             continue;
           }
           
           // Filter out manually excluded parking lots
           if (EXCLUDED_PARKING_LOTS.includes(zone)) {
             continue;
           }

           // Find or create parking info for this zone
           let parkingInfo = randomParkingData.find(p => p.zone === zone);
           if (!parkingInfo) {
             // Create parking data for zones that weren't in the initial list
             const total = Math.floor(Math.random() * 200) + 50;
             const vacant = Math.floor(Math.random() * total);
             const vacantPercentage = Math.round((vacant / total) * 100);
             
             parkingInfo = {
               zone,
               vacant,
               total,
               vacantPercentage,
               lastUpdated: new Date()
             };
             randomParkingData.push(parkingInfo);
           }

           // Calculate centroid - try multiple approaches
           let centroid = null;
           
           if (feature.geometry) {
             if (feature.geometry.extent && feature.geometry.extent.center) {
               centroid = feature.geometry.extent.center;
             } else if (feature.geometry.type === 'point') {
               centroid = feature.geometry;
             } else if (feature.geometry.type === 'polygon') {
               // For polygon, use extent center as fallback
               centroid = feature.geometry.extent?.center || null;
             }
           }
           
           if (!centroid) continue;

           // Try ArcGIS native symbols for crisp rendering
           const color = getVacancyColor(parkingInfo.vacantPercentage);
           
           // Import ArcGIS symbol classes
           const [
             { default: SimpleMarkerSymbol },
             { default: TextSymbol }
           ] = await Promise.all([
             import("@arcgis/core/symbols/SimpleMarkerSymbol"),
             import("@arcgis/core/symbols/TextSymbol")
           ]);

           // Calculate dynamic width based on text length
           const zoneTextWidth = zone.length * 7; // Estimate zone text width
           const percentText = `${parkingInfo.vacantPercentage}% free`;
           const percentTextWidth = percentText.length * 6; // Estimate percentage text width
           const maxTextWidth = Math.max(zoneTextWidth, percentTextWidth);
           const bubbleWidth = maxTextWidth + 20; // 30 for circle + 15 padding
           const bubbleHeight = 30;
           
           // Create rectangular speech bubble with pointer - proper speech bubble design
           const speechBubblePath = `
             M 5 5
             L ${bubbleWidth - 5} 5
             Q ${bubbleWidth} 5 ${bubbleWidth} 10
             L ${bubbleWidth} ${bubbleHeight - 5}
             Q ${bubbleWidth} ${bubbleHeight} ${bubbleWidth - 5} ${bubbleHeight}
             L 20 ${bubbleHeight}
             L 15 ${bubbleHeight + 8}
             L 10 ${bubbleHeight}
             L 10 ${bubbleHeight}
             Q 5 ${bubbleHeight} 5 ${bubbleHeight - 5}
             L 5 10
             Q 5 5 10 5
             Z
           `;

           // Create speech bubble background
           const speechBubbleSymbol = new SimpleMarkerSymbol({
             style: "path",
             path: speechBubblePath,
             color: "white",
             size: bubbleWidth,
             outline: {
               color: "#ddd",
               width: 1
             },
             xoffset: bubbleWidth / 2 - 15, // Offset so pointer points to location
             yoffset: (bubbleHeight + 8) / 2
           });

           // Create colored circle for P (positioned on left side of bubble)
           const circleSymbol = new SimpleMarkerSymbol({
             style: "circle",
             color: color,
             size: 20,
             outline: {
               color: "white",
               width: 2
             },
             xoffset: 0, // Left side of bubble, inside the bubble
             yoffset: (bubbleHeight + 19) / 2 // Align with speech bubble center
           });

           // Create P text (centered on circle)
           const pTextSymbol = new TextSymbol({
             text: "P",
             color: "white",
             font: {
               size: 12,
               weight: "bold",
               family: "Arial"
             },
             xoffset: 0, // Same position as circle
             yoffset: (bubbleHeight + 8) / 2 + 1 // Align with speech bubble center, slight adjustment for text centering
           });

           // Create zone name text (right side of bubble, top)
           const zoneTextSymbol = new TextSymbol({
             text: zone,
             color: "#2d3748",
             font: {
               size: 10,
               weight: "bold",
               family: "Arial"
             },
             xoffset: 13, // Right of circle
             yoffset: (bubbleHeight + 8) / 2 + 6, // Below center
             horizontalAlignment: "left"
           });

           // Create percentage text (right side of bubble, bottom)
           const percentTextSymbol = new TextSymbol({
             text: percentText,
             color: "#718096",
             font: {
               size: 9,
               family: "Arial"
             },
             xoffset: 13, // Right of circle
             yoffset: (bubbleHeight + 8) / 2 - 6, // Above center
             horizontalAlignment: "left"
           });

           // Create the complete marker graphic with popup
           const markerGraphic = new Graphic({
             geometry: centroid,
             symbol: speechBubbleSymbol,
             attributes: { ...parkingInfo },
             popupTemplate: {
               title: `${zone} Parking`,
               content: `
                 <div style="padding: 10px;">
                   <div style="margin-bottom: 8px;">
                     <strong>Availability:</strong> ${parkingInfo.vacantPercentage}% free
                   </div>
                   <div style="margin-bottom: 8px;">
                     <strong>Spaces:</strong> ${parkingInfo.vacant} available out of ${parkingInfo.total} total
                   </div>
                   <div style="margin-bottom: 8px;">
                     <strong>Status:</strong> 
                     <span style="color: ${getVacancyColor(parkingInfo.vacantPercentage)}; font-weight: bold;">
                       ${parkingInfo.vacantPercentage >= 50 ? 'Plenty Available' : 
                         parkingInfo.vacantPercentage >= 20 ? 'Limited Spaces' : 'Almost Full'}
                     </span>
                   </div>
                   <div style="font-size: 12px; color: #666;">
                     Last updated: ${parkingInfo.lastUpdated.toLocaleTimeString()}
                   </div>
                 </div>
               `
             }
           });

           const circleGraphic = new Graphic({
             geometry: centroid,
             symbol: circleSymbol
           });

           const pTextGraphic = new Graphic({
             geometry: centroid,
             symbol: pTextSymbol
           });

           const zoneGraphic = new Graphic({
             geometry: centroid,
             symbol: zoneTextSymbol
           });

           const percentGraphic = new Graphic({
             geometry: centroid,
             symbol: percentTextSymbol
           });

           // Add all graphics to create the complete speech bubble marker
           markersLayer.addMany([markerGraphic, circleGraphic, pTextGraphic, zoneGraphic, percentGraphic]);
         }
         
         // Update state only after all markers are added
         if (isMounted) {
           // No need to store parking data since we removed the stats component
         }
       } else {
         // Create some fallback markers at default locations
         if (isMounted) {
           // No need to store parking data since we removed the stats component
         }
       }
     } catch {
       // Create fallback data when query fails
       if (isMounted) {
         // No need to store parking data since we removed the stats component
       }
     }
     }

     // Store the initialization promise to prevent concurrent initialization
     initializationPromiseRef.current = new Promise<void>((resolve, reject) => {
       // Small delay to ensure DOM is ready
       setTimeout(async () => {
         try {
           await initializeMap();
           resolve();
         } catch (error) {
           reject(error);
         } finally {
           initializationPromiseRef.current = null;
         }
       }, 100);
     });

          return () => {
        isMounted = false;
        
        if (view && !view.destroyed) {
          view.destroy();
          view = null;
        }
        viewRef.current = null;
        markersLayerRef.current = null;
        bayLayersRef.current = [];
        
        // Only reset initialization if this is the current instance
        if (mapInstanceRef.current === instanceId) {
          globalMapInitialized = false;
          initializedRef.current = false;
          mapInstanceRef.current = null;
          initializationPromiseRef.current = null;
        }
      };
    }, [config.webMapId, config.parkingLayerUrl, config.bayLayerUrl, config.underBayLayerUrl, config.portalUrl, center, initialZoom]);

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-2">Map Error</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {/* Map Container */}
      <div 
        ref={mapDivRef} 
        className="w-full h-full overflow-hidden"
        style={{ minHeight: '100vh' }}
        data-map-instance={mapInstanceRef.current}
      />
      
      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <LoadingSpinner 
            size="lg"
            message="Loading parking map..."
          />
        </div>
      )}

      {/* Legend - Bottom Right (made bigger with margin) */}
      <ParkingLegend className="absolute bottom-8 right-8 scale-125" />

      {/* Bay Layers Toggle Button - Top Right */}
      <button
        onClick={toggleBayLayers}
        className={`absolute top-4 right-4 px-4 py-2 text-sm rounded-lg shadow transition-colors duration-200 ${
          bayLayersVisible 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        {bayLayersVisible ? 'Hide Bays' : 'Show Bays'}
      </button>

      {/* Sign Out Button - Top Right (below bay toggle) */}
      <button
        onClick={async () => {
          try {
            const { default: IdentityManager } = await import("@arcgis/core/identity/IdentityManager");
            IdentityManager.destroyCredentials();
            window.location.reload();
          } catch {
            // Sign out failed, reload anyway
            window.location.reload();
          }
        }}
        className="absolute top-16 right-4 px-4 py-2 text-sm bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors duration-200"
      >
        Sign Out
      </button>
    </div>
  );
} 