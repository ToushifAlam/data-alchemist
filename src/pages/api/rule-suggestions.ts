import { NextApiRequest, NextApiResponse } from 'next';
import openai from '@/lib/openaiClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  const { clients, tasks, workers } = req.body;

  const prompt = `
You are a smart scheduling assistant. Based on the clients, tasks, and workers below, suggest 3 useful scheduling or co-run rules.

Clients:
${JSON.stringify(clients, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}

Workers:
${JSON.stringify(workers, null, 2)}

Reply with a JSON array of rules like:
[
  { "type": "coRun", "tasks": ["T1", "T3"] },
  { "type": "loadLimit", "workerGroup": "G1", "maxSlotsPerPhase": 2 }
]
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  try {
    const content = completion.choices[0].message?.content || '[]';
    const rules = JSON.parse(content);
    res.status(200).json({ rules });
  } catch (e) {
    res.status(500).json({ error: 'Failed to parse AI response.' });
  }
}
