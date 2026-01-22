/**
 * Configuración de versión de la aplicación
 * Formato: MAJOR.MINOR.PATCH - YYYYMMDD
 */
export const APP_VERSION = {
  version: '1.1.34',
  date: '20260121',
  fullVersion: '1.1.34 - 20260121',
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
