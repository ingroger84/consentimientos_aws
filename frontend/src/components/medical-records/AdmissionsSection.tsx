import { useState } from 'react';
import { Calendar, FileText, ChevronDown, ChevronUp, Lock, CheckCircle, XCircle } from 'lucide-react';
import { Admission } from '../../services/admissions.service';

interface AdmissionsSectionProps {
  admissions: Admission[];
  activeAdmissionId?: string | null;
  onAdmissionSelect?: (admissionId: string) => void;
  onRefresh?: () => void;
  onCloseAdmission?: (admissionId: string) => void;
  onReopenAdmission?: (admissionId: string) => void;
}

const admissionTypeLabels: Record<string, { label: string; icon: string }> = {
  primera_vez: { label: 'Primera Vez', icon: '🆕' },
  control: { label: 'Control', icon: '📋' },
  urgencia: { label: 'Urgencia', icon: '🚨' },
  hospitalizacion: { label: 'Hospitalización', icon: '🏥' },
  cirugia: { label: 'Cirugía', icon: '⚕️' },
  procedimiento: { label: 'Procedimiento', icon: '💉' },
  telemedicina: { label: 'Telemedicina', icon: '💻' },
  domiciliaria: { label: 'Domiciliaria', icon: '🏠' },
  interconsulta: { label: 'Interconsulta', icon: '👨‍⚕️' },
  otro: { label: 'Otro', icon: '📝' },
};

export default function AdmissionsSection({
  admissions,
  activeAdmissionId,
  onAdmissionSelect,
  onRefresh,
  onCloseAdmission,
  onReopenAdmission,
}: AdmissionsSectionProps) {
  const [expandedAdmissions, setExpandedAdmissions] = useState<Set<string>>(new Set());

  const toggleAdmission = (admissionId: string) => {
    const newExpanded = new Set(expandedAdmissions);
    if (newExpanded.has(admissionId)) {
      newExpanded.delete(admissionId);
    } else {
      newExpanded.add(admissionId);
    }
    setExpandedAdmissions(newExpanded);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4" />
            Activa
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
            <Lock className="w-4 h-4" />
            Cerrada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
            <XCircle className="w-4 h-4" />
            Cancelada
          </span>
        );
      default:
        return null;
    }
  };

  if (!admissions || admissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay admisiones registradas
      </div>
    );
  }

  // Ordenar admisiones por fecha (más reciente primero)
  const sortedAdmissions = [...admissions].sort(
    (a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime()
  );

  const handleSelectAdmission = (admissionId: string) => {
    if (onAdmissionSelect) {
      onAdmissionSelect(admissionId);
    }
  };

  const handleCloseAdmission = async (admissionId: string) => {
    if (onCloseAdmission) {
      await onCloseAdmission(admissionId);
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  const handleReopenAdmission = async (admissionId: string) => {
    if (onReopenAdmission) {
      await onReopenAdmission(admissionId);
      if (onRefresh) {
        onRefresh();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Admisiones ({admissions.length})
        </h3>
        {activeAdmissionId && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Admisión activa:</span>{' '}
            <span className="text-blue-600">
              {sortedAdmissions.find(a => a.id === activeAdmissionId)?.admissionNumber || 'N/A'}
            </span>
          </div>
        )}
      </div>

      {sortedAdmissions.map((admission) => {
        const isExpanded = expandedAdmissions.has(admission.id);
        const isActive = activeAdmissionId === admission.id;
        const typeInfo = admissionTypeLabels[admission.admissionType] || { label: admission.admissionType, icon: '📝' };

        return (
          <div
            key={admission.id}
            className={`border-2 rounded-lg overflow-hidden transition-all ${
              isActive ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 cursor-pointer hover:bg-gray-100 transition ${
                isActive ? 'bg-blue-50' : 'bg-gray-50'
              }`}
              onClick={() => toggleAdmission(admission.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-3xl">{typeInfo.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {admission.admissionNumber}
                      </h4>
                      {getStatusBadge(admission.status)}
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-blue-600 text-white">
                          ⭐ Activa
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {typeInfo.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(admission.admissionDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{admission.reason}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            {isExpanded && (
              <div className="p-4 border-t border-gray-200">
                {/* Estadísticas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {admission.anamnesis?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Anamnesis</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {admission.physicalExams?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Exámenes</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {admission.diagnoses?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Diagnósticos</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {admission.evolutions?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Evoluciones</div>
                  </div>
                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">
                      {admission.consents?.length || 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Consentimientos</div>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Creado por:</span>
                    <span className="text-gray-600">
                      {admission.creator?.name || 'Desconocido'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Fecha de creación:</span>
                    <span className="text-gray-600">{formatDate(admission.createdAt)}</span>
                  </div>
                  {admission.closedAt && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Cerrada el:</span>
                        <span className="text-gray-600">{formatDate(admission.closedAt)}</span>
                      </div>
                      {admission.closureNotes && (
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-gray-700">Notas de cierre:</span>
                          <span className="text-gray-600">{admission.closureNotes}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Acciones */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
                  {admission.status === 'active' && !isActive && onAdmissionSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAdmission(admission.id);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Seleccionar como Activa
                    </button>
                  )}
                  {admission.status === 'active' && onCloseAdmission && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseAdmission(admission.id);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      Cerrar Admisión
                    </button>
                  )}
                  {admission.status === 'closed' && onReopenAdmission && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReopenAdmission(admission.id);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Reabrir Admisión
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
