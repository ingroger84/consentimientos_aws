/**
 * Sistema de Permisos - Definición Centralizada
 * 
 * Este archivo define todos los permisos disponibles en el sistema.
 * Usar constantes evita errores de tipeo y facilita el mantenimiento.
 */

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_GLOBAL_STATS: 'view_global_stats',

  // Consentimientos
  VIEW_CONSENTS: 'view_consents',
  CREATE_CONSENTS: 'create_consents',
  EDIT_CONSENTS: 'edit_consents',
  DELETE_CONSENTS: 'delete_consents',
  SIGN_CONSENTS: 'sign_consents',
  RESEND_CONSENT_EMAIL: 'resend_consent_email',

  // Usuarios
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  CHANGE_PASSWORDS: 'change_passwords',

  // Roles
  VIEW_ROLES: 'view_roles',
  EDIT_ROLES: 'edit_roles',

  // Sedes
  VIEW_BRANCHES: 'view_branches',
  CREATE_BRANCHES: 'create_branches',
  EDIT_BRANCHES: 'edit_branches',
  DELETE_BRANCHES: 'delete_branches',

  // Servicios
  VIEW_SERVICES: 'view_services',
  CREATE_SERVICES: 'create_services',
  EDIT_SERVICES: 'edit_services',
  DELETE_SERVICES: 'delete_services',

  // Preguntas
  VIEW_QUESTIONS: 'view_questions',
  CREATE_QUESTIONS: 'create_questions',
  EDIT_QUESTIONS: 'edit_questions',
  DELETE_QUESTIONS: 'delete_questions',

  // Clientes
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENTS: 'create_clients',
  EDIT_CLIENTS: 'edit_clients',
  DELETE_CLIENTS: 'delete_clients',

  // Plantillas de Consentimiento
  VIEW_TEMPLATES: 'view_templates',
  CREATE_TEMPLATES: 'create_templates',
  EDIT_TEMPLATES: 'edit_templates',
  DELETE_TEMPLATES: 'delete_templates',

  // Configuración
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  CONFIGURE_EMAIL: 'configure_email',

  // Facturación (para usuarios de tenant)
  VIEW_INVOICES: 'view_invoices',
  PAY_INVOICES: 'pay_invoices',

  // Tenants (Solo Super Admin)
  MANAGE_TENANTS: 'manage_tenants',
} as const;

// Tipo para autocompletado y validación
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Permisos por Rol
 * Define qué permisos tiene cada rol por defecto
 */
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_GLOBAL_STATS,
    PERMISSIONS.VIEW_CONSENTS,
    PERMISSIONS.CREATE_CONSENTS,
    PERMISSIONS.EDIT_CONSENTS,
    PERMISSIONS.DELETE_CONSENTS,
    PERMISSIONS.SIGN_CONSENTS,
    PERMISSIONS.RESEND_CONSENT_EMAIL,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.CHANGE_PASSWORDS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.EDIT_ROLES,
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.CREATE_BRANCHES,
    PERMISSIONS.EDIT_BRANCHES,
    PERMISSIONS.DELETE_BRANCHES,
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.CREATE_SERVICES,
    PERMISSIONS.EDIT_SERVICES,
    PERMISSIONS.DELETE_SERVICES,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.CREATE_QUESTIONS,
    PERMISSIONS.EDIT_QUESTIONS,
    PERMISSIONS.DELETE_QUESTIONS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.DELETE_CLIENTS,
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.CREATE_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.DELETE_TEMPLATES,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.MANAGE_TENANTS,
  ],

  ADMIN_GENERAL: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CONSENTS,
    PERMISSIONS.CREATE_CONSENTS,
    PERMISSIONS.EDIT_CONSENTS,
    PERMISSIONS.DELETE_CONSENTS,
    PERMISSIONS.SIGN_CONSENTS,
    PERMISSIONS.RESEND_CONSENT_EMAIL,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.DELETE_USERS,
    PERMISSIONS.CHANGE_PASSWORDS,
    PERMISSIONS.VIEW_ROLES,
    PERMISSIONS.EDIT_ROLES,
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.CREATE_BRANCHES,
    PERMISSIONS.EDIT_BRANCHES,
    PERMISSIONS.DELETE_BRANCHES,
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.CREATE_SERVICES,
    PERMISSIONS.EDIT_SERVICES,
    PERMISSIONS.DELETE_SERVICES,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.CREATE_QUESTIONS,
    PERMISSIONS.EDIT_QUESTIONS,
    PERMISSIONS.DELETE_QUESTIONS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.DELETE_CLIENTS,
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.CREATE_TEMPLATES,
    PERMISSIONS.EDIT_TEMPLATES,
    PERMISSIONS.DELETE_TEMPLATES,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.EDIT_SETTINGS,
    PERMISSIONS.CONFIGURE_EMAIL,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.PAY_INVOICES,
  ],

  ADMIN_SEDE: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CONSENTS,
    PERMISSIONS.CREATE_CONSENTS,
    PERMISSIONS.EDIT_CONSENTS,
    PERMISSIONS.DELETE_CONSENTS,
    PERMISSIONS.SIGN_CONSENTS,
    PERMISSIONS.RESEND_CONSENT_EMAIL,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
    PERMISSIONS.EDIT_CLIENTS,
    PERMISSIONS.VIEW_SETTINGS,
  ],

  OPERADOR: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_CONSENTS,
    PERMISSIONS.CREATE_CONSENTS,
    PERMISSIONS.SIGN_CONSENTS,
    PERMISSIONS.RESEND_CONSENT_EMAIL,
    PERMISSIONS.VIEW_SERVICES,
    PERMISSIONS.VIEW_BRANCHES,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.CREATE_CLIENTS,
  ],
} as const;

/**
 * Descripción de permisos para UI
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [PERMISSIONS.VIEW_DASHBOARD]: 'Ver dashboard y estadísticas',
  [PERMISSIONS.VIEW_GLOBAL_STATS]: 'Ver estadísticas globales del sistema',
  
  [PERMISSIONS.VIEW_CONSENTS]: 'Ver consentimientos',
  [PERMISSIONS.CREATE_CONSENTS]: 'Crear consentimientos',
  [PERMISSIONS.EDIT_CONSENTS]: 'Editar consentimientos',
  [PERMISSIONS.DELETE_CONSENTS]: 'Eliminar consentimientos',
  [PERMISSIONS.SIGN_CONSENTS]: 'Firmar consentimientos',
  [PERMISSIONS.RESEND_CONSENT_EMAIL]: 'Reenviar email de consentimiento',
  
  [PERMISSIONS.VIEW_USERS]: 'Ver usuarios',
  [PERMISSIONS.CREATE_USERS]: 'Crear usuarios',
  [PERMISSIONS.EDIT_USERS]: 'Editar usuarios',
  [PERMISSIONS.DELETE_USERS]: 'Eliminar usuarios',
  [PERMISSIONS.CHANGE_PASSWORDS]: 'Cambiar contraseñas',
  
  [PERMISSIONS.VIEW_ROLES]: 'Ver roles',
  [PERMISSIONS.EDIT_ROLES]: 'Editar permisos de roles',
  
  [PERMISSIONS.VIEW_BRANCHES]: 'Ver sedes',
  [PERMISSIONS.CREATE_BRANCHES]: 'Crear sedes',
  [PERMISSIONS.EDIT_BRANCHES]: 'Editar sedes',
  [PERMISSIONS.DELETE_BRANCHES]: 'Eliminar sedes',
  
  [PERMISSIONS.VIEW_SERVICES]: 'Ver servicios',
  [PERMISSIONS.CREATE_SERVICES]: 'Crear servicios',
  [PERMISSIONS.EDIT_SERVICES]: 'Editar servicios',
  [PERMISSIONS.DELETE_SERVICES]: 'Eliminar servicios',
  
  [PERMISSIONS.VIEW_QUESTIONS]: 'Ver preguntas',
  [PERMISSIONS.CREATE_QUESTIONS]: 'Crear preguntas',
  [PERMISSIONS.EDIT_QUESTIONS]: 'Editar preguntas',
  [PERMISSIONS.DELETE_QUESTIONS]: 'Eliminar preguntas',
  
  [PERMISSIONS.VIEW_CLIENTS]: 'Ver clientes',
  [PERMISSIONS.CREATE_CLIENTS]: 'Crear clientes',
  [PERMISSIONS.EDIT_CLIENTS]: 'Editar clientes',
  [PERMISSIONS.DELETE_CLIENTS]: 'Eliminar clientes',
  
  [PERMISSIONS.VIEW_TEMPLATES]: 'Ver plantillas de consentimiento',
  [PERMISSIONS.CREATE_TEMPLATES]: 'Crear plantillas de consentimiento',
  [PERMISSIONS.EDIT_TEMPLATES]: 'Editar plantillas de consentimiento',
  [PERMISSIONS.DELETE_TEMPLATES]: 'Eliminar plantillas de consentimiento',
  
  [PERMISSIONS.VIEW_SETTINGS]: 'Ver configuración',
  [PERMISSIONS.EDIT_SETTINGS]: 'Editar configuración',
  [PERMISSIONS.CONFIGURE_EMAIL]: 'Configurar correo electrónico',
  
  [PERMISSIONS.VIEW_INVOICES]: 'Ver facturas',
  [PERMISSIONS.PAY_INVOICES]: 'Registrar pagos de facturas',
  
  [PERMISSIONS.MANAGE_TENANTS]: 'Gestionar tenants (Solo Super Admin)',
};

/**
 * Categorías de permisos para organización en UI
 */
export const PERMISSION_CATEGORIES = {
  dashboard: {
    name: 'Dashboard',
    permissions: [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.VIEW_GLOBAL_STATS,
    ],
  },
  consents: {
    name: 'Consentimientos',
    permissions: [
      PERMISSIONS.VIEW_CONSENTS,
      PERMISSIONS.CREATE_CONSENTS,
      PERMISSIONS.EDIT_CONSENTS,
      PERMISSIONS.DELETE_CONSENTS,
      PERMISSIONS.SIGN_CONSENTS,
      PERMISSIONS.RESEND_CONSENT_EMAIL,
    ],
  },
  users: {
    name: 'Usuarios',
    permissions: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.EDIT_USERS,
      PERMISSIONS.DELETE_USERS,
      PERMISSIONS.CHANGE_PASSWORDS,
    ],
  },
  roles: {
    name: 'Roles y Permisos',
    permissions: [
      PERMISSIONS.VIEW_ROLES,
      PERMISSIONS.EDIT_ROLES,
    ],
  },
  branches: {
    name: 'Sedes',
    permissions: [
      PERMISSIONS.VIEW_BRANCHES,
      PERMISSIONS.CREATE_BRANCHES,
      PERMISSIONS.EDIT_BRANCHES,
      PERMISSIONS.DELETE_BRANCHES,
    ],
  },
  services: {
    name: 'Servicios',
    permissions: [
      PERMISSIONS.VIEW_SERVICES,
      PERMISSIONS.CREATE_SERVICES,
      PERMISSIONS.EDIT_SERVICES,
      PERMISSIONS.DELETE_SERVICES,
    ],
  },
  questions: {
    name: 'Preguntas',
    permissions: [
      PERMISSIONS.VIEW_QUESTIONS,
      PERMISSIONS.CREATE_QUESTIONS,
      PERMISSIONS.EDIT_QUESTIONS,
      PERMISSIONS.DELETE_QUESTIONS,
    ],
  },
  clients: {
    name: 'Clientes',
    permissions: [
      PERMISSIONS.VIEW_CLIENTS,
      PERMISSIONS.CREATE_CLIENTS,
      PERMISSIONS.EDIT_CLIENTS,
      PERMISSIONS.DELETE_CLIENTS,
    ],
  },
  templates: {
    name: 'Plantillas de Consentimiento',
    permissions: [
      PERMISSIONS.VIEW_TEMPLATES,
      PERMISSIONS.CREATE_TEMPLATES,
      PERMISSIONS.EDIT_TEMPLATES,
      PERMISSIONS.DELETE_TEMPLATES,
    ],
  },
  settings: {
    name: 'Configuración',
    permissions: [
      PERMISSIONS.VIEW_SETTINGS,
      PERMISSIONS.EDIT_SETTINGS,
      PERMISSIONS.CONFIGURE_EMAIL,
    ],
  },
  invoices: {
    name: 'Facturación',
    permissions: [
      PERMISSIONS.VIEW_INVOICES,
      PERMISSIONS.PAY_INVOICES,
    ],
  },
  tenants: {
    name: 'Tenants',
    permissions: [
      PERMISSIONS.MANAGE_TENANTS,
    ],
  },
} as const;
