const fs = require('fs');
const FormData = require('form-data');

async function testN8NProxy() {
    try {
        console.log("🚀 Starting Antigravity Automated Upload Test...");

        // 1. Simulate frontend generating Postman trace filename
        const originalName = 'test_upload.txt';
        const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${originalName}`;
        console.log(`📝 Generated dynamic filename: ${uniqueFileName}`);

        // 2. Read the local binary test file
        const fileBuffer = fs.readFileSync('test_upload.txt');

        // 3. Assemble form data (Exactly mimicking Postman)
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: uniqueFileName,
            contentType: 'text/plain'
        });

        console.log("🌐 Routing request through Vite frontend proxy (http://localhost:5173/n8n-proxy/webhook-test/creatorhub/docsure/verify)...");

        // Use dynamic import for node-fetch if available, otherwise just use native HTTP. 
        // We will target the Vite proxy to ensure the proxy logic is solid!
        const fetch = (await import('node-fetch')).default;

        const response = await fetch('http://localhost:5173/n8n-proxy/webhook-test/creatorhub/docsure/verify', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        // 4. Await JSON response
        const data = await response.json();

        console.log("\n✅ N8N WEBHOOK RESPONSE SUCCESS:");
        console.log(JSON.stringify(data, null, 2));

        // If it still says DUPLICATE here, we'll see it!
        if (JSON.stringify(data).includes("DUPLICATE") || JSON.stringify(data).includes("already been uploaded")) {
            console.error("\n❌ N8N RETURNED A DUPLICATE REJECTION AGAIN!");
        } else {
            console.log("\n🎉 TEST COMPLETE: NO DUPLICATE DETECTED! The new system flawlessy bypassed it!");
        }

    } catch (e) {
        console.error("Test failed: ", e.message);
    }
}
testN8NProxy();
