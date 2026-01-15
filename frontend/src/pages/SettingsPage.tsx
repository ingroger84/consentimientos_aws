import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Upload, Save, RefreshCw, Image, Palette, FileText, Building2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
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

type TabType = 'company' | 'logos' | 'colors' | 'texts';

export default function SettingsPage() {
  const { settings, refreshSettings } = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('company');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [uploadingWatermark, setUploadingWatermark] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SettingsForm>();

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
  }, [settings, reset]);

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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'footer' | 'watermark') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('La imagen no debe superar los 5MB');
      return;
    }

    try {
      if (type === 'logo') setUploadingLogo(true);
      if (type === 'footer') setUploadingFooterLogo(true);
      if (type === 'watermark') setUploadingWatermark(true);
      
      setMessage('');

      const formData = new FormData();
      formData.append('logo', file);

      const endpoint = type === 'logo' ? '/settings/logo' : 
                      type === 'footer' ? '/settings/footer-logo' : 
                      '/settings/watermark-logo';

      await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshSettings();
      setMessage(`Logo actualizado correctamente`);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al subir la imagen');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      if (type === 'footer') setUploadingFooterLogo(false);
      if (type === 'watermark') setUploadingWatermark(false);
    }
  };

  const tabs = [
    { id: 'company' as TabType, label: 'Empresa', icon: Building2 },
    { id: 'logos' as TabType, label: 'Logos', icon: Image },
    { id: 'colors' as TabType, label: 'Colores', icon: Palette },
    { id: 'texts' as TabType, label: 'Textos', icon: FileText },
  ];

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

        {activeTab === 'logos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo Principal</h2>
              
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
                Aparece en el header del PDF
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo del Footer</h2>
              
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
                Aparece en el footer del PDF
              </p>
            </div>

            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Marca de Agua</h2>
              
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
                Aparece centrada en el fondo del PDF
              </p>
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
      </form>

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
