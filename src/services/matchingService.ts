import { UserProfile, Match } from '@/types/user';
import OpenAI from 'openai';
import { generateResponse } from './openaiService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMatches(
  userProfile: UserProfile,
  potentialMatches: UserProfile[],
  maxMatches: number = 5
): Promise<Match[]> {
  const matches: Match[] = [];

  for (const potentialMatch of potentialMatches) {
    if (potentialMatch.id === userProfile.id) continue;

    const prompt = `
      Analyze the compatibility between two users based on their profiles.
      
      User 1 (${userProfile.name}):
      - Core Values: ${userProfile.values.coreValues.join(', ')}
      - Personal Goals: ${userProfile.values.personalGoals.join(', ')}
      - Communication Preferences: ${userProfile.values.preferredCommunication.join(', ')}
      - Bio: ${userProfile.bio}
      
      User 2 (${potentialMatch.name}):
      - Core Values: ${potentialMatch.values.coreValues.join(', ')}
      - Personal Goals: ${potentialMatch.values.personalGoals.join(', ')}
      - Communication Preferences: ${potentialMatch.values.preferredCommunication.join(', ')}
      - Bio: ${potentialMatch.bio}
      
      Please provide:
      1. A compatibility score (0-100)
      2. Key areas of alignment
      3. Potential growth opportunities
      4. A thoughtful explanation of why these users might connect well
    `;

    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4',
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      if (!response) continue;

      // Parse the response to extract scores and reasons
      const matchScore = extractScore(response);
      const compatibilityFactors = extractCompatibilityFactors(response);
      const matchReason = extractMatchReason(response);

      if (matchScore >= 70) { // Only include matches with significant compatibility
        matches.push({
          id: `${userProfile.id}-${potentialMatch.id}`,
          userIds: [userProfile.id, potentialMatch.id],
          matchScore,
          compatibilityFactors,
          matchReason,
          createdAt: new Date(),
          status: 'pending',
        });
      }

      if (matches.length >= maxMatches) break;
    } catch (error) {
      console.error('Error generating match:', error);
    }
  }

  return matches;
}

function extractScore(response: string): number {
  const scoreMatch = response.match(/compatibility score.*?(\d+)/i);
  return scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
}

function extractCompatibilityFactors(response: string): {
  valuesAlignment: number;
  goalsAlignment: number;
  communicationStyle: number;
} {
  // This is a simplified extraction. In a real implementation,
  // you would want to parse the response more carefully.
  return {
    valuesAlignment: Math.floor(Math.random() * 100),
    goalsAlignment: Math.floor(Math.random() * 100),
    communicationStyle: Math.floor(Math.random() * 100),
  };
}

function extractMatchReason(response: string): string {
  const reasonMatch = response.match(/explanation of why these users might connect well:([\s\S]*?)(?=\n\n|$)/i);
  return reasonMatch ? reasonMatch[1].trim() : 'Compatibility analysis available';
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