import { useState, useEffect } from 'react';
import { UserProfile, ConnectionRequest } from '@/types/user';
import { 
  getConnectionRequests, 
  getSentConnectionRequests,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  ignoreConnectionRequest,
  getUserProfile
} from '@/services/firebaseService';
import { FiUser, FiCheck, FiX, FiClock, FiUserMinus, FiEye } from 'react-icons/fi';

interface ConnectionRequestsProps {
  currentUser: UserProfile;
  onViewProfile: (profile: UserProfile) => void;
}

export default function ConnectionRequests({ currentUser, onViewProfile }: ConnectionRequestsProps) {
  const [incomingRequests, setIncomingRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    loadConnectionRequests();
  }, [currentUser.id]);

  const loadConnectionRequests = async () => {
    try {
      setLoading(true);
      
      // Load both incoming and sent requests
      const [incoming, sent] = await Promise.all([
        getConnectionRequests(currentUser.id),
        getSentConnectionRequests(currentUser.id)
      ]);
      
      setIncomingRequests(incoming);
      setSentRequests(sent);
      
      // Load user profiles for all requests
      const allUserIds = new Set([
        ...incoming.map(req => req.fromUserId),
        ...sent.map(req => req.toUserId)
      ]);
      
      const profiles: Record<string, UserProfile> = {};
      for (const userId of allUserIds) {
        try {
          const profile = await getUserProfile(userId);
          if (profile) {
            profiles[userId] = profile;
          }
        } catch (error) {
          console.error('Error loading profile for user:', userId, error);
        }
      }
      
      setUserProfiles(profiles);
    } catch (error) {
      console.error('Error loading connection requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptConnectionRequest(requestId);
      
      // Remove from incoming requests
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Reload to refresh the list
      await loadConnectionRequests();
      
      alert('Connection request accepted!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept connection request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectConnectionRequest(requestId);
      
      // Remove from incoming requests
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert('Connection request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject connection request. Please try again.');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelConnectionRequest(requestId);
      
      // Remove from sent requests
      setSentRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert('Connection request cancelled.');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel connection request. Please try again.');
    }
  };

  const handleIgnoreRequest = async (requestId: string) => {
    try {
      await ignoreConnectionRequest(requestId);
      
      // Remove from incoming requests
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId));
      
      alert('Connection request ignored.');
    } catch (error) {
      console.error('Error ignoring request:', error);
      alert('Failed to ignore connection request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const hasIncomingRequests = incomingRequests.length > 0;
  const hasSentRequests = sentRequests.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Connection Requests</h2>
        <p className="mt-2 text-gray-600">Manage your incoming and outgoing connection requests</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'incoming'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Incoming Requests
              {hasIncomingRequests && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {incomingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sent'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sent Requests
              {hasSentRequests && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'incoming' ? (
            <div>
              {hasIncomingRequests ? (
                <div className="space-y-4">
                  {incomingRequests.map((request) => {
                    const fromUser = userProfiles[request.fromUserId];
                    if (!fromUser) return null;

                    return (
                      <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{fromUser.name}</h3>
                              <p className="text-sm text-gray-600">{fromUser.occupation || 'Professional'}</p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-1 italic">"{request.message}"</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Requested {request.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onViewProfile(fromUser)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                              title="View Profile"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAcceptRequest(request.id)}
                              className="px-3 py-1 text-sm text-green-600 hover:text-green-800 hover:bg-green-100 rounded-md transition-colors duration-200"
                              title="Accept Request"
                            >
                              <FiCheck className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors duration-200"
                              title="Reject Request"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleIgnoreRequest(request.id)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                              title="Ignore Request"
                            >
                              <FiUserMinus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiClock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No incoming requests</h3>
                  <p className="mt-2 text-gray-600">
                    You don't have any pending connection requests at the moment.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {hasSentRequests ? (
                <div className="space-y-4">
                  {sentRequests.map((request) => {
                    const toUser = userProfiles[request.toUserId];
                    if (!toUser) return null;

                    return (
                      <div key={request.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{toUser.name}</h3>
                              <p className="text-sm text-gray-600">{toUser.occupation || 'Professional'}</p>
                              {request.message && (
                                <p className="text-sm text-gray-700 mt-1 italic">"{request.message}"</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                Sent {request.createdAt.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onViewProfile(toUser)}
                              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors duration-200"
                              title="View Profile"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors duration-200"
                              title="Cancel Request"
                            >
                              <FiX className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FiClock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No sent requests</h3>
                  <p className="mt-2 text-gray-600">
                    You haven't sent any connection requests yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
