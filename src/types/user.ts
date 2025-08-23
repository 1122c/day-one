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
    profileVisibility: 'public' | 'matches' | 'private';
    showEmail: boolean;
    showSocialProfiles: boolean;
    allowMessaging: boolean;
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

export type Connection = {
  id: string;
  userIds: string[];
  status: 'pending' | 'active' | 'inactive';
  lastInteraction: Date;
  sharedInterests: string[];
  growthAreas: string[];
  notes: string[];
}; 