import { UserProfile, Match } from '@/types/user';

// Use the Next.js API route instead of direct OpenAI calls
async function callOpenAI(prompt: string, systemPrompt: string = ''): Promise<string[]> {
  try {
    const response = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        type: 'conversation'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.suggestions || '';
    
    // Split by newlines and filter out empty lines
    return content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0 && !line.startsWith('#') && !line.match(/^\d+\./))
      .slice(0, 5); // Return up to 5 suggestions
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return [];
  }
}

export async function generateIceBreakers(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<string[]> {
  const userContext = `
    Current user: ${currentUser.name}
    Bio: ${currentUser.bio || 'No bio provided'}
    Interests: ${currentUser.interests?.join(', ') || 'Not specified'}
    Core values: ${currentUser.values?.coreValues?.join(', ') || 'Not specified'}
    Goals: ${currentUser.values?.personalGoals?.join(', ') || 'Not specified'}
    
    Target user: ${targetUser.name}
    Bio: ${targetUser.bio || 'No bio provided'}
    Interests: ${targetUser.interests?.join(', ') || 'Not specified'}
  `;

  const prompt = `Based on these two profiles, generate 5 unique, engaging ice breaker questions that ${currentUser.name} could ask ${targetUser.name}. 
  Make them personal, thoughtful, and likely to start a meaningful conversation.
  Focus on shared interests or complementary values.
  Keep each question concise (one sentence).
  
  ${userContext}`;

  const systemPrompt = 'You are an expert at creating meaningful conversation starters that help people connect authentically. Create questions that are warm, genuine, and encourage sharing.';

  const suggestions = await callOpenAI(prompt, systemPrompt);
  
  // Fallback suggestions if API fails
  if (suggestions.length === 0) {
    return [
      "What inspired you to pursue your current path in life?",
      "If you could have dinner with anyone, living or dead, who would it be and why?",
      "What's something you're passionate about that most people don't know?",
      "What's the best advice you've ever received?",
      "If you could master any skill instantly, what would it be?"
    ];
  }
  
  return suggestions;
}

export async function generateConversationStarters(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<string[]> {
  const userContext = `
    Current user: ${currentUser.name}
    Occupation: ${currentUser.occupation || 'Not specified'}
    Education: ${currentUser.education || 'Not specified'}
    Core values: ${currentUser.values?.coreValues?.join(', ') || 'Not specified'}
    Communication style: ${currentUser.values?.preferredCommunication?.join(', ') || 'Not specified'}
    
    Target user: ${targetUser.name}
    Occupation: ${targetUser.occupation || 'Not specified'}
    Interests: ${targetUser.interests?.join(', ') || 'Not specified'}
  `;

  const prompt = `Generate 5 thoughtful discussion topics that ${currentUser.name} could bring up with ${targetUser.name}.
  These should be deeper conversation starters that could lead to meaningful discussions about life, goals, or shared interests.
  Make them open-ended and intellectually engaging.
  
  ${userContext}`;

  const systemPrompt = 'You are an expert at facilitating deep, meaningful conversations. Create discussion topics that encourage authentic sharing and connection.';

  const suggestions = await callOpenAI(prompt, systemPrompt);
  
  // Fallback suggestions if API fails
  if (suggestions.length === 0) {
    return [
      "How do you think technology is changing the way we form meaningful relationships?",
      "What's a belief you held strongly in the past that you've since changed your mind about?",
      "How do you balance personal growth with maintaining stability in your life?",
      "What role does creativity play in your work or personal life?",
      "What's something you wish more people understood about your field or passion?"
    ];
  }
  
  return suggestions;
}

export async function generateGrowthSuggestions(
  currentUser: UserProfile,
  targetUser: UserProfile
): Promise<string[]> {
  const userContext = `
    Current user: ${currentUser.name}
    Personal goals: ${currentUser.values?.personalGoals?.join(', ') || 'Not specified'}
    Core values: ${currentUser.values?.coreValues?.join(', ') || 'Not specified'}
    
    Target user: ${targetUser.name}
    Bio: ${targetUser.bio || 'No bio provided'}
  `;

  const prompt = `Generate 5 suggestions for how ${currentUser.name} and ${targetUser.name} could support each other's growth and goals.
  These should be actionable ideas for collaboration, learning, or mutual support.
  Focus on ways they could help each other grow personally or professionally.
  
  ${userContext}`;

  const systemPrompt = 'You are a personal development coach focused on helping people form mutually beneficial connections that support growth.';

  const suggestions = await callOpenAI(prompt, systemPrompt);
  
  // Fallback suggestions if API fails
  if (suggestions.length === 0) {
    return [
      "Consider setting up a weekly accountability check-in to support each other's goals",
      "Share resources and book recommendations related to your mutual interests",
      "Collaborate on a small project that combines both of your skill sets",
      "Exchange feedback on professional work or creative projects",
      "Start a learning challenge together in an area you both want to improve"
    ];
  }
  
  return suggestions;
}

export async function generateFollowUpQuestions(
  currentUser: UserProfile,
  targetUser: UserProfile,
  conversationHistory: string[]
): Promise<string[]> {
  const recentContext = conversationHistory.slice(-5).join('\n');
  
  const prompt = `Based on this conversation between ${currentUser.name} and ${targetUser.name}, generate 3 thoughtful follow-up questions to keep the conversation flowing naturally.
  
  Recent conversation:
  ${recentContext}
  
  Create questions that:
  - Build on what was just discussed
  - Show genuine interest
  - Encourage deeper sharing`;

  const suggestions = await callOpenAI(prompt);
  
  // Fallback suggestions
  if (suggestions.length === 0) {
    return [
      "That's really interesting! Can you tell me more about that experience?",
      "How did that shape your perspective on things?",
      "What was the most challenging part of that journey?"
    ];
  }
  
  return suggestions.slice(0, 3);
} 