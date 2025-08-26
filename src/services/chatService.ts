import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types/user';

// ============================================================================
// TYPES
// ============================================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  messageType: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileUrl?: string;
    imageUrl?: string;
    imageCaption?: string;
  };
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  lastMessageTime?: Date;
  unreadCount: { [userId: string]: number };
  status: 'active' | 'archived' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    title?: string;
    isGroup?: boolean;
    groupName?: string;
    groupAvatar?: string;
  };
}

export interface ChatParticipant {
  userId: string;
  profile: UserProfile;
  lastSeen?: Date;
  isOnline: boolean;
  typing: boolean;
}

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

export async function createConversation(
  participantIds: string[],
  metadata?: Conversation['metadata']
): Promise<string> {
  try {
    console.log('💬 Creating new conversation...');
    
    const conversationData = {
      participantIds,
      unreadCount: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      status: 'active' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      metadata: metadata || {}
    };

    const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);
    console.log('✅ Conversation created:', conversationRef.id);
    
    return conversationRef.id;
  } catch (error) {
    console.error('❌ Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      return {
        id: conversationSnap.id,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime?.toDate(),
        unreadCount: data.unreadCount || {},
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        metadata: data.metadata || {}
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    throw new Error('Failed to fetch conversation');
  }
}

export async function getConversationsForUser(
  userId: string,
  limitCount: number = 20
): Promise<Conversation[]> {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participantIds', 'array-contains', userId),
      where('status', '==', 'active'),
      orderBy('updatedAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime?.toDate(),
        unreadCount: data.unreadCount || {},
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        metadata: data.metadata || {}
      });
    });

    return conversations;
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
}

export async function updateConversationStatus(
  conversationId: string,
  status: Conversation['status']
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      status,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Conversation status updated');
  } catch (error) {
    console.error('❌ Error updating conversation status:', error);
    throw new Error('Failed to update conversation status');
  }
}

export async function archiveConversation(conversationId: string): Promise<void> {
  await updateConversationStatus(conversationId, 'archived');
}

export async function blockConversation(conversationId: string): Promise<void> {
  await updateConversationStatus(conversationId, 'blocked');
}

// ============================================================================
// MESSAGE OPERATIONS
// ============================================================================

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: Message['messageType'] = 'text',
  metadata?: Message['metadata']
): Promise<string> {
  try {
    console.log('📤 Sending message...');
    
    const messageData = {
      conversationId,
      senderId,
      content,
      timestamp: serverTimestamp(),
      read: false,
      messageType,
      metadata: metadata || {}
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageData);
    console.log('✅ Message sent:', messageRef.id);

    // Update conversation with last message
    await updateConversationLastMessage(conversationId, messageRef.id, content);
    
    // Increment unread count for other participants
    await incrementUnreadCount(conversationId, senderId);

    return messageRef.id;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

export async function getMessagesForConversation(
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read,
        messageType: data.messageType,
        metadata: data.metadata || {}
      });
    });

    // Return messages in chronological order (oldest first)
    return messages.reverse();
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
}

export async function markMessageAsRead(
  messageId: string
): Promise<void> {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, { read: true });
    console.log('✅ Message marked as read');
  } catch (error) {
    console.error('❌ Error marking message as read:', error);
    throw new Error('Failed to mark message as read');
  }
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      [`unreadCount.${userId}`]: 0,
      updatedAt: serverTimestamp()
    });
    console.log('✅ Conversation marked as read');
  } catch (error) {
    console.error('❌ Error marking conversation as read:', error);
    throw new Error('Failed to mark conversation as read');
  }
}

export async function deleteMessage(
  messageId: string,
  userId: string
): Promise<void> {
  try {
    const messageRef = doc(db, 'messages', messageId);
    const messageSnap = await getDoc(messageRef);
    
    if (!messageSnap.exists()) {
      throw new Error('Message not found');
    }

    const messageData = messageSnap.data();
    if (messageData.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    await updateDoc(messageRef, {
      content: '[Message deleted]',
      metadata: { deleted: true, deletedAt: serverTimestamp() }
    });
    
    console.log('✅ Message deleted');
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
}

// ============================================================================
// REAL-TIME LISTENERS
// ============================================================================

export function subscribeToConversation(
  conversationId: string,
  callback: (conversation: Conversation | null) => void
): () => void {
  const conversationRef = doc(db, 'conversations', conversationId);
  
  return onSnapshot(conversationRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const conversation: Conversation = {
        id: doc.id,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime?.toDate(),
        unreadCount: data.unreadCount || {},
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        metadata: data.metadata || {}
      };
      callback(conversation);
    } else {
      callback(null);
    }
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
): () => void {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read,
        messageType: data.messageType,
        metadata: data.metadata || {}
      });
    });
    
    // Return messages in chronological order (oldest first)
    callback(messages.reverse());
  });
}

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void,
  limitCount: number = 20
): () => void {
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participantIds', 'array-contains', userId),
    where('status', '==', 'active'),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime?.toDate(),
        unreadCount: data.unreadCount || {},
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        metadata: data.metadata || {}
      });
    });
    callback(conversations);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function updateConversationLastMessage(
  conversationId: string,
  messageId: string,
  content: string
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        id: messageId,
        content: content.length > 100 ? content.substring(0, 100) + '...' : content,
        timestamp: serverTimestamp()
      },
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('❌ Error updating conversation last message:', error);
  }
}

async function incrementUnreadCount(
  conversationId: string,
  senderId: string
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      const batch = writeBatch(db);
      
      // Increment unread count for all participants except sender
      data.participantIds.forEach((participantId: string) => {
        if (participantId !== senderId) {
          const currentCount = data.unreadCount?.[participantId] || 0;
          batch.update(conversationRef, {
            [`unreadCount.${participantId}`]: currentCount + 1
          });
        }
      });
      
      await batch.commit();
    }
  } catch (error) {
    console.error('❌ Error incrementing unread count:', error);
  }
}

export async function getOrCreateConversation(
  user1Id: string,
  user2Id: string
): Promise<string> {
  try {
    // Check if conversation already exists
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
        console.log('✅ Existing conversation found:', doc.id);
        return doc.id;
      }
    }

    // Create new conversation
    console.log('🆕 Creating new conversation...');
    return await createConversation([user1Id, user2Id]);
    
  } catch (error) {
    console.error('❌ Error getting or creating conversation:', error);
    throw new Error('Failed to get or create conversation');
  }
}

export function formatMessageTime(timestamp: Date): string {
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
} 