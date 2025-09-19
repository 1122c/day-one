import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { UserProfile } from '@/types/user';
import Layout from '@/components/Layout';
import { FiBell, FiChevronDown, FiChevronUp, FiMessageSquare, FiHeart, FiUsers, FiEye, FiX } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'message' | 'match' | 'connection' | 'profile_view' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionData?: any;
}

export default function NotificationsPage() {
  const [user, loading] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // For now, create a mock profile since have Firebase isn't fully set up
      const mockProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        age: '25',
        location: 'San Francisco, CA',
        occupation: 'Software Developer',
        education: 'Bachelor\'s Degree',
        bio: 'Passionate about technology and innovation',
        interests: ['Technology', 'Innovation', 'Problem Solving'],
        socialProfiles: [
          { platform: 'linkedin', username: '', url: '' },
          { platform: 'twitter', username: '', url: '' },
          { platform: 'facebook', username: '', url: '' }
        ],
        values: {
          coreValues: ['Growth', 'Innovation', 'Collaboration'],
          personalGoals: ['Learn new technologies', 'Build meaningful products', 'Mentor others'],
          preferredCommunication: ['Direct', 'Professional', 'Constructive'],
          availability: {
            timezone: 'America/Los_Angeles',
            preferredTimes: ['Morning', 'Afternoon']
          }
        },
        privacy: {
          profileVisibility: 'public',
          showEmail: true,
          showSocialProfiles: true,
          allowMessaging: true,
          messageSource: 'anyone',
          showOnlineStatus: true,
          showReadReceipts: true,
          showTypingIndicators: true,
          allowProfileViews: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUserProfile(mockProfile);

      // Generate mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'message',
          title: 'New Message from Sarah',
          message: 'Sarah sent you a message about your shared interest in technology.',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          read: false,
          actionUrl: '/messages',
          actionData: { conversationId: 'conv-1' }
        },
        {
          id: '2',
          type: 'match',
          title: 'New Connection: Alex Chen',
          message: 'You have a new connection with Alex Chen based on shared values.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          read: false,
          actionUrl: '/matches',
          actionData: { matchId: 'match-1' }
        },
        {
          id: '3',
          type: 'connection',
          title: 'Connection Request Accepted',
          message: 'John Doe accepted your connection request.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          read: true,
          actionUrl: '/connections',
          actionData: { connectionId: 'conn-1' }
        },
        {
          id: '4',
          type: 'profile_view',
          title: 'Profile Viewed',
          message: 'Someone viewed your profile recently.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          read: true,
          actionUrl: '/discover',
          actionData: { viewerId: 'viewer-1' }
        },
        {
          id: '5',
          type: 'system',
          title: 'Welcome to WeNetwork!',
          message: 'Your profile has been successfully created. Start connecting with others!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          read: true,
          actionUrl: '/discover',
          actionData: {}
        }
      ];
      setNotifications(mockNotifications);
    }
  }, [user]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate to appropriate page
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <FiMessageSquare className="h-5 w-5 text-blue-600" />;
      case 'match':
        return <FiHeart className="h-5 w-5 text-red-600" />;
      case 'connection':
        return <FiUsers className="h-5 w-5 text-green-600" />;
      case 'profile_view':
        return <FiEye className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <FiBell className="h-5 w-5 text-gray-600" />;
      default:
        return <FiBell className="h-5 w-5 text-gray-600" />;
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

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view notifications</h1>
            <p className="text-gray-600">You need to be authenticated to access your notifications.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Stay updated with your latest connections, messages, and activity
            </p>
          </div>

          {/* Notifications Dropdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  {isDropdownOpen ? (
                    <>
                      <span>Hide</span>
                      <FiChevronUp className="ml-1 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Show</span>
                      <FiChevronDown className="ml-1 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {isDropdownOpen && (
              <div className="divide-y divide-gray-200">
                {notifications.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <FiBell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications yet</h3>
                    <p className="mt-2 text-gray-500">
                      When you receive notifications, they'll appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
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
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiBell className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">How it works</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>• Click "Show" to view your notifications</p>
                  <p>• Click on any notification to navigate to the relevant page</p>
                  <p>• Unread notifications are highlighted in blue</p>
                  <p>• Notifications are automatically marked as read when clicked</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
