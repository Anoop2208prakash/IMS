import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';

// Define the shape of the user data with all possible roles
interface User {
  userId: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'ADMIN_LIBRARY' | 'ADMIN_UNIFORMS' | 'ADMIN_STATIONERY' | 'ADMIN_ADMISSION';
}

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context.
const AuthContext = createContext<AuthContextType | null>(null);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On initial app load, check localStorage for existing session
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
    } finally {
      setIsLoading(false); // Finished loading session
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);

  // This check ensures that any component using this hook is wrapped by AuthProvider.
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};