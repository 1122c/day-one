import 'openai/shims/node';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateResponse = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};

export const generateImage = async (prompt: string) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image generated');
    }

    return response.data[0].url || '';
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}; 