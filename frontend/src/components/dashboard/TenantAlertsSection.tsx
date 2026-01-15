import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, XCircle, ChevronDown, ChevronUp, Users, Building2, FileText } from 'lucide-react';
import { tenantsService } from '@/services/tenants';

interface TenantAlertsSectionProps {
  tenantsNearLimit: number;
  tenantsAtLimit: number;
  suspendedTenants: number;
}

interface TenantWithAlerts {
  id: string;
  name: string;
  slug: string;
  plan: string;
  alerts: Array<{
    type: 'critical' | 'warning';
    resource: string;
    message: string;
    current: number;
    max: number;
    percentage: number;
  }>;
}

export default function TenantAlertsSection({
  tenantsNearLimit,
  tenantsAtLimit,
  suspendedTenants,
}: TenantAlertsSectionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [tenantsWithAlerts, setTenantsWithAlerts] = useState<TenantWithAlerts[]>([]);
  const [loading, setLoading] = useState(false);

  const hasAlerts = tenantsNearLimit > 0 || tenantsAtLimit > 0 || suspendedTenants > 0;

  useEffect(() => {
    if (hasAlerts && showDetails) {
      loadTenantsWithAlerts();
    }
  }, [showDetails, hasAlerts]);

  const loadTenantsWithAlerts = async () => {
    try {
      setLoading(true);
      const allTenants = await tenantsService.getAll();
      
      const tenantsWithProblems: TenantWithAlerts[] = [];

      allTenants.forEach(tenant => {
        const alerts: TenantWithAlerts['alerts'] = [];
        
        const userCount = tenant.users?.filter((u: any) => !u.deletedAt).length || 0;
        const branchCount = tenant.branches?.filter((b: any) => !b.deletedAt).length || 0;
        const consentCount = tenant.consents?.filter((c: any) => !c.deletedAt).length || 0;

        const userPercentage = (userCount / tenant.maxUsers) * 100;
        const branchPercentage = (branchCount / tenant.maxBranches) * 100;
        const consentPercentage = (consentCount / tenant.maxConsents) * 100;

        // Usuarios
        if (userPercentage >= 100) {
          alerts.push({
            type: 'critical',
            resource: 'users',
            message: 'Límite de usuarios alcanzado',
            current: userCount,
            max: tenant.maxUsers,
            percentage: Math.round(userPercentage),
          });
        } else if (userPercentage >= 80) {
          alerts.push({
            type: 'warning',
            resource: 'users',
            message: 'Cerca del límite de usuarios',
            current: userCount,
            max: tenant.maxUsers,
            percentage: Math.round(userPercentage),
          });
        }

        // Sedes
        if (branchPercentage >= 100) {
          alerts.push({
            type: 'critical',
            resource: 'branches',
            message: 'Límite de sedes alcanzado',
            current: branchCount,
            max: tenant.maxBranches,
            percentage: Math.round(branchPercentage),
          });
        } else if (branchPercentage >= 80) {
          alerts.push({
            type: 'warning',
            resource: 'branches',
            message: 'Cerca del límite de sedes',
            current: branchCount,
            max: tenant.maxBranches,
            percentage: Math.round(branchPercentage),
          });
        }

        // Consentimientos
        if (consentPercentage >= 100) {
          alerts.push({
            type: 'critical',
            resource: 'consents',
            message: 'Límite de consentimientos alcanzado',
            current: consentCount,
            max: tenant.maxConsents,
            percentage: Math.round(consentPercentage),
          });
        } else if (consentPercentage >= 80) {
          alerts.push({
            type: 'warning',
            resource: 'consents',
            message: 'Cerca del límite de consentimientos',
            current: consentCount,
            max: tenant.maxConsents,
            percentage: Math.round(consentPercentage),
          });
        }

        if (alerts.length > 0) {
          tenantsWithProblems.push({
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            alerts,
          });
        }
      });

      // Ordenar por severidad (críticos primero)
      tenantsWithProblems.sort((a, b) => {
        const aCritical = a.alerts.filter(alert => alert.type === 'critical').length;
        const bCritical = b.alerts.filter(alert => alert.type === 'critical').length;
        return bCritical - aCritical;
      });

      setTenantsWithAlerts(tenantsWithProblems);
    } catch (error) {
      console.error('Error loading tenants with alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'users':
        return <Users className="w-4 h-4" />;
      case 'branches':
        return <Building2 className="w-4 h-4" />;
      case 'consents':
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      users: 'Usuarios',
      branches: 'Sedes',
      consents: 'Consentimientos',
    };
    return labels[resource] || resource;
  };

  const scrollToTenant = (tenantId: string) => {
    const tableSection = document.getElementById('tenants-table');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth' });
      // Disparar evento para filtrar por tenant específico
      window.dispatchEvent(new CustomEvent('filterTenants', { 
        detail: { type: 'tenant-id', value: tenantId }
      }));
    }
  };

  if (!hasAlerts) {
    return (
      <div className="card bg-green-50 border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-900">
              ✓ Sistema Saludable
            </h3>
            <p className="text-sm text-green-700">
              No hay tenants que requieran atención inmediata
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Alertas y Atención Requerida
        </h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
        >
          {showDetails ? (
            <>
              Ocultar detalles <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Ver detalles <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tenants at Limit */}
        {tenantsAtLimit > 0 && (
          <button
            onClick={() => {
              const tableSection = document.getElementById('tenants-table');
              if (tableSection) {
                tableSection.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('filterTenants', { detail: 'at-limit' }));
              }
            }}
            className="card bg-red-50 border-2 border-red-300 hover:shadow-lg transition-all text-left cursor-pointer hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">
                  🚨 Límite Alcanzado
                </h3>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {tenantsAtLimit}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Tenants bloqueados - Acción inmediata requerida
                </p>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Clic para ver →
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Tenants Near Limit */}
        {tenantsNearLimit > 0 && (
          <button
            onClick={() => {
              const tableSection = document.getElementById('tenants-table');
              if (tableSection) {
                tableSection.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('filterTenants', { detail: 'near-limit' }));
              }
            }}
            className="card bg-orange-50 border-2 border-orange-300 hover:shadow-lg transition-all text-left cursor-pointer hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-900">
                  ⚠️ Cerca del Límite
                </h3>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {tenantsNearLimit}
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  Tenants usando &gt;80% de recursos
                </p>
                <p className="text-xs text-orange-600 mt-2 font-medium">
                  Clic para ver →
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Suspended Tenants */}
        {suspendedTenants > 0 && (
          <button
            onClick={() => {
              const tableSection = document.getElementById('tenants-table');
              if (tableSection) {
                tableSection.scrollIntoView({ behavior: 'smooth' });
                window.dispatchEvent(new CustomEvent('filterTenants', { detail: 'suspended' }));
              }
            }}
            className="card bg-gray-50 border-2 border-gray-300 hover:shadow-lg transition-all text-left cursor-pointer hover:scale-105"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  ⏸️ Suspendidos
                </h3>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {suspendedTenants}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  Tenants inactivos o suspendidos
                </p>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Clic para ver →
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Detailed Alerts */}
      {showDetails && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalle de Alertas por Tenant
          </h3>
          
          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Cargando detalles...
            </div>
          ) : tenantsWithAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No se encontraron tenants con alertas
            </div>
          ) : (
            <div className="space-y-3">
              {tenantsWithAlerts.map((tenant) => {
                const hasCritical = tenant.alerts.some(a => a.type === 'critical');
                
                return (
                  <div
                    key={tenant.id}
                    className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                      hasCritical 
                        ? 'border-red-200 bg-red-50' 
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{tenant.name}</h4>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
                            {tenant.plan}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{tenant.slug}</p>
                      </div>
                      <button
                        onClick={() => scrollToTenant(tenant.id)}
                        className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ver Tenant
                      </button>
                    </div>

                    <div className="space-y-2">
                      {tenant.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-2 rounded ${
                            alert.type === 'critical'
                              ? 'bg-red-100 border border-red-200'
                              : 'bg-orange-100 border border-orange-200'
                          }`}
                        >
                          <div className={`${
                            alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {getResourceIcon(alert.resource)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-medium ${
                                alert.type === 'critical' ? 'text-red-900' : 'text-orange-900'
                              }`}>
                                {getResourceLabel(alert.resource)}: {alert.message}
                              </span>
                              <span className={`text-xs font-bold ${
                                alert.type === 'critical' ? 'text-red-700' : 'text-orange-700'
                              }`}>
                                {alert.current}/{alert.max} ({alert.percentage}%)
                              </span>
                            </div>
                            <div className="mt-1 w-full bg-white rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  alert.type === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
