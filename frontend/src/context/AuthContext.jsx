import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({ name: 'Guest Admin', role: 'ADMIN', email: 'admin@docsure.ai' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Disabled real auth for demo purposes
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setUser({ name: 'Guest Admin', role: 'ADMIN', email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
