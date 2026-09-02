import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, Palette, Hexagon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';

export default function Topbar() {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const location = useLocation();

    return (
        <header className="h-[72px] border-b border-border/20 bg-background/20 backdrop-blur-3xl flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0">
            {/* Logo */}
            <div className="flex items-center shrink-0">
                <Link to="/" className="flex items-center gap-3">
                    <Hexagon size={24} className="text-foreground" fill="currentColor" />
                    <span className="text-lg font-display font-medium tracking-wide text-foreground uppercase">CRONUS INC.</span>
                </Link>
            </div>

            {/* Central Navigation */}
            <nav className="hidden lg:flex items-center gap-10 text-sm font-medium h-full">
                {[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Documents', path: '/intelligence' },
                    { label: 'Operations', path: '/applications' },
                    { label: 'Export Data', path: '/analytics' },
                    { label: 'Settings', path: '/settings' }
                ].map(link => {
                    // Quick matching
                    let isActive = location.pathname.startsWith(link.path);
                    if (location.pathname === '/' && link.path === '/dashboard') isActive = true;
                    
                    return (
                        <Link 
                            key={link.path} 
                            to={link.path} 
                            className={cn(
                                "relative h-full flex items-center text-foreground-muted hover:text-foreground transition-colors",
                                isActive && "text-foreground font-semibold"
                            )}
                        >
                            {link.label}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-foreground rounded-t-full shadow-[0_-2px_10px_rgba(255,255,255,0.5)]" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Right Tools */}
            <div className="flex items-center gap-3 shrink-0">
                <button 
                    onClick={() => {
                        if (theme === 'emerald') setTheme('light');
                        else if (theme === 'light') setTheme('oled');
                        else setTheme('emerald');
                    }}
                    className="p-2 rounded-full border border-border/50 text-foreground-muted hover:text-foreground bg-surface-muted/50 transition-colors"
                    title="Toggle Theme"
                >
                    <Palette size={18} />
                </button>
                <button className="p-2 rounded-full border border-border/50 text-foreground-muted hover:text-foreground bg-surface-muted/50 transition-colors">
                    <Settings size={18} />
                </button>
                
                <div className="h-[34px] w-[34px] rounded-full overflow-hidden ml-2 border border-border flex items-center justify-center bg-surface-muted">
                    <img src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>
    );
}
