import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/cn';

export default function Applications() {
    const location = window.location.pathname;
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(location.includes('review') ? 'REVIEW_REQUIRED' : 'ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await api.get('/applications');
                setApplications(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApps();

        // Check if navigated from Dashboard "Start New Verification"
        if (window.location.search.includes('create=true')) {
            setIsCreateModalOpen(true);
        }
    }, []);

    const openCreateModal = () => setIsCreateModalOpen(true);
    
    // Moved the logic into the CreateModal component rendered at the bottom

    const filteredApps = applications.filter(app => {
        if (filter === 'ALL') return true;
        if (filter === 'REVIEW_REQUIRED') return app.status === 'REVIEW_REQUIRED' || app.attentionScore > 0;
        if (filter === 'READY') return app.status === 'READY' || app.status === 'APPROVED';
        return app.status === filter;
    });

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-6">
                <div className="h-20 bg-surface-muted animate-pulse rounded-2xl w-full"></div>
                <div className="h-96 bg-surface-muted animate-pulse rounded-2xl w-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Review Workspace</h1>
                    <p className="text-foreground-muted text-sm font-medium mt-1">Manage human-in-the-loop approvals and exceptions.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                        <input 
                            type="text" 
                            placeholder="Search applications..." 
                            className="w-full bg-surface-muted border border-border rounded-xl py-2 pl-9 pr-4 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                    <Button onClick={openCreateModal} variant="primary" leftIcon={<Plus size={16} />}>
                        New
                    </Button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
                <TabButton active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
                    All Applications <span className="ml-1.5 bg-surface-muted text-foreground-muted px-2 py-0.5 rounded-full text-[10px] tabular-nums">{applications.length}</span>
                </TabButton>
                <TabButton active={filter === 'REVIEW_REQUIRED'} onClick={() => setFilter('REVIEW_REQUIRED')}>
                    <AlertTriangle size={14} className="mr-1.5 text-warning" /> Needs Review
                    <span className="ml-1.5 bg-warning-subtle text-warning px-2 py-0.5 rounded-full text-[10px] tabular-nums">
                        {applications.filter(a => a.status === 'REVIEW_REQUIRED' || a.attentionScore > 0).length}
                    </span>
                </TabButton>
                <TabButton active={filter === 'READY'} onClick={() => setFilter('READY')}>
                    <CheckCircle2 size={14} className="mr-1.5 text-success" /> Verified
                    <span className="ml-1.5 bg-success-subtle text-success px-2 py-0.5 rounded-full text-[10px] tabular-nums">
                        {applications.filter(a => a.status === 'READY' || a.status === 'APPROVED').length}
                    </span>
                </TabButton>
                <TabButton active={filter === 'DRAFT'} onClick={() => setFilter('DRAFT')}>
                    Incomplete / Draft
                </TabButton>
            </div>

            {/* Applications Table */}
            <Card className="overflow-hidden bg-surface border-border shadow-subtle">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-surface-muted/30 text-xs uppercase tracking-wider text-foreground-subtle font-bold">
                                <th className="py-4 px-6 w-[250px]">Applicant Identity</th>
                                <th className="py-4 px-6 w-[150px]">Status</th>
                                <th className="py-4 px-6">Readiness</th>
                                <th className="py-4 px-6">Attention / Risk</th>
                                <th className="py-4 px-6 text-right w-[150px]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <AnimatePresence>
                                {filteredApps.map(app => (
                                    <motion.tr 
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        key={app._id} 
                                        className="hover:bg-surface-muted/50 transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/applications/${app._id}`)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                                {app.applicantName}
                                            </div>
                                            <p className="text-[10px] uppercase tracking-wider text-foreground-muted mt-1 font-bold">
                                                ID: {app._id.slice(-6)}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={app.status} />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold w-10 tabular-nums">{app.readinessScore}%</span>
                                                <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                                                    <div 
                                                        className={cn("h-full rounded-full transition-all", app.readinessScore > 80 ? 'bg-success' : app.readinessScore > 50 ? 'bg-warning' : 'bg-danger')}
                                                        style={{ width: `${app.readinessScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {app.attentionScore > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle size={14} className={app.attentionScore > 50 ? "text-danger" : "text-warning"} />
                                                    <span className={cn("text-sm font-bold", app.attentionScore > 50 ? "text-danger" : "text-warning")}>
                                                        {app.attentionScore} Score
                                                    </span>
                                                    {app.issues?.length > 0 && (
                                                        <span className="text-[10px] font-bold bg-surface-muted px-2 py-0.5 rounded text-foreground-muted">
                                                            {app.issues.length} FLAGS
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-2 text-sm text-foreground-muted font-medium">
                                                    <ShieldAlert size={14} className="opacity-50" /> None
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                                Review <ArrowRight size={14} />
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredApps.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-foreground-muted">
                                            <FileText size={48} className="mb-4 opacity-20" />
                                            <p className="text-base font-bold text-foreground mb-1">Queue is empty</p>
                                            <p className="text-sm">No applications found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create Application Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <CreateApplicationModal 
                        onClose={() => setIsCreateModalOpen(false)} 
                        onSuccess={(id) => navigate(`/applications/${id}`)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function TabButton({ active, onClick, children }) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "px-5 py-3 text-sm font-bold border-b-2 transition-colors flex items-center whitespace-nowrap",
                active 
                    ? "border-primary text-primary" 
                    : "border-transparent text-foreground-muted hover:text-foreground hover:border-border"
            )}
        >
            {children}
        </button>
    );
}

function StatusBadge({ status }) {
    const format = (s) => s.replace('_', ' ');
    switch(status) {
        case 'READY':
        case 'APPROVED': return <span className="bg-success-subtle text-success px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
        case 'REVIEW_REQUIRED': return <span className="bg-warning-subtle text-warning px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
        case 'INCOMPLETE':
        case 'FAILED': return <span className="bg-danger-subtle text-danger px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">{format(status)}</span>;
    }
}

function CreateApplicationModal({ onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [templates, setTemplates] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await api.get('/templates');
                setTemplates(res.data.data);
                if (res.data.data.length > 0) {
                    setTemplateId(res.data.data[0].templateId);
                }
            } catch (err) {
                console.error("Failed to fetch templates", err);
            }
        };
        fetchTemplates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !templateId) return;
        setIsSubmitting(true);
        try {
            const res = await api.post('/applications/create', { applicantName: name, templateId });
            onSuccess(res.data.data.applicationId);
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-surface border border-border shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-border bg-surface-muted/30">
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Plus size={18} className="text-primary" /> Initialize New Workspace
                    </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-foreground-subtle mb-2">Subject / Applicant Name</label>
                        <input 
                            type="text" 
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-foreground-subtle mb-2">Verification Template (Select Scope)</label>
                        <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
                            {templates.map(t => (
                                <div 
                                    key={t.templateId}
                                    onClick={() => setTemplateId(t.templateId)}
                                    className={cn(
                                        "p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1",
                                        templateId === t.templateId ? "bg-primary/10 border-primary text-primary" : "bg-background border-border hover:border-foreground-muted"
                                    )}
                                >
                                    <span className="text-sm font-bold">{t.title}</span>
                                    <span className={cn("text-[10px] font-mono", templateId === t.templateId ? "text-primary/70" : "text-foreground-muted")}>
                                        Requires: {t.mandatoryDocuments?.map(d => d.displayName).join(', ') || 'Auto-detect'}
                                    </span>
                                </div>
                            ))}
                            {templates.length === 0 && (
                                <div className="p-4 text-center text-xs text-foreground-muted">Loading templates...</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting || !name}>
                            {isSubmitting ? "Generating Workspace..." : "Create Pipeline"}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
