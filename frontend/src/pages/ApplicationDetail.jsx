import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { 
    ShieldCheck, AlertTriangle, FileText, Upload, RefreshCw, Eye, 
    CheckCircle2, XCircle, Plus, Clock, FileWarning, Search, Cpu, Sparkles, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';
import AIPipelineVisual from '../components/AIPipelineVisual';
import AiAssistant from '../components/AiAssistant';
import AuditMatrixDrawer from '../components/AuditMatrixDrawer';
import DocumentVerificationReport from '../components/DocumentVerificationReport';
import { verifyDocument } from '../services/verifyService';

function RequirementsChecklist({ app }) {
    if (!app) return null;
    
    const missing = app.missingDocuments || [];
    // Calculate satisfied from native backend docs, PLUS newly verified n8n webhook docs
    const backendSatisfied = app.documents ? app.documents.map(d => d.detectedDocType).filter(d => d && d !== 'UNKNOWN') : [];
    const n8nSatisfied = (app.n8nReports || []).filter(r => r.success && r.documentType).map(r => r.documentType);
    
    const satisfied = Array.from(new Set([...backendSatisfied, ...n8nSatisfied]));
    const total = missing.length + satisfied.length;
    
    if (total === 0) return null;

    return (
        <Card className="shadow-subtle border-border bg-surface mb-6">
            <CardHeader className="border-b border-border bg-surface-muted/30 pb-4">
                <CardTitle className="text-sm uppercase tracking-wider text-foreground-muted flex items-center justify-between">
                    <span className="flex items-center gap-2"><FileText size={16} /> Application Requirements</span>
                    <span className="text-foreground font-bold">{satisfied.length} / {total} Satisfied</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {/* Render Satisfied */}
                    {satisfied.map((docType, idx) => (
                        <div key={`sat-${idx}`} className="p-4 flex items-center justify-between hover:bg-surface-muted/30 transition-colors">
                            <div>
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-success" />
                                    {docType.replace(/_/g, ' ')}
                                </h4>
                            </div>
                            <Badge variant="success">SATISFIED</Badge>
                        </div>
                    ))}
                    
                    {/* Render Missing */}
                    {missing.map((docType, idx) => (
                        <div key={`ms-${idx}`} className="p-4 flex items-center justify-between hover:bg-surface-muted/30 transition-colors">
                            <div>
                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2 text-danger">
                                    <XCircle size={16} className="text-danger" />
                                    {docType.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-xs text-danger mt-1 font-medium ml-6">Required document has not been uploaded or validation failed.</p>
                            </div>
                            <Badge variant="destructive">MISSING</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ApplicationDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dragActive, setDragActive] = useState(false);
    const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
    
    // N8N Pipeline States
    const [pendingFile, setPendingFile] = useState(null);
    const [uploadingState, setUploadingState] = useState(null);
    const [n8nReports, setN8nReports] = useState([]);
    const [uploadError, setUploadError] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get(`/applications/${id}`);
            setApp(res.data.data);
            setDocuments(res.data.data.documents || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(), 3000);
        return () => clearInterval(interval);
    }, [id]);

    const handleFileSelect = (file) => {
        if (!file) return;
        setUploadError(null);
        setPendingFile(file);
    };

    const executeN8NVerification = async () => {
        if (!pendingFile) return;
        setUploadingState("Uploading document...");
        setUploadError(null);
        
        try {
            // Simulated state progression for visual feedback while waiting for API
            setTimeout(() => { if (uploadingState) setUploadingState("Validating file format..."); }, 1500);
            setTimeout(() => { if (uploadingState) setUploadingState("Extracting intelligence via DocSure engine..."); }, 3500);
            
            const report = await verifyDocument(pendingFile, { applicationId: app._id });
            
            setN8nReports(prev => [report, ...prev]);
            
            // Re-fetch backend cautiously to update overview graphs if backend syncs eventually
            fetchData();
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploadingState(null);
            setPendingFile(null);
        }
    };

    if (loading && !app) return <ApplicationDetailSkeleton />;
    if (!app) return <div className="flex-center h-screen flex-col text-danger"><AlertTriangle className="mb-4 w-12 h-12" /> Application not found</div>;

    const issuesCount = app.issues?.length || 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            {/* Header Hero */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">{app.applicationType}</Badge>
                        <span className="text-foreground-muted text-xs font-medium font-mono">{app._id.slice(-8).toUpperCase()}</span>
                        <StatusBadge status={app.status} />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">{app.applicantName}</h1>
                    <p className="text-foreground-muted text-sm font-medium pt-1">
                        Application created on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <div className="pt-2">
                        <Link to={`/applications/${app._id}/report`}>
                            <Button variant="secondary" size="sm" className="gap-2">
                                <Printer size={14} /> Generate Report
                            </Button>
                        </Link>
                    </div>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-auto">
                    <Card className="border-border bg-surface shadow-subtle overflow-hidden">
                        <div className="flex items-center gap-6 p-4 px-6 relative">
                            {/* Decorative grad */}
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-subtle to-transparent opacity-50 z-0"></div>
                            
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-foreground-muted tracking-widest leading-tight">Readiness</p>
                                    <div className="text-3xl font-display font-bold text-primary tabular-nums tracking-tight">
                                        <AnimatedCounter value={app.readinessScore} />%
                                    </div>
                                </div>
                                <div className="relative w-16 h-16 flex-center">
                                    <svg className="transform -rotate-90 w-16 h-16 origin-center">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-border" />
                                        <motion.circle 
                                            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent"
                                            strokeDasharray={175.92} strokeDashoffset={175.92}
                                            strokeLinecap="round"
                                            className={app.readinessScore > 80 ? "text-success" : app.readinessScore > 50 ? "text-warning" : "text-danger"}
                                            initial={{ strokeDashoffset: 175.92 }}
                                            animate={{ strokeDashoffset: 175.92 - (175.92 * app.readinessScore) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* AI Verification Pipeline */}
            <Card className="shadow-subtle border-border transform transition-all group">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider text-primary font-bold">
                        <Cpu size={16} /> AI Verification Pipeline
                    </CardTitle>
                    <Button variant="secondary" size="sm" onClick={() => setIsAuditDrawerOpen(true)} className="gap-2 shrink-0">
                        <ShieldCheck size={14} /> View Audit Matrix
                    </Button>
                </CardHeader>
                <CardContent>
                    <AIPipelineVisual status={app.status} readinessScore={app.readinessScore} />
                </CardContent>
            </Card>

            {/* Analysis & Upload Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                
                {/* Documents Column */}
                <div className="lg:col-span-4 space-y-6">
                    <RequirementsChecklist app={{ ...app, n8nReports }} />

                    <div className="flex items-center justify-between mb-4 mt-6">
                        <h3 className="text-lg font-bold text-foreground">Uploaded Documents ({documents.length})</h3>
                    </div>

                    <AnimatePresence>
                        {documents.map((doc, idx) => (
                            <motion.div 
                                key={doc._id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card hoverEffect className="group overflow-hidden">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 gap-4">
                                        <div className="flex items-start gap-4 w-full">
                                            <div className={cn("p-3 rounded-xl border flex-shrink-0 transition-colors", 
                                                doc.processingStatus === 'COMPLETED' ? "bg-success-subtle text-success border-success/20" :
                                                doc.processingStatus === 'REVIEW_REQUIRED' ? "bg-warning-subtle text-warning border-warning/20" :
                                                doc.processingStatus === 'FAILED' ? "bg-danger-subtle text-danger border-danger/20" :
                                                "bg-surface-muted border-border text-foreground-muted"
                                            )}>
                                                <FileText size={24} className={doc.processingStatus === 'PROCESSING' ? "animate-pulse" : ""} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-foreground truncate max-w-[200px] mb-0.5">
                                                        {doc.documentType !== 'UNKNOWN' ? doc.documentType : doc.fileName}
                                                    </h4>
                                                    <StatusBadgeBadge status={doc.processingStatus} />
                                                </div>
                                                <p className="text-xs text-foreground-muted font-medium truncate">
                                                    {doc.fileName} • {(doc.fileSize / 1024).toFixed(0)} KB
                                                </p>
                                                
                                                {/* Mini progress for PROCESSING */}
                                                {doc.processingStatus === 'PROCESSING' && (
                                                    <div className="flex items-center gap-2 mt-2 w-full max-w-xs">
                                                        <div className="h-1 bg-border rounded-full flex-1 overflow-hidden relative">
                                                            <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm -translate-x-full animate-[scan_2s_linear_infinite]" />
                                                        </div>
                                                        <span className="text-[10px] font-semibold text-primary uppercase">Analyzing</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                                            {doc.issues?.length > 0 && (
                                                <Badge variant="warning" className="gap-1 shadow-sm">
                                                    <AlertTriangle size={12} /> {doc.issues.length} Issues
                                                </Badge>
                                            )}
                                            <Link to={`/documents/${doc._id}`}>
                                                <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View Extraction
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* N8N Interactive Upload Zone */}
                    {!pendingFile && !uploadingState && (
                        <div 
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[200px] group mb-6",
                                dragActive ? "border-primary bg-primary-subtle" : "border-border hover:border-foreground-subtle bg-surface-muted/30 hover:bg-surface-muted/80"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files[0]); }}
                        >
                            <div className={cn("p-4 rounded-full mb-4 transition-colors", dragActive ? "bg-primary text-primary-foreground" : "bg-surface border border-border text-foreground-muted group-hover:bg-primary group-hover:text-primary-foreground")}>
                                <Upload size={24} />
                            </div>
                            <h4 className="text-sm font-bold text-foreground mb-1">Upload documents to verify via n8n</h4>
                            <p className="text-xs text-foreground-subtle mb-4">Native format validation across 20+ filetypes</p>
                            
                            <input type="file" id="upload-doc" className="hidden" accept="image/jpeg, image/png, image/webp, application/pdf" onChange={(e) => handleFileSelect(e.target.files[0])} />
                            <label htmlFor="upload-doc" className="cursor-pointer">
                                <Button as="span" variant={dragActive ? "primary" : "secondary"} size="sm" className="pointer-events-none">
                                    Browse Files
                                </Button>
                            </label>
                        </div>
                    )}

                    {/* Active Validation State */}
                    {(pendingFile || uploadingState) && (
                        <Card className="bg-surface shadow-lg border-primary/20 mb-6 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-border overflow-hidden">
                                {uploadingState && <div className="h-full bg-primary animate-[scan_2s_linear_infinite]" style={{ width: '50%' }}></div>}
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col flex-1">
                                        <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">Verification Target</h3>
                                        <div className="flex items-center gap-4 bg-surface-muted/50 p-4 rounded-xl border border-border/50">
                                            {pendingFile?.type?.includes('image') ? (
                                                <div className="w-16 h-16 rounded-lg bg-surface border border-border overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img src={URL.createObjectURL(pendingFile)} alt="preview" className="object-cover w-full h-full" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                                                    <FileText size={20} className="text-foreground-muted" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-foreground truncate">{pendingFile?.name || "Processing Document"}</h4>
                                                <p className="text-xs text-foreground-muted font-medium mt-0.5">
                                                    {pendingFile ? `${(pendingFile.size / 1024).toFixed(1)} KB • ${pendingFile.type || 'Unknown Type'}` : 'Connecting...'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {uploadingState ? (
                                    <div className="mt-6 flex flex-col items-center justify-center p-6 bg-surface-muted/30 rounded-xl border border-border/20">
                                        <RefreshCw className="animate-spin text-primary mb-3" size={24} />
                                        <span className="text-sm font-bold text-primary animate-pulse">{uploadingState}</span>
                                        <span className="text-xs text-foreground-muted mt-2">Waiting for n8n Webhook Response</span>
                                    </div>
                                ) : (
                                    <div className="mt-6 flex gap-3">
                                        <Button variant="primary" onClick={executeN8NVerification} className="flex-1 font-bold">Verify Document Now</Button>
                                        <Button variant="secondary" onClick={() => setPendingFile(null)}>Cancel</Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Network Error Display */}
                    {uploadError && (
                        <div className="mb-6 p-4 bg-danger-subtle border border-danger/30 rounded-xl flex flex-col gap-2 relative">
                            <button onClick={() => setUploadError(null)} className="absolute top-3 right-3 text-danger/70 hover:text-danger"><XCircle size={16} /></button>
                            <div className="flex items-center gap-2 text-danger font-bold text-sm"><AlertTriangle size={16} /> Webhook Execution Failed</div>
                            <span className="text-xs text-danger/80 font-medium leading-relaxed">{uploadError}</span>
                            <div className="mt-2 text-right">
                                <Button size="sm" variant="secondary" onClick={() => setPendingFile(pendingFile)}>Retry Verification</Button>
                            </div>
                        </div>
                    )}

                    {/* Render N8N Reports */}
                    {n8nReports.length > 0 && (
                        <div className="space-y-6 mt-6">
                            <h3 className="text-lg font-bold text-foreground">Verified by n8n ({n8nReports.length})</h3>
                            {n8nReports.map((report, idx) => (
                                <DocumentVerificationReport key={`report-${idx}`} report={report} />
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Insights Column */}
                <div className="lg:col-span-3 space-y-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Sparkles size={18} className="text-primary" /> Cross-Document Intelligence
                    </h3>
                    
                    <Card className="bg-surface shadow-subtle border-border h-full max-h-[800px] flex flex-col flex-1">
                        <CardHeader className="border-b border-border bg-surface-muted/30">
                            <CardTitle className="text-sm flex items-center justify-between">
                                Attention Score
                                <span className={cn("text-2xl font-bold font-display ml-2", app.attentionScore > 50 ? "text-danger" : app.attentionScore > 0 ? "text-warning" : "text-success")}>
                                    <AnimatedCounter value={app.attentionScore} />
                                </span>
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            <div className="divide-y divide-border">
                                {issuesCount === 0 && (!app.recommendations || app.recommendations.length === 0) && (
                                    <div className="p-12 text-center flex-col flex-center text-success">
                                        <ShieldCheck size={48} className="mb-4 opacity-50" />
                                        <p className="font-medium">No anomalies detected.</p>
                                        <p className="text-xs text-foreground-muted mt-1">AI cross-checked all visible entities successfully.</p>
                                    </div>
                                )}

                                {/* Critical Issues */}
                                {app.issues?.map((issue, idx) => (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }} key={idx} className="p-5 flex items-start gap-4 hover:bg-surface-muted/50 transition-colors">
                                        <div className="mt-0.5 p-1.5 bg-danger-subtle text-danger border border-danger/20 rounded-md shrink-0">
                                            <AlertTriangle size={14} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground mb-1">Consistency Match Warning</h4>
                                            <p className="text-xs text-foreground-muted leading-relaxed font-medium">{issue}</p>
                                            
                                            <div className="mt-3 bg-surface-muted p-2.5 rounded-lg border border-border">
                                                <p className="text-[10px] uppercase font-bold text-foreground-subtle tracking-wider mb-1">AI Recommendation</p>
                                                <p className="text-xs text-foreground font-medium">Flagged for human queue. Request clarification from applicant.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Recommendations */}
                                {app.recommendations?.map((rec, idx) => (
                                    <div key={idx} className="p-5 flex items-start gap-4 hover:bg-surface-muted/50 transition-colors">
                                        <div className="mt-0.5 p-1.5 bg-success-subtle text-success border border-success/20 rounded-md shrink-0">
                                            <ShieldCheck size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground-muted font-medium">{rec}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <AiAssistant applicationId={app._id} />
            
            <AuditMatrixDrawer 
                isOpen={isAuditDrawerOpen} 
                onClose={() => setIsAuditDrawerOpen(false)} 
                auditMatrix={app.auditMatrix} 
            />
        </div>
    );
}

function StatusBadge({ status }) {
    const format = (s) => s.replace('_', ' ');
    switch(status) {
        case 'READY':
        case 'APPROVED': return <span className="bg-success-subtle text-success px-2 py-0.5 rounded text-xs font-bold shadow-sm whitespace-nowrap">{format(status)}</span>;
        case 'REVIEW_REQUIRED': return <span className="bg-warning-subtle text-warning px-2 py-0.5 rounded text-xs font-bold shadow-sm whitespace-nowrap">{format(status)}</span>;
        case 'INCOMPLETE':
        case 'FAILED': return <span className="bg-danger-subtle text-danger px-2 py-0.5 rounded text-xs font-bold shadow-sm whitespace-nowrap">{format(status)}</span>;
        default: return <span className="bg-surface-muted text-foreground-muted px-2 py-0.5 rounded text-xs font-bold border border-border shadow-sm whitespace-nowrap">{format(status)}</span>;
    }
}

function StatusBadgeBadge({ status }) {
    const format = (s) => s.replace('_', ' ');
    switch(status) {
        case 'COMPLETED': return <Badge variant="success" className="px-1.5 py-0 text-[10px] h-5">{format(status)}</Badge>;
        case 'REVIEW_REQUIRED': return <Badge variant="warning" className="px-1.5 py-0 text-[10px] h-5">{format(status)}</Badge>;
        case 'FAILED': return <Badge variant="destructive" className="px-1.5 py-0 text-[10px] h-5">{format(status)}</Badge>;
        case 'PROCESSING': return <Badge variant="info" className="px-1.5 py-0 text-[10px] h-5 animate-pulse">{format(status)}</Badge>;
        default: return <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-5">{format(status)}</Badge>;
    }
}

function AnimatedCounter({ value }) {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (start === end) return;
        let totalMilSecDur = 1000;
        let incrementTime = (totalMilSecDur / end);
        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);
        return () => clearInterval(timer);
    }, [value]);

    return <span>{count || value}</span>;
}

function ApplicationDetailSkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse p-4">
            <div className="flex justify-between items-end mb-12">
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-surface-muted rounded"></div>
                    <div className="h-10 w-96 bg-surface-muted rounded-xl"></div>
                </div>
                <div className="h-24 w-64 bg-surface-muted rounded-xl"></div>
            </div>
            <div className="h-32 bg-surface-muted rounded-2xl"></div>
            <div className="grid grid-cols-7 gap-6 mt-8">
                <div className="col-span-4 space-y-4">
                    <div className="h-24 bg-surface-muted rounded-2xl"></div>
                    <div className="h-24 bg-surface-muted rounded-2xl"></div>
                    <div className="h-48 bg-surface-muted rounded-2xl border-2 border-dashed border-border/50"></div>
                </div>
                <div className="col-span-3">
                    <div className="h-96 bg-surface-muted rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
}
