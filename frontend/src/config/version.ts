/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: 2026-02-09
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '34.0.1',
  date: '2026-02-09',
  fullVersion: '34.0.1 - 2026-02-09',
  buildDate: new Date('2026-02-09').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
