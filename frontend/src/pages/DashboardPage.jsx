import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center max-w-sm w-full">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mb-6">Your dashboard is being built.</p>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
