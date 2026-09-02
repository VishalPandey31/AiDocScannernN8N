const { GoogleGenAI } = require('@google/genai');

let aiClient;

const getGeminiClient = () => {
    if (!aiClient) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("WARNING: GEMINI_API_KEY is not defined.");
            // Return a dummy client if desired, or throw error
        }
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiClient;
};

module.exports = { getGeminiClient };
