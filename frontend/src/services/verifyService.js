export const verifyDocument = async (file, metadata = {}) => {
    try {
        // Anti-Duplicate Strategy: Because n8n strips EOF boundary data before hashing,
        // we instead make the payload structurally identical to a fresh Postman request
        // while appending a unique trace to the filename to bypass filename-based deduplication logs.
        const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}_${file.name}`;

        const formData = new FormData();
        formData.append('file', file, uniqueFileName);

        if (metadata.applicationId) {
            formData.append('applicationId', metadata.applicationId);
        }
        formData.append('requestId', crypto.randomUUID());

        // We use fetch natively to let the browser assign the multipart boundary
        let apiUrl = import.meta.env.VITE_DOCSURE_API_URL;

        // Dynamically tunnel through local proxy to bypass CORS during development
        if (import.meta.env.DEV && apiUrl.startsWith('http')) {
            try {
                const urlObj = new URL(apiUrl);
                // Strip origin and replace with local proxy route mapped in vite.config.js
                apiUrl = `/n8n-proxy${urlObj.pathname}${urlObj.search}`;
            } catch (e) {
                console.warn("Invalid n8n URL format in .env", e);
            }
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Verification service is currently not listening. Please start the DocSure workflow in n8n and try again.");
            }
            throw new Error(`Connection Error: Unable to reach verification pipeline (HTTP ${response.status})`);
        }

        const data = await response.json();
        return normalizeResponse(data);
    } catch (err) {
        console.error("verifyDocument Service Error:", err);
        throw err;
    }
};

const normalizeResponse = (data) => {
    // Normalizes n8n webhook JSON into a strict frontend schema
    return {
        success: Boolean(data.success),
        status: data.status || (data.success ? 'VERIFIED' : 'FAILED'),
        message: data.message || '',
        requestId: data.requestId || null,
        applicationId: data.applicationId || null,
        documentId: data.documentId || null,
        documentType: data.documentType || null,
        confidence: typeof data.confidence === 'number' ? data.confidence : null,
        data: data.data || {},
        issues: Array.isArray(data.issues) ? data.issues : [],
        timestamp: data.timestamp || new Date().toISOString()
    };
};
