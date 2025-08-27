export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'onlyfans' | 'facebook' | 'youtube' | 'discord';
  username: string;
  url?: string;
}

export interface UserValues {
  coreValues: string[];
  personalGoals: string[];
  preferredCommunication: string[];
  availability: {
    timezone?: string;
    preferredTimes?: string[];
    availability?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  age?: string;
  location?: string;
  occupation?: string;
  education?: string;
  interests?: string[];
  socialProfiles?: SocialProfile[];
  values: UserValues;
  createdAt: Date;
  updatedAt: Date;
  isDeactivated?: boolean;
  deactivatedAt?: Date;
  privacy: {
    profileVisibility: 'public' | 'connections' | 'private' | 'hidden';
    showEmail: boolean;
    showSocialProfiles: boolean;
    allowMessaging: boolean;
    messageSource: 'connections' | 'anyone';
    showOnlineStatus: boolean;
    showReadReceipts: boolean;
    showTypingIndicators: boolean;
    allowProfileViews: boolean;
  };
}

export interface Match {
  id: string;
  userIds: string[];
  matchScore: number;
  compatibilityFactors: {
    valuesAlignment: number;
    goalsAlignment: number;
    communicationStyle: number;
  };
  matchReason: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Connection {
  id: string;
  userIds: string[];
  status: 'pending' | 'active' | 'inactive';
  lastInteraction: Date;
  sharedInterests: string[];
  growthAreas: string[];
  notes: string[];
}

export interface ConnectionRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'match' | 'connection' | 'profile_view' | 'system' | 'connection_request' | 'connection_accepted' | 'connection_rejected';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionData?: any;
} 