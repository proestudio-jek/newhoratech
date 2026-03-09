'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente que escuta erros de permissão emitidos globalmente.
 * Em vez de travar a aplicação com um throw, ele exibe um log e pode ser estendido
 * para mostrar notificações amigáveis (toasts) se necessário.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Logamos o erro detalhado no console para depuração
      console.warn('Firestore Permission Error:', error.message);
      console.dir(error.request);
      
      // Opcional: Mostrar um toast silencioso se for um erro de escrita
      if (error.request.method !== 'list' && error.request.method !== 'get') {
        toast({
          variant: "destructive",
          title: "Erro de Permissão",
          description: "Você não tem autorização para realizar esta alteração.",
        });
      }
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}