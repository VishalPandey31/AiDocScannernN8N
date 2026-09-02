const mongoose = require('mongoose');
require('dotenv').config();
const Application = require('./src/models/Application');
const AuditLog = require('./src/models/AuditLog');

async function clearDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const result = await Application.deleteMany({});
        await AuditLog.deleteMany({});

        console.log(`Successfully deleted ${result.deletedCount} applications/documents from the database!`);
    } catch (err) {
        console.error("Error clearing DB:", err);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
}

clearDatabase();
