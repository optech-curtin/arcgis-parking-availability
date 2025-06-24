import Button from '@/components/ui/Button';

interface SignInPageProps {
  onSignIn: () => void;
  loading?: boolean;
}

export default function SignInPage({ onSignIn, loading = false }: SignInPageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Parking Availability
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to view real-time parking information
          </p>
          <Button
            onClick={onSignIn}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign In to ArcGIS'}
          </Button>
        </div>
      </div>
    </div>
  );
} 