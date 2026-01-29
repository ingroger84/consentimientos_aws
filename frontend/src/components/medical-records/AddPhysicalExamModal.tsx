import { useState } from 'react';
import { X } from 'lucide-react';
import { medicalRecordsService } from '../../services/medical-records.service';
import { useToast } from '../../hooks/useToast';

interface AddPhysicalExamModalProps {
  medicalRecordId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPhysicalExamModal({ medicalRecordId, onClose, onSuccess }: AddPhysicalExamModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    generalAppearance: '',
    otherFindings: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      
      // Construir vitalSigns solo con los campos que tienen valor
      const vitalSigns: Record<string, any> = {};
      if (formData.bloodPressureSystolic) vitalSigns.bloodPressureSystolic = Number(formData.bloodPressureSystolic);
      if (formData.bloodPressureDiastolic) vitalSigns.bloodPressureDiastolic = Number(formData.bloodPressureDiastolic);
      if (formData.heartRate) vitalSigns.heartRate = Number(formData.heartRate);
      if (formData.respiratoryRate) vitalSigns.respiratoryRate = Number(formData.respiratoryRate);
      if (formData.temperature) vitalSigns.temperature = Number(formData.temperature);
      if (formData.oxygenSaturation) vitalSigns.oxygenSaturation = Number(formData.oxygenSaturation);
      if (formData.weight) vitalSigns.weight = Number(formData.weight);
      if (formData.height) vitalSigns.height = Number(formData.height);
      
      const payload: any = {};
      
      if (Object.keys(vitalSigns).length > 0) {
        payload.vitalSigns = vitalSigns;
      }
      
      if (formData.generalAppearance) {
        payload.generalAppearance = formData.generalAppearance;
      }
      
      if (formData.otherFindings) {
        payload.findings = formData.otherFindings;
      }
      
      await medicalRecordsService.addPhysicalExam(medicalRecordId, payload);
      toast.success('Examen físico agregado exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Error al agregar examen físico', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Agregar Examen Físico</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Signos Vitales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presión Arterial Sistólica (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.bloodPressureSystolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureSystolic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presión Arterial Diastólica (mmHg)
                </label>
                <input
                  type="number"
                  value={formData.bloodPressureDiastolic}
                  onChange={(e) => setFormData({ ...formData, bloodPressureDiastolic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="80"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia Cardíaca (lpm)
                </label>
                <input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia Respiratoria (rpm)
                </label>
                <input
                  type="number"
                  value={formData.respiratoryRate}
                  onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="36.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Saturación de Oxígeno (%)
                </label>
                <input
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="98"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Medidas Antropométricas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="70.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="170"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apariencia General
            </label>
            <textarea
              value={formData.generalAppearance}
              onChange={(e) => setFormData({ ...formData, generalAppearance: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Estado general del paciente, nivel de conciencia, hidratación, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Otros Hallazgos
            </label>
            <textarea
              value={formData.otherFindings}
              onChange={(e) => setFormData({ ...formData, otherFindings: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Hallazgos adicionales del examen físico por sistemas"
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
              {loading ? 'Guardando...' : 'Guardar Examen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
