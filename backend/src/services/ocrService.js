const { getGeminiClient } = require('../utils/geminiClient');
const fs = require('fs');

/**
 * Perform OCR on a document. Since we are in a hackathon, we use Gemini 
 * Vision to act as our OCR provider, simulating an enterprise OCR service.
 */
exports.extractText = async (filePath, mimeType) => {
    const startTime = Date.now();
    try {
        const client = getGeminiClient();

        // Read file to base64
        const fileBytes = fs.readFileSync(filePath).toString("base64");

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                data: fileBytes,
                                mimeType: mimeType
                            }
                        },
                        {
                            text: 'Extract all visible text from this document exactly as it is written. Do not summarize or format it differently. Preserve original language.'
                        }
                    ]
                }
            ]
        });

        return {
            text: response.text,
            language: 'mixed',
            confidence: 0.95,
            pages: 1,
            processingTime: Date.now() - startTime
        };
    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('OCR Failed: ' + error.message);
    }
};
