interface AuthFallbackProps {
  onRetry: () => void;
}

export default function AuthFallback({ onRetry }: AuthFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-lg font-semibold mb-4">
          Authentication Required
        </div>
        <p className="text-gray-600 mb-6">
          This application requires ArcGIS authentication to access parking data. 
          Please ensure you have the correct credentials configured.
        </p>
        <div className="space-y-3 text-sm text-gray-500">
          <p>• Check that the authentication dialog appeared</p>
          <p>• Ensure you have access to the ArcGIS portal</p>
          <p>• Try refreshing the page if the dialog didn&apos;t appear</p>
        </div>
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry Authentication
        </button>
      </div>
    </div>
  );
} 