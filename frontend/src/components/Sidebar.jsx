import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Settings, LogOut, ChevronLeft, ChevronRight, HelpCircle, Activity, Hexagon, ScanFace } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

export default function Sidebar({ className }) {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const links = [
        { name: 'Command Center', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Applications', icon: FileText, path: '/applications' },
        { name: 'Document Intelligence', icon: FileText, path: '/intelligence' },
        { name: 'Analytics', icon: Activity, path: '/analytics' },
        { name: 'Audit Trail', icon: FileText, path: '/audit' },
    ];

    if (user?.role === 'ADMIN' || user?.role === 'REVIEWER') {
        // Insert Review queue before Document Intelligence
        links.splice(2, 0, { name: 'Review Queue', icon: CheckSquare, path: '/review' });
    }

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <aside 
            className={cn(
                "bg-surface/60 backdrop-blur-xl border-r border-border/60 flex flex-col h-screen transition-all duration-300 relative z-30 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)]", 
                collapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Collapse Toggle */}
            <button 
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-6 bg-surface border border-border rounded-full p-1 text-foreground-muted hover:text-foreground shadow-sm hover:shadow transition-all hidden md:flex z-50 hover:border-foreground-subtle"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className={cn("p-6 flex items-center", collapsed ? "justify-center px-0" : "gap-3")}>
                <Link to="/" className="flex items-center gap-3">
                    <div className="relative w-8 h-8 flex shrink-0 items-center justify-center">
                        <Hexagon size={32} className="absolute inset-0 text-primary animate-[spin_10s_linear_infinite]" strokeWidth={1.5} />
                        <ScanFace size={16} className="text-primary relative z-10" />
                        <div className="absolute inset-0 blur-sm bg-primary/20 rounded-full" />
                    </div>
                    {!collapsed && <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-primary/80 whitespace-nowrap overflow-hidden">AuraVerify</span>}
                </Link>
            </div>

            <nav className={cn("flex-1 py-4 space-y-1.5", collapsed ? "px-3" : "px-4")}>
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        title={collapsed ? link.name : undefined}
                        className={cn(
                            'flex items-center rounded-xl transition-all font-semibold text-sm group relative',
                            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                            isActive(link.path) 
                                ? 'bg-primary-subtle text-primary' 
                                : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground'
                        )}
                    >
                        <link.icon size={18} className={cn(
                            "transition-colors",
                            isActive(link.path) ? 'text-primary' : 'text-foreground-subtle group-hover:text-foreground'
                        )} />
                        {!collapsed && <span className="whitespace-nowrap">{link.name}</span>}
                        
                        {/* Tooltip for collapsed state */}
                        {collapsed && (
                            <div className="absolute left-full ml-3 px-2 py-1 bg-foreground text-surface text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-elevated z-50 pointer-events-none">
                                {link.name}
                            </div>
                        )}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-border mt-auto">
                <nav className={cn("space-y-1.5 mb-4", collapsed ? "px-0" : "px-0")}>
                    <button className={cn(
                            'w-full flex items-center rounded-xl transition-all font-semibold text-sm text-foreground-muted hover:bg-surface-muted hover:text-foreground group relative border-none outline-none',
                            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                        )}>
                        <HelpCircle size={18} className="text-foreground-subtle group-hover:text-foreground transition-colors" />
                        {!collapsed && <span>Support</span>}
                    </button>
                    <button className={cn(
                            'w-full flex items-center rounded-xl transition-all font-semibold text-sm text-foreground-muted hover:bg-surface-muted hover:text-foreground group relative border-none outline-none',
                            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                        )}>
                        <Settings size={18} className="text-foreground-subtle group-hover:text-foreground transition-colors" />
                        {!collapsed && <span>Settings</span>}
                    </button>
                </nav>

                <div className={cn("flex flex-col gap-2", collapsed && "items-center")}>
                    <button
                        onClick={logout}
                        title={collapsed ? "Log Out" : undefined}
                        className={cn(
                            "flex items-center text-foreground-muted hover:text-danger hover:bg-danger-subtle transition-colors text-sm font-semibold rounded-xl group relative border border-transparent hover:border-danger/20",
                            collapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5 w-full'
                        )}
                    >
                        <LogOut size={18} className="transition-colors group-hover:text-danger" />
                        {!collapsed && <span>Log Out</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
