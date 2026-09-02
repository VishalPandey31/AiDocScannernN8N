import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import { 
    Activity, Clock, AlertTriangle, ShieldCheck, FileWarning, TrendingUp, Layers, CheckCircle2 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';

// --- Realistic Demo Data for Analytics ---
const readinessData = [
  { name: '0-20%', count: 2 },
  { name: '21-40%', count: 5 },
  { name: '41-60%', count: 18 },
  { name: '61-80%', count: 42 },
  { name: '81-99%', count: 85 },
  { name: '100%', count: 124 }
];

const failureReasons = [
  { reason: 'Quality/Unreadable', count: 48 },
  { reason: 'Missing Fields', count: 35 },
  { reason: 'Identity Mismatch', count: 22 },
  { reason: 'Wrong Document Type', count: 19 },
  { reason: 'Expired', count: 7 },
  { reason: 'Duplicate', count: 4 },
];

const volumeTrends = [
  { date: 'Mon', applications: 24, reviews: 3 },
  { date: 'Tue', applications: 35, reviews: 8 },
  { date: 'Wed', applications: 42, reviews: 12 },
  { date: 'Thu', applications: 38, reviews: 5 },
  { date: 'Fri', applications: 56, reviews: 14 },
  { date: 'Sat', applications: 18, reviews: 2 },
  { date: 'Sun', applications: 22, reviews: 4 },
];

const docQualityData = [
  { name: 'Excellent (>90)', value: 145 },
  { name: 'Good (75-89)', value: 89 },
  { name: 'Poor (<75)', value: 32 },
];
const COLORS = ['#10b981', '#3b82f6', '#ef4444']; // Success, Primary, Danger

export default function Analytics() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto space-y-6 pt-4 p-8">
                <div className="h-8 w-64 bg-surface-muted animate-pulse rounded"></div>
                <div className="grid grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-32 bg-surface-muted animate-pulse rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-surface-muted animate-pulse rounded-xl w-full mt-6"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12 mt-4">
            
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-display font-medium text-foreground tracking-tight flex items-center gap-3">
                        <Activity size={28} className="text-primary" /> Intelligence Analytics
                    </h1>
                    <p className="text-foreground-muted mt-1 font-medium">Platform-wide insights, failure patterns, and throughput analysis.</p>
                </div>
                <div className="flex items-center gap-2 bg-surface-muted border border-border px-3 py-1.5 rounded-lg text-xs font-mono">
                    <span className="text-foreground-subtle">TIME_RANGE:</span>
                    <span className="text-primary font-bold">LAST_7_DAYS</span>
                </div>
            </div>

            {/* Top Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard 
                    title="Average Readiness" 
                    value="86%" 
                    trend="+4.2%" 
                    icon={CheckCircle2} 
                    color="text-success" 
                />
                <KpiCard 
                    title="Avg Processing Latency" 
                    value="2.4s" 
                    trend="-0.3s" 
                    icon={Clock} 
                    color="text-primary" 
                />
                <KpiCard 
                    title="Human Review Rate" 
                    value="12.5%" 
                    trend="-2.1%" 
                    icon={AlertTriangle} 
                    color="text-warning" 
                />
                <KpiCard 
                    title="Critical Anomalies" 
                    value="64" 
                    trend="+12" 
                    icon={FileWarning} 
                    color="text-danger" 
                />
            </div>

            {/* Layout Grid for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Application Throughput (Spans 2 columns) */}
                <Card className="col-span-1 lg:col-span-2 bg-surface border-border shadow-subtle min-h-[400px] flex flex-col">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <Layers size={16} className="text-primary" /> Application Throughput & Review Volume
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #3b82f6', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                <Area type="monotone" dataKey="reviews" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorReviews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Rejection Reasons */}
                <Card className="col-span-1 bg-surface border-border shadow-subtle min-h-[400px] flex flex-col">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <ShieldCheck size={16} className="text-danger" /> Primary Failure Reasons
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={failureReasons} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" stroke="#64748b" fontSize={10} hide />
                                <YAxis dataKey="reason" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={120} />
                                <RechartsTooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #ef4444', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16}>
                                    {failureReasons.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={'#ef4444'} opacity={1 - (index * 0.15)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Readiness Score Distribution */}
                <Card className="col-span-1 lg:col-span-2 bg-surface border-border shadow-subtle min-h-[300px] flex flex-col">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <Activity size={16} className="text-success" /> Readiness Score Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={readinessData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.02)'}}
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #10b981', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40}>
                                    {readinessData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === readinessData.length - 1 ? '#10b981' : '#059669'} opacity={0.3 + (index * 0.15)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* OCR Quality Map */}
                <Card className="col-span-1 bg-surface border-border shadow-subtle min-h-[300px] flex flex-col">
                    <CardHeader className="border-b border-border pb-4">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <TrendingUp size={16} className="text-primary" /> Document Quality Map
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative flex items-center justify-center h-[260px]">
                        <ResponsiveContainer width="100%" height="100%" className="-mt-6">
                            <PieChart>
                                <Pie
                                    data={docQualityData}
                                    cx="50%"
                                    cy="60%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {docQualityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #3b82f6', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="text-3xl font-display font-bold text-foreground">92<span className="text-sm text-foreground-muted">%</span></p>
                            <p className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider">Avg Quality</p>
                        </div>
                    </CardContent>
                </Card>
                
            </div>
            
        </div>
    );
}

function KpiCard({ title, value, trend, icon: Icon, color }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-surface border-border shadow-subtle hover:border-border/80 transition-colors h-full">
                <CardContent className="p-5 flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-foreground-muted uppercase tracking-widest mb-1.5">{title}</p>
                        <h4 className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</h4>
                        <div className="flex items-center gap-1.5 mt-2">
                            <Badge variant={trend.startsWith('+') && color === 'text-danger' ? 'destructive' : trend.startsWith('-') && color === 'text-warning' ? 'success' : 'secondary'} className="px-1.5 py-0 text-[10px]">
                                {trend}
                            </Badge>
                            <span className="text-[10px] font-bold text-foreground-muted uppercase tracking-wider">vs Last Wk</span>
                        </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-muted border border-border">
                        <Icon size={20} className={color} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
