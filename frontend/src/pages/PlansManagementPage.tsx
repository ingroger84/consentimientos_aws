import { useEffect, useState } from 'react';
import { plansService, PlanConfig } from '@/services/plans.service';
import { Edit, Save, X, Users, Building2, FileText, Briefcase, HelpCircle, HardDrive, Globe } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import api from '@/services/api';

interface PlanPricing {
  id: number;
  planId: string;
  region: string;
  regionName: string;
  currency: string;
  currencySymbol: string;
  priceMonthly: number;
  priceAnnual: number;
  taxRate: number;
  taxName: string;
  isActive: boolean;
}

export default function PlansManagementPage() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [pricing, setPricing] = useState<Record<string, PlanPricing[]>>({});
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PlanConfig>>({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, regionsData, pricingData] = await Promise.all([
        plansService.getAll(),
        api.get('/plans/regions/available'),
        api.get('/plans/pricing/all'),
      ]);
      setPlans(plansData);
      setRegions(regionsData.data);
      setPricing(pricingData.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: PlanConfig) => {
    setEditingPlan(plan.id);
    setFormData(plan);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    try {
      setSaving(true);
      
      // Remover el ID del formData antes de enviar
      const { id, ...updateData } = formData;
      
      await plansService.update(editingPlan, updateData);
      await loadData();
      setEditingPlan(null);
      setFormData({});
      toast.success('¡Plan actualizado!', 'Los cambios se guardaron correctamente');
    } catch (error: any) {
      console.error('Error updating plan:', error);
      toast.error('Error al actualizar', error.response?.data?.message || 'No se pudo actualizar el plan');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const locale = currency === 'COP' ? 'es-CO' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'COP' ? 0 : 2,
    }).format(amount);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLimitChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits!,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600">Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
        <p className="text-gray-600 mt-2">
          Administra los planes de suscripción del sistema
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              💡 Precios Multi-Región
            </h3>
            <p className="text-sm text-blue-800">
              Los precios se muestran por región (COP para Colombia, USD para Estados Unidos). 
              Para <strong>modificar los precios en COP o USD</strong>, ve a{' '}
              <a href="/plan-pricing" className="font-semibold underline hover:text-blue-900">
                Administración → Precios Multi-Región
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isEditing = editingPlan === plan.id;
          const currentData = isEditing ? formData : plan;

          return (
            <div key={plan.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                    )}
                    {plan.popular && (
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          title="Guardar"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Cancelar"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={currentData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="mt-2 text-sm text-gray-600 bg-white border border-gray-300 rounded px-2 py-1 w-full"
                    rows={2}
                  />
                ) : (
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                )}
              </div>

              {/* Pricing */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Precios por Región
                </h3>
                
                {regions.length > 0 ? (
                  <div className="space-y-4">
                    {regions.map((region) => {
                      const planPricing = pricing[plan.id]?.find(p => p.region === region.region);
                      if (!planPricing) return null;

                      return (
                        <div key={region.region} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{region.regionName}</h4>
                              <p className="text-xs text-gray-600">{region.currency} ({region.currencySymbol})</p>
                            </div>
                            <a
                              href="/plan-pricing"
                              className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              Editar precios →
                            </a>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Mensual</label>
                              <p className="text-base font-bold text-gray-900">
                                {formatCurrency(planPricing.priceMonthly, planPricing.currency)}
                              </p>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Anual</label>
                              <p className="text-base font-bold text-gray-900">
                                {formatCurrency(planPricing.priceAnnual, planPricing.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <p className="text-xs text-gray-600">
                              {planPricing.taxName}: {(planPricing.taxRate * 100).toFixed(0)}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Mensual</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={currentData.priceMonthly || 0}
                          onChange={(e) => handleChange('priceMonthly', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          {plansService.formatPrice(plan.priceMonthly)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Anual</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={currentData.priceAnnual || 0}
                          onChange={(e) => handleChange('priceAnnual', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          {plansService.formatPrice(plan.priceAnnual)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Limits */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Límites de Recursos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'users', label: 'Usuarios', icon: Users },
                    { key: 'branches', label: 'Sedes', icon: Building2 },
                    { key: 'consents', label: 'Consentimientos/mes', icon: FileText },
                    { key: 'medicalRecords', label: 'Historias Clínicas/mes', icon: FileText },
                    { key: 'consentTemplates', label: 'Plantillas CN', icon: FileText },
                    { key: 'mrConsentTemplates', label: 'Plantillas HC', icon: FileText },
                    { key: 'services', label: 'Servicios', icon: Briefcase },
                    { key: 'questions', label: 'Preguntas', icon: HelpCircle },
                    { key: 'storageMb', label: 'Almacenamiento (MB)', icon: HardDrive },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">{label}</p>
                        {isEditing ? (
                          <input
                            type="number"
                            value={currentData.limits?.[key as keyof typeof currentData.limits] || 0}
                            onChange={(e) => handleLimitChange(key, parseInt(e.target.value))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            min="-1"
                            placeholder="-1 = ilimitado"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">
                            {plan.limits[key as keyof typeof plan.limits] === -1 
                              ? 'Ilimitado' 
                              : plan.limits[key as keyof typeof plan.limits]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
