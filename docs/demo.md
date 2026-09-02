# DocSure AI Hackathon Demo Flow

Follow these steps exactly to show the "Wow moments":

1. **Start Fresh:**
   - Execute the seed script: `node backend/src/seed/seed.js`.
   - Boot backend and frontend concurrently.

2. **Login Simulation:**
   - Log into the system using `rahul@example.com` (password: `password123`) to prove the beautiful Login screen layout and JWT auth persistence.
   
3. **View Dashboard:**
   - Go to Dashboard, visually call out the 2 "Prepared Applications" - One is "Ready (Rahul)", One is "Attention Required (Priya)".
  
4. **Wow Moment 1: Open Priya Application:**
   - Observe the Readiness is sitting at 40%, but Attention Risk is 82 (HIGH).
   - Show the dynamic "Why is this flagged?" explanations. It will point out exactly that Priya Singh uploaded a PAN saying "Priya Singh" and an Aadhaar saying "Priya Kumar". 
   - This validates the *Cross-Document Intelligence Feature*.

5. **Wow Moment 2: Dynamic Processing:**
   - As an admin, upload a new fake document image to Priya's portal.
   - The UI will spin showing "Uploading -> Processing -> Classifying".
   - The UI will natively refresh and pull the latest Readiness score which will recalculate on the fly based on the AI validation algorithms returning.

6. **Wow Moment 3: Human Action Logging:**
   - Login as `admin@docsure.ai`.
   - Go to Application detail, click the "Document Review".
   - Press the Native `Approve/Reject` button provided for Review_Required documents.
   - This creates an Audit Log trail dynamically.
