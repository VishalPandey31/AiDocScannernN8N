import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Topbar from '../components/Topbar';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
    const location = useLocation();
    const { theme } = useTheme();

    return (
        <div className="flex flex-col bg-background min-h-screen text-foreground overflow-hidden relative">
            {/* Dynamic Ambient Background */}
            {theme === 'emerald' && (
                <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0a0f0f]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-900/40 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-800/10 rounded-full blur-[140px] mix-blend-screen animate-[pulse_14s_ease-in-out_infinite]" />
                </div>
            )}
            
            {theme === 'light' && (
                <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-300/40 rounded-full blur-[140px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-300/40 rounded-full blur-[140px] mix-blend-multiply animate-[pulse_12s_ease-in-out_infinite_reverse]" />
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-indigo-300/40 rounded-full blur-[140px] mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]" />
                </div>
            )}

            {theme === 'oled' && (
                <div className="fixed inset-0 z-[-1] bg-black pointer-events-none" />
            )}

            <Topbar />

            <main className="flex-1 w-full max-w-[1500px] mx-auto overflow-auto relative z-10 px-6 md:px-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname.split('/')[1] || 'home'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="min-h-full pb-10"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
