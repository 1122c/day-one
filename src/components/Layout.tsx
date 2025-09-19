import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { FiHome, FiSearch, FiHeart, FiUsers, FiSettings, FiMessageSquare, FiBell, FiChevronDown, FiChevronUp, FiHeart as FiMatch, FiEye, FiX } from 'react-icons/fi';
import { subscribeToNotifications, markNotificationAsRead, getConnectionRequests } from '@/services/firebaseService';
import { signOutUser } from '@/services/authService';

interface Notification {
  id: string;
  type: 'message' | 'match' | 'connection' | 'profile_view' | 'system' | 'connection_request' | 'connection_accepted' | 'connection_rejected';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionData?: any;
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, loading] = useAuthState(auth);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionRequestCount, setConnectionRequestCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscribe to real-time notifications when user is available
  useEffect(() => {
    if (user) {
      console.log('🔔 Setting up real-time notifications for user:', user.uid);
      
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(user.uid, (realNotifications) => {
        console.log('📱 Received notifications:', realNotifications);
        setNotifications(realNotifications);
      });

      // Get connection request count
      const getConnectionRequestCount = async () => {
        try {
          const requests = await getConnectionRequests(user.uid);
          setConnectionRequestCount(requests.length);
        } catch (error) {
          console.error('Error getting connection request count:', error);
        }
      };

      getConnectionRequestCount();

      // Cleanup subscription on unmount
      return () => {
        console.log('🧹 Cleaning up notifications subscription');
        unsubscribe();
      };
    }
  }, [user]);

  const navigation = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Discover', href: '/discover', icon: FiSearch },
    { name: 'Suggested Users', href: '/matches', icon: FiHeart },
    { 
      name: 'Connections', 
      href: '/connections', 
      icon: FiUsers,
      badge: connectionRequestCount > 0 ? connectionRequestCount : undefined
    },
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <FiMessageSquare className="h-4 w-4 text-blue-600" />;
      case 'match':
        return <FiMatch className="h-4 w-4 text-red-600" />;
      case 'connection':
        return <FiUsers className="h-4 w-4 text-green-600" />;
      case 'profile_view':
        return <FiEye className="h-4 w-4 text-purple-600" />;
      case 'system':
        return <FiBell className="h-4 w-4 text-gray-600" />;
      default:
        return <FiBell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read in Firebase
      await markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );

      // Close dropdown
      setNotificationsDropdownOpen(false);

      // Navigate to appropriate page
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      // Still navigate even if marking as read fails
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo & Nav */}
            <div className="flex items-center space-x-8">
              <Link href="/auth/signin" className="text-2xl font-extrabold text-indigo-600 tracking-tight flex items-center">
                WeNetwork
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
                      {item.badge && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            {/* User & Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <div className="md:hidden" ref={mobileMenuRef}>
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <FiX className="h-6 w-6" />
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
                
                {/* Mobile menu dropdown */}
                {mobileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                      <h3 className="text-sm font-semibold text-gray-900">Navigation</h3>
                    </div>
                    <div className="py-2">
                      {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                              router.pathname === item.href
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-700'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                            {item.badge && (
                              <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                      {user && (
                        <>
                          <div className="border-t border-gray-200 my-2"></div>
                          <Link
                            href="/messages"
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <FiMessageSquare className="h-5 w-5 mr-3" />
                            Messages
                          </Link>
                          <Link
                            href="/notifications"
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <FiBell className="h-5 w-5 mr-3" />
                            Notifications
                            {unreadCount > 0 && (
                              <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <FiSettings className="h-5 w-5 mr-3" />
                            Settings
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!loading && user && (
                <>
                  <Link
                    href="/messages"
                    className="hidden sm:flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200"
                    title="Messages"
                  >
                    <FiMessageSquare className="h-5 w-5 mr-1" />
                    Messages
                  </Link>
                  
                  {/* Notifications Dropdown */}
                  <div className="relative hidden sm:block" ref={notificationsRef}>
                    <button
                      onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-indigo-700 transition-colors duration-200 relative"
                      title="Notifications"
                    >
                      <FiBell className="h-5 w-5 mr-1" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {notificationsDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="py-2">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <FiBell className="mx-auto h-8 w-8 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-medium ${
                                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                                      }`}>
                                        {notification.title}
                                      </p>
                                      <span className="text-xs text-gray-500 ml-2">
                                        {formatTimestamp(notification.timestamp)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    {!notification.read && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          New
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {notifications.length > 0 && (
                          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <Link
                              href="/notifications"
                              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                              onClick={() => setNotificationsDropdownOpen(false)}
                            >
                              View all notifications →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full">
                    <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{user.displayName || user.email}</span>
                  </div>
                  <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                      onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                      className="flex items-center p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-200 rounded-md hover:bg-gray-100"
                      title="Settings"
                    >
                      <FiSettings className="h-5 w-5" />
                      <FiChevronDown className="h-4 w-4 ml-1" />
                    </button>
                    
                    {settingsDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-700"
                          onClick={() => setSettingsDropdownOpen(false)}
                        >
                          Settings
                        </Link>
                        <button
                          onClick={async () => {
                            try {
                              await signOutUser();
                              setSettingsDropdownOpen(false);
                            } catch (error) {
                              console.error('❌ Error signing out:', error);
                              // Fallback to direct sign out
                              auth.signOut();
                              setSettingsDropdownOpen(false);
                            }
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
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
      <main className="max-w-4xl mx-auto py-4 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg p-4 sm:p-8 min-h-[60vh]">
          {children}
        </div>
      </main>
    </div>
  );
} 