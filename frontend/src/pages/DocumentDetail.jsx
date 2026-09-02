import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileText, Fingerprint, Lock, ShieldCheck, Search, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

export default function DocumentDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDoc = async () => {
        try {
            const res = await api.get(`/documents/${id}`);
            setDoc(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoc();
    }, [id]);

    const handleAction = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this document?`)) return;
        try {
            await api.post(`/admin/reviews/${id}/${action}`);
            await fetchDoc();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto p-6 space-y-6 animate-pulse">
                <div className="h-20 bg-surface-muted rounded-2xl"></div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="h-[600px] bg-surface-muted rounded-2xl"></div>
                    <div className="h-[600px] bg-surface-muted rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (!doc) return <div className="text-center p-12 text-danger">Document not found</div>;

    // Use a placeholder if not found physically
    const fileUrl = doc.fileUrl && doc.fileUrl.startsWith('/') ? `http://localhost:5000${doc.fileUrl}` : doc.fileUrl;

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
            {/* Nav & Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                    <Button variant="secondary" onClick={() => navigate(`/applications/${doc.applicationId._id}`)} leftIcon={<ArrowLeft size={16} />}>
                        Application View
                    </Button>
                    <div className="h-6 w-px bg-border"></div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-foreground">
                            {doc.documentType !== 'UNKNOWN' ? doc.documentType : doc.fileName}
                        </h1>
                        <p className="text-xs font-semibold text-foreground-muted font-mono mt-0.5">
                            DOC_ID: {doc._id} • UPLOADED: {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                {(user.role === 'ADMIN' || user.role === 'REVIEWER') && doc.processingStatus === 'REVIEW_REQUIRED' && (
                    <div className="flex gap-3 bg-surface p-2 rounded-2xl border border-border shadow-subtle">
                        <Button variant="danger" leftIcon={<XCircle size={16} />} onClick={() => handleAction('reject')}>Reject Data</Button>
                        <Button variant="success" leftIcon={<CheckCircle2 size={16} />} onClick={() => handleAction('approve')}>Approve Extraction</Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left side: Document Sandbox */}
                <Card className="overflow-hidden border-border bg-surface-muted/30 shadow-subtle relative min-h-[600px] flex items-center justify-center p-6">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <Badge variant="secondary" className="backdrop-blur-md bg-white/70 shadow-sm border border-black/10 text-black">
                            SOURCE_ORIGINAL
                        </Badge>
                        <Badge variant="primary" className="shadow-sm">
                            <Search size={10} className="mr-1" /> OPTICAL_RECOGNITION
                        </Badge>
                    </div>

                    <div className="relative rounded-lg overflow-hidden shadow-xl border border-black/10 bg-white max-w-full max-h-[700px]">
                        {/* Fake scanning overlay */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                            <div className="w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.5)] animate-[scan_3s_ease-in-out_infinite_alternate]" />
                        </div>
                        
                        {/* The actual image or IFRAME */}
                        {doc.mimeType && doc.mimeType.includes('pdf') ? (
                            <iframe src={fileUrl} className="w-full h-[600px] border-none" title="PDF Preview" />
                        ) : (
                            <img src={fileUrl} alt={doc.fileName} className="max-w-full max-h-[700px] object-contain relative z-10" />
                        )}
                    </div>
                </Card>

                {/* Right side: AI Extraction & Details */}
                <div className="space-y-6">
                    
                    {/* Insights Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-surface border-border p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary-subtle text-primary rounded-lg"><Database size={16} /></div>
                                <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Classification Confidence</h4>
                            </div>
                            <p className="text-2xl font-display font-bold text-foreground">
                                {Math.round(doc.classificationConfidence * 100)}%
                            </p>
                            <div className="w-full h-1 bg-border rounded-full mt-3 overflow-hidden">
                                <motion.div initial={{width:0}} animate={{width:`${Math.round(doc.classificationConfidence*100)}%`}} transition={{duration:1}} className="h-full bg-primary rounded-full"></motion.div>
                            </div>
                        </Card>
                        
                        <Card className="bg-surface border-border p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2 rounded-lg", doc.qualityScore > 75 ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger")}><Fingerprint size={16} /></div>
                                <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wider">Image Quality Score</h4>
                            </div>
                            <p className={cn("text-2xl font-display font-bold", doc.qualityScore > 75 ? "text-success" : "text-danger")}>
                                {doc.qualityScore} <span className="text-sm text-foreground-muted">/ 100</span>
                            </p>
                            <p className="text-xs font-semibold text-foreground-subtle mt-1 flex items-center gap-1">
                                <Lock size={12} /> {doc.qualityScore > 75 ? "Valid for extraction" : "Blur/Glare detected"}
                            </p>
                        </Card>
                    </div>

                    {/* Flags */}
                    {doc.issues && doc.issues.length > 0 && (
                        <Card className="bg-danger-subtle border-danger/20">
                            <CardContent className="p-5">
                                <h3 className="text-sm font-bold text-danger mb-3 flex items-center gap-2">
                                    <AlertTriangle size={18} /> OCR Validation Exceptions
                                </h3>
                                <ul className="space-y-2">
                                    {doc.issues.map((iss, i) => (
                                        <li key={i} className="text-sm font-medium text-danger/80 bg-danger/5 border border-danger/10 p-3 rounded-lg flex items-start gap-2">
                                            <span className="mt-0.5">•</span> {iss}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Extracted Data Table */}
                    <Card className="overflow-hidden shadow-subtle border-border">
                        <CardHeader className="bg-surface-muted/30 border-b border-border p-5">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <FileText size={16} className="text-primary" /> Extracted Entities
                                </CardTitle>
                                <Badge variant="success" className="gap-1 animate-pulse"><ShieldCheck size={12} /> VERIFIED</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {doc.extractedData && Object.keys(doc.extractedData).length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-border">
                                        {Object.entries(doc.extractedData).map(([key, value]) => (
                                            <tr key={key} className="hover:bg-surface-muted/30 transition-colors">
                                                <th className="px-5 py-4 font-semibold text-foreground-muted capitalize w-1/3 bg-surface-muted/10">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </th>
                                                <td className="px-5 py-4 font-bold text-foreground bg-surface">
                                                    {(key.toLowerCase().includes('number') && value.toString().length > 5) 
                                                        ? <span className="font-mono">XXXX XXXX <span className="text-primary">{value.slice(-4)}</span></span>
                                                        : value.toString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-foreground-subtle">
                                    <p className="font-medium">No structured data extracted.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
