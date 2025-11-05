import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile if token exists
  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user || { email: 'demo@user.com' }); // Fallback for demo
    } catch (err) {
      console.error('Fetch user error:', err);
      if (err.response?.status === 401) {
        logout(); // Invalid token, clear it
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { token: newToken } = res.data;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser({ email });
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Login failed' };
    }
  };

  const register = async (email, password) => {
    try {
      const res = await axios.post('/auth/register', { email, password });
      const { token: newToken } = res.data;
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser({ email });
      return { success: true };
    } catch (err) {
      return { success: false, msg: err.response?.data?.msg || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Demo mode: Temporarily mock auth for project review (remove after)
  const enableDemoMode = () => {
    const demoToken = 'demo-token-for-review';
    localStorage.setItem('token', demoToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${demoToken}`;
    setToken(demoToken);
    setUser({ email: 'demo@review.com' });
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, enableDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};