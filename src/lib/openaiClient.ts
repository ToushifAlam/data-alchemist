import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log("🔑 OpenAI KEY loaded:", process.env.OPENAI_API_KEY?.slice(0, 10));



export default openai;