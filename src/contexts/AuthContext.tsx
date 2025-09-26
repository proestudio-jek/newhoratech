
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { app, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const auth = getAuth(app);

type User = {
  uid: string;
  email: string | null;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, pass: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string):Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo de volta, ${email}!`,
      });
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({
        variant: "destructive",
        title: "Erro no Login",
        description: error.message || "Ocorreu um erro ao tentar fazer login.",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta.",
      });
    } catch (error: any) {
       console.error("Error signing out:", error);
       toast({
        variant: "destructive",
        title: "Erro no Logout",
        description: "Ocorreu um erro ao tentar sair.",
      });
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Save user info to Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        uid: newUser.uid,
        createdAt: new Date(),
      });
      
      router.push("/");
       toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${email}!`,
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: error.message || "Ocorreu um erro ao criar a conta.",
      });
      throw error;
    }
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
