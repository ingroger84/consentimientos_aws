import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { medicalRecordsService } from '../services/medical-records.service';
import { branchesService, Branch } from '../services/branches.service';
import { CreateMedicalRecordDto } from '../types/medical-record';
import { Client, ClientDocumentType } from '../types/client';
import ClientSearchForm from '../components/consents/ClientSearchForm';
import { useToast } from '../hooks/useToast';

export default function CreateMedicalRecordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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

  const handleClientSelected = (client: Client | null) => {
    setSelectedClient(client);
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

  const onSubmit = async (data: CreateMedicalRecordDto) => {
    // Validar que se haya seleccionado o ingresado un cliente
    if (!selectedClient && !clientData.clientName) {
      toast.error('Error', 'Debe seleccionar o crear un cliente');
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Historia Clínica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
