import { ParkingStatistics } from '@/types/parking';

interface ParkingStatsProps {
  stats: ParkingStatistics;
  className?: string;
}

export default function ParkingStats({ stats, className = '' }: ParkingStatsProps) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-lg border ${className}`}>
      <h3 className="font-bold text-lg mb-2 text-gray-800">Overall Status</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.overallPercentage}%
          </div>
          <div className="text-gray-600">Available</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {stats.totalAvailable}
          </div>
          <div className="text-gray-600">Free spaces</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t text-xs text-gray-500">
        {stats.totalOccupied} of {stats.totalSpaces} spaces occupied
      </div>
    </div>
  );
} 