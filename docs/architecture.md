# DocSure AI Architecture
## High Level Flow

The architecture is driven by modular REST services separated into distinct controller, route, service, and data ingestion blocks.

```text
Database [MongoDB via Mongoose]
      ↑
Data Layer (Models: User, Application, Document, AuditLog)
      ↑
Service Abstractions (aiService, ocrService, validationService, crossDocumentService, completenessService)
      ↑
Controllers (AppController, AuthController, AdminController, DocumentController)
      ↑
REST API [Express Router + Middleware (Multer / JWT)]
      ↑
Client [Vite / React SPA]
```

## AI Pipeline Design
1. **Upload Phase:** Multer intercepts the multipart payload and buffers to local `tmp` storage.
2. **Phase 1: OCR Simulation (Fallback):** Generates base text representation.
3. **Phase 2: Multimodal Classification:** Feeds Base64 image payload into Gemini Flash with strict JSON prompting to extract document type.
4. **Phase 3: Structured Extraction:** Prompt instructs Gemini to map fields into typed schemas (e.g., PAN -> name, dob; AADHAAR -> document number).
5. **Phase 4: Quality Checks:** Gemini acts as a heuristic logic agent looking for blurriness, contrast. 

## Deterministic Pipeline
- `validationService`: Runs strict Regex validators against AI extracted payloads.
- `crossDocumentService`: Iterates O(n^2) pairing over completed documents to identify Dice Coefficient similarities crossing common fields (like Applicant Name).
- `completenessService`: Tallies warnings, valid docs exactly vs required, producing the `ReadinessScore` and `AttentionScore`.
