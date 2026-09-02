import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Shield, X, Download } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export default function AuditMatrixDrawer({ isOpen, onClose, auditMatrix }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex justify-end">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-xl h-full bg-surface border-l border-border shadow-2xl flex flex-col"
                >
                    <div className="flex items-center justify-between p-6 border-b border-border bg-surface-muted/30">
                        <div className="flex items-center gap-3">
                            <Shield className="text-primary" size={24} />
                            <div>
                                <h2 className="text-xl font-display font-bold text-foreground">Forensic Audit Matrix</h2>
                                <p className="text-xs text-foreground-muted font-medium mt-0.5">5-Dimensional Cross-Verification Analysis</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-surface-muted rounded-full text-foreground-muted transition-colors"><X size={20} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {auditMatrix?.map((audit, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:border-foreground-subtle transition-colors"
                            >
                                <div className="p-4 border-b border-border flex items-center justify-between bg-surface-muted/20">
                                    <div className="flex items-center gap-3">
                                        {audit.status === 'PASSED' && <CheckCircle2 size={18} className="text-success" />}
                                        {audit.status === 'WARNING' && <AlertTriangle size={18} className="text-warning" />}
                                        {audit.status === 'FAILED' && <XCircle size={18} className="text-danger" />}
                                        <h3 className="font-bold text-sm text-foreground">{audit.field}</h3>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-subtle bg-surface-muted px-2 py-1 rounded-md">
                                        {audit.dimension.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <p className="text-xs text-foreground-muted leading-relaxed font-medium">
                                        {audit.explanation}
                                    </p>
                                    
                                    <div className="bg-surface-muted/50 rounded-xl p-3 border border-border">
                                        <p className="text-[10px] uppercase font-bold text-foreground-subtle mb-2">RAW EXTRACTED DATA</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                            {Object.entries(audit.extractedValues || {}).map(([c, v], i) => (
                                                <div key={i} className="flex flex-col gap-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    <span className="text-foreground-subtle truncate" title={c}>{c}:</span>
                                                    <span className={cn("text-foreground truncate", audit.status==='FAILED' && "text-danger")} title={String(v)}>{String(v)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {(!auditMatrix || auditMatrix.length === 0) && (
                            <div className="p-12 mt-10 text-center text-foreground-muted flex flex-col items-center justify-center">
                                <Shield className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-medium text-sm text-foreground">No forensic data available.</p>
                                <p className="text-xs mt-1 max-w-[250px] leading-relaxed">Upload documents to generate the real-time AI audit matrix.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 border-t border-border bg-surface-muted/30">
                         <Button variant="secondary" className="w-full gap-2 font-bold" disabled={!auditMatrix?.length}>
                            <Download size={16} /> Export Forensic Evidence CSV
                         </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
