import { useState } from 'react';
import { X } from 'lucide-react';
import { medicalRecordsService } from '../../services/medical-records.service';
import { useToast } from '../../hooks/useToast';

interface AddEvolutionModalProps {
  medicalRecordId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEvolutionModal({ medicalRecordId, onClose, onSuccess }: AddEvolutionModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    evolutionDate: new Date().toISOString().slice(0, 16),
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      const payload: any = {
        evolutionDate: formData.evolutionDate,
      };
      
      if (formData.subjective) {
        payload.subjective = formData.subjective;
      }
      
      if (formData.objective) {
        payload.objective = formData.objective;
      }
      
      if (formData.assessment) {
        payload.assessment = formData.assessment;
      }
      
      if (formData.plan) {
        payload.plan = formData.plan;
      }
      
      await medicalRecordsService.addEvolution(medicalRecordId, payload);
      toast.success('Evolución agregada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Error al agregar evolución', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Agregar Evolución</h2>
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
              Fecha y Hora <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={formData.evolutionDate}
              onChange={(e) => setFormData({ ...formData, evolutionDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Formato SOAP:</strong> Subjetivo, Objetivo, Análisis, Plan
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              S - Subjetivo
            </label>
            <textarea
              value={formData.subjective}
              onChange={(e) => setFormData({ ...formData, subjective: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="¿Qué dice el paciente? Síntomas, quejas, sensaciones"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              O - Objetivo
            </label>
            <textarea
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hallazgos del examen físico, signos vitales, resultados de laboratorio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              A - Análisis
            </label>
            <textarea
              value={formData.assessment}
              onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Interpretación de los datos, diagnóstico, evaluación del progreso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              P - Plan
            </label>
            <textarea
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tratamiento, medicamentos, órdenes, seguimiento, recomendaciones"
            />
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
              {loading ? 'Guardando...' : 'Guardar Evolución'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
