require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/node_modules/dotenv').config({ path: 'c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/.env' });
const { GoogleGenerativeAI } = require('c:/Users/Hp/OneDrive/Documents/Desktop/INTERIOR-WEBSITE/Backend/node_modules/@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash"
        });
        const result = await model.generateContent("Hello! What is your name?");
        console.log("SUCCESS:", result.response.text());
    } catch (err) {
        console.error("FAILED:", err);
    }
}

run();
