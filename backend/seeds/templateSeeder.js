require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const WorkflowTemplate = require('../src/models/WorkflowTemplate');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        await WorkflowTemplate.deleteMany({});

        const templates = [
            {
                templateId: "BUSINESS_ONBOARDING_V1",
                title: "Business / Merchant Onboarding",
                category: "BUSINESS_ONBOARDING",
                mandatoryDocuments: [
                    { docType: "PAN_CARD", displayName: "PAN Card" },
                    { docType: "IDENTITY_PROOF", displayName: "Identity Proof" },
                    { docType: "ADDRESS_PROOF", displayName: "Address Proof", maxAgeDays: 90 },
                    { docType: "BUSINESS_REG", displayName: "Business Registration" }
                ],
                optionalDocuments: [
                    { docType: "BANK_STATEMENT", displayName: "Bank Statement" }
                ]
            },
            {
                templateId: "RETAIL_LOAN_V1",
                title: "Individual KYC & Loans",
                category: "RETAIL_LOAN",
                mandatoryDocuments: [
                    { docType: "PAN_CARD", displayName: "PAN Card" },
                    { docType: "IDENTITY_PROOF", displayName: "Identity Proof" },
                    { docType: "ADDRESS_PROOF", displayName: "Address Proof", maxAgeDays: 90 }
                ],
                optionalDocuments: [
                    { docType: "SALARY_SLIP", displayName: "Salary Slip" },
                    { docType: "BANK_STATEMENT", displayName: "Bank Statement" }
                ]
            },
            {
                templateId: "HR_ONBOARDING_V1",
                title: "Employee / HR Onboarding",
                category: "HR_ONBOARDING",
                mandatoryDocuments: [
                    { docType: "IDENTITY_PROOF", displayName: "Identity Proof" },
                    { docType: "DEGREE_MARKSHEET", displayName: "Degree / Marksheet" }
                ],
                optionalDocuments: []
            }
        ];

        await WorkflowTemplate.insertMany(templates);
        console.log("Templates seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seed();
