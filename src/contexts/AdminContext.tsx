
"use client";

import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";

type AdminContextType = {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  // Automatically disable admin mode if user logs out.
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
    }
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
