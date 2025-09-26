"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "./AdminContext";

// Mock user type
type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  signup: (email: string) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setIsAdmin } = useAdmin();

  useEffect(() => {
    // Check for a logged-in user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const mockUser = { id: "1", email };
    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAdmin(false); // Disable admin mode on logout
    router.push("/login");
  };

  const signup = (email: string) => {
    // In a real app, this would involve a call to your backend
    const mockUser = { id: new Date().getTime().toString(), email };
    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
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
