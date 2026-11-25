import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  loginAsDemo: (role: 'student' | 'librarian') => void;
  register: (userData: {
    fullName: string;
    universityId: string;
    email: string;
    department: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
}

const STORAGE_KEY = 'kite_ils_auth_user';

export const demoStudent: UserProfile = {
  id: 'usr-demo-std',
  fullName: 'Alex Chen',
  email: 'alex.chen@kite.edu',
  role: 'student',
  department: 'Department of Computer Science',
  patronNumber: 'KIT-2026-4401',
  activeLoansCount: 3,
  reservationsCount: 1,
  finesDue: 0.00,
};

export const demoLibrarian: UserProfile = {
  id: 'usr-demo-lib',
  fullName: 'Prof. Margaret Vance',
  email: 'm.vance@kite.edu',
  role: 'librarian',
  department: 'University Library Administration',
  patronNumber: 'KIT-LIB-009',
  activeLoansCount: 0,
  reservationsCount: 0,
  finesDue: 0.00,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Unable to persist session to localStorage', e);
    }
  }, [user]);

  const login = async (identifier: string, _password: string): Promise<boolean> => {
    // Simulate brief authentication verification
    await new Promise((resolve) => setTimeout(resolve, 200));

    const idLower = identifier.toLowerCase().trim();
    if (idLower.includes('lib') || idLower.includes('vance') || idLower.includes('admin')) {
      setUser(demoLibrarian);
      return true;
    }

    // Default to student/researcher session
    setUser({
      ...demoStudent,
      email: identifier.includes('@') ? identifier : `${identifier}@kite.edu`,
      patronNumber: identifier.startsWith('KIT-') ? identifier : demoStudent.patronNumber,
    });
    return true;
  };

  const loginAsDemo = (role: 'student' | 'librarian') => {
    setUser(role === 'librarian' ? demoLibrarian : demoStudent);
  };

  const register = async (userData: {
    fullName: string;
    universityId: string;
    email: string;
    department: string;
    password: string;
  }): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-5)}`,
      fullName: userData.fullName,
      email: userData.email,
      role: 'student',
      department: userData.department,
      patronNumber: userData.universityId.toUpperCase(),
      activeLoansCount: 0,
      reservationsCount: 0,
      finesDue: 0.00,
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const requestPasswordReset = async (_email: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        loginAsDemo,
        register,
        logout,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
