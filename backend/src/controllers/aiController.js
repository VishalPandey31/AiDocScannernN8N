const aiService = require('../services/aiService');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        const file = req.file;

        if (!message && !file) {
            return res.status(400).json({ success: false, message: 'Message or file is required' });
        }

        const reply = await aiService.askChat(
            message || "Please analyze this document based on standard metrics.",
            file ? file.buffer : null,
            file ? file.mimetype : null
        );

        res.status(200).json({ success: true, reply });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
