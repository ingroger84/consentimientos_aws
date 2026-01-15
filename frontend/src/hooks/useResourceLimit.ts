import { useState } from 'react';
import { AxiosError } from 'axios';
import { isResourceLimitError, parseResourceLimitError } from '../utils/resource-limit-handler';

interface UseResourceLimitReturn {
  showLimitModal: boolean;
  limitError: {
    resourceType: 'users' | 'branches' | 'consents';
    message: string;
    currentCount: number;
    maxLimit: number;
  } | null;
  handleResourceLimitError: (error: any) => boolean;
  closeLimitModal: () => void;
}

/**
 * Hook para manejar errores de límite de recursos
 */
export function useResourceLimit(): UseResourceLimitReturn {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitError, setLimitError] = useState<{
    resourceType: 'users' | 'branches' | 'consents';
    message: string;
    currentCount: number;
    maxLimit: number;
  } | null>(null);

  /**
   * Maneja un error y determina si es un error de límite de recursos
   * @returns true si es un error de límite, false en caso contrario
   */
  const handleResourceLimitError = (error: any): boolean => {
    if (!isResourceLimitError(error)) {
      return false;
    }

    const parsedError = parseResourceLimitError(error as AxiosError);
    
    if (!parsedError.resourceType) {
      // Si no se puede determinar el tipo de recurso, mostrar alert simple
      alert(parsedError.message);
      return true;
    }

    // Extraer números del mensaje (formato: "X/Y")
    const match = parsedError.message.match(/\((\d+)\/(\d+)\)/);
    const currentCount = match ? parseInt(match[1]) : 0;
    const maxLimit = match ? parseInt(match[2]) : 0;

    setLimitError({
      resourceType: parsedError.resourceType,
      message: parsedError.message,
      currentCount,
      maxLimit,
    });
    setShowLimitModal(true);

    return true;
  };

  const closeLimitModal = () => {
    setShowLimitModal(false);
    setLimitError(null);
  };

  return {
    showLimitModal,
    limitError,
    handleResourceLimitError,
    closeLimitModal,
  };
}
