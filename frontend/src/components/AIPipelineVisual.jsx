import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Cpu, ScanText, CheckSquare, RefreshCw, Layers } from 'lucide-react';
import { cn } from '../utils/cn';

export default function AIPipelineVisual({ status, readinessScore }) {
    const steps = [
        { id: 'upload', label: 'UPLOAD', icon: Upload },
        { id: 'ocr', label: 'OCR', icon: ScanText },
        { id: 'classify', label: 'CLASSIFICATION', icon: Layers },
        { id: 'extract', label: 'EXTRACTION', icon: FileText },
        { id: 'validate', label: 'VALIDATE', icon: CheckSquare },
        { id: 'cross', label: 'CROSS-CHECK', icon: RefreshCw },
        { id: 'score', label: 'SCORE', icon: Cpu },
    ];

    // Determine active index based on generic statuses
    let activeIdx = 0;
    if (status === 'INCOMPLETE' || status === 'FAILED') activeIdx = 2; // Failed somewhere early
    if (status === 'REVIEW_REQUIRED') activeIdx = 5; // Reached cross-check and failed
    if (status === 'READY') activeIdx = 6; 
    
    // Animate scanning line across if processing
    const isProcessing = status === 'PROCESSING' || status === 'DRAFT'; 

    return (
        <div className="w-full overflow-hidden py-4">
            <div className="flex items-center justify-between relative">
                
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0 hidden md:block"></div>
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-1000 hidden md:block" 
                    style={{ width: `${(activeIdx / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx <= activeIdx;
                    const isProcessingNode = isProcessing && idx === activeIdx + 1;
                    
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <motion.div 
                                initial={false}
                                animate={{
                                    scale: isActive ? 1 : 0.9,
                                    backgroundColor: isActive ? 'var(--primary)' : 'var(--surface-muted)',
                                    borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                                    color: isActive ? 'var(--primary-foreground)' : 'var(--foreground-muted)'
                                }}
                                className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors",
                                    isProcessingNode && "animate-pulse ring-4 ring-primary/20",
                                )}
                            >
                                <Icon size={18} className={isProcessingNode ? "animate-bounce" : ""} />
                            </motion.div>
                            <p className={cn(
                                "text-[10px] uppercase font-bold mt-2 tracking-widest hidden md:block transition-colors",
                                isActive ? "text-primary" : "text-foreground-muted"
                            )}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
