import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { medicalRecordsService } from '../services/medical-records.service';
import { admissionsService } from '../services/admissions.service';
import { branchesService, Branch } from '../services/branches.service';
import { CreateMedicalRecordDto } from '../types/medical-record';
import { Client, ClientDocumentType } from '../types/client';
import ClientSearchForm from '../components/consents/ClientSearchForm';
import AdmissionTypeModal from '../components/AdmissionTypeModal';
import { useToast } from '../hooks/useToast';

export default function CreateMedicalRecordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [existingHC, setExistingHC] = useState<any>(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [clientData, setClientData] = useState({
    clientName: '',
    clientId: '',
    clientEmail: '',
    clientPhone: '',
    documentType: ClientDocumentType.CC,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMedicalRecordDto>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const branchesData = await branchesService.getAll();
      setBranches(branchesData);
    } catch (error: any) {
      toast.error('Error al cargar datos', error.response?.data?.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleClientSelected = async (client: Client | null) => {
    setSelectedClient(client);
    
    // Si se seleccionó un cliente, verificar si ya tiene HC activa
    if (client) {
      try {
        // Usar el nuevo endpoint que verifica HC activa
        const activeHC = await medicalRecordsService.getActiveByClient(client.id);
        
        if (activeHC) {
          // Cliente tiene HC activa, mostrar modal de admisión
          const hcWithAdmissions = await medicalRecordsService.getById(activeHC.id);
          setExistingHC(hcWithAdmissions);
          setShowAdmissionModal(true);
          
          toast.info(
            'Historia Clínica Existente',
            `El paciente ya tiene una HC activa (${activeHC.recordNumber}). Puede agregar una nueva admisión.`
          );
        }
      } catch (error) {
        console.error('Error al verificar HC existente:', error);
      }
    }
  };

  const handleClientDataChange = (data: {
    clientName: string;
    clientId: string;
    clientEmail: string;
    clientPhone: string;
    documentType: ClientDocumentType;
  }) => {
    setClientData(data);
  };

  const handleAdmissionTypeSelect = async (admissionType: string, reason: string) => {
    if (!existingHC) {
      console.error('No hay HC existente');
      toast.error('Error', 'No se encontró la historia clínica');
      return;
    }

    try {
      // Crear nueva admisión para la HC existente
      const admission = await admissionsService.create({
        medicalRecordId: existingHC.id,
        admissionType,
        reason,
        admissionDate: new Date().toISOString(),
      });

      // Mostrar mensaje de éxito
      toast.success('Admisión creada exitosamente', 'Redirigiendo a la historia clínica...');
      
      // Navegar INMEDIATAMENTE a la HC con la nueva admisión
      // No cerrar el modal ni limpiar estados - la navegación lo hará automáticamente
      navigate(`/medical-records/${existingHC.id}?admissionId=${admission.id}`);
      
    } catch (error: any) {
      console.error('Error al crear admisión:', error);
      toast.error('Error al crear admisión', error.response?.data?.message || error.message);
    }
  };

  const onSubmit = async (data: CreateMedicalRecordDto) => {
    // Validar que se haya seleccionado o ingresado un cliente
    if (!selectedClient && !clientData.clientName) {
      toast.error('Error', 'Debe seleccionar o crear un cliente');
      return;
    }

    // Si hay HC existente, no permitir crear nueva
    if (existingHC) {
      toast.error(
        'HC Activa Existente',
        'El paciente ya tiene una HC activa. Use el modal para agregar una nueva admisión.'
      );
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos para enviar
      const recordData: any = {
        admissionDate: data.admissionDate,
        admissionType: data.admissionType,
        branchId: data.branchId || undefined,
      };

      // Si hay un cliente seleccionado, usar su ID
      if (selectedClient) {
        recordData.clientId = selectedClient.id;
      } else {
        // Si no, enviar datos para crear nuevo cliente
        recordData.clientData = {
          fullName: clientData.clientName,
          documentType: clientData.documentType,
          documentNumber: clientData.clientId,
          email: clientData.clientEmail || undefined,
          phone: clientData.clientPhone || undefined,
        };
      }

      const record = await medicalRecordsService.create(recordData);
      toast.success('Historia clínica creada', 'La historia clínica fue creada exitosamente');
      navigate(`/medical-records/${record.id}`);
    } catch (error: any) {
      toast.error('Error al crear historia clínica', error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Historia Clínica</h1>
          <p className="text-gray-600 mt-1">
            Crear una nueva historia clínica para un paciente
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Alerta de HC Activa */}
        {existingHC && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  Historia Clínica Activa Encontrada
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  El paciente <strong>{selectedClient?.fullName}</strong> ya tiene una historia clínica activa 
                  (N° {existingHC.recordNumber}). Para continuar la atención, agregue una nueva admisión usando el modal.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(true)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar Nueva Admisión
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Búsqueda/Creación de Cliente */}
          <ClientSearchForm
            onClientSelected={handleClientSelected}
            onClientDataChange={handleClientDataChange}
          />

          {/* Sede */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sede (Opcional)
            </label>
            <select
              {...register('branchId')}
              disabled={!!existingHC}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Sin sede específica</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de admisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Admisión *
            </label>
            <input
              type="datetime-local"
              {...register('admissionDate', { required: 'La fecha es requerida' })}
              defaultValue={new Date().toISOString().slice(0, 16)}
              disabled={!!existingHC}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {errors.admissionDate && (
              <p className="mt-1 text-sm text-red-600">{errors.admissionDate.message}</p>
            )}
          </div>

          {/* Tipo de admisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Admisión *
            </label>
            <select
              {...register('admissionType', { required: 'El tipo es requerido' })}
              disabled={!!existingHC}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="consulta">Consulta</option>
              <option value="urgencia">Urgencia</option>
              <option value="hospitalizacion">Hospitalización</option>
              <option value="control">Control</option>
            </select>
            {errors.admissionType && (
              <p className="mt-1 text-sm text-red-600">{errors.admissionType.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/medical-records')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!existingHC}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear Historia Clínica'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Tipo de Admisión */}
      <AdmissionTypeModal
        isOpen={showAdmissionModal}
        onClose={() => {
          setShowAdmissionModal(false);
          // Solo limpiar estado, NO navegar
          setExistingHC(null);
          setSelectedClient(null);
        }}
        onSelect={handleAdmissionTypeSelect}
        existingHC={existingHC}
      />
    </div>
  );
}
