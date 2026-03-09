'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente que gerencia notificações de erro do Firebase.
 * Evita travar a interface em erros de leitura pública (get/list).
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Apenas logamos avisos de leitura para não interromper a UX
      if (error.request.method === 'list' || error.request.method === 'get') {
        console.warn('Firestore Rule Update Pending:', error.request.path);
        return;
      }
      
      // Erros de escrita (create, update, delete) mostram notificação
      toast({
        variant: "destructive",
        title: "Ação não permitida",
        description: "Você não tem permissão para realizar esta alteração.",
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}