import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import Layout from '@/components/Layout';
import { FiUsers, FiPlus } from 'react-icons/fi';

export default function ConnectionsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Connections</h1>
          <p className="mt-2 text-gray-600">Manage your professional and personal connections</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No connections yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start building your network by discovering new people.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/discover')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Discover People
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
