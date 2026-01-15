import { Trophy, TrendingUp, Users, FileText } from 'lucide-react';

interface TopTenant {
  id: string;
  name: string;
  plan: string;
  consentsCount: number;
  usersCount: number;
  lastActivity: string;
}

interface TopPerformersSectionProps {
  topTenants: TopTenant[];
}

export default function TopPerformersSection({ topTenants }: TopPerformersSectionProps) {
  const top3 = topTenants.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  const handleTenantClick = (tenantId: string) => {
    // Scroll a la tabla y aplicar filtro para ese tenant específico
    const tableSection = document.getElementById('tenants-table');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth' });
      // Disparar evento personalizado para filtrar por tenant ID
      window.dispatchEvent(new CustomEvent('filterTenants', { detail: { type: 'tenant-id', value: tenantId } }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          Top Performers
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((tenant, index) => (
          <button
            key={tenant.id}
            onClick={() => handleTenantClick(tenant.id)}
            className="card hover:shadow-xl transition-all transform hover:-translate-y-1 text-left cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{medals[index]}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                  <span className="text-xs text-gray-500 uppercase">{tenant.plan}</span>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Consentimientos</span>
                </div>
                <span className="font-bold text-gray-900">{tenant.consentsCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Usuarios</span>
                </div>
                <span className="font-bold text-gray-900">{tenant.usersCount}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Última actividad: {new Date(tenant.lastActivity).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-blue-600 font-medium text-center">
                Clic para ver en la tabla →
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
