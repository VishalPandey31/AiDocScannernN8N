import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import ApplicationReport from './pages/ApplicationReport';
import DocumentDetail from './pages/DocumentDetail';
import Analytics from './pages/Analytics';
import DocumentIntelligence from './pages/DocumentIntelligence';
import AuditTrail from './pages/AuditTrail';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="applications" element={<Applications />} />
                <Route path="review" element={<Applications />} />
                <Route path="applications/:id" element={<ApplicationDetail />} />
                <Route path="applications/:id/report" element={<ApplicationReport />} />
                <Route path="documents/:id" element={<DocumentDetail />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="intelligence" element={<DocumentIntelligence />} />
                <Route path="audit" element={<AuditTrail />} />
            </Route>
        </Routes>
    );
}

function App() {
  return (
    <BrowserRouter>
        <ThemeProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
