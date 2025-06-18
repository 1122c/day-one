// Client-side wrapper for OpenAI API calls
// All actual OpenAI calls are now handled server-side in /api/openai

const callOpenAI = async (type: string, data: any) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, data }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.result;
};

export const generateResponse = async (prompt: string) => {
  try {
    return await callOpenAI('text', { prompt });
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

export const generateImage = async (prompt: string) => {
  try {
    return await callOpenAI('image', { prompt });
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}; 