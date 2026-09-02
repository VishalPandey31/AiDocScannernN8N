/**
 * Compares data across multiple documents within an application for mismatches.
 */
const Document = require('../models/Document');
const Application = require('../models/Application');

// Helper to normalize strings: uppercase, replace whitespace/punctuation
const normalize = (str) => {
    if (!str) return '';
    return str.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
};

// Dice's coefficient for basic fuzzy matching
const similarity = (s1, s2) => {
    let bigrams1 = [];
    let bigrams2 = [];
    for (let i = 0; i < s1.length - 1; i++) bigrams1.push(s1.substring(i, i + 2));
    for (let i = 0; i < s2.length - 1; i++) bigrams2.push(s2.substring(i, i + 2));

    let intersection = 0;
    for (let i = 0; i < bigrams1.length; i++) {
        for (let j = 0; j < bigrams2.length; j++) {
            if (bigrams1[i] === bigrams2[j]) {
                intersection++;
                bigrams2.splice(j, 1);
                break;
            }
        }
    }
    const max = bigrams1.length + bigrams2.length;
    return max === 0 ? 0 : (2.0 * intersection) / max;
};

exports.compareDocuments = async (applicationId) => {
    const documents = await Document.find({ applicationId, processingStatus: { $in: ['COMPLETED', 'VALIDATING', 'REVIEW_REQUIRED'] } });

    let crossDocIssues = [];
    let duplicateWarnings = [];

    // Compare each pair once
    for (let i = 0; i < documents.length; i++) {
        for (let j = i + 1; j < documents.length; j++) {
            const docA = documents[i];
            const docB = documents[j];

            // Duplicate Document Detection
            if (docA.documentType === docB.documentType && docA.documentType !== 'UNKNOWN') {
                if (docA.fileSize === docB.fileSize || docA.ocrText === docB.ocrText) {
                    duplicateWarnings.push(`Possible duplicate: ${docA.documentType} uploaded multiple times.`);
                    // Mark visually
                    continue;
                }
            }

            // Name Comparison
            const nameA = docA.extractedData?.name;
            const nameB = docB.extractedData?.name;

            if (nameA && nameB) {
                const normA = normalize(nameA);
                const normB = normalize(nameB);
                if (normA !== normB) {
                    const sim = similarity(normA, normB);
                    if (sim >= 0.8 && sim < 1.0) {
                        crossDocIssues.push(`Mild name mismatch between ${docA.documentType} and ${docB.documentType} (Similarity: ${Math.round(sim * 100)}%)`);
                    } else if (sim < 0.8) {
                        crossDocIssues.push(`HIGH ATTENTION: Cross-document identity mismatch. ${docA.documentType} (${nameA}) vs ${docB.documentType} (${nameB})`);
                    }
                }
            }

            // DOBC Comparison
            const dobA = docA.extractedData?.dateOfBirth;
            const dobB = docB.extractedData?.dateOfBirth;

            if (dobA && dobB) {
                if (dobA !== dobB) {
                    crossDocIssues.push(`HIGH ATTENTION: Date of Birth mismatch detected between ${docA.documentType} and ${docB.documentType}`);
                }
            }
        }
    }

    return { crossDocIssues, duplicateWarnings };
};
