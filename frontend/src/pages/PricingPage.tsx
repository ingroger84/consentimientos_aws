import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  limits: {
    users: number;
    branches: number;
    consents: number;
    services: number;
    questions: number;
    storageMb: number;
  };
  features: {
    customization: boolean;
    advancedReports: boolean;
    prioritySupport: boolean;
    customDomain: boolean;
    whiteLabel: boolean;
    backup: string;
    supportResponseTime: string;
  };
  popular?: boolean;
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [requestingPlan, setRequestingPlan] = useState<string | null>(null);
  const { user } = useAuthStore();
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      console.log('Loading plans from:', `${apiUrl}/tenants/plans`);
      const response = await axios.get(`${apiUrl}/tenants/plans`);
      console.log('Plans loaded:', response.data);
      // Filtrar el plan gratuito - solo el Super Admin puede asignarlo
      const filteredPlans = response.data.filter((plan: Plan) => plan.id !== 'free');
      setPlans(filteredPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
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

  const formatStorage = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(0)} GB`;
    }
    return `${mb} MB`;
  };

  const handleRequestPlanChange = async (plan: Plan) => {
    if (!user || !user.tenant) {
      toast.error(
        'Autenticación requerida',
        'Debes estar autenticado para solicitar un cambio de plan'
      );
      return;
    }

    // Confirmar antes de enviar
    const confirmed = await confirm({
      type: 'info',
      title: '¿Solicitar cambio de plan?',
      message: `Estás a punto de solicitar el plan "${plan.name}" (${billingCycle === 'monthly' ? 'Mensual' : 'Anual'}).\n\nEl administrador revisará tu solicitud y se pondrá en contacto contigo.`,
      confirmText: 'Solicitar',
      cancelText: 'Cancelar',
    });

    if (!confirmed) return;

    setRequestingPlan(plan.id);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
      
      await axios.post(`${apiUrl}/tenants/request-plan-change`, {
        planId: plan.id,
        planName: plan.name,
        billingCycle,
        price,
        tenantId: user.tenant.id,
        tenantName: user.tenant.name,
        tenantEmail: (user.tenant as any).contactEmail || user.email,
        currentPlan: (user.tenant as any).plan || 'No especificado',
      });

      toast.success(
        '¡Solicitud enviada!',
        'El administrador revisará tu solicitud y se pondrá en contacto contigo pronto.'
      );
    } catch (error: any) {
      console.error('Error al solicitar cambio de plan:', error);
      toast.error(
        'Error al enviar la solicitud',
        error.response?.data?.message || 'Por favor, intenta nuevamente o contacta al administrador.'
      );
    } finally {
      setRequestingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Elige el plan perfecto para tu clínica, consultorio o negocio
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Ahorra 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No hay planes disponibles en este momento.
              </p>
              <button
                onClick={loadPlans}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Reintentar
              </button>
            </div>
          ) : (
            plans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            const monthlyPrice = billingCycle === 'annual' ? plan.priceAnnual / 12 : price;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-primary-600' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Más Popular
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6 h-12">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <div className="text-4xl font-bold text-gray-900">
                        Gratis
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gray-900">
                          {formatPrice(monthlyPrice)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {billingCycle === 'annual' ? 'por mes, facturado anualmente' : 'por mes'}
                        </div>
                        {billingCycle === 'annual' && (
                          <div className="text-xs text-green-600 font-medium mt-1">
                            Total: {formatPrice(price)} / año
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Usuarios</span>
                      <span className="font-semibold text-gray-900">{plan.limits.users}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Sedes</span>
                      <span className="font-semibold text-gray-900">{plan.limits.branches}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Consentimientos/mes</span>
                      <span className="font-semibold text-gray-900">{plan.limits.consents.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Servicios</span>
                      <span className="font-semibold text-gray-900">{plan.limits.services}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Almacenamiento</span>
                      <span className="font-semibold text-gray-900">{formatStorage(plan.limits.storageMb)}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <Feature included={plan.features.customization} text="Personalización" />
                    <Feature included={plan.features.advancedReports} text="Reportes avanzados" />
                    <Feature included={plan.features.prioritySupport} text="Soporte prioritario" />
                    <Feature included={plan.features.customDomain} text="Dominio personalizado" />
                    <div className="text-xs text-gray-500 mt-2">
                      Soporte: {plan.features.supportResponseTime}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleRequestPlanChange(plan)}
                    disabled={requestingPlan === plan.id}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {requestingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        {plan.id === 'free' ? 'Comenzar Gratis' : plan.id === 'custom' ? 'Contactar' : 'Solicitar Plan'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
          )}
        </div>

        {/* FAQ or Additional Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Necesitas más información?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Puedo cambiar de plan?</h3>
              <p className="text-gray-600 text-sm">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu panel de administración.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Qué incluye el soporte?</h3>
              <p className="text-gray-600 text-sm">
                Todos los planes incluyen soporte por acceso remoto o por email. Los planes superiores tienen tiempos de respuesta más rápidos.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Hay período de prueba?</h3>
              <p className="text-gray-600 text-sm">
                Sí, todos los planes de pago incluyen un tiempo de prueba gratuita, puedes preguntar y empezar a usarla.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">¿Necesitas un plan personalizado?</h3>
              <p className="text-gray-600 text-sm">
                Contáctanos para planes Empresariales con características y límites personalizados para tu organización.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ included, text }: { included: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {included ? (
        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
      )}
      <span className={`text-sm ${included ? 'text-gray-900' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
}
