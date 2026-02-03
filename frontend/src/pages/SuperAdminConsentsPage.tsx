import { useEffect, useState } from 'react';
import { FileText, Building2, User, Calendar, ChevronRight, Search, Filter, Mail, CheckCircle, XCircle, Clock, Loader2, Trash2, Eye } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/services/api';
import { consentService } from '@/services/consent.service';
import PdfViewer from '@/components/PdfViewer';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

type PdfType = 'procedure' | 'data-treatment' | 'image-rights';

interface Consent {
  id: string;
  clientName: string;
  clientId: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  branchName: string;
  status: string;
  signedAt: string | null;
  emailSentAt: string | null;
  createdAt: string;
  tenantName: string;
  tenantSlug: string;
}

interface GroupedConsents {
  tenantId: string | null;
  tenantName: string;
  tenantSlug: string;
  totalConsents: number;
  draftConsents: number;
  signedConsents: number;
  sentConsents: number;
  failedConsents: number;
  consents: Consent[];
}

export default function SuperAdminConsentsPage() {
  const [loading, setLoading] = useState(true);
  const [groupedConsents, setGroupedConsents] = useState<GroupedConsents[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const [selectedPdf, setSelectedPdf] = useState<{ id: string; clientId: string; type: PdfType } | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    loadConsents();
  }, []);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/consents/all/grouped');
      setGroupedConsents(response.data);
    } catch (error) {
      console.error('Error loading consents:', error);
      setGroupedConsents([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => consentService.delete(id),
    onSuccess: () => {
      loadConsents();
      toast.success('Consentimiento eliminado', 'El consentimiento fue eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar', error.response?.data?.message || error.message);
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: (id: string) => consentService.resendEmail(id),
    onSuccess: () => {
      loadConsents();
      toast.success('Email reenviado', 'El email fue reenviado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al reenviar email', error.response?.data?.message || error.message);
    },
    onSettled: () => {
      setResendingEmail(null);
    },
  });

  const handleResendEmail = async (consentId: string) => {
    const confirmed = await confirm({
      type: 'info',
      title: '¿Reenviar email?',
      message: '¿Desea reenviar el email con los consentimientos?',
      confirmText: 'Reenviar',
      cancelText: 'Cancelar',
    });
    
    if (confirmed) {
      setResendingEmail(consentId);
      resendEmailMutation.mutate(consentId);
    }
  };

  const handleDelete = async (consentId: string, clientName: string) => {
    const confirmed = await confirm({
      type: 'danger',
      title: '¿Eliminar consentimiento?',
      message: `¿Está seguro de eliminar el consentimiento de ${clientName}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
    });
    
    if (confirmed) {
      deleteMutation.mutate(consentId);
    }
  };

  const handleViewPdf = (consentId: string, clientId: string, type: PdfType) => {
    setSelectedPdf({ id: consentId, clientId, type });
  };

  const toggleTenant = (tenantId: string) => {
    const newExpanded = new Set(expandedTenants);
    if (newExpanded.has(tenantId)) {
      newExpanded.delete(tenantId);
    } else {
      newExpanded.add(tenantId);
    }
    setExpandedTenants(newExpanded);
  };

  const filteredConsents = groupedConsents.filter(group => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return group.tenantName.toLowerCase().includes(search) ||
             group.tenantSlug.toLowerCase().includes(search);
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
      signed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
      sent: { bg: 'bg-green-100', text: 'text-green-800', icon: Mail },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };
    const labels: Record<string, string> = {
      draft: 'Borrador',
      signed: 'Firmado',
      sent: 'Enviado',
      failed: 'Fallido',
    };
    
    const config = styles[status] || styles.draft;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="ml-4 text-gray-600">Cargando consentimientos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consentimientos</h1>
          <p className="text-gray-600 mt-2">
            Vista global de todos los consentimientos del sistema
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-10"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borradores</option>
              <option value="signed">Firmados</option>
              <option value="sent">Enviados</option>
              <option value="failed">Fallidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Consentimientos</p>
              <p className="text-3xl font-bold mt-2">
                {groupedConsents.reduce((sum, g) => sum + g.totalConsents, 0)}
              </p>
            </div>
            <FileText className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Enviados</p>
              <p className="text-3xl font-bold mt-2">
                {groupedConsents.reduce((sum, g) => sum + g.sentConsents, 0)}
              </p>
            </div>
            <Mail className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Firmados</p>
              <p className="text-3xl font-bold mt-2">
                {groupedConsents.reduce((sum, g) => sum + g.signedConsents, 0)}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-sm">Borradores</p>
              <p className="text-3xl font-bold mt-2">
                {groupedConsents.reduce((sum, g) => sum + g.draftConsents, 0)}
              </p>
            </div>
            <Clock className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Grouped Consents */}
      <div className="space-y-4">
        {filteredConsents.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay consentimientos
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Aún no se han creado consentimientos en el sistema'}
            </p>
          </div>
        ) : (
          filteredConsents.map((group) => (
            <div key={group.tenantId || 'no-tenant'} className="card">
              {/* Tenant Header */}
              <button
                onClick={() => toggleTenant(group.tenantId || 'no-tenant')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    transform transition-transform duration-200
                    ${expandedTenants.has(group.tenantId || 'no-tenant') ? 'rotate-90' : ''}
                  `}>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{group.tenantName}</h3>
                    <p className="text-sm text-gray-500">{group.tenantSlug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{group.totalConsents}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{group.sentConsents}</p>
                    <p className="text-xs text-gray-500">Enviados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-purple-600">{group.signedConsents}</p>
                    <p className="text-xs text-gray-500">Firmados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-600">{group.draftConsents}</p>
                    <p className="text-xs text-gray-500">Borradores</p>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              {expandedTenants.has(group.tenantId || 'no-tenant') && (
                <div className="border-t mt-4 pt-4">
                  {group.consents.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay consentimientos para mostrar
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.consents.map((consent) => (
                        <div
                          key={consent.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{consent.clientName}</p>
                                {getStatusBadge(consent.status)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {consent.clientId}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {consent.branchName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {consent.serviceName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(consent.createdAt).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Botones de acción */}
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {consent.status !== 'draft' && (
                              <>
                                <button
                                  onClick={() => handleViewPdf(consent.id, consent.clientId, 'procedure')}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Vista Previa"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleResendEmail(consent.id)}
                                  disabled={resendingEmail === consent.id}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reenviar Email"
                                >
                                  {resendingEmail === consent.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                  ) : (
                                    <Mail className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDelete(consent.id, consent.clientName)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {consent.status === 'draft' && (
                              <span className="text-sm text-gray-400 px-3">Borrador</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedPdf && (
        <PdfViewer
          consentId={selectedPdf.id}
          clientId={selectedPdf.clientId}
          pdfType={selectedPdf.type}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
}
