"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (displayName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "bookcroli_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  // Persist user to localStorage
  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    if (!email || !password) {
      return { success: false, error: "Please fill in all fields" };
    }

    // Mock: any valid email/password combo works
    const mockUser: User = {
      id: `user_${Date.now()}`,
      displayName: email.split("@")[0],
      email,
    };
    persistUser(mockUser);
    return { success: true };
  };

  const signup = async (displayName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 800));

    if (!displayName || !email || !password) {
      return { success: false, error: "Please fill in all fields" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const mockUser: User = {
      id: `user_${Date.now()}`,
      displayName,
      email,
    };
    persistUser(mockUser);
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 1000));

    const mockUser: User = {
      id: `google_${Date.now()}`,
      displayName: "Google User",
      email: "user@gmail.com",
      avatarUrl: undefined, // Will use initials fallback
    };
    persistUser(mockUser);
    return { success: true };
  };

  const logout = () => {
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
