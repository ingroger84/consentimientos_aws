import { useState } from 'react';
import { X } from 'lucide-react';
import { medicalRecordsService } from '../../services/medical-records.service';
import { useToast } from '../../hooks/useToast';

interface AddDiagnosisModalProps {
  medicalRecordId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDiagnosisModal({ medicalRecordId, onClose, onSuccess }: AddDiagnosisModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cie10Code: '',
    cie10Description: '',
    diagnosisType: 'principal',
    isConfirmed: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cie10Code.trim() || !formData.cie10Description.trim()) {
      toast.error('El código CIE-10 y la descripción son requeridos');
      return;
    }

    try {
      setLoading(true);
      await medicalRecordsService.addDiagnosis(medicalRecordId, {
        cie10Code: formData.cie10Code,
        cie10Description: formData.cie10Description,
        diagnosisType: formData.diagnosisType as 'principal' | 'relacionado' | 'complicacion',
        isConfirmed: formData.isConfirmed,
        isPresumptive: !formData.isConfirmed,
      });
      toast.success('Diagnóstico agregado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Error al agregar diagnóstico', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Agregar Diagnóstico</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código CIE-10 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cie10Code}
              onChange={(e) => setFormData({ ...formData, cie10Code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: J00, K29.7, I10"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ingresa el código de la Clasificación Internacional de Enfermedades
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del Diagnóstico <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.cie10Description}
              onChange={(e) => setFormData({ ...formData, cie10Description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Rinofaringitis aguda (resfriado común)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Diagnóstico
            </label>
            <select
              value={formData.diagnosisType}
              onChange={(e) => setFormData({ ...formData, diagnosisType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="principal">Principal</option>
              <option value="relacionado">Relacionado</option>
              <option value="complicacion">Complicación</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isConfirmed}
                onChange={(e) => setFormData({ ...formData, isConfirmed: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Diagnóstico confirmado</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Si no está marcado, se considerará como diagnóstico presuntivo
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Diagnóstico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
