export interface ParkingLot {
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  freePercentage: number;
  totalSpaces: number;
  occupiedSpaces: number;
  status: ParkingStatus;
  lastUpdated?: Date;
}

export type ParkingStatus = 'plenty' | 'limited' | 'almost-full' | 'closed';

export interface ParkingStatistics {
  totalSpaces: number;
  totalOccupied: number;
  totalAvailable: number;
  overallPercentage: number;
}

export interface MapViewProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  className?: string;
}

export interface ArcGISConfig {
  portalUrl: string;
  webMapId: string;
  bayLayerUrl: string;
  underBayLayerUrl: string;
  parkingLayerUrl: string;
} 