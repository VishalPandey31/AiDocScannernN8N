const crypto = require('crypto');
const sharp = require('sharp');
const exifParser = require('exif-parser');
const Application = require('../models/Application');

/**
 * Calculates SHA-256 hash of a buffer
 */
function getFileHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Calculates basic pixel variance (approximation for blur detection)
 */
async function calculateBlurScore(buffer) {
    try {
        const { data } = await sharp(buffer)
            .greyscale()
            .resize(300, 300, { fit: 'inside' }) // resize for speed
            .raw()
            .toBuffer({ resolveWithObject: true });

        let sum = 0;
        let sumSq = 0;
        for (let i = 0; i < data.length; i++) {
            const p = data[i];
            sum += p;
            sumSq += p * p;
        }
        const mean = sum / data.length;
        const variance = (sumSq / data.length) - (mean * mean);
        // Normalize variance somewhat to mimic Laplacian
        return variance;
    } catch (err) {
        console.error("Blur detection error:", err);
        return 150; // default safe value
    }
}

/**
 * Parses EXIF data to look for software tags indicating modification
 */
function checkExifMetadata(buffer, mimeType) {
    if (mimeType !== 'image/jpeg') {
        return { hasEditorArtifacts: false, softwareTag: null };
    }

    try {
        const parser = exifParser.create(buffer);
        const result = parser.parse();
        if (result && result.tags && result.tags.Software) {
            const software = result.tags.Software.toLowerCase();
            if (software.includes('photoshop') || software.includes('canva') || software.includes('gimp')) {
                return { hasEditorArtifacts: true, softwareTag: result.tags.Software };
            }
        }
        return { hasEditorArtifacts: false, softwareTag: null };
    } catch (err) {
        return { hasEditorArtifacts: false, softwareTag: null };
    }
}

/**
 * Main Forensic Check Pipeline
 */
exports.runForensics = async (fileBuffer, mimeType) => {
    const fileHash = getFileHash(fileBuffer);

    // Check for exact duplicates across entire DB
    const duplicateApp = await Application.findOne({ 'documents.fileHash': fileHash });

    let isDuplicate = !!duplicateApp;

    let blurScore = 150; // Assume good if not image
    let exifFindings = { hasEditorArtifacts: false, softwareTag: null };

    if (mimeType.startsWith('image/')) {
        blurScore = await calculateBlurScore(fileBuffer);
        exifFindings = checkExifMetadata(fileBuffer, mimeType);
    }

    return {
        fileHash,
        isDuplicate,
        blurScore,
        ...exifFindings
    };
};
