/**
 * Configuración de versión de la aplicación
 * Formato: MAJOR.MINOR.PATCH - YYYYMMDD
 */
export const APP_VERSION = {
  version: '1.1.2',
  date: '20260120',
  fullVersion: '1.1.2 - 20260120',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
