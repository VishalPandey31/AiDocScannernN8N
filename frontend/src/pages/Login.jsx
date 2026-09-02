import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Shield, ExternalLink, LockKeyhole, Terminal, Hexagon, ScanFace } from 'lucide-react';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 = Locked, 1 = Form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // Fake scan animation duration for effect
            await new Promise(r => setTimeout(r, 800));
            setScanned(true);
            await new Promise(r => setTimeout(r, 600)); 
            
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authorization Denied');
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div 
                        key="locked"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="flex flex-col items-center justify-center z-10"
                    >
                        <motion.button
                            onClick={() => setStep(1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative group cursor-pointer border-none bg-transparent outline-none flex flex-col items-center"
                        >
                            {/* Scanning Ring */}
                            <div className="absolute inset-0 rounded-full border border-primary/30 group-hover:border-primary/80 transition-colors animate-[spin_4s_linear_infinite]" />
                            <div className="absolute inset-[-10px] rounded-full border border-dashed border-primary/20 group-hover:border-primary/50 transition-colors animate-[spin_8s_linear_infinite_reverse]" />
                            
                            <div className="w-32 h-32 rounded-full bg-surface-elevated/80 backdrop-blur-xl border border-border flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_60px_rgba(99,102,241,0.4)] transition-all">
                                <Fingerprint size={48} className="text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.button>

                        <div className="mt-12 text-center flex flex-col items-center">
                            <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-foreground-muted mb-2 flex items-center gap-2">
                                <Shield size={12} className="text-primary" /> SECURE ENVIRONMENT
                            </h2>
                            <p className="text-xs font-mono text-primary/80 animate-pulse">
                                CLICK TO INITIATE UPLINK
                            </p>
                        </div>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        className="w-full max-w-md z-10 px-4"
                    >
                        <div className="bg-surface/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                            {/* Inner Glass Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                            
                            <div className="flex items-center gap-4 mb-8">
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                    <Hexagon size={48} className="absolute inset-0 text-primary animate-[spin_10s_linear_infinite]" strokeWidth={1} />
                                    <ScanFace size={24} className="text-primary relative z-10" />
                                    <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">AuraVerify</h1>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary/80">Neural Gateway</p>
                                </div>
                            </div>

                            {error && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-danger-subtle border border-danger/30 text-danger p-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                                    <LockKeyhole size={14} /> {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5 relative z-10 w-full">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground-subtle mb-1.5 ml-1">Identity Node</label>
                                    <div className="relative group">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-surface border border-border text-foreground placeholder-foreground-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground-subtle mb-1.5 ml-1">Encryption Key</label>
                                    <div className="relative group">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-surface border border-border text-foreground placeholder-foreground-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono tracking-widest"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading || scanned}
                                    className="w-full relative overflow-hidden bg-primary hover:bg-primary-hover text-white font-bold rounded-xl px-4 py-3.5 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-80 mt-6 flex justify-center items-center gap-2 border border-primary-hover/50 group"
                                >
                                    {scanned ? (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                            <Shield size={16} /> ACCESS GRANTED
                                        </motion.div>
                                    ) : loading ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-xs uppercase tracking-widest font-mono">Authenticating...</div>
                                        </div>
                                    ) : (
                                        <>AUTHORIZE <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                    
                                {/* Scanner Animation Effect */}
                                    {loading && !scanned && (
                                        <motion.div 
                                            initial={{ top: 0 }}
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                                            className="absolute left-0 right-0 h-px bg-white shadow-[0_0_10px_#fff] z-20"
                                        />
                                    )}
                                </button>
                                
                                {/* Terminal Logs styling for Demo text */}
                                <div className="mt-8 bg-surface-muted p-4 rounded-xl border border-border font-mono text-[10px] text-foreground-subtle flex flex-col gap-1 w-full shadow-inner">
                                    <div className="flex items-center gap-2 text-warning mb-2 border-b border-border pb-2">
                                        <Terminal size={12} /> System Overrides (Demo)
                                    </div>
                                    <p><span className="text-primary">Admin:</span> admin@auraverify.ai</p>
                                    <p><span className="text-success">Reviewer:</span> rahul@example.com</p>
                                    <p><span className="text-foreground-muted">Key:</span> password123</p>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
