import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { consentService } from '@/services/consent.service';
import api from '@/services/api';
import { Service, Branch } from '@/types';
import { Client, ClientDocumentType } from '@/types/client';
import SignaturePad from '@/components/SignaturePad';
import CameraCapture from '@/components/CameraCapture';
import ClientSearchForm from '@/components/consents/ClientSearchForm';
import { ArrowLeft, Camera, User } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function CreateConsentPage() {
  const navigate = useNavigate();
  const { id: consentIdParam } = useParams<{ id: string }>();
  const isEditMode = !!consentIdParam;
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [consentId, setConsentId] = useState<string | null>(consentIdParam || null);
  const [formData, setFormData] = useState<any>({});
  const [clientPhoto, setClientPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDocumentType, setClientDocumentType] = useState<ClientDocumentType>(ClientDocumentType.CC);

  // Handlers para ClientSearchForm
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
    setFormData({
      ...formData,
      clientName: data.clientName,
      clientId: data.clientId,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
    });
    setClientDocumentType(data.documentType);
  };

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const { data: services, isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Cargando servicios...');
      const { data } = await api.get<Service[]>('/services');
      console.log('Servicios cargados:', data);
      return data;
    },
  });

  const { data: branches, isLoading: branchesLoading, error: branchesError } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      console.log('Cargando sedes...');
      const { data } = await api.get<Branch[]>('/branches');
      console.log('Sedes cargadas:', data);
      return data;
    },
  });

  // Cargar consentimiento existente si estamos en modo edición
  const { data: existingConsent, isLoading: loadingConsent } = useQuery({
    queryKey: ['consent', consentIdParam],
    queryFn: () => consentService.getById(consentIdParam!),
    enabled: isEditMode,
  });

  // Cargar datos del consentimiento existente
  useEffect(() => {
    if (existingConsent && isEditMode) {
      const service = services?.find((s) => s.id === existingConsent.service.id);
      setSelectedService(service || null);
      setClientPhoto(existingConsent.clientPhoto || null);
      
      const initialData = {
        clientName: existingConsent.clientName,
        clientId: existingConsent.clientId,
        clientEmail: existingConsent.clientEmail,
        clientPhone: existingConsent.clientPhone,
        serviceId: existingConsent.service.id,
        branchId: existingConsent.branch.id,
      };
      
      setFormData(initialData);
      reset(initialData);
    }
  }, [existingConsent, isEditMode, services, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditMode && consentId) {
        // En modo edición, actualizar el consentimiento existente
        return api.patch(`/consents/${consentId}`, data).then(res => res.data);
      } else {
        // En modo creación, crear nuevo consentimiento
        return consentService.create(data);
      }
    },
    onSuccess: (data) => {
      if (!isEditMode) {
        setConsentId(data.id);
      }
      setStep(3);
    },
    onError: (error: any) => {
      toast.error(
        isEditMode ? 'Error al actualizar consentimiento' : 'Error al crear consentimiento',
        error.response?.data?.message || error.message
      );
    },
  });

  const signMutation = useMutation({
    mutationFn: ({ id, signatureData }: { id: string; signatureData: string }) =>
      consentService.sign(id, { signatureData }),
    onSuccess: () => {
      toast.success('Consentimiento creado', '¡Consentimiento creado exitosamente!');
      navigate('/consents');
    },
    onError: (error: any) => {
      toast.error('Error al firmar consentimiento', error.response?.data?.message || error.message);
    },
  });

  // const serviceId = watch('serviceId'); // Not used currently

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = services?.find((s) => s.id === e.target.value);
    setSelectedService(service || null);
  };

  const onSubmitStep1 = (data: any) => {
    // Buscar el servicio seleccionado con sus preguntas
    const service = services?.find((s) => s.id === data.serviceId);
    setSelectedService(service || null);
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onSubmitStep2 = (data: any) => {
    const answers = selectedService?.questions?.map((q) => ({
      questionId: q.id,
      value: data[`question_${q.id}`] || '',
    })) || [];

    const completeData = {
      clientName: formData.clientName,
      clientId: formData.clientId,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientPhoto: clientPhoto || undefined,
      serviceId: formData.serviceId,
      branchId: formData.branchId,
      // Nuevos campos para gestión de clientes
      documentType: clientDocumentType,
      existingClientId: selectedClient?.id,
      answers,
    };

    console.log('=== ENVIANDO CONSENTIMIENTO ===');
    console.log('Datos completos:', {
      ...completeData,
      clientPhoto: clientPhoto ? `[FOTO: ${clientPhoto.substring(0, 50)}... (${clientPhoto.length} caracteres)]` : 'SIN FOTO'
    });
    console.log('Estado clientPhoto:', clientPhoto ? 'PRESENTE' : 'AUSENTE');
    console.log('===============================');
    
    createMutation.mutate(completeData);
  };

  const handlePhotoCapture = (photoData: string) => {
    console.log('Foto capturada, tamaño:', photoData.length, 'caracteres');
    setClientPhoto(photoData);
    setShowCamera(false);
  };

  const handleRemovePhoto = () => {
    console.log('Foto removida');
    setClientPhoto(null);
  };

  const handleSignatureSave = (dataUrl: string) => {
    if (consentId) {
      signMutation.mutate({ id: consentId, signatureData: dataUrl });
    } else {
      toast.error('Error', 'No se ha creado el consentimiento');
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate('/consents')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="max-w-3xl mx-auto">
        <div className="card">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Consentimiento' : 'Nuevo Consentimiento'}
            </h1>
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full ${
                    s <= step ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Paso {step} de 3: {step === 1 ? 'Datos del Cliente' : step === 2 ? 'Preguntas' : 'Firma'}
            </div>
          </div>

          {step === 1 && (
            <>
              {(servicesLoading || branchesLoading || (isEditMode && loadingConsent)) ? (
                <div className="text-center py-8">
                  <p>Cargando datos...</p>
                  {servicesLoading && <p className="text-sm text-gray-500">Cargando servicios...</p>}
                  {branchesLoading && <p className="text-sm text-gray-500">Cargando sedes...</p>}
                </div>
              ) : servicesError || branchesError ? (
                <div className="text-center py-8 text-red-600">
                  <p>Error al cargar datos:</p>
                  {servicesError && <p className="text-sm">Servicios: {(servicesError as any).message}</p>}
                  {branchesError && <p className="text-sm">Sedes: {(branchesError as any).message}</p>}
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 btn btn-secondary"
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicio *
                    </label>
                    <select
                      {...register('serviceId', { required: 'Debe seleccionar un servicio' })}
                      onChange={handleServiceChange}
                      className="input"
                      defaultValue={formData.serviceId || ''}
                    >
                      <option value="">Seleccionar servicio</option>
                      {services?.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} {service.questions && `(${service.questions.length} preguntas)`}
                        </option>
                      ))}
                    </select>
                    {errors.serviceId && (
                      <p className="text-red-600 text-sm mt-1">{errors.serviceId.message as string}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sede *
                    </label>
                    {branchesLoading ? (
                      <div className="input bg-gray-100">Cargando sedes...</div>
                    ) : !branches || branches.length === 0 ? (
                      <div className="text-red-600 text-sm">
                        No hay sedes disponibles. Contacte al administrador.
                      </div>
                    ) : (
                      <select
                        {...register('branchId', { required: 'Debe seleccionar una sede' })}
                        className="input"
                        defaultValue={formData.branchId || ''}
                      >
                        <option value="">Seleccionar sede</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {errors.branchId && (
                      <p className="text-red-600 text-sm mt-1">{errors.branchId.message as string}</p>
                    )}
                  </div>

                  {/* Búsqueda/Creación de Cliente */}
                  <ClientSearchForm
                    onClientSelected={handleClientSelected}
                    onClientDataChange={handleClientDataChange}
                    initialData={{
                      clientName: formData.clientName,
                      clientId: formData.clientId,
                      clientEmail: formData.clientEmail,
                      clientPhone: formData.clientPhone,
                    }}
                  />

                  {/* Photo Capture Section */}
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Foto del Cliente (Opcional)
                    </label>
                    
                    {!showCamera && !clientPhoto && (
                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="w-full btn btn-secondary flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Tomar Foto del Cliente
                      </button>
                    )}

                    {showCamera && (
                      <CameraCapture
                        onCapture={handlePhotoCapture}
                        onCancel={() => setShowCamera(false)}
                      />
                    )}

                    {clientPhoto && !showCamera && (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img
                            src={clientPhoto}
                            alt="Foto del cliente"
                            className="w-48 h-64 object-cover rounded-lg border-2 border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                            title="Eliminar foto"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="btn btn-secondary flex items-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Tomar Otra Foto
                        </button>
                      </div>
                    )}

                    <p className="text-sm text-gray-500 mt-2">
                      La foto del cliente aparecerá en el documento de consentimiento junto a la firma
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn btn-primary"
                  >
                    Continuar
                  </button>
                </form>
              )}
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Preguntas de Restricciones</h2>
              
              {!selectedService ? (
                <div className="text-center py-8 text-red-600">
                  Error: No se ha seleccionado un servicio. Por favor vuelva al paso anterior.
                  <button
                    onClick={() => setStep(1)}
                    className="mt-4 btn btn-secondary"
                  >
                    Volver
                  </button>
                </div>
              ) : selectedService.questions && selectedService.questions.length > 0 ? (
                <form onSubmit={handleSubmit(onSubmitStep2)} className="space-y-6">
                  {selectedService.questions.map((question) => (
                    <div key={question.id} className="border-b pb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.questionText}
                        {question.isRequired && <span className="text-red-600"> *</span>}
                        {question.isCritical && (
                          <span className="ml-2 text-xs text-red-600">(Pregunta crítica)</span>
                        )}
                      </label>
                      {question.type === 'YES_NO' ? (
                        <select
                          {...register(`question_${question.id}`, {
                            required: question.isRequired ? 'Esta pregunta es obligatoria' : false,
                          })}
                          className="input"
                        >
                          <option value="">Seleccionar</option>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <textarea
                          {...register(`question_${question.id}`, {
                            required: question.isRequired ? 'Esta pregunta es obligatoria' : false,
                          })}
                          className="input"
                          rows={3}
                          placeholder="Escriba su respuesta aquí..."
                        />
                      )}
                      {errors[`question_${question.id}`] && (
                        <p className="text-red-600 text-sm mt-1">
                          {(errors[`question_${question.id}`] as any)?.message}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 btn btn-secondary"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn btn-primary"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Procesando...' : 'Continuar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8 text-gray-500">
                    No hay preguntas configuradas para este servicio.
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 btn btn-secondary"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={() => {
                        // Si no hay preguntas, crear el consentimiento directamente
                        const completeData = {
                          clientName: formData.clientName,
                          clientId: formData.clientId,
                          clientEmail: formData.clientEmail,
                          clientPhone: formData.clientPhone,
                          serviceId: formData.serviceId,
                          branchId: formData.branchId,
                          // Nuevos campos para gestión de clientes
                          documentType: clientDocumentType,
                          existingClientId: selectedClient?.id,
                          answers: [],
                        };
                        createMutation.mutate(completeData);
                      }}
                      className="flex-1 btn btn-primary"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Procesando...' : 'Continuar sin preguntas'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Firma del Cliente</h2>
              <p className="text-gray-600">
                Por favor, solicite al cliente que firme en el recuadro a continuación
              </p>
              {signMutation.isPending && (
                <div className="text-center py-4 text-primary-600">
                  Procesando firma y generando PDF...
                </div>
              )}
              <SignaturePad onSave={handleSignatureSave} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
