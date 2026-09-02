import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Activity } from 'lucide-react';

export default function AuditTrail() {
    return (
        <div className="max-w-[1400px] mx-auto space-y-6 pb-12 mt-4">
            <h1 className="text-3xl font-display font-medium text-foreground tracking-tight flex items-center gap-3">
                <Activity size={28} className="text-primary" /> Audit Trail
            </h1>
            <p className="text-foreground-muted">Immutable chronological intelligence timeline.</p>
            
            <Card className="bg-surface border-border shadow-subtle p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="font-mono text-xs text-foreground-muted animate-pulse">
                    LOADING SYSTEM LOGS...
                </div>
            </Card>
        </div>
    );
}
