import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, FileText } from 'lucide-react';
import { medicalRecordsService } from '../services/medical-records.service';
import { MedicalRecord } from '../types/medical-record';
import { useToast } from '../hooks/useToast';

export default function ViewMedicalRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    if (id) {
      loadRecord();
    }
  }, [id]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      const data = await medicalRecordsService.getById(id!);
      setRecord(data);
    } catch (error: any) {
      toast.error('Error al cargar historia clínica', error.response?.data?.message);
      navigate('/medical-records');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando historia clínica...</div>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/medical-records')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{record.recordNumber}</h1>
            <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(record.status)}`}>
              {record.status === 'active' ? 'Activa' : record.status === 'closed' ? 'Cerrada' : 'Archivada'}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            Historia clínica de {record.client?.name}
          </p>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Paciente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-medium">{record.client?.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Documento</p>
              <p className="font-medium">{record.client?.documentType} {record.client?.documentNumber}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Fecha de Admisión</p>
              <p className="font-medium">{new Date(record.admissionDate).toLocaleDateString('es-CO')}</p>
            </div>
          </div>
          {record.client?.email && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{record.client.email}</p>
              </div>
            </div>
          )}
          {record.client?.phone && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{record.client.phone}</p>
              </div>
            </div>
          )}
          {record.branch && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Sede</p>
                <p className="font-medium">{record.branch.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex gap-4 px-6">
            {['resumen', 'anamnesis', 'examenes', 'diagnosticos', 'evoluciones'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'resumen' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumen de Historia Clínica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tipo de Admisión</p>
                  <p className="font-medium capitalize">{record.admissionType}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Creada por</p>
                  <p className="font-medium">{record.creator?.name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Fecha de Creación</p>
                  <p className="font-medium">{new Date(record.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Última Actualización</p>
                  <p className="font-medium">{new Date(record.updatedAt).toLocaleString('es-CO')}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anamnesis' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Anamnesis</h3>
              {record.anamnesis && record.anamnesis.length > 0 ? (
                <div className="space-y-4">
                  {record.anamnesis.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(item.createdAt).toLocaleString('es-CO')} - {item.creator?.name}
                      </p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Motivo de Consulta:</p>
                          <p className="text-gray-900">{item.chiefComplaint}</p>
                        </div>
                        {item.currentIllness && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Enfermedad Actual:</p>
                            <p className="text-gray-900">{item.currentIllness}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay anamnesis registrada</p>
              )}
            </div>
          )}

          {activeTab === 'examenes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Exámenes Físicos</h3>
              {record.physicalExams && record.physicalExams.length > 0 ? (
                <div className="space-y-4">
                  {record.physicalExams.map((exam) => (
                    <div key={exam.id} className="p-4 border rounded-lg">
                      <p className="text-sm text-gray-600 mb-4">
                        {new Date(exam.createdAt).toLocaleString('es-CO')} - {exam.creator?.name}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {exam.bloodPressureSystolic && (
                          <div>
                            <p className="text-xs text-gray-600">Presión Arterial</p>
                            <p className="font-medium">{exam.bloodPressureSystolic}/{exam.bloodPressureDiastolic} mmHg</p>
                          </div>
                        )}
                        {exam.heartRate && (
                          <div>
                            <p className="text-xs text-gray-600">Frecuencia Cardíaca</p>
                            <p className="font-medium">{exam.heartRate} lpm</p>
                          </div>
                        )}
                        {exam.temperature && (
                          <div>
                            <p className="text-xs text-gray-600">Temperatura</p>
                            <p className="font-medium">{exam.temperature}°C</p>
                          </div>
                        )}
                        {exam.weight && (
                          <div>
                            <p className="text-xs text-gray-600">Peso</p>
                            <p className="font-medium">{exam.weight} kg</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay exámenes físicos registrados</p>
              )}
            </div>
          )}

          {activeTab === 'diagnosticos' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Diagnósticos</h3>
              {record.diagnoses && record.diagnoses.length > 0 ? (
                <div className="space-y-2">
                  {record.diagnoses.map((diagnosis) => (
                    <div key={diagnosis.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{diagnosis.cie10Code} - {diagnosis.cie10Description}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Tipo: {diagnosis.diagnosisType} | {diagnosis.isConfirmed ? 'Confirmado' : 'Presuntivo'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(diagnosis.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay diagnósticos registrados</p>
              )}
            </div>
          )}

          {activeTab === 'evoluciones' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Evoluciones</h3>
              {record.evolutions && record.evolutions.length > 0 ? (
                <div className="space-y-4">
                  {record.evolutions.map((evolution) => (
                    <div key={evolution.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-medium">{new Date(evolution.evolutionDate).toLocaleString('es-CO')}</p>
                          <p className="text-sm text-gray-600">{evolution.creator?.name}</p>
                        </div>
                        {evolution.signedBy && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Firmada
                          </span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {evolution.subjective && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">S - Subjetivo:</p>
                            <p className="text-gray-900">{evolution.subjective}</p>
                          </div>
                        )}
                        {evolution.objective && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">O - Objetivo:</p>
                            <p className="text-gray-900">{evolution.objective}</p>
                          </div>
                        )}
                        {evolution.assessment && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">A - Análisis:</p>
                            <p className="text-gray-900">{evolution.assessment}</p>
                          </div>
                        )}
                        {evolution.plan && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">P - Plan:</p>
                            <p className="text-gray-900">{evolution.plan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No hay evoluciones registradas</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
