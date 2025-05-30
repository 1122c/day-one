import { UserProfile, Match } from '@/types/user';
import { generateResponse } from './openaiService';

export const generateConversationStarters = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string[]> => {
  const prompt = `Generate 3 engaging conversation starters based on these user profiles:

    User 1 (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Bio: ${userProfile.bio}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Bio: ${matchProfile.bio}
    
    Generate 3 conversation starters that:
    1. Reference shared values or goals
    2. Are open-ended and encourage discussion
    3. Show genuine interest in the other person
    4. Are professional but friendly
    5. Avoid generic or cliché questions
    
    Format each starter on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating conversation starters:', error);
    throw error;
  }
};

export const generateIceBreakers = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string[]> => {
  const prompt = `Generate 3 fun ice breaker activities based on these user profiles:

    User 1 (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Communication Preferences: ${matchProfile.values.preferredCommunication.join(', ')}
    
    Generate 3 ice breaker activities that:
    1. Are appropriate for their communication preferences
    2. Help build rapport quickly
    3. Are engaging and fun
    4. Can be done in a short time
    5. Don't require special equipment
    
    Format each activity on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating ice breakers:', error);
    throw error;
  }
};

export const generateGrowthSuggestions = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string[]> => {
  const prompt = `Generate 3 growth and learning opportunities based on these user profiles:

    User 1 (${userProfile.name}):
    - Core Values: ${userProfile.values.coreValues.join(', ')}
    - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
    - Bio: ${userProfile.bio}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${matchProfile.values.coreValues.join(', ')}
    - Personal Goals: ${matchProfile.values.personalGoals.join(', ')}
    - Bio: ${matchProfile.bio}
    
    Generate 3 growth opportunities that:
    1. Leverage each person's strengths
    2. Address areas for development
    3. Are mutually beneficial
    4. Are specific and actionable
    5. Align with their values and goals
    
    Format each suggestion on a new line.`;

  try {
    const response = await generateResponse(prompt);
    return response.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error generating growth suggestions:', error);
    throw error;
  }
};

export const generateConnectionInsights = async (
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string> => {
  const prompt = `Analyze the potential connection between these users:

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
    
    Provide a thoughtful analysis that includes:
    1. Key areas of alignment
    2. Potential challenges
    3. Growth opportunities
    4. Communication style compatibility
    5. Specific ways they could support each other's goals
    
    Keep the analysis concise but insightful.`;

  try {
    const response = await generateResponse(prompt);
    return response;
  } catch (error) {
    console.error('Error generating connection insights:', error);
    throw error;
  }
}; 