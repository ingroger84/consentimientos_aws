import { useState } from 'react';
import { X } from 'lucide-react';
import { medicalRecordsService } from '../../services/medical-records.service';
import { useToast } from '../../hooks/useToast';

interface AddAnamnesisModalProps {
  medicalRecordId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAnamnesisModal({ medicalRecordId, onClose, onSuccess }: AddAnamnesisModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    currentIllness: '',
    personalHistory: '',
    familyHistory: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.chiefComplaint.trim()) {
      toast.error('El motivo de consulta es requerido');
      return;
    }

    try {
      setLoading(true);
      
      // Construir el objeto solo con los campos que tienen valor
      const payload: any = {
        chiefComplaint: formData.chiefComplaint,
      };
      
      if (formData.currentIllness) {
        payload.currentIllness = formData.currentIllness;
      }
      
      if (formData.personalHistory) {
        payload.personalHistory = formData.personalHistory;
      }
      
      if (formData.familyHistory) {
        payload.familyHistory = formData.familyHistory;
      }
      
      await medicalRecordsService.addAnamnesis(medicalRecordId, payload);
      toast.success('Anamnesis agregada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Error al agregar anamnesis', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Agregar Anamnesis</h2>
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
              Motivo de Consulta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="¿Por qué viene el paciente?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enfermedad Actual
            </label>
            <textarea
              value={formData.currentIllness}
              onChange={(e) => setFormData({ ...formData, currentIllness: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada de la enfermedad actual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antecedentes Personales
            </label>
            <textarea
              value={formData.personalHistory}
              onChange={(e) => setFormData({ ...formData, personalHistory: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enfermedades previas, cirugías, alergias, medicamentos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antecedentes Familiares
            </label>
            <textarea
              value={formData.familyHistory}
              onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enfermedades hereditarias en la familia"
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
              {loading ? 'Guardando...' : 'Guardar Anamnesis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
