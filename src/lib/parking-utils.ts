import { ParkingLot, ParkingStatistics, ParkingStatus } from '@/types/parking';

export function calculateParkingStatistics(parkingLots: ParkingLot[]): ParkingStatistics {
  if (parkingLots.length === 0) {
    return {
      totalSpaces: 0,
      totalOccupied: 0,
      totalAvailable: 0,
      overallPercentage: 0
    };
  }

  const totalSpaces = parkingLots.reduce((sum, lot) => sum + lot.totalSpaces, 0);
  const totalOccupied = parkingLots.reduce((sum, lot) => sum + lot.occupiedSpaces, 0);
  const totalAvailable = totalSpaces - totalOccupied;
  const overallPercentage = totalSpaces > 0 ? Math.round((totalAvailable / totalSpaces) * 100) : 0;

  return {
    totalSpaces,
    totalOccupied,
    totalAvailable,
    overallPercentage
  };
}

export function getStatusFromPercentage(percentage: number): ParkingStatus {
  if (percentage >= 50) return 'plenty';
  if (percentage >= 20) return 'limited';
  return 'almost-full';
}

// Re-export the color function from map-utils for consistency
export { getVacancyColor as getStatusColor } from './map-utils';

 