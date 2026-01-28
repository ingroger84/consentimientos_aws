import { FileText, Building2, Activity, CheckCircle, XCircle } from 'lucide-react';
import { GlobalStats } from '@/types/tenant';

interface MedicalRecordsStatsSectionProps {
  stats: GlobalStats;
}

export default function MedicalRecordsStatsSection({ stats }: MedicalRecordsStatsSectionProps) {
  const { medicalRecordsByTenant, topTenantsByMedicalRecords } = stats;

  if (!medicalRecordsByTenant || medicalRecordsByTenant.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Historias Clínicas por Cuenta
        </h3>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay historias clínicas registradas aún</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Tenants por Historias Clínicas */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Top Cuentas por Historias Clínicas
        </h3>
        
        <div className="space-y-3">
          {topTenantsByMedicalRecords && topTenantsByMedicalRecords.slice(0, 5).map((tenant, index) => (
            <div
              key={tenant.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'}
                `}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-500">{tenant.slug}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-indigo-600">{tenant.medicalRecordsCount}</p>
                <p className="text-xs text-gray-500">{tenant.branchesCount} sedes</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historias Clínicas por Cuenta y Sede */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Historias Clínicas por Cuenta y Sede
        </h3>
        
        <div className="space-y-6">
          {medicalRecordsByTenant.map((tenant) => (
            <div key={tenant.tenantId} className="border-l-4 border-indigo-500 pl-4">
              {/* Header del Tenant */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{tenant.tenantName}</h4>
                  <p className="text-sm text-gray-500">{tenant.tenantSlug}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">{tenant.totalRecords}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>

              {/* Estadísticas del Tenant */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Activas</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{tenant.activeRecords}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">Cerradas</span>
                  </div>
                  <p className="text-xl font-bold text-gray-600">{tenant.closedRecords}</p>
                </div>
              </div>

              {/* Historias por Sede */}
              {tenant.recordsByBranch && tenant.recordsByBranch.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Por Sede:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {tenant.recordsByBranch.map((branch) => (
                      <div
                        key={branch.branchId}
                        className="bg-white border border-gray-200 p-3 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <p className="text-sm font-medium text-gray-900 truncate" title={branch.branchName}>
                          {branch.branchName}
                        </p>
                        <p className="text-lg font-bold text-indigo-600">{branch.recordCount}</p>
                        <p className="text-xs text-gray-500">historias</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
