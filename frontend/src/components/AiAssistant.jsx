import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';
import { Button } from './ui/Button';

export default function AiAssistant({ applicationId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', text: 'Hello! I am AuraVerify AI. I have full context of this application, its documents, and readiness status. How can I help you?' }
    ]);
    const [inputStr, setInputStr] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, loading, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputStr.trim() || loading) return;

        const question = inputStr.trim();
        setInputStr('');
        
        const newHistory = [...chatHistory, { role: 'user', text: question }];
        setChatHistory(newHistory);
        setLoading(true);

        try {
            // Filter out the initial greeting if we want, or just send the whole history
            const res = await api.post(`/applications/${applicationId}/ask`, {
                question,
                history: newHistory.slice(1, -1) // send everything except the very first greeting and the latest question
            });

            setChatHistory([...newHistory, { role: 'model', text: res.data.data.answer }]);
        } catch (error) {
            console.error('Ask AuraVerify Error:', error);
            setChatHistory([...newHistory, { role: 'model', text: 'My neural link dropped. Error fetching response.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-primary to-primary-focus hover:from-primary-focus hover:to-primary text-white font-bold p-4 rounded-full shadow-[0_0_20px_rgba(var(--color-primary),0.4)] flex items-center gap-2 group transition-all"
                    >
                        <Sparkles size={24} className="group-hover:animate-pulse" />
                        <span className="max-w-0 overflow-hidden font-mono text-sm whitespace-nowrap group-hover:max-w-xs transition-all duration-300">
                            Ask AuraVerify
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] h-[550px] max-h-[80vh] flex flex-col bg-surface shadow-2xl rounded-2xl border border-primary/30 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-surface-muted to-primary-subtle p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-xl relative">
                                    <Bot size={20} className="text-primary" />
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-success rounded-full animate-pulse border border-surface"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider font-mono">Ask AuraVerify AI</h3>
                                    <p className="text-[10px] text-foreground-muted font-mono tracking-widest">CONTEXT AWARE AGENT</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-foreground-muted hover:text-foreground transition-colors p-1 hover:bg-surface rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Chat Window */}
                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a071a]/30">
                            {chatHistory.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="w-6 h-6 rounded-full bg-primary-subtle flex-center shrink-0 border border-primary/20">
                                            <Bot size={12} className="text-primary" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                                            : 'bg-surface border border-border text-foreground-subtle rounded-bl-none'
                                        }`}
                                    >
                                        {/* Extremely basic markdown parsing for bold text */}
                                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br />') }} />
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex items-center gap-2 text-primary-muted text-xs font-mono ml-8">
                                    <Loader2 size={12} className="animate-spin" /> Neural sync in progress...
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface-muted/50 flex gap-2">
                            <input 
                                type="text"
                                value={inputStr}
                                onChange={(e) => setInputStr(e.target.value)}
                                placeholder="Why isn't my app ready?"
                                className="flex-1 bg-surface border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                            />
                            <Button type="submit" disabled={!inputStr.trim() || loading} className="rounded-xl px-4">
                                <Send size={16} />
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
