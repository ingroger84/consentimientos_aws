import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Calendar, X, Info } from 'lucide-react';
import { Tenant } from '@/types/tenant';

const BillingCycleReminderBanner: React.FC = () => {
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);

  if (!user?.tenant || dismissed) {
    return null;
  }

  // Cast tenant to full Tenant type (el backend devuelve el tenant completo)
  const tenant = user.tenant as unknown as Tenant;

  // No mostrar para planes gratuitos
  if (tenant.plan === 'free') {
    return null;
  }

  // No mostrar si está en período de prueba
  if (tenant.trialEndsAt && new Date(tenant.trialEndsAt) > new Date()) {
    return null;
  }

  const billingDay = tenant.billingDay || 1;
  const now = new Date();
  const currentDay = now.getDate();

  // Calcular días hasta la fecha de corte
  let daysUntilBilling = billingDay - currentDay;
  
  // Si ya pasó el día de facturación este mes, calcular para el próximo mes
  if (daysUntilBilling < 0) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
    const diffTime = nextMonth.getTime() - now.getTime();
    daysUntilBilling = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Solo mostrar si faltan 5 días o menos para la fecha de corte
  if (daysUntilBilling > 5 || daysUntilBilling < 0) {
    return null;
  }

  // Calcular la fecha de corte
  let billingDate: Date;
  if (billingDay > currentDay) {
    billingDate = new Date(now.getFullYear(), now.getMonth(), billingDay);
  } else {
    billingDate = new Date(now.getFullYear(), now.getMonth() + 1, billingDay);
  }

  // Calcular fecha de vencimiento (3 días después de la fecha de corte)
  const dueDate = new Date(billingDate);
  dueDate.setDate(dueDate.getDate() + 3);

  // Obtener precio del plan
  const getPlanPrice = () => {
    // Debug: Log tenant data
    console.log('🔍 Banner Debug - Tenant data:', {
      plan: tenant.plan,
      billingCycle: tenant.billingCycle,
      useCustomPrice: tenant.useCustomPrice,
      customPriceMonthly: tenant.customPriceMonthly,
      customPriceAnnual: tenant.customPriceAnnual,
    });

    // Si el tenant tiene precios personalizados, usarlos
    if (tenant.useCustomPrice) {
      if (tenant.billingCycle === 'annual' && tenant.customPriceAnnual) {
        console.log('✅ Usando precio anual personalizado:', tenant.customPriceAnnual);
        return tenant.customPriceAnnual;
      } else if (tenant.billingCycle === 'monthly' && tenant.customPriceMonthly) {
        console.log('✅ Usando precio mensual personalizado:', tenant.customPriceMonthly);
        return tenant.customPriceMonthly;
      }
    }

    // Si no tiene precios personalizados, usar los precios estándar del plan
    const standardPrices: { [key: string]: { monthly: number; annual: number } } = {
      basic: { monthly: 89900, annual: 899000 },
      professional: { monthly: 119900, annual: 1199000 },
      enterprise: { monthly: 179900, annual: 1799000 },
    };

    const planPrices = standardPrices[tenant.plan];
    if (!planPrices) {
      console.warn('⚠️ Plan no encontrado en standardPrices:', tenant.plan);
      return 0;
    }

    // Retornar precio según ciclo de facturación (default: monthly)
    const cycle = tenant.billingCycle || 'monthly';
    const price = cycle === 'annual' ? planPrices.annual : planPrices.monthly;
    console.log(`✅ Usando precio estándar ${cycle}:`, price);
    return price;
  };

  const price = getPlanPrice();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 mb-6 shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-blue-900">
                📅 Próxima Fecha de Corte
              </h3>
              <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                {daysUntilBilling} {daysUntilBilling === 1 ? 'día' : 'días'} restantes
              </span>
            </div>
            <p className="text-blue-800 mt-1">
              Tu factura se generará el{' '}
              <strong>
                {billingDate.toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </strong>
              {' '}por un monto de{' '}
              <strong className="text-blue-900">{formatCurrency(price)}</strong>.
              {' '}Tendrás <strong className="text-blue-900">3 días</strong> para realizar el pago (hasta el{' '}
              <strong>
                {dueDate.toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                })}
              </strong>
              ).
            </p>
            <div className="flex items-start gap-2 mt-3 p-3 bg-blue-100 rounded-lg">
              <Info className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> Después de generada la factura, tu servicio estará condicionado por 3 días.
                Si no pagas dentro de este período, tu cuenta será suspendida automáticamente.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BillingCycleReminderBanner;
