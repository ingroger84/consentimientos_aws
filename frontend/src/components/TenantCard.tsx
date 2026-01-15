import { Building2, Users, MapPin, FileText, MoreVertical, Edit, TrendingUp, Ban, CheckCircle, Trash2, Mail, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Tenant, TenantStatus, TenantPlan } from '../types/tenant';

interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onViewStats: (tenant: Tenant) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onResendWelcomeEmail: (id: string) => void;
  onRegisterPayment?: (tenant: Tenant) => void;
}

export default function TenantCard({ tenant, onEdit, onViewStats, onSuspend, onActivate, onDelete, onResendWelcomeEmail, onRegisterPayment }: TenantCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case TenantStatus.TRIAL:
        return 'bg-blue-100 text-blue-800';
      case TenantStatus.SUSPENDED:
        return 'bg-red-100 text-red-800';
      case TenantStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: TenantPlan) => {
    switch (plan) {
      case TenantPlan.FREE:
        return 'bg-gray-100 text-gray-800';
      case TenantPlan.BASIC:
        return 'bg-blue-100 text-blue-800';
      case TenantPlan.PROFESSIONAL:
        return 'bg-purple-100 text-purple-800';
      case TenantPlan.ENTERPRISE:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: TenantStatus) => {
    switch (status) {
      case TenantStatus.ACTIVE:
        return 'Activo';
      case TenantStatus.TRIAL:
        return 'Prueba';
      case TenantStatus.SUSPENDED:
        return 'Suspendido';
      case TenantStatus.EXPIRED:
        return 'Expirado';
      default:
        return status;
    }
  };

  const getPlanLabel = (plan: TenantPlan) => {
    switch (plan) {
      case TenantPlan.FREE:
        return 'Free';
      case TenantPlan.BASIC:
        return 'Basic';
      case TenantPlan.PROFESSIONAL:
        return 'Professional';
      case TenantPlan.ENTERPRISE:
        return 'Enterprise';
      default:
        return plan;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
            <p className="text-sm text-gray-500">/{tenant.slug}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onEdit(tenant);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onViewStats(tenant);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Estadísticas
                </button>
                <button
                  onClick={() => {
                    onResendWelcomeEmail(tenant.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-blue-600"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reenviar Email Bienvenida
                </button>
                {onRegisterPayment && (
                  <button
                    onClick={() => {
                      onRegisterPayment(tenant);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-green-600"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Registrar Pago
                  </button>
                )}
                {tenant.status === TenantStatus.ACTIVE ? (
                  <button
                    onClick={() => {
                      onSuspend(tenant.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspender
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onActivate(tenant.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Activar
                  </button>
                )}
                <button
                  onClick={() => {
                    onDelete(tenant.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status & Plan */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
          {getStatusLabel(tenant.status)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(tenant.plan)}`}>
          {getPlanLabel(tenant.plan)}
        </span>
      </div>

      {/* Contact Info */}
      {tenant.contactEmail && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">{tenant.contactEmail}</p>
          {tenant.contactName && (
            <p className="text-sm text-gray-500">{tenant.contactName}</p>
          )}
          {/* URL del Tenant */}
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-500 mb-1">URL de Acceso:</p>
            <a
              href={`http://${tenant.slug}.localhost:5173`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium break-all"
            >
              http://{tenant.slug}.localhost:5173
            </a>
          </div>
        </div>
      )}

      {/* Limits & Usage */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-3">Consumo de Recursos</p>
        <div className="space-y-3">
          {/* Usuarios */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">Usuarios</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {tenant.users?.length || 0} / {tenant.maxUsers}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  ((tenant.users?.length || 0) / tenant.maxUsers) * 100 >= 90
                    ? 'bg-red-500'
                    : ((tenant.users?.length || 0) / tenant.maxUsers) * 100 >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(((tenant.users?.length || 0) / tenant.maxUsers) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Sedes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">Sedes</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {tenant.branches?.length || 0} / {tenant.maxBranches}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  ((tenant.branches?.length || 0) / tenant.maxBranches) * 100 >= 90
                    ? 'bg-red-500'
                    : ((tenant.branches?.length || 0) / tenant.maxBranches) * 100 >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(((tenant.branches?.length || 0) / tenant.maxBranches) * 100, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Servicios */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">Servicios</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {tenant.services?.length || 0}
              </span>
            </div>
          </div>

          {/* Consentimientos */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-600">Consentimientos</span>
              </div>
              <span className="text-xs font-semibold text-gray-900">
                {tenant.consents?.length || 0} / {tenant.maxConsents}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  ((tenant.consents?.length || 0) / tenant.maxConsents) * 100 >= 90
                    ? 'bg-red-500'
                    : ((tenant.consents?.length || 0) / tenant.maxConsents) * 100 >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(((tenant.consents?.length || 0) / tenant.maxConsents) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Creado: {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>
    </div>
  );
}
