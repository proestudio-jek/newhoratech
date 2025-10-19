
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  type AuthError
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/contexts/FirebaseContext";
import { useToast } from "@/hooks/use-toast";

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
  initialLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_ERROR_MAP: Record<string, string> = {
    'auth/invalid-email': 'O endereço de e-mail não é válido.',
    'auth/user-disabled': 'Este usuário foi desabilitado.',
    'auth/user-not-found': 'Nenhum usuário encontrado com este e-mail.',
    'auth/wrong-password': 'A senha está incorreta.',
    'auth/email-already-in-use': 'Este e-mail já está em uso por outra conta.',
    'auth/weak-password': 'A senha é muito fraca. Tente uma mais forte.',
    'auth/operation-not-allowed': 'Operação não permitida.',
    'auth/configuration-not-found': 'Erro de configuração do Firebase. Verifique suas credenciais.',
    'auth/api-key-not-valid': 'Chave de API do Firebase inválida.',
};

const getFriendlyAuthErrorMessage = (errorCode: string) => {
    return AUTH_ERROR_MAP[errorCode] || 'Ocorreu um erro inesperado. Tente novamente.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      setUser(firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null);
      setInitialLoading(false);
      
      if(firebaseUser && (pathname === '/login' || pathname === '/signup')) {
          router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [auth, router, pathname]);

  const handleAuthError = (error: AuthError) => {
    console.error(`Firebase Auth Error (${error.code}):`, error.message);
    toast({
        variant: "destructive",
        title: "Erro de Autenticação",
        description: getFriendlyAuthErrorMessage(error.code),
    });
  }

  const login = async (email: string, password: string):Promise<void> => {
    if (!auth) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
      toast({
        title: "Login bem-sucedido!",
        description: `Bem-vindo de volta, ${email}!`,
      });
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    setLoading(true);
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
    } finally {
        setLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Save user info to Firestore
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        uid: newUser.uid,
        createdAt: serverTimestamp(),
      });
      
      router.push("/");
       toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo, ${email}!`,
      });
    } catch (error) {
        handleAuthError(error as AuthError)
    } finally {
        setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    signup,
    loading,
    initialLoading
  };

  if(initialLoading) {
    return null; // Ou um spinner/loader global
  }

  return (
    <AuthContext.Provider value={value}>
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
