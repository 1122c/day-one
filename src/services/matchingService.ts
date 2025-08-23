import { UserProfile, Match } from '@/types/user';

// Use the Next.js API route instead of direct OpenAI calls
async function callOpenAI(prompt: string, systemPrompt: string = ''): Promise<string> {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        type: 'matching'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return '';
  }
}

export async function generateMatchSuggestions(
  currentUser: UserProfile,
  matchedUser: UserProfile
): Promise<string[]> {
  const prompt = `Given these two profiles:
  
  Person 1 (${currentUser.name}):
  - Bio: ${currentUser.bio || 'Not provided'}
  - Interests: ${currentUser.interests?.join(', ') || 'Not specified'}
  - Values: ${currentUser.values?.coreValues?.join(', ') || 'Not specified'}
  - Goals: ${currentUser.values?.personalGoals?.join(', ') || 'Not specified'}
  
  Person 2 (${matchedUser.name}):
  - Bio: ${matchedUser.bio || 'Not provided'}
  - Interests: ${matchedUser.interests?.join(', ') || 'Not specified'}
  - Values: ${matchedUser.values?.coreValues?.join(', ') || 'Not specified'}
  - Goals: ${matchedUser.values?.personalGoals?.join(', ') || 'Not specified'}
  
  Generate 3 specific suggestions for activities or topics they could explore together based on their shared interests and complementary strengths.`;

  const response = await callOpenAI(prompt);
  
  if (!response) {
    // Fallback suggestions
    return [
      "Explore a shared interest through a workshop or online course together",
      "Start a collaborative project that combines both of your unique skills",
      "Schedule regular coffee chats to discuss your professional goals and progress"
    ];
  }
  
  // Parse the response into an array
  return response
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .slice(0, 3);
}

export async function generateInitialMessage(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<string> {
  const prompt = `Write a friendly, engaging first message from ${currentUser.name} to ${targetUser.name}.
  
  ${currentUser.name}'s background:
  - ${currentUser.bio || 'Professional looking to connect'}
  - Interests: ${currentUser.interests?.join(', ') || 'Various'}
  
  ${targetUser.name}'s background:
  - ${targetUser.bio || 'Open to connections'}
  - Interests: ${targetUser.interests?.join(', ') || 'Various'}
  
  The message should:
  - Be warm and genuine
  - Reference something specific from their profile
  - Ask an engaging question
  - Be 2-3 sentences maximum`;

  const systemPrompt = 'You are an expert at writing personalized, engaging first messages that start meaningful conversations.';
  
  const response = await callOpenAI(prompt, systemPrompt);
  
  if (!response) {
    // Fallback message
    return `Hi ${targetUser.name}! I noticed we share some common interests and values. I'd love to hear about your journey and what you're currently working on. What's been the most exciting part of your recent projects?`;
  }
  
  return response.trim();
}

export async function generateFollowUpQuestions(
  currentUser: UserProfile,
  matchedUser: UserProfile,
  conversationHistory: string[]
): Promise<string[]> {
  // Get last few messages for context
  const recentMessages = conversationHistory.slice(-3).join('\n');
  
  const prompt = `Based on this conversation between ${currentUser.name} and ${matchedUser.name}:
  
  "${recentMessages}"
  
  Generate 3 natural follow-up questions that:
  - Build on what was just discussed
  - Show genuine interest and active listening
  - Encourage deeper conversation
  - Are concise and conversational`;

  const response = await callOpenAI(prompt);
  
  if (!response) {
    // Fallback questions
    return [
      "What inspired you to take that approach?",
      "How has that experience shaped your current goals?",
      "What's the next step in your journey with this?"
    ];
  }
  
  // Parse response into array
  return response
    .split('\n')
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\.\s*/, '').replace(/^[-•]\s*/, '').trim())
    .filter(line => line.endsWith('?'))
    .slice(0, 3);
}

export async function calculateMatchScore(
  user1: UserProfile,
  user2: UserProfile
): Promise<number> {
  // Calculate base score from shared interests
  const sharedInterests = user1.interests?.filter(
    interest => user2.interests?.includes(interest)
  ).length || 0;
  
  const totalInterests = Math.max(
    user1.interests?.length || 0,
    user2.interests?.length || 0
  );
  
  const interestScore = totalInterests > 0 ? (sharedInterests / totalInterests) * 40 : 0;
  
  // Calculate values alignment
  const sharedValues = user1.values?.coreValues?.filter(
    value => user2.values?.coreValues?.includes(value)
  ).length || 0;
  
  const totalValues = Math.max(
    user1.values?.coreValues?.length || 0,
    user2.values?.coreValues?.length || 0
  );
  
  const valueScore = totalValues > 0 ? (sharedValues / totalValues) * 30 : 0;
  
  // Calculate goal compatibility
  const sharedGoals = user1.values?.personalGoals?.filter(
    goal => user2.values?.personalGoals?.includes(goal)
  ).length || 0;
  
  const totalGoals = Math.max(
    user1.values?.personalGoals?.length || 0,
    user2.values?.personalGoals?.length || 0
  );
  
  const goalScore = totalGoals > 0 ? (sharedGoals / totalGoals) * 30 : 0;
  
  // Calculate total score
  const totalScore = Math.round(interestScore + valueScore + goalScore);
  
  // Ensure score is between 0 and 100
  return Math.min(100, Math.max(0, totalScore));
}

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
  const valuesAlignment = calculateValuesAlignment(user1.values?.coreValues || [], user2.values?.coreValues || []);
  
  // Goals alignment (25% weight)
  const goalsAlignment = calculateGoalsAlignment(user1.values?.personalGoals || [], user2.values?.personalGoals || []);
  
  // Communication style (20% weight)
  const communicationStyle = calculateCommunicationAlignment(
    user1.values?.preferredCommunication || [],
    user2.values?.preferredCommunication || []
  );
  
  // Availability match (10% weight)
  const availabilityMatch = calculateAvailabilityMatch(
    user1.values?.availability,
    user2.values?.availability
  );
  
  // Interests overlap (5% weight) - based on bio analysis
  const interestsOverlap = calculateInterestsOverlap(user1.bio || '', user2.bio || '');
  
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
  if (!avail1 || !avail2) return 50;
  
  // Check timezone compatibility
  const timezoneMatch = avail1.timezone === avail2.timezone ? 100 : 50;
  
  // Check overlapping preferred times
  const commonTimes = (avail1.preferredTimes || []).filter((time: string) => 
    (avail2.preferredTimes || []).includes(time)
  );
  const timeOverlap = (avail1.preferredTimes || []).length > 0 ? 
    (commonTimes.length / Math.max((avail1.preferredTimes || []).length, (avail2.preferredTimes || []).length)) * 100 : 0;
  
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
    - Core Values: ${(user1.values?.coreValues || []).join(', ')}
    - Personal Goals: ${(user1.values?.personalGoals || []).join(', ')}
    - Communication Preferences: ${(user1.values?.preferredCommunication || []).join(', ')}
    - Bio: ${user1.bio}
    
    User 2 (${user2.name}):
    - Core Values: ${(user2.values?.coreValues || []).join(', ')}
    - Personal Goals: ${(user2.values?.personalGoals || []).join(', ')}
    - Communication Preferences: ${(user2.values?.preferredCommunication || []).join(', ')}
    - Bio: ${user2.bio}
    
    Compatibility Scores:
    - Overall: ${compatibility.overallScore}%
    - Values Alignment: ${compatibility.valuesAlignment}%
    - Goals Alignment: ${compatibility.goalsAlignment}%
    - Communication Style: ${compatibility.communicationStyle}%
    
    Provide a concise, engaging reason (2-3 sentences) explaining why these users would connect well, focusing on their strongest alignment areas.
  `;

  try {
    const response = await callOpenAI(prompt);
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

export async function generateMatchInsights(
  userProfile: UserProfile,
  matchProfile: UserProfile
): Promise<string> {
  const prompt = `Analyze the potential match between these users:

    User 1 (${userProfile.name}):
    - Core Values: ${(userProfile.values?.coreValues || []).join(', ')}
    - Personal Goals: ${(userProfile.values?.personalGoals || []).join(', ')}
    - Communication Preferences: ${(userProfile.values?.preferredCommunication || []).join(', ')}
    - Bio: ${userProfile.bio}
    
    User 2 (${matchProfile.name}):
    - Core Values: ${(matchProfile.values?.coreValues || []).join(', ')}
    - Personal Goals: ${(matchProfile.values?.personalGoals || []).join(', ')}
    - Communication Preferences: ${(matchProfile.values?.preferredCommunication || []).join(', ')}
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
    const response = await callOpenAI(prompt);
    return response;
  } catch (error) {
    console.error('Error generating match insights:', error);
    throw error;
  }
}