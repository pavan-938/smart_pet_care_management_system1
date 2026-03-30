import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.role && parsedUser.role.startsWith('ROLE_')) {
                    parsedUser.role = parsedUser.role.replace('ROLE_', '');
                }
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to restore session:', error);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/signin', { email, password });
            if (response.data.token) {
                const userData = response.data;
                if (userData.role && userData.role.startsWith('ROLE_')) {
                    userData.role = userData.role.replace('ROLE_', '');
                }
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            }
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name, email, password, role, extraData = {}) => {
        try {
            await api.post('/auth/signup', { name, email, password, role, ...extraData });
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
