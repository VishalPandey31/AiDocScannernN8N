import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function ApplicationReport() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const [appRes, docRes] = await Promise.all([
                    api.get(`/applications/${id}`),
                    api.get(`/applications/${id}/documents`)
                ]);
                setApp(appRes.data.data);
                setDocuments(docRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, [id]);

    if (loading) return <div className="p-10 font-mono">Compiling verification report tensors...</div>;
    if (!app) return <div className="p-10 text-red-500 font-mono">Report generation failed. Node missing.</div>;

    return (
        <div className="bg-white text-black min-h-screen p-10 font-sans max-w-4xl mx-auto printable-report">
            {/* Action Bar (hidden when printing) */}
            <div className="flex justify-end mb-8 print:hidden">
                <button 
                    onClick={() => window.print()}
                    className="bg-primary text-white px-6 py-2 rounded font-bold shadow hover:bg-primary-focus transition-colors"
                >
                    Print / Save as PDF
                </button>
            </div>

            {/* Document Header */}
            <div className="border-b-4 border-black pb-6 mb-8 text-center flex flex-col items-center">
                <h1 className="text-4xl font-black uppercase tracking-widest">DOCSURE AI</h1>
                <h2 className="text-xl text-gray-600 mt-2 font-mono uppercase">Official Application Verification Report</h2>
            </div>
            
            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Applicant Name</p>
                    <p className="text-2xl font-bold">{app.applicantName}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Application ID</p>
                    <p className="text-lg font-mono">{app._id}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Report Date</p>
                    <p className="text-lg">{new Date().toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-bold uppercase mb-1">Final Status</p>
                    <p className="text-lg font-bold">{app.status.replace('_', ' ')}</p>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-gray-100 p-6 rounded-lg mb-10 border border-gray-300">
                <h3 className="text-lg font-black uppercase mb-4 border-b border-gray-300 pb-2">Executive Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 font-mono">READINESS SCORE</p>
                        <p className="text-4xl font-black">{app.readinessScore}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 font-mono">ATTENTION SCORE</p>
                        <p className={`text-4xl font-black ${app.attentionScore > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {app.attentionScore}
                        </p>
                    </div>
                </div>
            </div>

            {/* Requirements Matrix */}
            <h3 className="text-xl font-bold uppercase mb-4 text-black border-b border-gray-200 pb-2">Requirement Matrix</h3>
            <table className="w-full text-left mb-10 border-collapse">
                <thead>
                    <tr className="bg-black text-white text-xs uppercase">
                        <th className="p-3">Requirement</th>
                        <th className="p-3">Target Node Type</th>
                        <th className="p-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {app.requirements.map(req => (
                        <tr key={req._id} className="border-b border-gray-200 text-sm">
                            <td className="p-3 font-bold">{req.requirementName}</td>
                            <td className="p-3 font-mono text-gray-600">{req.documentType}</td>
                            <td className="p-3 font-bold">
                                {req.status === 'SATISFIED' ? '✔ SATISFIED' : '❌ ' + req.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Document Analysis */}
            <h3 className="text-xl font-bold uppercase mb-4 text-black border-b border-gray-200 pb-2">Document Tensors</h3>
            <div className="space-y-6 mb-10">
                {documents.map((doc, idx) => (
                    <div key={doc._id} className="border border-gray-300 p-4 rounded bg-white page-break-inside-avoid">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                            <h4 className="font-bold font-mono text-sm">FILE_REF: {doc.fileName}</h4>
                            <span className="text-xs font-bold bg-gray-200 px-2 py-1 uppercase">{doc.processingStatus}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div>
                                <span className="text-gray-500 uppercase text-[10px] block">Detected AI Classification</span>
                                <strong>{doc.documentType}</strong>
                            </div>
                            <div>
                                <span className="text-gray-500 uppercase text-[10px] block">Validation Status</span>
                                <strong>{doc.validationStatus}</strong>
                            </div>
                            <div>
                                <span className="text-gray-500 uppercase text-[10px] block">OCR Quality Map</span>
                                <strong>{doc.qualityScore}/100</strong>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 uppercase text-[10px] block">Detected Anomalies / Issues</span>
                                {doc.issues?.length > 0 ? (
                                    <ul className="list-disc pl-5 mt-1 text-red-600">
                                        {doc.issues.map((iss, i) => <li key={i}>{iss}</li>)}
                                    </ul>
                                ) : (
                                    <span className="text-green-600 font-mono mt-1 block">None</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {documents.length === 0 && <p className="text-sm text-gray-500">No documents ingested for this application.</p>}
            </div>

            {/* Issues & Recommendations */}
            <h3 className="text-xl font-bold uppercase mb-4 text-black border-b border-gray-200 pb-2">Application Health & Audit Findings</h3>
            <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                    <h4 className="font-bold text-red-600 mb-2 uppercase text-sm">Critical Anomalies</h4>
                    {app.issues?.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {app.issues.map((i, idx) => <li key={idx}>{i}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No critical anomalies flagged by AI Engine.</p>
                    )}
                </div>
                <div>
                    <h4 className="font-bold text-blue-600 mb-2 uppercase text-sm">Machine Recommendations</h4>
                    {app.recommendations?.length > 0 ? (
                        <ul className="list-disc pl-5 text-sm space-y-1">
                            {app.recommendations.map((r, idx) => <li key={idx}>{r}</li>)}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No actionable recommendations.</p>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 1cm; }
                    body { background: white !important; }
                    .printable-report { max-width: 100% !important; border: none !important; box-shadow: none !important; }
                    .print\\:hidden { display: none !important; }
                    .page-break-inside-avoid { break-inside: avoid; }
                }
            `}} />

            {/* Footer */}
            <div className="mt-16 pt-8 border-t-2 border-gray-200 text-center text-xs text-gray-400 font-mono">
                <p>DO NOT TRUST UPLOADS. TRUST REQUIREMENTS.</p>
                <p className="mt-2 text-[10px] leading-relaxed">
                    AuraVerify provides AI-assisted document analysis and configured business-rule validation. 
                    It does not independently establish official government authenticity or legal validity unless connected to an authorized verification service.
                </p>
                <p className="mt-4">End of Verification Report // HASH: {Math.random().toString(36).substr(2, 12).toUpperCase()}</p>
            </div>
        </div>
    );
}
