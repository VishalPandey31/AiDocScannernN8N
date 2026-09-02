# DOCSURE AI — AI-Powered Document Verification Platform

> Verify Documents. Complete Applications Faster.

DocSure AI is a next-generation document verification and completeness platform that uses the power of Multimodal AI (Google Gemini) to analyze, extract, validate, and dynamically cross-check physical business and government documents against strict organizational rules.

## Core Problem
Business-service applications require numerous documents. Missing, incorrect, expired, duplicate, or inconsistent documents lead to massive manual verification overhead and delayed application processing. 

## The DocSure AI Solution
Most systems stop at basic OCR. DocSure understands the **complete application context**. 
1. **Intelligent Identification:** AI recognizes precisely what a document is based on its visual footprint, irrespective of the file name.
2. **Quality Checks:** Instantly flags blurry or unreadable uploads.
3. **Structured Extraction:** Transforms visual text into structured `document-type specific` JSON fields securely using LLM vision.
4. **Deterministic Validation:** Applies strict organizational logic (e.g. valid PAN syntax, Expiry checks).
5. **Cross-Document Intelligence:** Automatically cross-references identities (e.g., Name on Aadhaar vs Address Proof) using fuzzy matching to flag discrepancies.
6. **Readiness Scoring:** Synthesizes the exact application completion percentage and risk metrics dynamically.
7. **Explainable AI:** Pinpoints exactly *why* a penalty or warning was issued.
8. **Human-in-the-loop:** Routes low-confidence extractions or critical mismatch flags to a unified admin / reviewer queue.

## Features Implemented
- Completely secure JWT-based Authorization and RBAC (Admin, Reviewer, User)
- Multer File Upload abstractions serving a unified AI processing pipeline
- Asynchronous document processing simulations
- Modern, dynamic, premium React UI using TailwindCSS
- Explainable Risk & Application Readiness tracking
- MongoDB architecture optimizing rapid schema iterations

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Axios
- **Backend:** Node.js, Express.js, JWT, Multer
- **Database:** MongoDB (Mongoose)
- **AI/LLM:** Google Gemini 2.5 Flash SDK

## Getting Started

### Prerequisites
- Node.js > 18.x
- MongoDB (running locally or URI)
- Google Gemini API Key

### Installation

1. Root: Clone repository.
2. Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Make sure you populate the GEMINI_API_KEY in the .env file
   npm run dev
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Setting up the n8n AI Workflow
1. Install and start [n8n](https://n8n.io/) locally or use the cloud version.
2. Open your n8n dashboard in the browser (usually `http://localhost:5678`).
3. Create a new Workflow by clicking **Add Workflow**.
4. Click the **`...`** (options menu) on the top right corner and select **Import from File**.
5. Select the `DocSure AI - Document Verification (1).json` file located in this root directory.
6. Make sure to configure your **Credentials** inside n8n for any required nodes (like Google Gemini API Key).
7. Toggle the workflow to **Active**!

## Included Demo Data
Run the dummy seed initialization to deploy test-users with cross-document mismatches.
```bash
cd backend
node src/seed/seed.js
```
Democratized Logins:
- user: `rahul@example.com` | admin: `admin@docsure.ai` | pass: `password123`

## Disclaimer
Note: *DocSure AI is an AI-assisted analysis tool. It does not replace official national government identity verification interfaces. All output is simulated for the hackathon prototype intent.*
