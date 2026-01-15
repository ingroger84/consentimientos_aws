import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentService } from '@/services/consent.service';
import { Plus, FileText, Mail, Loader2, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import PdfViewer from '@/components/PdfViewer';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

type PdfType = 'procedure' | 'data-treatment' | 'image-rights';

export default function ConsentsPage() {
  const [selectedPdf, setSelectedPdf] = useState<{ id: string; clientId: string; type: PdfType } | null>(null);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const toast = useToast();
  const confirm = useConfirm();

  // Check if user has permission to delete consents
  const canDeleteConsents = user?.role?.permissions?.includes('delete_consents') || false;

  const { data: consents, isLoading } = useQuery({
    queryKey: ['consents', searchTerm],
    queryFn: () => consentService.getAll(searchTerm),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => consentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      toast.success('Consentimiento eliminado', 'El consentimiento fue eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar', error.response?.data?.message || error.message);
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: (id: string) => consentService.resendEmail(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
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

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SIGNED: 'bg-blue-100 text-blue-800',
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  const handleViewPdf = (consentId: string, clientId: string, type: PdfType) => {
    setSelectedPdf({ id: consentId, clientId, type });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consentimientos</h1>
          <p className="text-gray-600 mt-2">Gestiona los consentimientos digitales</p>
        </div>
        <Link to="/consents/new" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Consentimiento
        </Link>
      </div>

      {/* Search Bar */}
      <div className="card mb-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border-0 focus:ring-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Cliente</th>
                  <th className="text-left py-3 px-4">Servicio</th>
                  <th className="text-left py-3 px-4">Sede</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {consents?.map((consent) => (
                  <tr key={consent.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{consent.clientName}</p>
                        <p className="text-sm text-gray-500">{consent.clientEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{consent.service.name}</td>
                    <td className="py-3 px-4">{consent.branch.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consent.status)}`}>
                        {consent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(consent.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {consent.pdfUrl ? (
                          <>
                            <button
                              onClick={() => handleViewPdf(consent.id, consent.clientId, 'procedure')}
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                              title="Ver Consentimientos"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleResendEmail(consent.id)}
                              disabled={resendingEmail === consent.id}
                              className="text-green-600 hover:text-green-700 flex items-center gap-1 disabled:opacity-50"
                              title="Reenviar Email"
                            >
                              {resendingEmail === consent.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Mail className="w-5 h-5" />
                              )}
                            </button>
                            {canDeleteConsents && (
                              <button
                                onClick={() => handleDelete(consent.id, consent.clientName)}
                                className="text-red-600 hover:text-red-700 flex items-center gap-1"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin PDF</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
