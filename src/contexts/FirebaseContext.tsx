
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type FirebaseApp } from "firebase/app";
import { type Auth } from "firebase/auth";
import { type Firestore } from "firebase/firestore";
import { getFirebase } from "@/lib/firebase";

interface FirebaseContextValue {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextValue>({ app: null, auth: null, db: null });

  useEffect(() => {
    const { app, auth, db } = getFirebase();
    setFirebase({ app, auth, db });
  }, []);
  
  if (!firebase.app) {
    return null; // ou um loader
  }

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}
