require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/node_modules/dotenv').config({ path: 'c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/.env' });
const { GoogleGenerativeAI } = require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/node_modules/@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTry = [
    "gemini-2.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash"
];

async function tryModels() {
    const prompt = `You are a test assistant. Say hello.`;
    for (const modelName of modelsToTry) {
        console.log(`Trying model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            console.log(`SUCCESS with ${modelName}:`, result.response.text());
            return modelName; // found a working one!
        } catch (err) {
            console.error(`FAILED with ${modelName}:`, err.message || err);
        }
    }
    console.error("All model attempts failed!");
    return null;
}

tryModels();
