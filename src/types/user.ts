export type SocialProfile = {
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'tiktok' | 'onlyfans';
  url: string;
  username: string;
};

export type UserValues = {
  coreValues: string[];
  personalGoals: string[];
  preferredCommunication: string[];
  availability: {
    timezone: string;
    preferredTimes: string[];
  };
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  bio: string;
  photoURL?: string;
  socialProfiles?: SocialProfile[];
  values: UserValues;
  createdAt: Date;
  updatedAt: Date;
};

export type Match = {
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
};

export type Connection = {
  id: string;
  userIds: string[];
  status: 'pending' | 'active' | 'inactive';
  lastInteraction: Date;
  sharedInterests: string[];
  growthAreas: string[];
  notes: string[];
}; 