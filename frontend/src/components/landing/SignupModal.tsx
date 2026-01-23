import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../../services/api';

interface SignupModalProps {
  selectedPlan: any;
  onClose: () => void;
}

export default function SignupModal({ selectedPlan, onClose }: SignupModalProps) {
  const [step, setStep] = useState<'form' | 'success' | 'error'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Datos de la empresa
    companyName: '',
    slug: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    // Datos del administrador
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generar slug desde el nombre de la empresa
    if (name === 'companyName') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      setError('El nombre de la empresa es requerido');
      return false;
    }
    if (!formData.slug.trim()) {
      setError('El subdominio es requerido');
      return false;
    }
    if (!formData.contactName.trim()) {
      setError('El nombre de contacto es requerido');
      return false;
    }
    if (!formData.contactEmail.trim() || !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      setError('El email de contacto es inválido');
      return false;
    }
    if (!formData.adminName.trim()) {
      setError('El nombre del administrador es requerido');
      return false;
    }
    if (!formData.adminEmail.trim() || !/\S+@\S+\.\S+/.test(formData.adminEmail)) {
      setError('El email del administrador es inválido');
      return false;
    }
    if (formData.adminPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const price = selectedPlan.billingCycle === 'monthly' 
        ? selectedPlan.priceMonthly 
        : selectedPlan.priceAnnual;

      const tenantData = {
        name: formData.companyName,
        slug: formData.slug,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        plan: selectedPlan.id,
        planPrice: price,
        billingCycle: selectedPlan.billingCycle,
        status: selectedPlan.id === 'free' ? 'active' : 'trial',
        adminUser: {
          name: formData.adminName,
          email: formData.adminEmail,
          password: formData.adminPassword,
        },
      };

      await api.post('/tenants', tenantData);
      setStep('success');
    } catch (err: any) {
      console.error('Error creating tenant:', err);
      const errorMessage = err.response?.data?.message || 'Error al crear la cuenta. Por favor intenta nuevamente.';
      setError(errorMessage);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const price = selectedPlan.billingCycle === 'monthly' 
    ? selectedPlan.priceMonthly 
    : selectedPlan.priceAnnual;
  const monthlyPrice = selectedPlan.billingCycle === 'annual' ? price / 12 : price;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="text-gray-600">Plan: {selectedPlan.name} - {formatPrice(monthlyPrice)}/mes</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos de la Empresa */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Empresa</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Empresa *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="input"
                      placeholder="Ej: Clínica Salud Total"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subdominio *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="input flex-1"
                        placeholder="clinica-salud"
                        required
                      />
                      <span className="text-gray-600">.archivoenlinea.com</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Este será tu URL de acceso: {formData.slug || 'tu-empresa'}.archivoenlinea.com
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de Contacto *
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="input"
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de Contacto *
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        className="input"
                        placeholder="contacto@empresa.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="input"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Administrador */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos del Administrador</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleChange}
                      className="input"
                      placeholder="María González"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={formData.adminEmail}
                      onChange={handleChange}
                      className="input"
                      placeholder="admin@empresa.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este será tu usuario para iniciar sesión
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña *
                      </label>
                      <input
                        type="password"
                        name="adminPassword"
                        value={formData.adminPassword}
                        onChange={handleChange}
                        className="input"
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="password"
                        name="adminPasswordConfirm"
                        value={formData.adminPasswordConfirm}
                        onChange={handleChange}
                        className="input"
                        placeholder="Repite la contraseña"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                Al crear una cuenta, aceptas nuestros{' '}
                <a href="#" className="text-primary-600 hover:underline">Términos de Servicio</a>
                {' '}y{' '}
                <a href="#" className="text-primary-600 hover:underline">Política de Privacidad</a>
              </p>
              
              {selectedPlan.id === 'free' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">
                    <strong>Plan Gratuito:</strong> Tendrás acceso completo por 7 días. Después deberás seleccionar un plan de pago para continuar usando el sistema.
                  </p>
                </div>
              )}
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Cuenta Creada Exitosamente!
              </h3>
              <p className="text-gray-600 mb-6">
                Hemos enviado un correo de bienvenida a <strong>{formData.adminEmail}</strong> con los detalles de tu cuenta.
              </p>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Tu URL de acceso:</strong>
                </p>
                <p className="text-lg font-semibold text-primary-600">
                  {formData.slug}.archivoenlinea.com
                </p>
              </div>
              <div className="space-y-3">
                <a
                  href={`https://${formData.slug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}/login`}
                  className="btn btn-primary w-full"
                >
                  Ir a Iniciar Sesión
                </a>
                <button
                  onClick={onClose}
                  className="btn btn-secondary w-full"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Error al Crear la Cuenta
              </h3>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setStep('form');
                    setError('');
                  }}
                  className="btn btn-primary w-full"
                >
                  Intentar Nuevamente
                </button>
                <button
                  onClick={onClose}
                  className="btn btn-secondary w-full"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
