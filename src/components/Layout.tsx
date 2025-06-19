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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Nav */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-extrabold text-indigo-600 tracking-tight flex items-center">
                ConnectMind
              </Link>
              <div className="hidden md:flex space-x-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        router.pathname === item.href
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-700'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-1" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* User & Actions */}
            <div className="flex items-center space-x-4">
              {!loading && user && (
                <>
                  <RealTimeNotifications onNotificationClick={handleNotificationClick} />
                  <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full">
                    <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{user.displayName || user.email}</span>
                  </div>
                  <Link
                    href="/settings"
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                    title="Settings"
                  >
                    <FiSettings className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => auth.signOut()}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!loading && !user && (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[60vh]">
          {children}
        </div>
      </main>
    </div>
  );
} 