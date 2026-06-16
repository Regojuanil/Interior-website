require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    // Try gemini-1.5-flash using apiVersion v1 first
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });
      const prompt = `You are a test assistant. Say hello.`;
      const result = await model.generateContent(prompt);
      console.log('SUCCESS (gemini-1.5-flash v1)', result);
      return;
    } catch (e) {
      console.error('gemini-1.5-flash v1 failed:', e && e.message ? e.message : e);
    }

    // Fallback to text-bison if gemini isn't available
    try {
      const model2 = genAI.getGenerativeModel({ model: 'text-bison-001' });
      const result2 = await model2.generateContent('You are a test assistant. Say hello.');
      console.log('SUCCESS (text-bison-001)', result2);
      return;
    } catch (e2) {
      console.error('text-bison-001 failed:', e2 && e2.message ? e2.message : e2);
    }
  } catch (err) {
    console.error('ERROR TYPE:', err.constructor && err.constructor.name);
    console.error(err);
  }
}

test();
