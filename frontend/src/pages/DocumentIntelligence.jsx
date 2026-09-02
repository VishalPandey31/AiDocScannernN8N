import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Brain, FileText, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';

export default function DocumentIntelligence() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const res = await api.get('/admin/documents');
                if (res.data.success) {
                    setDocuments(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-6 pb-12 mt-4">
                <div className="h-10 bg-surface-muted animate-pulse rounded-full w-64 mb-4"></div>
                <div className="h-96 bg-surface-muted animate-pulse rounded-2xl w-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-12 mt-4">
            <h1 className="text-3xl font-display font-medium text-foreground tracking-tight flex items-center gap-3">
                <Brain size={28} className="text-primary" /> Document Intelligence
            </h1>
            <p className="text-foreground-muted">Universal library of all processed documents across tenants.</p>
            
            <Card className="overflow-hidden bg-surface border-border shadow-subtle mt-4">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-surface-muted/30 text-xs uppercase tracking-wider text-foreground-subtle font-bold">
                                <th className="py-4 px-6 w-[300px]">Document & Applicant</th>
                                <th className="py-4 px-6 w-[180px]">Type</th>
                                <th className="py-4 px-6 w-[180px]">Processing State</th>
                                <th className="py-4 px-6 w-[180px]">Validation</th>
                                <th className="py-4 px-6">Quality / Confidence</th>
                                <th className="py-4 px-6 text-right w-[150px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <AnimatePresence>
                                {documents.map(doc => (
                                    <motion.tr 
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={doc._id} 
                                        className="hover:bg-surface-muted/50 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/applications/${doc.applicationId?._id || ''}`)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2 truncate max-w-[250px]">
                                                {doc.fileName}
                                            </div>
                                            <p className="text-[10px] uppercase tracking-wider text-foreground-muted mt-1 font-bold">
                                                APPLICANT: {doc.applicationId?.applicantName || 'Unknown'}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-mono text-sm bg-surface-muted text-foreground px-2 py-1 rounded">
                                                {doc.documentType}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <ProcessingBadge status={doc.processingStatus} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <ValidationBadge status={doc.validationStatus} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <Cpu size={14} className="text-primary opacity-70" />
                                                <span className="text-sm font-bold w-10 tabular-nums">{Math.round(doc.extractionConfidence || 0)}%</span>
                                                <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden hidden md:block">
                                                    <div 
                                                        className={cn("h-full rounded-full transition-all", (doc.extractionConfidence || 0) > 80 ? 'bg-success' : (doc.extractionConfidence || 0) > 50 ? 'bg-warning' : 'bg-danger')}
                                                        style={{ width: `${doc.extractionConfidence || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                Inspect <ArrowRight size={14} />
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {documents.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-foreground-muted">
                                            <FileText size={48} className="mb-4 opacity-20" />
                                            <p className="text-base font-bold text-foreground mb-1">No documents found</p>
                                            <p className="text-sm">Documents processed across all tenants will appear here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function ProcessingBadge({ status }) {
    const format = (s) => (s || '').replace(/_/g, ' ');
    switch(status) {
        case 'COMPLETED': return <span className="bg-success-subtle text-success px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
        case 'FAILED': return <span className="bg-danger-subtle text-danger px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
        case 'REVIEW_REQUIRED': return <span className="bg-warning-subtle text-warning px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
        default: return <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
    }
}

function ValidationBadge({ status }) {
    switch(status) {
        case 'VALID': return <span className="flex items-center gap-1.5 text-xs font-bold text-success"><CheckCircle2 size={12} /> Valid</span>;
        case 'INVALID': return <span className="flex items-center gap-1.5 text-xs font-bold text-danger"><AlertTriangle size={12} /> Invalid</span>;
        case 'WARNING': return <span className="flex items-center gap-1.5 text-xs font-bold text-warning"><ShieldAlert size={12} /> Warning</span>;
        default: return <span className="text-xs font-bold text-foreground-muted">Pending</span>;
    }
}
