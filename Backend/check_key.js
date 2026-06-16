require('dotenv').config({ path: __dirname + '/.env' });
const fetch = global.fetch || require('node-fetch');

async function check() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return console.error('No GEMINI_API_KEY in .env');

  try {
    // Try with x-goog-api-key header
    const res1 = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { 'x-goog-api-key': key }
    });
    console.log('Status (header):', res1.status);
    console.log('Response (header):', await res1.text());

    // Try with key as query param
    const res2 = await fetch('https://generativelanguage.googleapis.com/v1/models?key=' + encodeURIComponent(key));
    console.log('Status (query):', res2.status);
    console.log('Response (query):', await res2.text());
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

check();
