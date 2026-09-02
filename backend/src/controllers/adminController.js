const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');

exports.getReviews = async (req, res) => {
    try {
        const apps = await Application.find({ status: "ATTENTION_REQUIRED" }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: apps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reviewAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reason } = req.body;

        const application = await Application.findOne({ applicationId: id });
        if (!application) return res.status(404).json({ success: false, message: "Not found" });

        if (action === 'APPROVE_OVERRIDE') {
            application.status = 'VERIFIED';
            application.aiSummary = "Approved by Human Reviewer: " + reason;
        } else if (action === 'REJECT') {
            application.status = 'REJECTED';
            application.aiSummary = "Rejected by Human Reviewer: " + reason;
        }

        await application.save();

        await AuditLog.create({
            applicationId: id,
            action: `HUMAN_${action}`,
            actor: req.user?.id || 'STAFF',
            details: { reason }
        });

        res.status(200).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const total = await Application.countDocuments();
        const verified = await Application.countDocuments({ status: "VERIFIED" });
        const attention = await Application.countDocuments({ status: "ATTENTION_REQUIRED" });
        const rejected = await Application.countDocuments({ status: "REJECTED" });

        res.status(200).json({
            success: true,
            data: {
                applications: {
                    total,
                    byStatus: {
                        "APPROVED": verified, // map VERIFIED to APPROVED on frontend if needed
                        "IN_REVIEW": attention,
                        "REJECTED": rejected
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
