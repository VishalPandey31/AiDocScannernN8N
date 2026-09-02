require('dotenv').config();
const mongoose = require('mongoose');
const Application = require('../src/models/Application');
const connectDB = require('../src/config/db');

const seedData = async () => {
    await connectDB();
    console.log("Seeding Dashboard mock data...");

    // Create a mix of applications matching the screenshot structure
    const apps = [
        {
            applicationId: "APP-BGD-001",
            applicantName: "BGD_Industry_Project_Proposal_2026.pdf",
            applicationType: "Proposal",
            status: "VERIFIED",
            readinessScore: 92,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        },
        {
            applicationId: "APP-BGD-002",
            applicantName: "Termination_Agreement_2026.pdf",
            applicationType: "Signed Contract",
            status: "ATTENTION_REQUIRED",
            readinessScore: 65,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        },
        {
            applicationId: "APP-BGD-003",
            applicantName: "Contract_Terms_2026.pdf",
            applicationType: "Signed Contract",
            status: "VERIFIED",
            readinessScore: 98,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        },
        {
            applicationId: "APP-BGD-004",
            applicantName: "Industry_Safety_Guidelines.pdf",
            applicationType: "Workspace",
            status: "VERIFIED",
            readinessScore: 88,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        },
        {
            applicationId: "APP-BGD-005",
            applicantName: "Legal_Notice.pdf",
            applicationType: "Workspace",
            status: "VERIFIED",
            readinessScore: 94,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        },
        {
            applicationId: "APP-BGD-006",
            applicantName: "Vendor_Invoice_001.pdf",
            applicationType: "Invoice",
            status: "PROCESSING",
            readinessScore: 40,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        },
        {
            applicationId: "APP-BGD-007",
            applicantName: "Supplier_Invoice_B.pdf",
            applicationType: "Invoice",
            status: "REJECTED",
            readinessScore: 10,
            extractedData: {},
            documentRefs: [],
            forensicLogs: []
        }
    ];

    try {
        await Application.insertMany(apps);
        console.log("Dashboard Mock Data Seeded successfully!");
    } catch (e) {
        console.error("Error seeding:", e);
    }

    process.exit();
};

seedData();
