import { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load existing session from localStorage
    try {
      const savedUser = JSON.parse(localStorage.getItem('et_currentUser'));
      const token = localStorage.getItem('et_token');
      if (savedUser && token) {
        setCurrentUser(savedUser);
      }
    } catch (error) {
        console.error("Could not load user session:", error);
        // Clear potentially corrupted storage
        localStorage.removeItem('et_currentUser');
        localStorage.removeItem('et_token');
    } finally {
        setLoading(false);
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('et_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };
  
  const handleAuthResponse = async (response) => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }
    const { token, user } = await response.json();
    localStorage.setItem('et_token', token);
    localStorage.setItem('et_currentUser', JSON.stringify(user));
    setCurrentUser(user);
    return { success: true };
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleAuthResponse(response);
  };

  const signup = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleAuthResponse(response);
  };

  const logout = () => {
    localStorage.removeItem('et_token');
    localStorage.removeItem('et_currentUser');
    setCurrentUser(null);
  };

  const updateProfile = async (profileData) => {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    const updatedUser = await response.json();
    localStorage.setItem('et_currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    return { success: true };
  };

  const changePassword = async (oldPassword, newPassword) => {
    const response = await fetch(`${API_BASE}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }
    return { success: true };
  };
  
  const value = { currentUser, loading, login, signup, logout, updateProfile, changePassword };

  // Your loading spinner UI can remain the same
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted text-center mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}