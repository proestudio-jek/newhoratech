
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
import { doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth as useFirebaseAuth, useFirestore, setDocumentNonBlocking } from "@/firebase";

const CENTRAL_ADMIN_EMAIL = "jeffersonnascimentoone@outlook.com";

type User = {
  uid: string;
  email: string | null;
};

type AuthContextType = {
  user: User | null;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  isCentralAdmin: boolean;
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
    'auth/weak-password': 'A senha é muito fraca (mínimo 6 caracteres).',
    'auth/operation-not-allowed': 'Configuração de autenticação pendente no console.',
    'auth/invalid-credential': 'Dados incorretos. Verifique e tente novamente.',
};

const getFriendlyAuthErrorMessage = (errorCode: string) => {
    return AUTH_ERROR_MAP[errorCode] || 'Ocorreu um erro na autenticação. Tente novamente.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  const db = useFirestore();

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const isCentralAdmin = user?.email === CENTRAL_ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      const newUser = firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null;
      setUser(newUser);
      setInitialLoading(false);
      
      // Só permite isAdmin ser verdadeiro se for o e-mail central
      if (newUser?.email === CENTRAL_ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

      if(firebaseUser && (pathname === '/login' || pathname === '/signup')) {
          router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [auth, router, pathname]);

  const handleAuthError = (error: AuthError) => {
    toast({
        variant: "destructive",
        title: "Aviso",
        description: getFriendlyAuthErrorMessage(error.code),
    });
  }

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta à PROMUSIC.",
      });
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      router.push("/login");
      toast({
        title: "Logout concluído",
        description: "Até a próxima!",
      });
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Erro no Logout",
        description: "Não foi possível sair no momento.",
      });
    } finally {
        setLoading(false);
    }
  };

  const signup = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const userProfile = {
        email: newUser.email!,
        createdAt: serverTimestamp(),
        role: 'user',
        status: 'pending'
      };

      setDocumentNonBlocking(doc(db, "users", newUser.uid), userProfile, { merge: true });
      
      router.push("/");
      toast({
        title: "Bem-vindo!",
        description: "Sua conta foi criada com sucesso.",
      });
    } catch (error) {
        handleAuthError(error as AuthError)
    } finally {
        setLoading(false);
    }
  };

  const value = {
    user,
    isAdmin: isCentralAdmin && isAdmin,
    setIsAdmin: (val: boolean) => isCentralAdmin && setIsAdmin(val),
    isCentralAdmin,
    login,
    logout,
    signup,
    loading,
    initialLoading,
  };

  if(initialLoading) {
    return null;
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
