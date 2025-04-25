import { UserProfile, Match } from '@/types/user';
import OpenAI from 'openai';

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