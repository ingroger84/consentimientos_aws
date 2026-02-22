import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdmissionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (admissionType: string, reason: string) => void;
  existingHC: any;
}

const admissionTypes = [
  { value: 'primera_vez', label: 'Primera Vez', icon: '🆕', description: 'Primera consulta del paciente' },
  { value: 'control', label: 'Control', icon: '📋', description: 'Consulta de control/seguimiento' },
  { value: 'urgencia', label: 'Urgencia', icon: '🚨', description: 'Atención de urgencia' },
  { value: 'hospitalizacion', label: 'Hospitalización', icon: '🏥', description: 'Ingreso hospitalario' },
  { value: 'cirugia', label: 'Cirugía', icon: '⚕️', description: 'Procedimiento quirúrgico' },
  { value: 'procedimiento', label: 'Procedimiento', icon: '💉', description: 'Procedimiento ambulatorio' },
  { value: 'telemedicina', label: 'Telemedicina', icon: '💻', description: 'Consulta virtual' },
  { value: 'domiciliaria', label: 'Domiciliaria', icon: '🏠', description: 'Atención domiciliaria' },
  { value: 'interconsulta', label: 'Interconsulta', icon: '👨‍⚕️', description: 'Interconsulta con especialista' },
  { value: 'otro', label: 'Otro', icon: '📝', description: 'Otro tipo de admisión' },
];

export default function AdmissionTypeModal({
  isOpen,
  onClose,
  onSelect,
  existingHC,
}: AdmissionTypeModalProps) {
  const [selectedType, setSelectedType] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetear estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setSelectedType('');
      setReason('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedType) {
      setError('Debe seleccionar un tipo de admisión');
      return;
    }
    if (!reason.trim()) {
      setError('Debe ingresar el motivo de la admisión');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    // Llamar a onSelect - el componente padre manejará todo
    await onSelect(selectedType, reason);
  };

  const handleClose = () => {
    if (isSubmitting) return; // No permitir cerrar mientras se procesa
    setSelectedType('');
    setReason('');
    setError('');
    onClose();
  };

  // Si está enviando, mostrar overlay de carga
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Creando admisión...</h3>
          <p className="text-gray-600">Redirigiendo a la historia clínica</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Paciente con Historia Clínica Existente
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Seleccione el tipo de admisión para esta consulta
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* HC Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">HC Nº:</span>
                <span className="ml-2 text-gray-900">{existingHC.recordNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Paciente:</span>
                <span className="ml-2 text-gray-900">{existingHC.client?.fullName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Documento:</span>
                <span className="ml-2 text-gray-900">{existingHC.client?.documentNumber}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Admisiones previas:</span>
                <span className="ml-2 text-gray-900">{existingHC.admissions?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Tipo de Admisión */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tipo de Admisión *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {admissionTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setSelectedType(type.value);
                    setError('');
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{type.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {type.label}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Motivo de la Admisión */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo de la Admisión *
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ej: Control post-operatorio, Consulta de seguimiento, Dolor abdominal agudo, etc."
            />
            <p className="text-xs text-gray-500 mt-1">
              Describa brevemente el motivo de esta consulta/admisión
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando...' : 'Crear Admisión'}
          </button>
        </div>
      </div>
    </div>
  );
}
