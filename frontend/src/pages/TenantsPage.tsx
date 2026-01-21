import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { tenantsService } from '../services/tenants';
import { Tenant, TenantStatus, TenantPlan, GlobalStats } from '../types/tenant';
import { getPlanName } from '@/utils/plan-names';
import TenantCard from '../components/TenantCard';
import TenantFormModal from '../components/TenantFormModal';
import TenantStatsModal from '../components/TenantStatsModal';
import GlobalStatsCard from '../components/GlobalStatsCard';
import RegisterPaymentModal from '../components/billing/RegisterPaymentModal';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<TenantPlan | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tenantsData, statsData] = await Promise.all([
        tenantsService.getAll(),
        tenantsService.getGlobalStats(),
      ]);
      setTenants(tenantsData);
      setGlobalStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setShowCreateModal(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowCreateModal(true);
  };

  const handleViewStats = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowStatsModal(true);
  };

  const handleSuspend = async (id: string) => {
    const confirmed = await confirm({
      type: 'warning',
      title: '¿Suspender tenant?',
      message: 'El tenant no podrá acceder al sistema hasta que sea reactivado.',
      confirmText: 'Suspender',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) return;
    
    try {
      await tenantsService.suspend(id);
      await loadData();
      toast.success('Tenant suspendido', 'El tenant fue suspendido correctamente');
    } catch (error) {
      console.error('Error suspending tenant:', error);
      toast.error('Error al suspender', 'No se pudo suspender el tenant');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await tenantsService.activate(id);
      await loadData();
      toast.success('Tenant activado', 'El tenant fue activado correctamente');
    } catch (error) {
      console.error('Error activating tenant:', error);
      toast.error('Error al activar', 'No se pudo activar el tenant');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar tenant?',
      message: 'Esta acción no se puede deshacer. Todos los datos del tenant serán eliminados permanentemente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) return;
    
    try {
      await tenantsService.delete(id);
      await loadData();
      toast.success('Tenant eliminado', 'El tenant fue eliminado correctamente');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Error al eliminar', 'No se pudo eliminar el tenant');
    }
  };

  const handleResendWelcomeEmail = async (id: string) => {
    const confirmed = await confirm({
      type: 'info',
      title: '¿Reenviar correo de bienvenida?',
      message: 'Se enviará un nuevo correo de bienvenida al administrador del tenant.',
      confirmText: 'Enviar',
      cancelText: 'Cancelar',
    });
    
    if (!confirmed) return;
    
    try {
      await tenantsService.resendWelcomeEmail(id);
      toast.success('¡Correo enviado!', 'El correo de bienvenida fue enviado exitosamente');
    } catch (error: any) {
      console.error('Error resending welcome email:', error);
      toast.error('Error al enviar', error.response?.data?.message || 'No se pudo enviar el correo');
    }
  };

  const handleRegisterPayment = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowPaymentModal(true);
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tenants</h1>
            <p className="text-gray-600 mt-2">
              Administra todas las cuentas cliente del sistema
            </p>
          </div>
          <button
            onClick={handleCreateTenant}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Tenant
          </button>
        </div>
      </div>

      {/* Global Stats */}
      {globalStats && <GlobalStatsCard stats={globalStats} />}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, slug o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TenantStatus | 'all')}
            className="input"
          >
            <option value="all">Todos los estados</option>
            <option value={TenantStatus.ACTIVE}>Activo</option>
            <option value={TenantStatus.TRIAL}>Prueba</option>
            <option value={TenantStatus.SUSPENDED}>Suspendido</option>
            <option value={TenantStatus.EXPIRED}>Expirado</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as TenantPlan | 'all')}
            className="input"
          >
            <option value="all">Todos los planes</option>
            <option value={TenantPlan.FREE}>{getPlanName(TenantPlan.FREE)}</option>
            <option value={TenantPlan.BASIC}>{getPlanName(TenantPlan.BASIC)}</option>
            <option value={TenantPlan.PROFESSIONAL}>{getPlanName(TenantPlan.PROFESSIONAL)}</option>
            <option value={TenantPlan.ENTERPRISE}>{getPlanName(TenantPlan.ENTERPRISE)}</option>
            <option value={TenantPlan.CUSTOM}>{getPlanName(TenantPlan.CUSTOM)}</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Mostrando {filteredTenants.length} de {tenants.length} tenants
      </div>

      {/* Tenants Grid */}
      {filteredTenants.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron tenants
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || planFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza creando tu primer tenant'}
          </p>
          {!searchTerm && statusFilter === 'all' && planFilter === 'all' && (
            <button onClick={handleCreateTenant} className="btn btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Crear Primer Tenant
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onEdit={handleEditTenant}
              onViewStats={handleViewStats}
              onSuspend={handleSuspend}
              onActivate={handleActivate}
              onDelete={handleDelete}
              onResendWelcomeEmail={handleResendWelcomeEmail}
              onRegisterPayment={handleRegisterPayment}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <TenantFormModal
          tenant={selectedTenant}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTenant(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setSelectedTenant(null);
            loadData();
          }}
        />
      )}

      {showStatsModal && selectedTenant && (
        <TenantStatsModal
          tenant={selectedTenant}
          onClose={() => {
            setShowStatsModal(false);
            setSelectedTenant(null);
          }}
        />
      )}

      {showPaymentModal && selectedTenant && (
        <RegisterPaymentModal
          tenantId={selectedTenant.id}
          tenantName={selectedTenant.name}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedTenant(null);
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
