/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: 2026-01-28
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '22.0.2',
  date: '2026-01-28',
  fullVersion: '22.0.2 - 2026-01-28',
  buildDate: new Date('2026-01-28').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
