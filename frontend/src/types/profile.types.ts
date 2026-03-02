// Tipos para el sistema de perfiles y permisos

export interface Permission {
  module: string;
  actions: string[];
}

export interface Profile {
  id: string;
  name: string;
  description: string;
  tenantId: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tenant?: {
    id: string;
    name: string;
  };
  users?: any[];
}

export interface SystemModule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  icon: string | null;
  route: string | null;
  parentModuleId: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface ModuleAction {
  id: string;
  moduleId: string;
  code: string;
  name: string;
  description: string;
}

export interface PermissionAudit {
  id: string;
  profileId: string;
  userId: string | null;
  action: string;
  changes: any;
  performedBy: string;
  performedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  performer?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateProfileDto {
  name: string;
  description: string;
  tenantId?: string;
  permissions: Permission[];
}

export interface UpdateProfileDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissions?: Permission[];
}

export interface AssignProfileDto {
  profileId: string;
  userId: string;
}

export interface CheckPermissionDto {
  userId: string;
  module: string;
  action: string;
}

export interface ModulesByCategory {
  [category: string]: SystemModule[];
}
