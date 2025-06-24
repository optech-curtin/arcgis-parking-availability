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

export function getStatusColor(status: ParkingStatus): string {
  switch (status) {
    case 'plenty':
      return '#10B981'; // Green
    case 'limited':
      return '#F59E0B'; // Amber
    case 'almost-full':
      return '#EF4444'; // Red
    case 'closed':
      return '#6B7280'; // Gray
    default:
      return '#6B7280';
  }
}

export function getStatusFromPercentage(percentage: number): ParkingStatus {
  if (percentage >= 50) return 'plenty';
  if (percentage >= 20) return 'limited';
  return 'almost-full';
}

 