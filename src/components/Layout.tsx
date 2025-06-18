import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { FiHome, FiSearch, FiHeart, FiUsers, FiSettings } from 'react-icons/fi';
import RealTimeNotifications from './notifications/RealTimeNotifications';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Discover', href: '/discover', icon: FiSearch },
    { name: 'Matches', href: '/matches', icon: FiHeart },
    { name: 'Connections', href: '/connections', icon: FiUsers },
  ];

  const handleNotificationClick = (notification: any) => {
    // Handle notification clicks based on type
    switch (notification.type) {
      case 'match':
        router.push('/discover?tab=matches');
        break;
      case 'message':
        router.push('/chat');
        break;
      case 'profile_view':
        // Could navigate to profile views page
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-indigo-600">
                  ConnectMind
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        router.pathname === item.href
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <>
                      <RealTimeNotifications onNotificationClick={handleNotificationClick} />
                      <div className="relative">
                        <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {user.displayName?.[0] || user.email?.[0] || 'U'}
                            </span>
                          </div>
                          <span>{user.displayName || user.email}</span>
                        </button>
                      </div>
                      <Link
                        href="/settings"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        <FiSettings className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => auth.signOut()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Sign In
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 