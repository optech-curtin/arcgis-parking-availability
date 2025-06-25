interface MapErrorProps {
  error: string;
  className?: string;
}

export default function MapError({ error, className = "w-full h-full min-h-screen" }: MapErrorProps) {
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