import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { ShieldCheck, AlertTriangle, XCircle, FileText, Activity, Clock, Cpu } from 'lucide-react';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';

export default function DocumentVerificationReport({ report }) {
    if (!report) return null;

    const isSuccess = report.success;
    const hasIssues = report.issues && report.issues.length > 0;
    const isWarning = isSuccess && hasIssues;

    const getStatusIcon = () => {
        if (!isSuccess) return <XCircle size={24} className="text-danger" />;
        if (isWarning) return <AlertTriangle size={24} className="text-warning" />;
        return <ShieldCheck size={24} className="text-success" />;
    };

    const getStatusBg = () => {
        if (!isSuccess) return "bg-danger-subtle border-danger/20 text-danger";
        if (isWarning) return "bg-warning-subtle border-warning/20 text-warning";
        return "bg-success-subtle border-success/20 text-success";
    };

    // We filter out null or empty strings to render valid dynamic fields 
    const extractedKeys = report.data ? Object.keys(report.data).filter(key => report.data[key] !== null && report.data[key] !== "") : [];

    return (
        <Card className="shadow-lg border-border bg-surface mb-6 overflow-hidden">
            <div className={cn("px-6 py-4 border-b flex items-center justify-between", getStatusBg())}>
                <div className="flex items-center gap-3">
                    {getStatusIcon()}
                    <div>
                        <h3 className="font-bold tracking-wide uppercase text-sm">
                            {isSuccess ? (isWarning ? "Verified with Warnings" : "Document Verified") : "Verification Rejected"}
                        </h3>
                        <p className="text-xs font-medium opacity-80 mt-0.5">{report.message || (isSuccess ? "Passed Deterministic Core" : "Validation Failed")}</p>
                    </div>
                </div>
                {report.confidence !== null && (
                    <div className="bg-surface/50 px-3 py-1.5 rounded-lg flex flex-col items-end shrink-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Confidence</span>
                        <span className="font-bold text-sm tracking-tight">{report.confidence <= 1 ? Math.round(report.confidence * 100) : Math.round(report.confidence)}%</span>
                    </div>
                )}
            </div>

            <CardContent className="p-6 space-y-8">
                
                {/* Meta Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="min-w-0">
                        <p className="text-[10px] text-foreground-subtle uppercase tracking-wider font-bold mb-1">Doc Type</p>
                        <p className="text-sm font-medium text-foreground truncate">
                            {(report.documentType || (report.data && report.data.documentType) || 'Unknown').replace(/_/g, ' ')}
                        </p>
                    </div>
                    {report.documentId && (
                        <div className="min-w-0">
                            <p className="text-[10px] text-foreground-subtle uppercase tracking-wider font-bold mb-1">Doc ID</p>
                            <p className="text-sm font-medium text-foreground font-mono truncate" title={report.documentId}>{report.documentId}</p>
                        </div>
                    )}
                    {report.applicationId && (
                        <div className="min-w-0">
                            <p className="text-[10px] text-foreground-subtle uppercase tracking-wider font-bold mb-1">App Binder ID</p>
                            <p className="text-sm font-medium text-foreground font-mono truncate" title={report.applicationId}>{report.applicationId}</p>
                        </div>
                    )}
                    {report.requestId && (
                        <div className="min-w-0">
                            <p className="text-[10px] text-foreground-subtle uppercase tracking-wider font-bold mb-1">N8N Trace ID</p>
                            <p className="text-sm font-medium text-foreground font-mono truncate" title={report.requestId}>{report.requestId.split('-')[0]}</p>
                        </div>
                    )}
                </div>

                {/* Dynamic Extracted Data Map */}
                {Object.keys(report.data || {}).length > 0 && (
                    <div className="mt-8">
                        <h4 className="text-xs uppercase tracking-widest text-primary font-bold mb-4 flex items-center gap-2">
                            <Cpu size={14} /> Neural Extraction Map
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(report.data).map(([key, rawValue]) => {
                                if (rawValue === null || rawValue === undefined || rawValue === "") return null;
                                
                                // Specific handling for the nested "fields" object from n8n 
                                if (key.toLowerCase() === 'fields' && typeof rawValue === 'object') {
                                    return (
                                        <div key={key} className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-[10px] uppercase font-bold text-foreground-subtle tracking-widest mt-2 border-b border-border/50 pb-1">
                                                Extracted Data Fields
                                            </div>
                                            {Object.entries(rawValue).map(([subKey, fieldData]) => (
                                                <div key={`field-${subKey}`} className="bg-surface border border-border/50 p-4 rounded-xl flex flex-col justify-between hover:bg-surface-muted/30 transition-colors shadow-sm">
                                                    <div>
                                                        <span className="text-[10px] uppercase text-foreground-muted font-bold tracking-wider mb-1.5 block">
                                                            {subKey.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <span className="text-sm font-semibold text-foreground break-words">
                                                            {fieldData && fieldData.value !== undefined ? (fieldData.value !== null ? String(fieldData.value) : 'Not Detected') : (typeof fieldData === 'object' ? JSON.stringify(fieldData) : String(fieldData))}
                                                        </span>
                                                    </div>
                                                    {fieldData && typeof fieldData.confidence === 'number' && fieldData.value !== null && (
                                                        <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2">
                                                            <span className="text-[9px] uppercase font-bold text-foreground-subtle">Confidence</span>
                                                            <Badge variant={fieldData.confidence > 0.85 ? "success" : fieldData.confidence > 0.5 ? "warning" : "destructive"} className="px-1.5 py-0 text-[9px] h-4">
                                                                {Math.round(fieldData.confidence * 100)}%
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                
                                // Specific handling for crossDocument objects
                                if (key.toLowerCase() === 'crossdocument' && typeof rawValue === 'object') {
                                    return (
                                        <div key={key} className="col-span-1 md:col-span-2 bg-surface border border-info/20 bg-info-subtle/10 p-4 rounded-xl shadow-sm">
                                            <span className="text-[10px] uppercase text-info font-bold tracking-widest mb-3 flex items-center gap-2 border-b border-info/20 pb-2">
                                                <Activity size={12} /> Cross Document Correlation
                                            </span>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[9px] uppercase text-foreground-muted font-bold tracking-wider mb-1 block">Analysis Result</span>
                                                    <Badge variant={rawValue.name === 'MATCH_FOUND' ? 'success' : rawValue.name === 'NOT_ENOUGH_DATA' ? 'secondary' : 'warning'}>
                                                        {rawValue.name?.replace(/_/g, ' ') || 'Unknown'}
                                                    </Badge>
                                                </div>
                                                {rawValue.comparedWith && rawValue.comparedWith.length > 0 && (
                                                    <div>
                                                        <span className="text-[9px] uppercase text-foreground-muted font-bold tracking-wider mb-1 block">Correlated Against</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {rawValue.comparedWith.map((doc, idx) => (
                                                                <Badge key={idx} variant="outline" className="bg-surface">
                                                                    {typeof doc === 'object' && doc !== null ? (doc.name || doc.documentId || doc.type || JSON.stringify(doc)) : String(doc)}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Specific handling for scores (attentionScore, readinessScore)
                                if ((key === 'attentionScore' || key === 'readinessScore') && typeof rawValue === 'number') {
                                    return (
                                        <div key={key} className="bg-surface border border-border/50 p-4 rounded-xl flex flex-col justify-between shadow-sm">
                                            <span className="text-[10px] uppercase text-foreground-muted font-bold tracking-wider mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <div className={cn("text-2xl font-display font-bold tracking-tight", 
                                                key === 'readinessScore' ? (rawValue >= 80 ? 'text-success' : rawValue >= 50 ? 'text-warning' : 'text-danger') :
                                                (rawValue > 50 ? 'text-danger' : rawValue > 0 ? 'text-warning' : 'text-success')
                                            )}>
                                                {rawValue}
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Standard / Fallback rendering for top-level keys
                                return (
                                    <div key={key} className="bg-surface border border-border/50 p-4 rounded-xl flex flex-col justify-center">
                                        <span className="text-[10px] uppercase text-foreground-muted font-bold tracking-wider mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-sm font-medium text-foreground overflow-auto">
                                            {typeof rawValue === 'object' 
                                                ? <pre className="text-[10px] mt-1 text-foreground-subtle font-mono p-2 bg-surface-muted rounded-lg whitespace-pre-wrap">{JSON.stringify(rawValue, null, 2)}</pre>
                                                : String(rawValue)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Issues Map */}
                {report.issues && report.issues.length > 0 && (
                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-danger font-bold mb-3 flex items-center gap-2">
                            <Activity size={14} /> Validation Telemetry Alerts
                        </h4>
                        <div className="space-y-2">
                            {report.issues.map((issue, idx) => (
                                <div key={idx} className="flex gap-3 bg-danger-subtle/30 border border-danger/10 p-4 rounded-xl items-start shadow-sm">
                                    <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-bold text-danger">{typeof issue === 'object' && issue.name ? issue.name : 'Validation Flag'}</span>
                                        <span className="text-sm text-foreground-muted font-medium leading-relaxed">
                                            {typeof issue === 'object' && issue !== null ? (issue.description || issue.comparedWith || JSON.stringify(issue)) : String(issue)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Audit Timestamp */}
                <div className="pt-2 flex items-center justify-between text-[11px] font-medium text-foreground-muted border-t border-border/30">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> Execution Checkpoint Logged</span>
                    <span>{new Date(report.timestamp).toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
