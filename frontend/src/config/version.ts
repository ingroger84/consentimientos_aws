/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: 2026-03-15
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '41.1.5',
  date: '2026-03-15',
  fullVersion: '41.1.5 - 2026-03-15',
  buildDate: new Date('2026-03-15').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
