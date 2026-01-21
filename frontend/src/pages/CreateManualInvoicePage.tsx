import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tenantsService } from '@/services/tenants';
import CreateInvoiceModal from '@/components/invoices/CreateInvoiceModal';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
}

export default function CreateManualInvoicePage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const data = await tenantsService.getAll();
      setTenants(data.filter((t: Tenant) => t.status === 'active'));
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/billing')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Factura Manual</h1>
          <p className="text-gray-600 mt-2">
            Selecciona un tenant para crear una factura personalizada
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar tenant por nombre o slug..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tenants List */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-600">Cargando tenants...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTenants.map((tenant) => (
            <button
              key={tenant.id}
              onClick={() => setSelectedTenant({ id: tenant.id, name: tenant.name })}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{tenant.name}</h3>
              <p className="text-sm text-gray-600 mb-1">Slug: {tenant.slug}</p>
              <p className="text-sm text-gray-600">Plan: {tenant.plan}</p>
            </button>
          ))}
        </div>
      )}

      {filteredTenants.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No se encontraron tenants activos</p>
        </div>
      )}

      {/* Modal */}
      {selectedTenant && (
        <CreateInvoiceModal
          tenantId={selectedTenant.id}
          tenantName={selectedTenant.name}
          onClose={() => setSelectedTenant(null)}
          onSuccess={() => {
            setSelectedTenant(null);
            navigate('/billing');
          }}
        />
      )}
    </div>
  );
}
