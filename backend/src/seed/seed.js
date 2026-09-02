const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Application = require('../models/Application');
const Document = require('../models/Document');

dotenv.config({ path: '../.env.example' }); // use example config for seed if full env missing

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/docsure_ai');
        console.log('MongoDB Connected for Seeding');

        // Clear existing data
        await User.deleteMany();
        await Application.deleteMany();
        await Document.deleteMany();

        // Create Users
        const plainPassword = 'password123';

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@docsure.ai',
            password: plainPassword,
            role: 'ADMIN'
        });

        const reviewer = await User.create({
            name: 'Reviewer Account',
            email: 'reviewer@docsure.ai',
            password: plainPassword,
            role: 'REVIEWER'
        });

        const user = await User.create({
            name: 'Rahul Sharma',
            email: 'rahul@example.com',
            password: plainPassword,
            role: 'USER'
        });

        const user2 = await User.create({
            name: 'Priya Singh',
            email: 'priya@example.com',
            password: plainPassword,
            role: 'USER'
        });

        console.log('Users created (password for all is "password123")');

        // Create Demo Applications
        const app1 = await Application.create({
            applicantName: 'Rahul Sharma',
            owner: user._id,
            applicationType: 'Business Onboarding',
            readinessScore: 94,
            attentionScore: 10,
            status: 'READY'
        });

        const app2 = await Application.create({
            applicantName: 'Priya Singh',
            owner: user2._id,
            applicationType: 'Business Onboarding',
            readinessScore: 40,
            attentionScore: 82,
            status: 'REVIEW_REQUIRED',
            issues: ['HIGH ATTENTION: Cross-document identity mismatch. PAN (Priya Singh) vs AADHAAR (Priya Kumar)']
        });

        // Add some realistic demo documents for App 2
        await Document.create({
            applicationId: app2._id,
            fileName: 'pan_card.jpg',
            fileUrl: '/uploads/dummy_pan.jpg',
            mimeType: 'image/jpeg',
            fileSize: 154032,
            documentType: 'PAN',
            classificationConfidence: 0.98,
            processingStatus: 'COMPLETED',
            validationStatus: 'VALID',
            extractedData: { name: 'Priya Singh', panNumber: 'ABCDE1234F', dateOfBirth: '1990-05-15' },
            qualityScore: 92
        });

        await Document.create({
            applicationId: app2._id,
            fileName: 'aadhaar_scan.pdf',
            fileUrl: '/uploads/dummy_aadhaar.pdf',
            mimeType: 'application/pdf',
            fileSize: 504032,
            documentType: 'AADHAAR',
            classificationConfidence: 0.95,
            processingStatus: 'REVIEW_REQUIRED',
            validationStatus: 'WARNING',
            extractedData: { name: 'Priya Kumar', documentNumber: '1234 5678 9012' },
            qualityScore: 88,
            issues: ['Name mismatch with PAN']
        });

        console.log('Seed completed successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDB();
