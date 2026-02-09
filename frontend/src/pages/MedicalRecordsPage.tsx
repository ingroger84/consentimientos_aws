import { useState, useEffect } from 'react';
import { Plus, FileText, Search, Eye, LayoutGrid, List, User, Calendar, Building2, Trash2, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { medicalRecordsService } from '../services/medical-records.service';
import { MedicalRecord } from '../types/medical-record';
import { usePermissions } from '../hooks/usePermissions';
import { useToast } from '../hooks/useToast';
import MedicalRecordConsentPdfViewer from '../components/medical-records/MedicalRecordConsentPdfViewer';

type ViewMode = 'table' | 'cards';

export default function MedicalRecordsPage() {
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const navigate = useNavigate();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Vista de tabla por defecto
  const [selectedPdf, setSelectedPdf] = useState<{ recordId: string; consentId: string; clientName: string } | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordsService.getAll();
      setRecords(data);
    } catch (error: any) {
      toast.error('Error al cargar historias clínicas', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, recordNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`¿Estás seguro de eliminar la historia clínica ${recordNumber}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await medicalRecordsService.delete(id);
      toast.success('Historia clínica eliminada correctamente');
      loadRecords();
    } catch (error: any) {
      toast.error('Error al eliminar historia clínica', error.response?.data?.message);
    }
  };

  const handlePreview = async (record: MedicalRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Verificar que tenga consentimientos
      const consents = await medicalRecordsService.getConsents(record.id);
      if (consents.length === 0) {
        toast.error('No hay consentimientos generados', 'Esta historia clínica no tiene consentimientos para visualizar');
        return;
      }
      
      // Abrir modal con el primer consentimiento (el más reciente)
      setSelectedPdf({
        recordId: record.id,
        consentId: consents[0].id,
        clientName: record.client?.name || record.client?.fullName || 'Sin nombre'
      });
    } catch (error: any) {
      toast.error('Error al cargar vista previa', error.response?.data?.message || error.message);
    }
  };

  const handleSendEmail = async (record: MedicalRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!record.client?.email) {
      toast.error('Sin email', 'El paciente no tiene email registrado');
      return;
    }

    if (!confirm(`¿Enviar consentimientos por correo a ${record.client.email}?`)) {
      return;
    }

    try {
      setSendingEmail(record.id);
      await medicalRecordsService.sendRecordEmail(record.id);
      toast.success('Email enviado', `Consentimientos enviados a ${record.client.email}`);
    } catch (error: any) {
      toast.error('Error al enviar email', error.response?.data?.message || error.message);
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const clientName = record.client?.name || record.client?.fullName || '';
    return (
      record.recordNumber.toLowerCase().includes(search) ||
      clientName.toLowerCase().includes(search) ||
      record.client?.documentNumber.includes(search)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'closed': return 'Cerrada';
      case 'archived': return 'Archivada';
      default: return status;
    }
  };

  const getAdmissionTypeText = (type: string) => {
    switch (type) {
      case 'consulta': return 'Consulta';
      case 'urgencia': return 'Urgencia';
      case 'hospitalizacion': return 'Hospitalización';
      case 'control': return 'Control';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Historias Clínicas</h1>
        <p className="text-gray-600 mt-1">
          Gestión de historias clínicas electrónicas
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número de HC, nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de tabla"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>

          {/* Create */}
          {hasPermission('create_medical_records') && (
            <button
              onClick={() => navigate('/medical-records/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nueva Historia Clínica
            </button>
          )}
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Cargando historias clínicas...
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay historias clínicas
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'No se encontraron resultados para tu búsqueda'
              : 'Crea la primera historia clínica para comenzar'}
          </p>
          {hasPermission('create_medical_records') && !searchTerm && (
            <button
              onClick={() => navigate('/medical-records/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Nueva Historia Clínica
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Vista de Tabla */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Historia Clínica
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Admisión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sede
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr 
                    key={record.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/medical-records/${record.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.recordNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            Creada: {new Date(record.createdAt).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.client?.name || record.client?.fullName || 'Sin nombre'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.client?.documentType} {record.client?.documentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getAdmissionTypeText(record.admissionType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(record.admissionDate).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.branch ? (
                        <div className="flex items-center text-sm text-gray-900">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          {record.branch.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/medical-records/${record.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => handlePreview(record, e)}
                          className="text-green-600 hover:text-green-900 inline-flex items-center gap-1"
                          title="Vista Previa PDF"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => handleSendEmail(record, e)}
                          disabled={sendingEmail === record.id || !record.client?.email}
                          className="text-purple-600 hover:text-purple-900 inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={record.client?.email ? "Enviar por correo" : "Sin email registrado"}
                        >
                          {sendingEmail === record.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Mail className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDelete(record.id, record.recordNumber, e)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                          title="Eliminar Historia Clínica"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista de Tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
              onClick={() => navigate(`/medical-records/${record.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {record.recordNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {record.client?.name || record.client?.fullName || 'Sin nombre'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {record.client?.documentType} {record.client?.documentNumber}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(record.status)}`}>
                  {getStatusText(record.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{getAdmissionTypeText(record.admissionType)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {new Date(record.admissionDate).toLocaleDateString('es-CO')}
                  </span>
                </div>
                {record.branch && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sede:</span>
                    <span className="font-medium text-xs">{record.branch.name}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Creada: {new Date(record.createdAt).toLocaleDateString('es-CO')}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/medical-records/${record.id}`);
                    }}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    onClick={(e) => handlePreview(record, e)}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm"
                    title="Vista Previa"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleSendEmail(record, e)}
                    disabled={sendingEmail === record.id || !record.client?.email}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm disabled:opacity-50"
                    title="Enviar Email"
                  >
                    {sendingEmail === record.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDelete(record.id, record.recordNumber, e)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1 text-sm"
                    title="Eliminar Historia Clínica"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Vista Previa */}
      {selectedPdf && (
        <MedicalRecordConsentPdfViewer
          medicalRecordId={selectedPdf.recordId}
          consentId={selectedPdf.consentId}
          clientName={selectedPdf.clientName}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
}
