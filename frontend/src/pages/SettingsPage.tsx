import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Upload, Save, RefreshCw, Image, Palette, FileText, Building2, Mail, Send, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { getResourceUrl } from '@/utils/api-url';
import api from '../services/api';

interface SettingsForm {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  linkColor: string;
  borderColor: string;
  logoSize: number;
  logoPosition: 'left' | 'center' | 'right';
  watermarkOpacity: number;
  footerText: string;
  procedureTitle: string;
  dataTreatmentTitle: string;
  imageRightsTitle: string;
}

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

type TabType = 'company' | 'logos-cn' | 'logos-hc' | 'colors' | 'texts' | 'email';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { settings, refreshSettings } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [uploadingWatermark, setUploadingWatermark] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHCLogo, setUploadingHCLogo] = useState(false);
  const [uploadingHCFooterLogo, setUploadingHCFooterLogo] = useState(false);
  const [uploadingHCWatermark, setUploadingHCWatermark] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const hcLogoInputRef = useRef<HTMLInputElement>(null);
  const hcFooterLogoInputRef = useRef<HTMLInputElement>(null);
  const hcWatermarkInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SettingsForm>();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    reset: resetEmail,
    watch: watchEmail,
    formState: { errors: errorsEmail },
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

  const useCustomEmail = watchEmail('useCustomEmail');

  useEffect(() => {
    if (settings) {
      reset({
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        companyWebsite: settings.companyWebsite || '',
        primaryColor: settings.primaryColor || '#3B82F6',
        secondaryColor: settings.secondaryColor || '#10B981',
        accentColor: settings.accentColor || '#F59E0B',
        textColor: settings.textColor || '#1F2937',
        linkColor: settings.linkColor || '#3B82F6',
        borderColor: settings.borderColor || '#D1D5DB',
        logoSize: settings.logoSize || 60,
        logoPosition: settings.logoPosition || 'left',
        watermarkOpacity: settings.watermarkOpacity || 0.1,
        footerText: settings.footerText || '',
        procedureTitle: settings.procedureTitle || 'CONSENTIMIENTO DEL PROCEDIMIENTO',
        dataTreatmentTitle: settings.dataTreatmentTitle || 'CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES',
        imageRightsTitle: settings.imageRightsTitle || 'CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES',
      });
    }
    loadEmailConfig();
  }, [settings, reset]);

  const loadEmailConfig = async () => {
    if (!user?.tenant) return;
    
    try {
      const response = await api.get('/settings/email-config');
      if (response.data) {
        resetEmail(response.data);
      }
    } catch (error: any) {
      console.error('Error loading email config:', error);
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      setLoading(true);
      setMessage('');

      await api.patch('/settings', data);
      await refreshSettings();
      
      setMessage('Configuración guardada correctamente');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'footer' | 'watermark' | 'favicon' | 'hc-logo' | 'hc-footer' | 'hc-watermark') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validación específica para favicon
    if (type === 'favicon') {
      const validExtensions = ['ico', 'png', 'svg'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        setMessage('Por favor selecciona un archivo .ico, .png o .svg para el favicon');
        return;
      }

      if (file.size > 1 * 1024 * 1024) {
        setMessage('El favicon no debe superar 1MB');
        return;
      }
    } else {
      if (!file.type.startsWith('image/')) {
        setMessage('Por favor selecciona una imagen válida');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setMessage('La imagen no debe superar los 5MB');
        return;
      }
    }

    try {
      if (type === 'logo') setUploadingLogo(true);
      if (type === 'footer') setUploadingFooterLogo(true);
      if (type === 'watermark') setUploadingWatermark(true);
      if (type === 'favicon') setUploadingFavicon(true);
      if (type === 'hc-logo') setUploadingHCLogo(true);
      if (type === 'hc-footer') setUploadingHCFooterLogo(true);
      if (type === 'hc-watermark') setUploadingHCWatermark(true);
      
      setMessage('');

      const formData = new FormData();
      const fieldName = type === 'favicon' ? 'favicon' : 'logo';
      formData.append(fieldName, file);

      const endpoint = type === 'logo' ? '/settings/logo' : 
                      type === 'footer' ? '/settings/footer-logo' : 
                      type === 'watermark' ? '/settings/watermark-logo' :
                      type === 'favicon' ? '/settings/favicon' :
                      type === 'hc-logo' ? '/settings/hc-logo' :
                      type === 'hc-footer' ? '/settings/hc-footer-logo' :
                      '/settings/hc-watermark-logo';

      await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshSettings();
      
      const label = type === 'logo' ? 'Logo' :
                   type === 'footer' ? 'Logo del footer' :
                   type === 'watermark' ? 'Marca de agua' :
                   type === 'favicon' ? 'Favicon' :
                   type === 'hc-logo' ? 'Logo HC' :
                   type === 'hc-footer' ? 'Logo del footer HC' :
                   'Marca de agua HC';
      
      setMessage(`${label} actualizado correctamente`);
      
      // Si es favicon, actualizar el favicon del navegador
      if (type === 'favicon') {
        await refreshSettings();
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al subir la imagen');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'footer') setUploadingFooterLogo(false);
      if (type === 'watermark') setUploadingWatermark(false);
      if (type === 'favicon') setUploadingFavicon(false);
      if (type === 'hc-logo') setUploadingHCLogo(false);
      if (type === 'hc-footer') setUploadingHCFooterLogo(false);
      if (type === 'hc-watermark') setUploadingHCWatermark(false);
    }
  };

  const onSubmitEmail = async (data: EmailConfigForm) => {
    try {
      setLoading(true);
      setMessage('');

      await api.post('/settings/email-config', data);
      
      setMessage('Configuración de correo guardada correctamente');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al guardar la configuración de correo');
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

  const tabs = [
    { id: 'company' as TabType, label: 'Empresa', icon: Building2 },
    { id: 'logos-cn' as TabType, label: 'Logos CN', icon: Image },
    { id: 'logos-hc' as TabType, label: 'Logos HC', icon: Image },
    { id: 'colors' as TabType, label: 'Colores', icon: Palette },
    { id: 'texts' as TabType, label: 'Textos', icon: FileText },
  ];

  // Agregar pestaña de Correo solo para usuarios de tenant con permiso
  if (user?.tenant) {
    tabs.push({ id: 'email' as TabType, label: 'Correo', icon: Mail });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración Avanzada</h1>
        <p className="text-gray-600 mt-2">
          Personaliza completamente la apariencia de tus PDFs y la aplicación
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-100 text-red-700 border border-red-400'
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab === 'company' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Empresa</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    {...register('companyName', { required: 'El nombre es requerido' })}
                    className="input"
                    placeholder="Sistema de Consentimientos"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    {...register('companyAddress')}
                    className="input"
                    placeholder="Calle 123 #45-67, Ciudad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    {...register('companyPhone')}
                    className="input"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register('companyEmail')}
                    className="input"
                    placeholder="contacto@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="text"
                    {...register('companyWebsite')}
                    className="input"
                    placeholder="www.empresa.com"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración de Logo</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño del Logo (px)
                  </label>
                  <input
                    type="number"
                    {...register('logoSize', { min: 30, max: 150, valueAsNumber: true })}
                    className="input"
                    placeholder="60"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Tamaño del logo en el header del PDF (30-150px)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición del Logo
                  </label>
                  <select {...register('logoPosition')} className="input">
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opacidad de Marca de Agua
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    {...register('watermarkOpacity', { min: 0, max: 1, valueAsNumber: true })}
                    className="input"
                    placeholder="0.1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Opacidad de la marca de agua (0.0 - 1.0)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logos-cn' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo Principal CN</h2>
              
              <div className="mb-4">
                {settings.logoUrl ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <img
                      src={getResourceUrl(settings.logoUrl)}
                      alt="Logo principal"
                      className="max-h-32 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p>No hay logo</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'logo')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="btn btn-primary w-full"
              >
                {uploadingLogo ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Logo
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-2">
                Aparece en el header del PDF de consentimientos tradicionales
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo del Footer CN</h2>
              
              <div className="mb-4">
                {settings.footerLogoUrl ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <img
                      src={getResourceUrl(settings.footerLogoUrl)}
                      alt="Logo del footer"
                      className="max-h-32 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p>No hay logo</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={footerLogoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'footer')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => footerLogoInputRef.current?.click()}
                disabled={uploadingFooterLogo}
                className="btn btn-primary w-full"
              >
                {uploadingFooterLogo ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Logo
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-2">
                Aparece en el footer del PDF de consentimientos tradicionales
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Marca de Agua CN</h2>
              
              <div className="mb-4">
                {settings.watermarkLogoUrl ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <img
                      src={getResourceUrl(settings.watermarkLogoUrl)}
                      alt="Marca de agua"
                      className="max-h-32 object-contain opacity-30"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p>No hay marca de agua</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={watermarkInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleLogoUpload(e, 'watermark')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => watermarkInputRef.current?.click()}
                disabled={uploadingWatermark}
                className="btn btn-primary w-full"
              >
                {uploadingWatermark ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Marca de Agua
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-2">
                Aparece centrada en el fondo del PDF de consentimientos tradicionales
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Favicon</h2>
              
              <div className="mb-4">
                {settings.faviconUrl ? (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <img
                      src={getResourceUrl(settings.faviconUrl)}
                      alt="Favicon"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p>No hay favicon</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.svg"
                onChange={(e) => handleLogoUpload(e, 'favicon')}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => faviconInputRef.current?.click()}
                disabled={uploadingFavicon}
                className="btn btn-primary w-full"
              >
                {uploadingFavicon ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Favicon
                  </>
                )}
              </button>

              <p className="text-sm text-gray-500 mt-2">
                Aparece en la pestaña del navegador (.ico, .png, .svg)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'logos-hc' && (
          <div className="space-y-6">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Logos para Historias Clínicas</h3>
                  <p className="text-sm text-blue-800">
                    Estos logos se usarán exclusivamente en los PDFs generados desde el módulo de Historias Clínicas.
                    Si no configuras logos HC, se usarán automáticamente los logos CN como respaldo.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo Principal HC</h2>
                
                <div className="mb-4">
                  {settings.hcLogoUrl ? (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                      <img
                        src={getResourceUrl(settings.hcLogoUrl)}
                        alt="Logo principal HC"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">No configurado</p>
                        <p className="text-xs mt-1">Usando logo CN</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={hcLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'hc-logo')}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => hcLogoInputRef.current?.click()}
                  disabled={uploadingHCLogo}
                  className="btn btn-primary w-full"
                >
                  {uploadingHCLogo ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo HC
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 mt-2">
                  Aparece en el header del PDF de historias clínicas
                </p>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo del Footer HC</h2>
                
                <div className="mb-4">
                  {settings.hcFooterLogoUrl ? (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                      <img
                        src={getResourceUrl(settings.hcFooterLogoUrl)}
                        alt="Logo del footer HC"
                        className="max-h-32 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">No configurado</p>
                        <p className="text-xs mt-1">Usando logo CN</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={hcFooterLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'hc-footer')}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => hcFooterLogoInputRef.current?.click()}
                  disabled={uploadingHCFooterLogo}
                  className="btn btn-primary w-full"
                >
                  {uploadingHCFooterLogo ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo Footer HC
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 mt-2">
                  Aparece en el footer del PDF de historias clínicas
                </p>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Marca de Agua HC</h2>
                
                <div className="mb-4">
                  {settings.hcWatermarkLogoUrl ? (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
                      <img
                        src={getResourceUrl(settings.hcWatermarkLogoUrl)}
                        alt="Marca de agua HC"
                        className="max-h-32 object-contain opacity-30"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <div className="text-center text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">No configurado</p>
                        <p className="text-xs mt-1">Usando marca de agua CN</p>
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={hcWatermarkInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'hc-watermark')}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => hcWatermarkInputRef.current?.click()}
                  disabled={uploadingHCWatermark}
                  className="btn btn-primary w-full"
                >
                  {uploadingHCWatermark ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Marca de Agua HC
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-500 mt-2">
                  Aparece centrada en el fondo del PDF de historias clínicas
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Colores Principales</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Primario
                  </label>
                  <Controller
                    name="primaryColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="input flex-1"
                          placeholder="#3B82F6"
                        />
                      </div>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Color del header en PDFs
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Secundario
                  </label>
                  <Controller
                    name="secondaryColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="input flex-1"
                          placeholder="#10B981"
                        />
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de Acento
                  </label>
                  <Controller
                    name="accentColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="input flex-1"
                          placeholder="#F59E0B"
                        />
                      </div>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Color para títulos de secciones en PDFs
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Colores Adicionales</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de Texto
                  </label>
                  <Controller
                    name="textColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="input flex-1"
                          placeholder="#1F2937"
                        />
                      </div>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Color del texto principal en PDFs
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de Enlaces
                  </label>
                  <Controller
                    name="linkColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="input flex-1"
                          placeholder="#3B82F6"
                        />
                      </div>
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de Bordes
                  </label>
                  <Controller
                    name="borderColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="input flex-1"
                          placeholder="#D1D5DB"
                        />
                      </div>
                    )}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Color de líneas y bordes en PDFs
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'texts' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Títulos de Secciones del PDF</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Consentimiento del Procedimiento
                  </label>
                  <input
                    type="text"
                    {...register('procedureTitle')}
                    className="input"
                    placeholder="CONSENTIMIENTO DEL PROCEDIMIENTO"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del Tratamiento de Datos
                  </label>
                  <input
                    type="text"
                    {...register('dataTreatmentTitle')}
                    className="input"
                    placeholder="CONSENTIMIENTO PARA TRATAMIENTO DE DATOS PERSONALES"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de Derechos de Imagen
                  </label>
                  <input
                    type="text"
                    {...register('imageRightsTitle')}
                    className="input"
                    placeholder="CONSENTIMIENTO EXPRESO PARA UTILIZACIÓN DE IMÁGENES PERSONALES"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto del Footer
                  </label>
                  <textarea
                    {...register('footerText')}
                    className="input"
                    rows={3}
                    placeholder="Texto personalizado que aparecerá en el footer de cada página del PDF"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Este texto aparecerá en la parte inferior de cada página del PDF
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && user?.tenant && (
          <div className="space-y-6">
            <div className="card bg-blue-50 border-blue-200">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Configuración de Correo Electrónico</h3>
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

            <div className="card">
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
                    {...registerEmail('useCustomEmail')}
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
                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuración SMTP</h2>
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
                        {...registerEmail('smtpHost', { 
                          required: useCustomEmail ? 'El servidor SMTP es requerido' : false 
                        })}
                        className="input"
                        placeholder="smtp.gmail.com"
                      />
                      {errorsEmail.smtpHost && (
                        <p className="text-red-500 text-sm mt-1">{errorsEmail.smtpHost.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puerto *
                      </label>
                      <input
                        type="number"
                        {...registerEmail('smtpPort', { 
                          required: useCustomEmail ? 'El puerto es requerido' : false,
                          valueAsNumber: true 
                        })}
                        className="input"
                        placeholder="587"
                      />
                      {errorsEmail.smtpPort && (
                        <p className="text-red-500 text-sm mt-1">{errorsEmail.smtpPort.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario SMTP *
                      </label>
                      <input
                        type="text"
                        {...registerEmail('smtpUser', { 
                          required: useCustomEmail ? 'El usuario es requerido' : false 
                        })}
                        className="input"
                        placeholder="tu-email@gmail.com"
                      />
                      {errorsEmail.smtpUser && (
                        <p className="text-red-500 text-sm mt-1">{errorsEmail.smtpUser.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña SMTP *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...registerEmail('smtpPassword', { 
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
                      {errorsEmail.smtpPassword && (
                        <p className="text-red-500 text-sm mt-1">{errorsEmail.smtpPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Remitente *
                      </label>
                      <input
                        type="email"
                        {...registerEmail('smtpFrom', { 
                          required: useCustomEmail ? 'El email remitente es requerido' : false 
                        })}
                        className="input"
                        placeholder="tu-email@gmail.com"
                      />
                      {errorsEmail.smtpFrom && (
                        <p className="text-red-500 text-sm mt-1">{errorsEmail.smtpFrom.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Remitente *
                      </label>
                      <input
                        type="text"
                        {...registerEmail('smtpFromName', { 
                          required: useCustomEmail ? 'El nombre del remitente es requerido' : false 
                        })}
                        className="input"
                        placeholder="Mi Clínica"
                      />
                      {errorsEmail.smtpFromName && (
                        <p className="text-red-500 text-sm mt-1">{errorsEmail.smtpFromName.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card bg-yellow-50 border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-3 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Configuración para Gmail
                  </h3>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p>• <strong>Servidor SMTP:</strong> smtp.gmail.com</p>
                    <p>• <strong>Puerto:</strong> 587 (TLS) o 465 (SSL)</p>
                    <p>• <strong>Usuario:</strong> tu-email@gmail.com</p>
                    <p>• <strong>Contraseña:</strong> Usa una "Contraseña de aplicación"</p>
                  </div>
                </div>

                <div className="card">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Probar Configuración</h2>
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
              </>
            )}
          </div>
        )}

        {activeTab !== 'email' && (
          <div className="mt-6 flex justify-end">
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
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {activeTab === 'email' && (
        <form onSubmit={handleSubmitEmail(onSubmitEmail)}>
          <div className="mt-6 flex justify-end">
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
      )}

      <div className="card mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vista Previa de Colores</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Primario</p>
            <div
              className="h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {settings.primaryColor}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Secundario</p>
            <div
              className="h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
              style={{ backgroundColor: settings.secondaryColor }}
            >
              {settings.secondaryColor}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Acento</p>
            <div
              className="h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
              style={{ backgroundColor: settings.accentColor }}
            >
              {settings.accentColor}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Texto</p>
            <div
              className="h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
              style={{ backgroundColor: settings.textColor }}
            >
              {settings.textColor}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Enlaces</p>
            <div
              className="h-16 rounded-lg flex items-center justify-center text-white font-medium text-xs"
              style={{ backgroundColor: settings.linkColor }}
            >
              {settings.linkColor}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Bordes</p>
            <div
              className="h-16 rounded-lg flex items-center justify-center font-medium text-xs"
              style={{ backgroundColor: settings.borderColor, color: '#1F2937' }}
            >
              {settings.borderColor}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Los cambios se aplicarán en los próximos PDFs generados
        </p>
      </div>
    </div>
  );
}
