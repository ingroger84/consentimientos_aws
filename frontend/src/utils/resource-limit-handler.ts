import axios, { AxiosError } from 'axios';

export interface ResourceLimitError {
  isResourceLimit: boolean;
  message: string;
  resourceType?: 'users' | 'branches' | 'consents';
}

/**
 * Verifica si un error es un error de límite de recursos
 */
export function isResourceLimitError(error: any): error is AxiosError {
  if (!axios.isAxiosError(error)) return false;
  
  const status = error.response?.status;
  const responseData = error.response?.data as any;
  const message = responseData?.message || '';
  
  // Verificar si es un error 403 (Forbidden) con mensaje de límite
  return (
    status === 403 &&
    (message.includes('límite máximo') ||
     message.includes('limite máximo') ||
     message.includes('alcanzado el límite'))
  );
}

/**
 * Extrae información del error de límite de recursos
 */
export function parseResourceLimitError(error: AxiosError): ResourceLimitError {
  const responseData = error.response?.data as any;
  const message = responseData?.message || 'Has alcanzado el límite de recursos permitidos';
  
  let resourceType: 'users' | 'branches' | 'consents' | undefined;
  
  if (message.includes('usuarios')) {
    resourceType = 'users';
  } else if (message.includes('sedes')) {
    resourceType = 'branches';
  } else if (message.includes('consentimientos')) {
    resourceType = 'consents';
  }
  
  return {
    isResourceLimit: true,
    message,
    resourceType,
  };
}

/**
 * Muestra un mensaje de error de límite de recursos
 */
export function showResourceLimitError(error: AxiosError): void {
  const limitError = parseResourceLimitError(error);
  
  // Usar alert nativo (puede ser reemplazado por un toast o modal más elegante)
  alert(limitError.message);
}

/**
 * Obtiene el nombre amigable del recurso
 */
export function getResourceName(resourceType: 'users' | 'branches' | 'consents'): string {
  const names = {
    users: 'usuarios',
    branches: 'sedes',
    consents: 'consentimientos',
  };
  
  return names[resourceType];
}

/**
 * Genera un mensaje de ayuda para el usuario
 */
export function getResourceLimitHelpMessage(resourceType: 'users' | 'branches' | 'consents'): string {
  const resourceName = getResourceName(resourceType);
  
  return (
    `Has alcanzado el límite máximo de ${resourceName} permitidos en tu plan actual.\n\n` +
    `Para continuar creando ${resourceName}, por favor:\n` +
    `1. Contacta al administrador del sistema\n` +
    `2. Solicita un aumento de límite o actualización de plan\n\n` +
    `Si eres el administrador, puedes actualizar el plan desde la configuración de tu cuenta.`
  );
}
