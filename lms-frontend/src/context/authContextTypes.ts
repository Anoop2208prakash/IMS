import { createContext, useContext } from 'react';

// Define the shape of the user data
export interface User {
  userId: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

// Define the shape of the context's value
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};