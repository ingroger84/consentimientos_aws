import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Save, RefreshCw, AlertCircle, CheckCircle, Send } from 'lucide-react';
import api from '../services/api';

interface EmailConfigForm {
  useCustomEmail: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpFrom: string;
  smtpFromName: string;
  useEncryption: boolean;
}

export default function EmailConfigPage() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmailConfigForm>({
    defaultValues: {
      useCustomEmail: false,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpFrom: '',
      smtpFromName: 'Sistema de Consentimientos',
      useEncryption: false,
    },
  });

  const useCustomEmail = watch('useCustomEmail');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await api.get('/settings/email-config');
      if (response.data) {
        reset(response.data);
      }
    } catch (error: any) {
      console.error('Error loading email config:', error);
    }
  };

  const onSubmit = async (data: EmailConfigForm) => {
    try {
      setLoading(true);
      setMessage('');

      await api.post('/settings/email-config', data);
      
      setMessage('Configuración guardada correctamente');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setMessage('Por favor ingresa un correo electrónico para la prueba');
      return;
    }

    try {
      setTesting(true);
      setMessage('');

      await api.post('/settings/test-email', { email: testEmail });
      
      setMessage('Correo de prueba enviado correctamente. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al enviar el correo de prueba');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Mail className="w-8 h-8 mr-3 text-blue-600" />
          Configuración de Correo Electrónico
        </h1>
        <p className="text-gray-600 mt-2">
          Configura el servidor SMTP para el envío de correos electrónicos del sistema
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-100 text-red-700 border border-red-400'
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message.includes('Error') || message.includes('error') ? (
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="card mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Importante: Esta configuración solo afecta al envío de correos desde tu cuenta</h3>
            <p className="text-sm text-blue-800 mb-2">
              Los correos se enviarán desde tu servidor SMTP configurado. Los usuarios de tu cuenta recibirán correos desde tu correo personalizado.
            </p>
            <div className="mt-3 space-y-1 text-sm text-blue-800">
              <p>• <strong>Opción 1:</strong> Usar correo del sistema (predeterminado)</p>
              <p>• <strong>Opción 2:</strong> Usar tu propio servidor de correo</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Usar correo del sistema</h2>
              <p className="text-sm text-gray-600 mt-1">
                Envía correos usando la configuración del sistema (predeterminado)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('useCustomEmail')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {useCustomEmail ? 'Usar mi propio correo' : 'Usar correo del sistema'}
              </span>
            </label>
          </div>

          {!useCustomEmail && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Los correos se enviarán usando la configuración predeterminada del sistema.
                No necesitas configurar nada adicional.
              </p>
            </div>
          )}
        </div>

        {useCustomEmail && (
          <>
            <div className="card mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Usar mi propio servidor de correo</h2>
              <p className="text-sm text-gray-600 mb-6">
                Configura tu servidor SMTP para enviar correos desde tu propio dominio
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servidor SMTP *
                  </label>
                  <input
                    type="text"
                    {...register('smtpHost', { 
                      required: useCustomEmail ? 'El servidor SMTP es requerido' : false 
                    })}
                    className="input"
                    placeholder="smtp.gmail.com"
                  />
                  {errors.smtpHost && (
                    <p className="text-red-500 text-sm mt-1">{errors.smtpHost.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Ejemplo: smtp.gmail.com, smtp.office365.com
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Puerto *
                  </label>
                  <input
                    type="number"
                    {...register('smtpPort', { 
                      required: useCustomEmail ? 'El puerto es requerido' : false,
                      valueAsNumber: true 
                    })}
                    className="input"
                    placeholder="587"
                  />
                  {errors.smtpPort && (
                    <p className="text-red-500 text-sm mt-1">{errors.smtpPort.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Común: 587 (TLS), 465 (SSL), 25
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario SMTP *
                  </label>
                  <input
                    type="text"
                    {...register('smtpUser', { 
                      required: useCustomEmail ? 'El usuario es requerido' : false 
                    })}
                    className="input"
                    placeholder="tu-email@gmail.com"
                  />
                  {errors.smtpUser && (
                    <p className="text-red-500 text-sm mt-1">{errors.smtpUser.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña SMTP *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('smtpPassword', { 
                        required: useCustomEmail ? 'La contraseña es requerida' : false 
                      })}
                      className="input pr-20"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  {errors.smtpPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.smtpPassword.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Para Gmail, usa una "Contraseña de aplicación" en lugar de tu contraseña normal
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Remitente *
                  </label>
                  <input
                    type="email"
                    {...register('smtpFrom', { 
                      required: useCustomEmail ? 'El email remitente es requerido' : false 
                    })}
                    className="input"
                    placeholder="tu-email@gmail.com"
                  />
                  {errors.smtpFrom && (
                    <p className="text-red-500 text-sm mt-1">{errors.smtpFrom.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Dirección que aparecerá como remitente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Remitente *
                  </label>
                  <input
                    type="text"
                    {...register('smtpFromName', { 
                      required: useCustomEmail ? 'El nombre del remitente es requerido' : false 
                    })}
                    className="input"
                    placeholder="Mi Clínica"
                  />
                  {errors.smtpFromName && (
                    <p className="text-red-500 text-sm mt-1">{errors.smtpFromName.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Nombre que verán los destinatarios
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('useEncryption')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Usar Encriptación AES (solo para Gmail)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Para Gmail, usa "Contraseña de aplicación" en lugar de tu contraseña normal
                </p>
              </div>
            </div>

            <div className="card mb-6 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Configuración para Gmail
              </h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p>• <strong>Servidor SMTP:</strong> smtp.gmail.com</p>
                <p>• <strong>Puerto:</strong> 587 (TLS) o 465 (SSL)</p>
                <p>• <strong>Usuario:</strong> tu-email@gmail.com</p>
                <p>• <strong>Contraseña:</strong> Usa una "Contraseña de aplicación"</p>
                <p className="mt-3">
                  <strong>Cómo obtener una Contraseña de aplicación:</strong>
                </p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Ve a tu Cuenta de Google → Seguridad</li>
                  <li>Activa la "Verificación en 2 pasos"</li>
                  <li>Ve a "Contraseñas de aplicaciones"</li>
                  <li>Genera una nueva contraseña para "Correo"</li>
                  <li>Copia y pega esa contraseña aquí</li>
                </ol>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-8"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>

      {useCustomEmail && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Probar Configuración de Email</h2>
          <p className="text-sm text-gray-600 mb-4">
            Envía un correo de prueba para verificar que la configuración funciona correctamente
          </p>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="input"
                placeholder="tu-email@ejemplo.com"
              />
            </div>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testing || !testEmail}
              className="btn btn-secondary"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Prueba
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
