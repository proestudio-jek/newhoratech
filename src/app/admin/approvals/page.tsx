
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, UserCheck, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/lib/types";

export default function ApprovalsPage() {
  const { user, isAdmin } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const usersColRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const pendingUsersQuery = useMemoFirebase(() => {
    if (!usersColRef) return null;
    return query(usersColRef, where("status", "==", "pending"));
  }, [usersColRef]);

  const { data: pendingUsers, isLoading } = useCollection<UserProfile>(pendingUsersQuery);

  const handleApprove = (userId: string, name: string) => {
    if (!db) return;
    const userRef = doc(db, "users", userId);
    updateDocumentNonBlocking(userRef, { status: "approved" });
    toast({
      title: "Solicitação Aprovada",
      description: `${name} agora pode postar hinos como solista.`,
    });
  };

  const handleReject = (userId: string, name: string) => {
    if (!db) return;
    const userRef = doc(db, "users", userId);
    updateDocumentNonBlocking(userRef, { status: "rejected" });
    toast({
      variant: "destructive",
      title: "Solicitação Recusada",
      description: `A solicitação de ${name} foi recusada.`,
    });
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground mt-2">Você precisa estar no Modo Admin para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-headline text-4xl font-bold text-primary">Aprovações de Solistas</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Gerencie as solicitações de usuários que desejam postar hinos.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : pendingUsers && pendingUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingUsers.map((pUser) => (
            <Card key={pUser.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{pUser.username || "Usuário sem nome"}</CardTitle>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Pendente
                  </Badge>
                </div>
                <CardDescription>{pUser.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <UserCheck className="h-4 w-4" />
                   Conjunto: <span className="font-medium text-foreground">{pUser.conjunto || "Não informado"}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700" 
                    onClick={() => handleApprove(pUser.id, pUser.username)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleReject(pUser.id, pUser.username)}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Recusar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed py-20 text-center">
          <CardContent className="space-y-4">
            <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="text-xl font-semibold">Tudo em dia!</h3>
            <p className="text-muted-foreground">Não há solicitações de aprovação pendentes no momento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
