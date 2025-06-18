export interface Message {
  id?: string;
  matchId: string;
  senderId: string;
  content: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: Date | any;
  updatedAt?: Date;
  messageType?: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
}

export interface Conversation {
  id: string;
  matchId: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ChatNotification {
  id: string;
  type: 'new_message' | 'typing' | 'read_receipt' | 'online_status';
  matchId: string;
  senderId: string;
  data: any;
  timestamp: Date;
  isRead: boolean;
}

export interface TypingIndicator {
  matchId: string;
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