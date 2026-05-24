/**
 * Configuración de versión de la aplicación
 * Actualizado automáticamente: 2026-05-23
 * 
 * Formato: MAJOR.MINOR.PATCH
 * - MAJOR: Cambios incompatibles (breaking changes)
 * - MINOR: Nueva funcionalidad compatible
 * - PATCH: Correcciones y mejoras
 */
export const APP_VERSION = {
  version: '93.2.2',
  date: '2026-05-23',
  fullVersion: '93.2.2 - 2026-05-23',
  buildDate: new Date('2026-05-23').toISOString(),
} as const;

export const getAppVersion = () => APP_VERSION.fullVersion;
export const getVersion = () => APP_VERSION.version;
export const getBuildDate = () => APP_VERSION.date;
