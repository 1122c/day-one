import { UserProfile, Match } from '@/types/user';
// import OpenAI from 'openai';
import { generateResponse } from './openaiService';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Enhanced matching algorithm with multiple scoring factors
export function calculateCompatibilityScore(
  user1: UserProfile,
  user2: UserProfile
): {
  overallScore: number;
  valuesAlignment: number;
  goalsAlignment: number;
  communicationStyle: number;
  availabilityMatch: number;
  interestsOverlap: number;
} {
  // Values alignment (40% weight)
  const valuesAlignment = calculateValuesAlignment(user1.values.coreValues, user2.values.coreValues);
  
  // Goals alignment (25% weight)
  const goalsAlignment = calculateGoalsAlignment(user1.values.personalGoals, user2.values.personalGoals);
  
  // Communication style (20% weight)
  const communicationStyle = calculateCommunicationAlignment(
    user1.values.preferredCommunication,
    user2.values.preferredCommunication
  );
  
  // Availability match (10% weight)
  const availabilityMatch = calculateAvailabilityMatch(
    user1.values.availability,
    user2.values.availability
  );
  
  // Interests overlap (5% weight) - based on bio analysis
  const interestsOverlap = calculateInterestsOverlap(user1.bio, user2.bio);
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    valuesAlignment * 0.4 +
    goalsAlignment * 0.25 +
    communicationStyle * 0.2 +
    availabilityMatch * 0.1 +
    interestsOverlap * 0.05
  );
  
  return {
    overallScore,
    valuesAlignment,
    goalsAlignment,
    communicationStyle,
    availabilityMatch,
    interestsOverlap,
  };
}

function calculateValuesAlignment(values1: string[], values2: string[]): number {
  const commonValues = values1.filter(value => values2.includes(value));
  const totalValues = Math.max(values1.length, values2.length);
  return totalValues > 0 ? (commonValues.length / totalValues) * 100 : 0;
}

function calculateGoalsAlignment(goals1: string[], goals2: string[]): number {
  const commonGoals = goals1.filter(goal => goals2.includes(goal));
  const totalGoals = Math.max(goals1.length, goals2.length);
  return totalGoals > 0 ? (commonGoals.length / totalGoals) * 100 : 0;
}

function calculateCommunicationAlignment(comm1: string[], comm2: string[]): number {
  const commonMethods = comm1.filter(method => comm2.includes(method));
  const totalMethods = Math.max(comm1.length, comm2.length);
  return totalMethods > 0 ? (commonMethods.length / totalMethods) * 100 : 0;
}

function calculateAvailabilityMatch(avail1: any, avail2: any): number {
  // Check timezone compatibility
  const timezoneMatch = avail1.timezone === avail2.timezone ? 100 : 50;
  
  // Check overlapping preferred times
  const commonTimes = avail1.preferredTimes.filter((time: string) => 
    avail2.preferredTimes.includes(time)
  );
  const timeOverlap = avail1.preferredTimes.length > 0 ? 
    (commonTimes.length / Math.max(avail1.preferredTimes.length, avail2.preferredTimes.length)) * 100 : 0;
  
  return (timezoneMatch + timeOverlap) / 2;
}

function calculateInterestsOverlap(bio1: string, bio2: string): number {
  // Simple keyword-based overlap calculation
  const words1 = bio1.toLowerCase().split(/\s+/);
  const words2 = bio2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => 
    words2.includes(word) && word.length > 3
  );
  
  const totalWords = Math.max(words1.length, words2.length);
  return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
}

export async function generateMatches(
  userProfile: UserProfile,
  potentialMatches: UserProfile[],
  maxMatches: number = 5
): Promise<Match[]> {
  const matches: Match[] = [];

  for (const potentialMatch of potentialMatches) {
    if (potentialMatch.id === userProfile.id) continue;

    // Calculate compatibility score using our enhanced algorithm
    const compatibility = calculateCompatibilityScore(userProfile, potentialMatch);
    
    // Only include matches with significant compatibility (70%+)
    if (compatibility.overallScore >= 70) {
      // Generate AI-powered match reason
      const matchReason = await generateMatchReason(userProfile, potentialMatch, compatibility);
      
      matches.push({
        id: `${userProfile.id}-${potentialMatch.id}`,
        userIds: [userProfile.id, potentialMatch.id],
        matchScore: compatibility.overallScore,
        compatibilityFactors: {
          valuesAlignment: compatibility.valuesAlignment,
          goalsAlignment: compatibility.goalsAlignment,
          communicationStyle: compatibility.communicationStyle,
        },
        matchReason,
        createdAt: new Date(),
        status: 'pending',
      });
    }

    if (matches.length >= maxMatches) break;
  }

  // Sort matches by score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

async function generateMatchReason(
  user1: UserProfile,
  user2: UserProfile,
  compatibility: any
): Promise<string> {
  const prompt = `
    Analyze the compatibility between these users and provide a compelling reason for connection:
    
    User 1 (${user1.name}):
    - Core Values: ${user1.values.coreValues.join(', ')}
    - Personal Goals: ${user1.values.personalGoals.join(', ')}
    - Communication Preferences: ${user1.values.preferredCommunication.join(', ')}
    - Bio: ${user1.bio}
    
    User 2 (${user2.name}):
    - Core Values: ${user2.values.coreValues.join(', ')}
    - Personal Goals: ${user2.values.personalGoals.join(', ')}
    - Communication Preferences: ${user2.values.preferredCommunication.join(', ')}
    - Bio: ${user2.bio}
    
    Compatibility Scores:
    - Overall: ${compatibility.overallScore}%
    - Values Alignment: ${compatibility.valuesAlignment}%
    - Goals Alignment: ${compatibility.goalsAlignment}%
    - Communication Style: ${compatibility.communicationStyle}%
    
    Provide a concise, engaging reason (2-3 sentences) explaining why these users would connect well, focusing on their strongest alignment areas.
  `;

  try {
    const response = await generateResponse(prompt);
    return response || 'Strong compatibility based on shared values and goals';
  } catch (error) {
    console.error('Error generating match reason:', error);
    return 'Strong compatibility based on shared values and goals';
  }
}

export async function saveMatches(matches: Match[]) {
  // TODO: Implement Firebase storage for matches
  console.log('Saving matches:', matches);
}

export async function getMatchesForUser(userId: string): Promise<Match[]> {
  // TODO: Implement Firebase retrieval for matches
  return [];
}

export const generateMatchInsights = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string> => {
  const prompt = `Analyze the potential match between these users:

    User 1 (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    - Bio: ${userProfile.bio}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${matchProfile.values.preferredCommunication.join(', ')}
    - Bio: ${matchProfile.bio}
    
    Provide a detailed analysis that includes:
    1. Value alignment score (0-100) and explanation
    2. Goal compatibility assessment
    3. Communication style compatibility
    4. Potential synergies
    5. Areas that might need attention
    6. Specific ways they could support each other
    
    Keep the analysis professional and actionable.`;

  try {
    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    console.error('Error generating match insights:', error);
    throw error;
  }
};

export const generateMatchSuggestions = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string[]> => {
  const prompt = `Generate specific suggestions for this match:

    User 1 (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${matchProfile.values.preferredCommunication.join(', ')}
    
    Generate 3 specific suggestions that:
    1. Leverage their shared values
    2. Address their communication preferences
    3. Support their individual goals
    4. Create opportunities for growth
    5. Build a strong foundation for connection
    
    Format each suggestion on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating match suggestions:', error);
    throw error;
  }
};

export const generateInitialMessage = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string> => {
  const prompt = `Generate an initial message for this match:

    Sender (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    - Bio: ${userProfile.bio}
    
    Recipient (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${matchProfile.values.preferredCommunication.join(', ')}
    - Bio: ${matchProfile.bio}
    
    Generate a message that:
    1. References shared values or interests
    2. Shows genuine interest in their goals
    3. Is professional but friendly
    4. Includes a specific question
    5. Respects their communication preferences
    6. Is concise but engaging
    
    Keep the message under 200 words.`;

  try {
    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    console.error('Error generating initial message:', error);
    throw error;
  }
};

export const generateFollowUpQuestions = async (
  userProfile: UserProfile,
  matchProfile: UserProfile,
  previousMessages: string[]
): Promise<string[]> => {
  const prompt = `Generate follow-up questions based on this conversation:

    User 1 (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${matchProfile.values.preferredCommunication.join(', ')}
    
    Previous Messages:
    ${previousMessages.join('\n')}
    
    Generate 3 follow-up questions that:
    1. Build on previous conversation topics
    2. Explore shared interests deeper
    3. Show active listening
    4. Are open-ended and engaging
    5. Respect their communication preferences
    
    Format each question on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    throw error;
  }
}; 