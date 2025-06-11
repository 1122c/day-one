export interface SocialProfile {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'tiktok' | 'onlyfans';
  username: string;
  url?: string;
}

export interface UserValues {
  coreValues: string[];
  personalGoals: string[];
  preferredCommunication: string[];
  availability: {
    timezone: string;
    preferredTimes: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio: string;
  socialProfiles?: SocialProfile[];
  values: UserValues;
  createdAt: Date;
  updatedAt: Date;
  privacy: {
    profileVisibility: 'public' | 'matches' | 'private';
    showEmail: boolean;
    showSocialProfiles: boolean;
    allowMessaging: boolean;
    showOnlineStatus: boolean;
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