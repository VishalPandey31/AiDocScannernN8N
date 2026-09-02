const geminiModel = require('../config/gemini');

/**
 * Sends image data to Gemini 1.5 Flash for JSON-structured extraction
 */
exports.extractDocumentData = async (fileBuffer, mimeType) => {
    try {
        const prompt = `
        You are an enterprise document verification AI. Analyze the document image with 100% precision. 
        Extract text, determine document type (PAN_CARD, IDENTITY_PROOF, ADDRESS_PROOF, SALARY_SLIP, BANK_STATEMENT, DEGREE_MARKSHEET, BUSINESS_REG, PASSPORT, DRIVING_LICENSE, or UNKNOWN), 
        and evaluate readability. If a field is missing, return null. Return STRICT JSON without any markdown block formatting (\`\`\`).
        
        REQUIRED JSON SCHEMA:
        {
          "detectedDocType": "string",
          "extractedData": {
            "fullName": "string or null",
            "identifierMasked": "string or null (e.g. ABCDE****F)",
            "dateOfBirth": "YYYY-MM-DD or null",
            "issueDate": "YYYY-MM-DD or null",
            "expiryDate": "YYYY-MM-DD or null",
            "address": "string or null",
            "employerOrBusinessName": "string or null"
          },
          "quality": {
            "isReadable": true,
            "isCropped": false,
            "confidenceScore": 0.95
          }
        }
        `;

        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            },
        };

        const result = await geminiModel.generateContent([prompt, imagePart]);
        let responseText = result.response.text();

        // Clean markdown backticks if returned accidentally
        responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        const data = JSON.parse(responseText);

        // Ensure confidence Score exists
        if (typeof data.quality.confidenceScore !== 'number') {
            data.quality.confidenceScore = 0.8;
        }

        return data;

    } catch (err) {
        console.error("AI Extraction Error:", err);
        // Fallback gracefully on parsing failure or AI timeout
        return {
            detectedDocType: "UNKNOWN",
            extractedData: {
                fullName: null, identifierMasked: null, dateOfBirth: null,
                issueDate: null, expiryDate: null, address: null, employerOrBusinessName: null
            },
            quality: {
                isReadable: false, isCropped: false, confidenceScore: 0.1
            }
        };
    }
};

exports.askChat = async (message, fileBuffer = null, mimeType = null) => {
    try {
        const prompt = `You are DocSure AI, an enterprise verification assistant. Respond to the user's query intelligently, concisely, and professionally.\n\nUser: ${message}\n\nAI Response:`;

        let payload = [prompt];
        if (fileBuffer && mimeType) {
            payload.push({
                inlineData: {
                    data: fileBuffer.toString("base64"),
                    mimeType: mimeType
                }
            });
        }

        const result = await geminiModel.generateContent(payload);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw new Error(`AI Chat processing failed: ${error.message}`);
    }
};
