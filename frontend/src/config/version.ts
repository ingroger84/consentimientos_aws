/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: 2026-05-11
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '92.3.16',
  date: '2026-05-11',
  fullVersion: '92.3.16 - 2026-05-11',
  buildDate: new Date('2026-05-11').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
