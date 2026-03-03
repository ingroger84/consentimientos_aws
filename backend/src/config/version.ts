/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: 2026-03-03
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '54.0.0',
  date: '2026-03-03',
  fullVersion: '54.0.0 - 2026-03-03',
  buildDate: new Date('2026-03-03').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
