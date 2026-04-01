import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('resume_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('resume_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    axios
      .get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        setUser(response.data.user);
        localStorage.setItem('resume_user', JSON.stringify(response.data.user));
      })
      .catch(() => logout());
  }, [token]);

  const persistSession = (payload) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem('resume_token', payload.token);
    localStorage.setItem('resume_user', JSON.stringify(payload.user));
  };

  const login = async (formData, mode) => {
    const endpoint = mode === 'register' ? 'register' : 'login';
    const response = await axios.post(`${API_URL}/auth/${endpoint}`, formData);
    persistSession(response.data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('resume_token');
    localStorage.removeItem('resume_user');
  };

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
