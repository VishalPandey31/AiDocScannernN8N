import React, { useState, useEffect, useRef } from 'react';
import { Folder, Search, MoreHorizontal, ArrowUpRight, Navigation, Hexagon, Plus, FileCode } from 'lucide-react';
import api from '../services/api';
import { cn } from '../utils/cn';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Chat State
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm here to help you review your signed documents. Just ask a question or attach a file!" }
    ]);
    const [input, setInput] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [activeTab, setActiveTab] = useState('Workspace');
    
    const fileInputRef = useRef(null);

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
    }, []);

    // Derived Metrics
    const verifiedApps = applications.filter(a => a.status === 'VERIFIED').length;
    const totalApps = applications.length;
    
    // Calculate Average Compliance Score (Readiness Score)
    const avgScore = totalApps > 0 
        ? Math.round(applications.reduce((acc, app) => acc + (app.readinessScore || 0), 0) / totalApps) 
        : 0;

    // Status Breakdowns
    const processingApps = applications.filter(a => a.status === 'PROCESSING').length;
    const attentionApps = applications.filter(a => a.status === 'ATTENTION_REQUIRED' || a.status === 'REJECTED').length;
    
    const processingPct = totalApps > 0 ? Math.round((processingApps / totalApps) * 100) : 0;
    const completedPct = totalApps > 0 ? Math.round((verifiedApps / totalApps) * 100) : 0;
    const awaitingPct = totalApps > 0 ? Math.round((attentionApps / totalApps) * 100) : 0;

    // Filtered Applications based on Tabs
    const filteredApps = applications.filter(app => {
        if (activeTab === 'Workspace') return true;
        if (activeTab === 'Invoices') return app.applicationType?.toLowerCase().includes('invoice');
        if (activeTab === 'Proposals') return app.applicationType?.toLowerCase().includes('proposal');
        if (activeTab === 'Pending Review') return app.status === 'ATTENTION_REQUIRED' || app.status === 'REJECTED';
        if (activeTab === 'Verified') return app.status === 'VERIFIED';
        return true;
    });

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() && !attachment) return;

        const userMsg = input;
        const attachedDoc = attachment;
        
        setInput('');
        setAttachment(null);
        
        setMessages(prev => [...prev, { role: 'user', text: userMsg, file: attachedDoc }]);
        setIsTyping(true);

        try {
            const formData = new FormData();
            if (userMsg) formData.append('message', userMsg);
            if (attachedDoc) formData.append('document', attachedDoc);

            const headers = attachedDoc ? { 'Content-Type': 'multipart/form-data' } : {};
            const res = await api.post('/ai/chat', formData, { headers });
            
            setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting to the verification core. Please make sure your backend is running and the API key is active." }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const folders = [
        { name: 'Workspace' },
        { name: 'Invoices' },
        { name: 'Proposals' },
        { name: 'Pending Review' },
        { name: 'Verified' },
    ];

    return (
        <div className="w-full h-full text-foreground relative isolate pt-4">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 relative z-20 px-2">
                <div>
                    <p className="text-foreground-muted text-sm mb-1.5 font-medium tracking-wide">Documents</p>
                    <h1 className="text-4xl md:text-[44px] font-display text-foreground tracking-tight leading-none">BGD Industry Inc.</h1>
                    <div className="mt-4">
                        <Button variant="primary" onClick={() => window.location.href='/applications?create=true'} size="lg" className="gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] transition-all">
                            <Plus size={18} /> Start New Verification
                        </Button>
                    </div>
                </div>
                
                <div className="mt-6 md:mt-0 flex flex-col items-end text-sm text-foreground-muted font-medium">
                    <p>Counterparty ID: <span className="text-foreground font-semibold tracking-wide">48-3920</span></p>
                    <p className="mt-1">Industry: <span className="text-foreground font-semibold">Industrial Services</span></p>
                    
                    <div className="mt-5 flex flex-col items-end w-[220px]">
                        <div className="flex justify-between w-full mb-2 text-xs">
                            <span>Reliability Score</span>
                            <span className="text-foreground">B (High)</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden flex">
                            <div className="h-full bg-primary w-[30%]"></div>
                            <div className="h-full bg-surface-muted w-[70%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-4 overflow-x-auto pb-6 mb-2 scrollbar-hide relative z-20 px-2">
                {folders.map(folder => {
                    const isActive = activeTab === folder.name;
                    return (
                        <button 
                            key={folder.name}
                            onClick={() => setActiveTab(folder.name)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-xl border transition-all whitespace-nowrap min-w-36 font-medium text-sm",
                                isActive 
                                    ? "bg-surface-elevated/80 border-border/50 text-foreground shadow-[0_-12px_40px_rgba(255,255,255,0.05)] -translate-y-3 backdrop-blur-xl" 
                                    : "bg-surface/30 border-border/10 text-foreground-subtle hover:bg-surface-elevated/40 hover:text-foreground backdrop-blur-md"
                            )}
                        >
                            <Folder className={isActive ? "text-primary" : "text-primary/70"} size={20} fill="currentColor" strokeWidth={1} />
                            {folder.name}
                        </button>
                    )
                })}
            </div>

            {/* Main Grid Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-20 px-2 lg:h-[500px]">
                
                {/* Left Side (Stats + Table) */}
                <div className="lg:col-span-8 flex flex-col gap-5">
                    
                    {/* 3 Top Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        
                        <div className="bg-surface/30 backdrop-blur-2xl border border-border/20 rounded-2xl p-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] h-[140px]">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-foreground-muted font-medium text-sm">Total Applications</h3>
                                <ArrowUpRight size={16} className="text-foreground-subtle" />
                            </div>
                            <div>
                                <div className="text-4xl font-display font-medium text-foreground mb-1 tracking-tight">{totalApps}</div>
                                <div className="text-success text-xs font-semibold flex items-center justify-between">
                                    <span>Verified: {verifiedApps}</span>
                                    {/* Mock chart */}
                                    <svg width="50" height="20" viewBox="0 0 60 20" className="opacity-80">
                                        <polyline points="0,15 15,10 30,12 45,5 60,2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface/30 backdrop-blur-2xl border border-border/20 rounded-2xl p-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] h-[140px]">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-foreground-muted font-medium text-sm">System Compliance (Avg)</h3>
                                <ArrowUpRight size={16} className="text-foreground-subtle" />
                            </div>
                            <div>
                                <div className="text-4xl font-display font-medium text-foreground mb-1 tracking-tight">{avgScore}<span className="text-xl text-foreground-muted ml-0.5">%</span></div>
                                <div className="text-foreground-subtle text-xs flex items-center justify-between">
                                    <span>Readiness Score</span>
                                    <svg width="50" height="20" viewBox="0 0 60 20" className="opacity-80 text-primary">
                                        <polyline points="0,18 15,14 30,15 45,8 60,4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface/30 backdrop-blur-2xl border border-border/20 rounded-2xl p-5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] h-[140px]">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-foreground-muted font-medium text-sm">Application Breakdown</h3>
                                <ArrowUpRight size={16} className="text-foreground-subtle" />
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-auto">
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-1">{processingPct}%</div>
                                    <div className="text-[10px] text-foreground-subtle mb-2 truncate">Processing</div>
                                    <div className="h-1 w-full bg-primary rounded-full"></div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-1">{completedPct}%</div>
                                    <div className="text-[10px] text-foreground-subtle mb-2 truncate">Verified</div>
                                    <div className="h-1 w-full bg-success rounded-full"></div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-foreground mb-1">{awaitingPct}%</div>
                                    <div className="text-[10px] text-foreground-subtle mb-2 truncate">Needs Review</div>
                                    <div className="h-1 w-full bg-warning rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overview Table Card */}
                    <div className="bg-surface/30 backdrop-blur-2xl border border-border/20 rounded-2xl p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-foreground font-medium">Overview</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-surface-muted/50 rounded-lg px-3 py-1.5 text-xs text-foreground-subtle border border-border/30">
                                    Sort By: Recent <span className="ml-2 font-bold cursor-pointer hover:text-foreground">×</span>
                                </div>
                                <div className="flex items-center bg-surface-muted/50 rounded-lg px-3 py-1.5 text-xs text-foreground-subtle border border-border/30 cursor-pointer hover:text-foreground">
                                    Date ⌄
                                </div>
                                <div className="flex items-center bg-surface-muted/50 rounded-lg px-3 py-1.5 text-xs text-foreground-subtle border border-border/30 cursor-pointer hover:text-foreground">
                                    Priority ⌄
                                </div>
                                <button className="p-1.5 bg-surface-muted/50 rounded-lg border border-border/30 text-foreground-subtle hover:text-foreground">
                                    <Search size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="w-full text-left text-xs text-foreground-muted font-medium mb-3 grid grid-cols-12 px-2 uppercase tracking-wider">
                            <div className="col-span-2 flex items-center gap-1">ID <span className="text-[10px]">↕</span></div>
                            <div className="col-span-4 flex items-center gap-1">NAME <span className="text-[10px]">↕</span></div>
                            <div className="col-span-3 flex items-center gap-1">DATE SIGNED <span className="text-[10px]">↕</span></div>
                            <div className="col-span-1 flex items-center gap-1">OWNER <span className="text-[10px]">↕</span></div>
                            <div className="col-span-2 flex items-center gap-1">PRIORITY <span className="text-[10px]">↕</span></div>
                        </div>

                        <div className="flex-1 min-h-[150px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {filteredApps.length === 0 && !loading && (
                                <div className="text-center text-foreground-muted text-sm py-10">
                                    {activeTab === 'Workspace' ? 'No applications created yet.' : `No applications found for ${activeTab}.`}
                                </div>
                            )}
                            {filteredApps.map((app) => (
                                <div key={app._id} className="grid grid-cols-12 py-3 px-2 border-t border-border/10 text-sm hover:bg-surface-elevated/30 transition-colors items-center group cursor-pointer" onClick={() => window.location.href=`/applications/${app._id}`}>
                                    <div className="col-span-2 text-foreground-muted font-mono text-xs">{app._id.slice(-6)}</div>
                                    <div className="col-span-4 text-foreground font-medium truncate pr-4">{app.applicantName}</div>
                                    <div className="col-span-3 text-foreground-muted">{new Date(app.createdAt).toLocaleDateString()}</div>
                                    <div className="col-span-1 text-foreground-muted truncate">{app.applicationType}</div>
                                    <div className="col-span-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2 max-w-full">
                                            <span className="flex gap-0.5 shrink-0">
                                                {app.status === 'ATTENTION_REQUIRED' || app.status === 'REJECTED' ? (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-danger"></span><span className="w-1.5 h-1.5 rounded-full bg-surface-elevated"></span></>
                                                ) : app.status === 'VERIFIED' ? (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-success"></span><span className="w-1.5 h-1.5 rounded-full bg-surface-elevated"></span></>
                                                ) : (
                                                    <><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span><span className="w-1.5 h-1.5 rounded-full bg-surface-elevated"></span></>
                                                )}
                                            </span>
                                            <span className="text-foreground-muted text-[10px] font-bold uppercase truncate">{app.status.replace('_', ' ')}</span>
                                        </div>
                                        <button className="text-foreground-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side (Document AI Chat) */}
                <div className="lg:col-span-4 bg-surface/30 backdrop-blur-2xl border border-border/20 rounded-2xl p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] flex flex-col h-full lg:min-h-full min-h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-foreground font-medium">Document AI</h3>
                        <ArrowUpRight size={16} className="text-foreground-subtle" />
                    </div>

                    <div className="flex-1 flex flex-col gap-6 text-sm overflow-y-auto pr-2 custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-col items-end self-end w-[90%] relative pr-1" : "mt-2")}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border/30 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                        <Hexagon size={16} className="text-foreground" fill="currentColor" />
                                    </div>
                                )}
                                <div>
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl md:text-sm text-xs leading-relaxed max-w-[100%] break-words whitespace-pre-wrap",
                                        msg.role === 'assistant' 
                                            ? "bg-surface-muted/30 border border-border/20 rounded-tl-sm text-foreground-muted" 
                                            : "bg-surface-elevated/40 border border-border/20 rounded-tr-sm text-foreground-muted relative"
                                    )}>
                                        {msg.text && <p className="mb-2">{msg.text}</p>}
                                        
                                        {msg.file && (
                                            <div className="inline-flex items-center gap-2 bg-background/50 border border-border/30 rounded-full pl-1 pr-3 py-1 mb-1">
                                                <div className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-none">DOC</div>
                                                <span className="text-[10px] lg:text-xs text-foreground font-medium tracking-wide truncate max-w-[120px] lg:max-w-full">
                                                    {msg.file.name}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {msg.role === 'user' && (
                                            <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full overflow-hidden border-[3px] border-[#0e1616] z-10 shadow-lg">
                                                <img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Bot typing */}
                        {isTyping && (
                            <div className="flex gap-3 mt-2">
                                <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border/30 flex items-center justify-center shrink-0 shadow-sm">
                                    <Hexagon size={16} className="text-foreground" fill="currentColor" />
                                </div>
                                <div className="w-full">
                                    <div className="flex items-center gap-2 text-xs text-primary font-medium ml-1 mt-2">
                                        <div className="flex gap-1" style={{opacity: 0.8}}>
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                        </div>
                                        Analyzing context
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    {attachment && (
                        <div className="px-3 py-2 bg-surface-muted/30 border-t border-x border-border/20 rounded-t-2xl text-xs flex items-center justify-between">
                            <span className="flex items-center gap-2 text-foreground-muted">
                                <FileCode size={14} className="text-primary" /> {attachment.name}
                            </span>
                            <button onClick={() => setAttachment(null)} className="text-danger hover:text-danger/80">×</button>
                        </div>
                    )}
                    <form onSubmit={handleChatSubmit} className={cn("mt-auto pt-4 border-t border-border/10 flex gap-2", attachment ? "pt-2 border-t-0" : "")}>
                        <div className={cn("flex-1 bg-surface-muted/30 border border-border/20 px-4 py-3 flex items-center focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-input", attachment ? "rounded-b-2xl rounded-t-none" : "rounded-2xl")}>
                            <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Enter Task for Document AI" 
                                className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground-subtle" 
                            />
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={(e) => setAttachment(e.target.files[0])}
                            />
                            <div className="flex items-center gap-2 text-foreground-subtle shrink-0">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-foreground transition-colors"><FileCode size={16} /></button>
                                <button type="button" className="hover:text-foreground transition-colors"><Hexagon size={16} /></button>
                            </div>
                        </div>
                        <button type="submit" disabled={isTyping || (!input.trim() && !attachment)} className="h-[46px] w-[50px] shrink-0 rounded-2xl bg-primary text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] disabled:opacity-50 transition-all flex items-center justify-center hover:scale-105 active:scale-95">
                            <Navigation size={18} fill="currentColor" className="rotate-45 -ml-1 -mb-1" />
                        </button>
                    </form>

                </div>

            </div>
        </div>
    );
}
