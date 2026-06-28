"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "../../lib/firebase";

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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          avatarUrl: firebaseUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      let errorMessage = "Failed to sign in.";
      if (error.code === 'auth/invalid-credential') errorMessage = "Invalid email or password.";
      else if (error.code === 'auth/user-not-found') errorMessage = "User not found.";
      else if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      else if (error.code === 'auth/too-many-requests') errorMessage = "Too many failed attempts. Try again later.";
      
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (displayName: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with their display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
        
        // Immediately update local state so the UI updates correctly
        setUser(prev => prev ? { ...prev, displayName } : null);
      }
      
      return { success: true };
    } catch (error: any) {
      let errorMessage = "Failed to create an account.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "Email is already in use.";
      else if (error.code === 'auth/invalid-email') errorMessage = "Invalid email address.";
      else if (error.code === 'auth/weak-password') errorMessage = "Password is too weak.";
      
      return { success: false, error: errorMessage };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error: any) {
      let errorMessage = "Google sign-in failed.";
      if (error.code === 'auth/popup-closed-by-user') errorMessage = "Sign-in popup was closed.";
      else if (error.code === 'auth/network-request-failed') errorMessage = "Network error occurred.";
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
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
