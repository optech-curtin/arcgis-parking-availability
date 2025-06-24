interface ParkingLegendProps {
  className?: string;
}

export default function ParkingLegend({ className = '' }: ParkingLegendProps) {
  const legendItems = [
    { color: 'bg-green-500', label: 'Plenty of parking' },
    { color: 'bg-yellow-500', label: 'Limited parking' },
    { color: 'bg-red-500', label: 'Almost full' },
    { color: 'bg-gray-500', label: 'Lot closed' },
  ];

  return (
    <div className={`bg-white p-4 rounded-lg shadow-lg border m-4 ${className}`}>
      <h3 className="font-bold mb-3 text-gray-800">Legend</h3>
      <div className="space-y-3">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-4 h-4 ${item.color} rounded-full mr-3`} />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        Click markers for details
      </div>
    </div>
  );
} 