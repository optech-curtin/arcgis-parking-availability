interface MapControlsProps {
  bayLayersVisible: boolean;
  onToggleBayLayers: () => void;
  onSignOut: () => void;
}

export default function MapControls({ 
  bayLayersVisible, 
  onToggleBayLayers, 
  onSignOut 
}: MapControlsProps) {
  return (
    <>
      {/* Bay Layers Toggle Button - Top Right */}
      <button
        onClick={onToggleBayLayers}
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
        onClick={onSignOut}
        className="absolute top-16 right-4 px-4 py-2 text-sm bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition-colors duration-200"
      >
        Sign Out
      </button>
    </>
  );
} 