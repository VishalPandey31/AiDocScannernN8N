const multer = require('multer');

// Memory storage keeps file buffers entirely in RAM for fastest processing 
// and streaming to Gemini directly.
const memoryStorage = multer.memoryStorage();

// Accept up to 10 files in parallel
const uploadMiddleware = multer({
    storage: memoryStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit per file
});

module.exports = uploadMiddleware;
