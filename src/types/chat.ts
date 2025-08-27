export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date | any;
  read: boolean;
  messageType?: 'text' | 'image' | 'file' | 'system';
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

export interface ChatNotification {
  id: string;
  type: 'new_message' | 'typing' | 'read_receipt' | 'online_status';
  conversationId: string;
  senderId: string;
  data: any;
  timestamp: Date;
  isRead: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface OnlineStatus {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatSettings {
  userId: string;
  notifications: {
    newMessages: boolean;
    typingIndicators: boolean;
    readReceipts: boolean;
    onlineStatus: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    showTypingIndicators: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    messageBubbleStyle: 'rounded' | 'square';
  };
} 