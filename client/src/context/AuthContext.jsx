import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check if the user is already logged in when the app loads
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await API.post('/auth/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            setUser(response.data);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};