const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    applicationId: { type: String, required: true },
    action: { type: String, required: true }, // e.g., "INGESTION", "FORENSIC_FLAG", "REVIEWER_OVERRIDE"
    actor: { type: String, default: "SYSTEM_ENGINE" },
    details: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
