import { NextApiRequest, NextApiResponse } from 'next';
import { generateResponse, generateImage } from '../../services/openaiService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { prompt, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    let result;
    if (type === 'image') {
      result = await generateImage(prompt);
    } else {
      result = await generateResponse(prompt);
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 