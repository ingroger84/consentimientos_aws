import { useState, useEffect } from 'react';
import { Check, Zap } from 'lucide-react';
import api from '../../services/api';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  limits: {
    users: number;
    branches: number;
    consents: number;
    medicalRecords: number;
    mrConsentTemplates: number;
    consentTemplates: number;
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
    apiAccess: boolean;
    backup: string;
    supportResponseTime: string;
  };
  popular?: boolean;
}

interface PricingSectionProps {
  onSelectPlan: (plan: PricingPlan & { billingCycle: 'monthly' | 'annual' }) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans/public');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
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

  const getFeaturesList = (plan: PricingPlan) => {
    const formatLimit = (value: number, singular: string, plural: string) => {
      if (value === -1) return `${plural} ilimitados`;
      return `${value} ${value === 1 ? singular : plural}`;
    };

    const formatStorage = (mb: number) => {
      if (mb >= 1000) return `${(mb / 1000).toFixed(0)} GB`;
      return `${mb} MB`;
    };

    const features = [
      formatLimit(plan.limits.users, 'usuario', 'usuarios'),
      formatLimit(plan.limits.branches, 'sede', 'sedes'),
      formatLimit(plan.limits.consents, 'consentimiento', 'consentimientos') + '/mes',
      formatLimit(plan.limits.medicalRecords, 'historia clínica', 'historias clínicas') + '/mes',
      formatLimit(plan.limits.consentTemplates, 'plantilla CN', 'plantillas CN'),
      formatLimit(plan.limits.mrConsentTemplates, 'plantilla HC', 'plantillas HC'),
      `${formatStorage(plan.limits.storageMb)} de almacenamiento`,
      plan.features.customization && 'Personalización completa',
      plan.features.advancedReports && 'Reportes avanzados',
      plan.features.prioritySupport && 'Soporte prioritario',
      plan.features.customDomain && 'Dominio personalizado',
      plan.features.whiteLabel && 'Marca blanca',
      plan.features.apiAccess && 'Acceso a API',
      plan.features.backup !== 'none' && `Backup ${plan.features.backup === 'daily' ? 'diario' : 'semanal'}`,
      `Soporte: ${plan.features.supportResponseTime}`,
    ].filter(Boolean);

    return features;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md transition ${
              billingCycle === 'monthly'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md transition ${
              billingCycle === 'annual'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Anual
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Ahorra 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {plans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
          const monthlyPrice = billingCycle === 'annual' ? price / 12 : price;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 ${
                plan.popular
                  ? 'bg-gradient-to-br from-primary-600 to-purple-600 text-white shadow-2xl scale-105'
                  : 'bg-white border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg'
              } transition`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.popular ? 'text-primary-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {formatPrice(monthlyPrice)}
                </div>
                <div className={`text-sm ${plan.popular ? 'text-primary-100' : 'text-gray-600'}`}>
                  por mes
                </div>
                {billingCycle === 'annual' && price > 0 && (
                  <div className={`text-xs mt-1 ${plan.popular ? 'text-primary-100' : 'text-gray-500'}`}>
                    Facturado anualmente: {formatPrice(price)}
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectPlan({ ...plan, billingCycle })}
                className={`w-full py-3 rounded-lg font-semibold transition mb-6 ${
                  plan.popular
                    ? 'bg-white text-primary-600 hover:bg-gray-100'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {plan.id === 'free' ? 'Comenzar Gratis' : 'Seleccionar Plan'}
              </button>

              <ul className="space-y-3">
                {getFeaturesList(plan).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-white' : 'text-green-600'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-gray-600">
        <p className="text-sm">
          Todos los planes incluyen: Almacenamiento en la nube, Firma digital, Envío de emails, Personalización básica
        </p>
        <p className="text-sm mt-2">
          ¿Necesitas más? <a href="mailto:ventas@archivoenlinea.com" className="text-primary-600 hover:underline">Contáctanos para un plan personalizado</a>
        </p>
      </div>
    </div>
  );
}
