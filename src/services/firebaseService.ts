import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import { UserProfile, Match, Connection, Notification } from '@/types/user';

// ============================================================================
// USER PROFILE OPERATIONS
// ============================================================================

export async function createUserProfile(
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userProfile: UserProfile = {
      id: userId,
      email: profileData.email || '',
      name: profileData.name || 'User',
      profilePicture: profileData.profilePicture,
      bio: profileData.bio,
      age: profileData.age,
      location: profileData.location,
      occupation: profileData.occupation,
      education: profileData.education,
      interests: profileData.interests || [],
      socialProfiles: profileData.socialProfiles || [],
      values: profileData.values || {
        coreValues: [],
        personalGoals: [],
        preferredCommunication: [],
        availability: {
          timezone: 'UTC',
          preferredTimes: []
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeactivated: false,
      privacy: profileData.privacy || {
        profileVisibility: 'public',
        showEmail: true,
        showSocialProfiles: true,
        allowMessaging: true,
        messageSource: 'anyone',
        showOnlineStatus: true,
        showReadReceipts: true,
        showTypingIndicators: true,
        allowProfileViews: true
      }
    };

    // Filter out undefined values before sending to Firebase
    const cleanProfile = Object.fromEntries(
      Object.entries(userProfile).filter(([_, value]) => value !== undefined)
    );

    await setDoc(userRef, {
      ...cleanProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ User profile created successfully');
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        email: data.email || '',
        name: data.name || 'User',
        profilePicture: data.profilePicture,
        bio: data.bio,
        age: data.age,
        location: data.location,
        occupation: data.occupation,
        education: data.education,
        interests: data.interests || [],
        socialProfiles: data.socialProfiles || [],
        values: data.values || {
          coreValues: [],
          personalGoals: [],
          preferredCommunication: [],
          availability: {
            timezone: 'UTC',
            preferredTimes: []
          }
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isDeactivated: data.isDeactivated || false,
        deactivatedAt: data.deactivatedAt?.toDate(),
        privacy: data.privacy || {
          profileVisibility: 'public',
          showEmail: true,
          showSocialProfiles: true,
          allowMessaging: true,
          messageSource: 'anyone',
          showOnlineStatus: true,
          showReadReceipts: true,
          showTypingIndicators: true,
          allowProfileViews: true
        }
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    console.log('✅ User profile updated successfully');
  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // Also delete related data (matches, connections, etc.)
    await deleteUserRelatedData(userId);

    console.log('✅ User profile deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting user profile:', error);
    throw new Error('Failed to delete user profile');
  }
}

// ============================================================================
// MATCHING SYSTEM
// ============================================================================

export async function createMatch(
  user1Id: string, 
  user2Id: string, 
  matchScore: number,
  compatibilityFactors: any
): Promise<string> {
  try {
    const matchData = {
      userIds: [user1Id, user2Id],
      matchScore,
      compatibilityFactors,
      matchReason: 'AI-generated match based on compatibility',
      createdAt: serverTimestamp(),
      status: 'pending' as const
    };

    const matchRef = await addDoc(collection(db, 'matches'), matchData);
    console.log('✅ Match created successfully:', matchRef.id);
    return matchRef.id;
  } catch (error) {
    console.error('❌ Error creating match:', error);
    throw new Error('Failed to create match');
  }
}

export async function getMatchesForUser(userId: string): Promise<Match[]> {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('userIds', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const matches: Match[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      matches.push({
        id: doc.id,
        userIds: data.userIds,
        matchScore: data.matchScore,
        compatibilityFactors: data.compatibilityFactors,
        matchReason: data.matchReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status
      });
    });

    return matches;
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    throw new Error('Failed to fetch matches');
  }
}

export async function updateMatchStatus(
  matchId: string, 
  status: 'pending' | 'accepted' | 'rejected'
): Promise<void> {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await updateDoc(matchRef, { status });

    // If accepted, create a connection
    if (status === 'accepted') {
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const matchData = matchSnap.data();
        await createConnection(matchData.userIds[0], matchData.userIds[1]);
      }
    }

    console.log('✅ Match status updated successfully');
  } catch (error) {
    console.error('❌ Error updating match status:', error);
    throw new Error('Failed to update match status');
  }
}

// ============================================================================
// CONNECTIONS SYSTEM
// ============================================================================

export async function createConnection(
  user1Id: string, 
  user2Id: string
): Promise<string> {
  try {
    const connectionData = {
      userIds: [user1Id, user2Id],
      status: 'active' as const,
      lastInteraction: serverTimestamp(),
      sharedInterests: [],
      growthAreas: [],
      notes: []
    };

    const connectionRef = await addDoc(collection(db, 'connections'), connectionData);
    console.log('✅ Connection created successfully:', connectionRef.id);
    return connectionRef.id;
  } catch (error) {
    console.error('❌ Error creating connection:', error);
    throw new Error('Failed to create connection');
  }
}

export async function getConnectionsForUser(userId: string): Promise<Connection[]> {
  try {
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('userIds', 'array-contains', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const connections: Connection[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      connections.push({
        id: doc.id,
        userIds: data.userIds,
        status: data.status,
        lastInteraction: data.lastInteraction?.toDate() || new Date(),
        sharedInterests: data.sharedInterests || [],
        growthAreas: data.growthAreas || [],
        notes: data.notes || []
      });
    });

    return connections;
  } catch (error) {
    console.error('❌ Error fetching connections:', error);
    throw new Error('Failed to fetch connections');
  }
}

export async function removeConnection(connectionId: string): Promise<void> {
  try {
    const connectionRef = doc(db, 'connections', connectionId);
    await deleteDoc(connectionRef);
    console.log('✅ Connection removed successfully');
  } catch (error) {
    console.error('❌ Error removing connection:', error);
    throw new Error('Failed to remove connection');
  }
}

// ============================================================================
// USER BLOCKING SYSTEM
// ============================================================================

export async function blockUser(
  currentUserId: string,
  blockedUserId: string,
  reason?: string
): Promise<void> {
  try {
    console.log('🚫 Blocking user:', blockedUserId);
    
    // Create or update block record
    const blockData = {
      blockerId: currentUserId,
      blockedUserId: blockedUserId,
      reason: reason || 'User blocked',
      blockedAt: serverTimestamp(),
      status: 'active' as const
    };

    const blockRef = doc(db, 'userBlocks', `${currentUserId}_${blockedUserId}`);
    await setDoc(blockRef, blockData);

    // Remove any existing connection
    await removeConnectionIfExists(currentUserId, blockedUserId);

    // Archive any existing conversations
    await archiveConversationsBetweenUsers(currentUserId, blockedUserId);

    console.log('✅ User blocked successfully');
  } catch (error) {
    console.error('❌ Error blocking user:', error);
    throw new Error('Failed to block user');
  }
}

export async function unblockUser(
  currentUserId: string,
  blockedUserId: string
): Promise<void> {
  try {
    console.log('🔓 Unblocking user:', blockedUserId);
    
    const blockRef = doc(db, 'userBlocks', `${currentUserId}_${blockedUserId}`);
    await deleteDoc(blockRef);

    console.log('✅ User unblocked successfully');
  } catch (error) {
    console.error('❌ Error unblocking user:', error);
    throw new Error('Failed to unblock user');
  }
}

export async function isUserBlocked(
  currentUserId: string,
  otherUserId: string
): Promise<boolean> {
  try {
    const blockRef = doc(db, 'userBlocks', `${currentUserId}_${otherUserId}`);
    const blockSnap = await getDoc(blockRef);
    
    if (blockSnap.exists()) {
      const blockData = blockSnap.data();
      return blockData.status === 'active';
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error checking if user is blocked:', error);
    return false;
  }
}

export async function getBlockedUsers(userId: string): Promise<string[]> {
  try {
    const blocksRef = collection(db, 'userBlocks');
    const q = query(
      blocksRef,
      where('blockerId', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const blockedUserIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blockedUserIds.push(data.blockedUserId);
    });

    return blockedUserIds;
  } catch (error) {
    console.error('❌ Error getting blocked users:', error);
    return [];
  }
}

export async function getUsersWhoBlockedMe(userId: string): Promise<string[]> {
  try {
    const blocksRef = collection(db, 'userBlocks');
    const q = query(
      blocksRef,
      where('blockedUserId', '==', userId),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    const blockerIds: string[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blockerIds.push(data.blockerId);
    });

    return blockerIds;
  } catch (error) {
    console.error('❌ Error getting users who blocked me:', error);
    return [];
  }
}

// Helper function to remove connection if it exists
async function removeConnectionIfExists(user1Id: string, user2Id: string): Promise<void> {
  try {
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('userIds', 'array-contains', user1Id),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.userIds.includes(user2Id)) {
        await deleteDoc(doc.ref);
        console.log('✅ Connection removed due to blocking');
        break;
      }
    }
  } catch (error) {
    console.error('❌ Error removing connection:', error);
  }
}

// Helper function to archive conversations between blocked users
async function archiveConversationsBetweenUsers(user1Id: string, user2Id: string): Promise<void> {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', user1Id),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.participantIds.includes(user2Id)) {
        await updateDoc(doc.ref, { 
          status: 'archived',
          updatedAt: serverTimestamp()
        });
        console.log('✅ Conversation archived due to blocking');
      }
    }
  } catch (error) {
    console.error('❌ Error archiving conversations:', error);
  }
}

// ============================================================================
// CONNECTION REQUESTS SYSTEM
// ============================================================================

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function sendConnectionRequest(
  fromUserId: string,
  toUserId: string,
  message?: string
): Promise<string> {
  try {
    console.log('📤 Sending connection request from', fromUserId, 'to', toUserId);
    
    // Check if request already exists
    const existingRequest = await getExistingConnectionRequest(fromUserId, toUserId);
    if (existingRequest) {
      throw new Error('Connection request already exists');
    }
    
    // Check if users are already connected
    const existingConnection = await getExistingConnection(fromUserId, toUserId);
    if (existingConnection) {
      throw new Error('Users are already connected');
    }
    
    const requestData = {
      fromUserId,
      toUserId,
      status: 'pending' as const,
      message: message || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const requestRef = await addDoc(collection(db, 'connectionRequests'), requestData);
    
    // Create notification for recipient
    await createNotification(toUserId, {
      userId: toUserId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `You have a new connection request from ${fromUserId}`,
      actionUrl: '/connections/requests'
    });

    console.log('✅ Connection request sent successfully');
    return requestRef.id;
  } catch (error) {
    console.error('❌ Error sending connection request:', error);
    throw new Error('Failed to send connection request');
  }
}

export async function acceptConnectionRequest(requestId: string): Promise<void> {
  try {
    console.log('✅ Accepting connection request:', requestId);
    
    const requestRef = doc(db, 'connectionRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      throw new Error('Connection request not found');
    }
    
    const requestData = requestSnap.data() as ConnectionRequest;
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });
    
    // Create connection between users
    await createConnection(requestData.fromUserId, requestData.toUserId);
    
    // Create notifications
    await createNotification(requestData.fromUserId, {
      userId: requestData.fromUserId,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `Your connection request to ${requestData.toUserId} was accepted!`,
      actionUrl: '/connections'
    });
    
    console.log('✅ Connection request accepted successfully');
  } catch (error) {
    console.error('❌ Error accepting connection request:', error);
    throw new Error('Failed to accept connection request');
  }
}

export async function rejectConnectionRequest(requestId: string): Promise<void> {
  try {
    console.log('❌ Rejecting connection request:', requestId);
    
    const requestRef = doc(db, 'connectionRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      throw new Error('Connection request not found');
    }
    
    const requestData = requestSnap.data() as ConnectionRequest;
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    
    // Create notification for sender
    await createNotification(requestData.fromUserId, {
      userId: requestData.fromUserId,
      type: 'connection_rejected',
      title: 'Connection Request Rejected',
      message: `Your connection request to ${requestData.toUserId} was rejected.`,
      actionUrl: '/connections'
    });
    
    console.log('✅ Connection request rejected successfully');
  } catch (error) {
    console.error('❌ Error rejecting connection request:', error);
    throw new Error('Failed to reject connection request');
  }
}

export async function cancelConnectionRequest(requestId: string): Promise<void> {
  try {
    console.log('🚫 Cancelling connection request:', requestId);
    
    const requestRef = doc(db, 'connectionRequests', requestId);
    await deleteDoc(requestRef);
    
    console.log('✅ Connection request cancelled successfully');
  } catch (error) {
    console.error('❌ Error cancelling connection request:', error);
    throw new Error('Failed to cancel connection request');
  }
}

export async function ignoreConnectionRequest(requestId: string): Promise<void> {
  try {
    console.log('🤐 Ignoring connection request:', requestId);
    
    const requestRef = doc(db, 'connectionRequests', requestId);
    await updateDoc(requestRef, {
      status: 'ignored',
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Connection request ignored successfully');
  } catch (error) {
    console.error('❌ Error ignoring connection request:', error);
    throw new Error('Failed to ignore connection request');
  }
}

export async function getConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
  try {
    console.log('📋 Getting connection requests for user:', userId);
    
    const requestsRef = collection(db, 'connectionRequests');
    const q = query(
      requestsRef,
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requests: ConnectionRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        status: data.status,
        message: data.message,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    console.log('✅ Retrieved connection requests:', requests.length);
    return requests;
  } catch (error) {
    console.error('❌ Error getting connection requests:', error);
    return [];
  }
}

export async function getSentConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
  try {
    console.log('📤 Getting sent connection requests for user:', userId);
    
    const requestsRef = collection(db, 'connectionRequests');
    const q = query(
      requestsRef,
      where('fromUserId', '==', userId),
      where('status', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const requests: ConnectionRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      requests.push({
        id: doc.id,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        status: data.status,
        message: data.message,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    console.log('✅ Retrieved sent connection requests:', requests.length);
    return requests;
  } catch (error) {
    console.error('❌ Error getting sent connection requests:', error);
    return [];
  }
}

// Helper function to check for existing connection request
async function getExistingConnectionRequest(user1Id: string, user2Id: string): Promise<ConnectionRequest | null> {
  try {
    const requestsRef = collection(db, 'connectionRequests');
    const q = query(
      requestsRef,
      where('fromUserId', '==', user1Id),
      where('toUserId', '==', user2Id),
      where('status', 'in', ['pending', 'accepted'])
    );

    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if ((data.fromUserId === user1Id && data.toUserId === user2Id) ||
          (data.fromUserId === user2Id && data.toUserId === user1Id)) {
        return {
          id: doc.id,
          fromUserId: data.fromUserId,
          toUserId: data.toUserId,
          status: data.status,
          message: data.message,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error checking existing connection request:', error);
    return null;
  }
}

// Helper function to check for existing connection
async function getExistingConnection(user1Id: string, user2Id: string): Promise<any> {
  try {
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('userIds', 'array-contains', user1Id),
      where('status', '==', 'active')
    );

    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      if (data.userIds.includes(user2Id)) {
        return { id: doc.id, ...data };
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error checking existing connection:', error);
    return null;
  }
}

// ============================================================================
// NOTIFICATIONS SYSTEM
// ============================================================================

export async function createNotification(
  userId: string,
  notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>
): Promise<string> {
  try {
    const notification = {
      ...notificationData,
      timestamp: serverTimestamp(),
      read: false
    };

    const notificationRef = await addDoc(collection(db, 'notifications'), notification);
    console.log('✅ Notification created successfully:', notificationRef.id);
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

export async function getNotificationsForUser(
  userId: string, 
  limitCount: number = 20
): Promise<Notification[]> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        userId: data.userId || '',
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read,
        actionUrl: data.actionUrl,
        actionData: data.actionData
      });
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw new Error('Failed to fetch notifications');
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
    console.log('✅ Notification marked as read');
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

// ============================================================================
// REAL-TIME LISTENERS
// ============================================================================

export function subscribeToUserProfile(
  userId: string, 
  callback: (profile: UserProfile | null) => void
): () => void {
  const userRef = doc(db, 'users', userId);
  
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const profile: UserProfile = {
        id: doc.id,
        email: data.email || '',
        name: data.name || 'User',
        profilePicture: data.profilePicture || null,
        bio: data.bio,
        age: data.age,
        location: data.location,
        occupation: data.occupation,
        education: data.education,
        interests: data.interests || [],
        socialProfiles: data.socialProfiles || [],
        values: data.values || {
          coreValues: [],
          personalGoals: [],
          preferredCommunication: [],
          availability: {
            timezone: 'UTC',
            preferredTimes: []
          }
        },
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        isDeactivated: data.isDeactivated || false,
        privacy: data.privacy || {
          profileVisibility: 'public',
          showEmail: true,
          showSocialProfiles: true,
          allowMessaging: true,
          messageSource: 'anyone',
          showOnlineStatus: true,
          showReadReceipts: true,
          showTypingIndicators: true,
          allowProfileViews: true
        }
      };
      callback(profile);
    } else {
      callback(null);
    }
  });
}

export function subscribeToNotifications(
  userId: string, 
  callback: (notifications: Notification[]) => void
): () => void {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (querySnapshot) => {
    const notifications: Notification[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        userId: data.userId || '',
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read,
        actionUrl: data.actionUrl,
        actionData: data.actionData
      });
    });
    callback(notifications);
  });
}

export function subscribeToMatches(
  userId: string, 
  callback: (matches: Match[]) => void
): () => void {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('userIds', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const matches: Match[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      matches.push({
        id: doc.id,
        userIds: data.userIds,
        matchScore: data.matchScore,
        compatibilityFactors: data.compatibilityFactors,
        matchReason: data.matchReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status
      });
    });
    callback(matches);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function deleteUserRelatedData(userId: string): Promise<void> {
  try {
    // Delete matches
    const matchesRef = collection(db, 'matches');
    const matchesQuery = query(matchesRef, where('userIds', 'array-contains', userId));
    const matchesSnapshot = await getDocs(matchesQuery);
    
    const batch = writeBatch(db);
    matchesSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete connections
    const connectionsRef = collection(db, 'connections');
    const connectionsQuery = query(connectionsRef, where('userIds', 'array-contains', userId));
    const connectionsSnapshot = await getDocs(connectionsQuery);
    
    connectionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete notifications
    const notificationsRef = collection(db, 'notifications');
    const notificationsQuery = query(notificationsRef, where('userId', '==', userId));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    
    notificationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log('✅ User related data deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting user related data:', error);
    throw new Error('Failed to delete user related data');
  }
}

export async function searchUsers(
  searchTerm: string, 
  currentUserId: string,
  limitCount: number = 20
): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || 'User',
          profilePicture: data.profilePicture || null,
          bio: data.bio,
          age: data.age,
          location: data.location,
          occupation: data.occupation,
          education: data.education,
          interests: data.interests || [],
          socialProfiles: data.socialProfiles || [],
          values: data.values || {
            coreValues: [],
            personalGoals: [],
            preferredCommunication: [],
            availability: {
              timezone: 'UTC',
              preferredTimes: []
            }
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isDeactivated: data.isDeactivated || false,
          privacy: data.privacy || {
            profileVisibility: 'public',
            showEmail: true,
            showSocialProfiles: true,
            allowMessaging: true,
            messageSource: 'anyone',
            showOnlineStatus: true,
            showReadReceipts: true,
            showTypingIndicators: true,
            allowProfileViews: true
          }
        });
      }
    });

    return users;
  } catch (error) {
    console.error('❌ Error searching users:', error);
    throw new Error('Failed to search users');
  }
}

export async function getPotentialMatches(
  currentUserId: string,
  limitCount: number = 10
): Promise<UserProfile[]> {
  try {
    const currentUser = await getUserProfile(currentUserId);
    if (!currentUser) throw new Error('Current user not found');

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('privacy.profileVisibility', '==', 'public'),
      limit(limitCount * 2) // Get more to filter
    );

    const querySnapshot = await getDocs(q);
    const potentialMatches: UserProfile[] = [];

    querySnapshot.forEach((doc) => {
      if (doc.id !== currentUserId) {
        const data = doc.data();
        const userProfile: UserProfile = {
          id: doc.id,
          email: data.email || '',
          name: data.name || 'User',
          profilePicture: data.profilePicture || null,
          bio: data.bio,
          age: data.age,
          location: data.location,
          occupation: data.occupation,
          education: data.education,
          interests: data.interests || [],
          socialProfiles: data.socialProfiles || [],
          values: data.values || {
            coreValues: [],
            personalGoals: [],
            preferredCommunication: [],
            availability: {
              timezone: 'UTC',
              preferredTimes: []
            }
          },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          isDeactivated: data.isDeactivated || false,
          privacy: data.privacy || {
            profileVisibility: 'public',
            showEmail: true,
            showSocialProfiles: true,
            allowMessaging: true,
            messageSource: 'anyone',
            showOnlineStatus: true,
            showReadReceipts: true,
            showTypingIndicators: true,
            allowProfileViews: true
          }
        };

        // Basic compatibility check
        const compatibility = calculateBasicCompatibility(currentUser, userProfile);
        if (compatibility > 30) { // Only show users with >30% compatibility
          potentialMatches.push(userProfile);
        }
      }
    });

    // Sort by compatibility and limit
    return potentialMatches
      .sort((a, b) => calculateBasicCompatibility(currentUser, b) - calculateBasicCompatibility(currentUser, a))
      .slice(0, limitCount);
  } catch (error) {
    console.error('❌ Error getting potential matches:', error);
    throw new Error('Failed to get potential matches');
  }
}

function calculateBasicCompatibility(user1: UserProfile, user2: UserProfile): number {
  let score = 0;
  
  // Check shared interests
  const sharedInterests = user1.interests?.filter(interest => 
    user2.interests?.includes(interest)
  ).length || 0;
  
  if (user1.interests && user1.interests.length > 0) {
    score += (sharedInterests / user1.interests.length) * 40;
  }
  
  // Check shared values
  const sharedValues = user1.values?.coreValues?.filter(value => 
    user2.values?.coreValues?.includes(value)
  ).length || 0;
  
  if (user1.values?.coreValues && user1.values.coreValues.length > 0) {
    score += (sharedValues / user1.values.coreValues.length) * 30;
  }
  
  // Check shared goals
  const sharedGoals = user1.values?.personalGoals?.filter(goal => 
    user2.values?.personalGoals?.includes(goal)
  ).length || 0;
  
  if (user1.values?.personalGoals && user1.values.personalGoals.length > 0) {
    score += (sharedGoals / user1.values.personalGoals.length) * 30;
  }
  
  return Math.round(score);
} 