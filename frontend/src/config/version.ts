/**
 * Configuración de versión de la aplicación
 * Formato: MAJOR.MINOR.PATCH - YYYYMMDD
 */
export const APP_VERSION = {
  version: '1.1.38',
  date: '20260122',
  fullVersion: '1.1.38 - 20260122',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
