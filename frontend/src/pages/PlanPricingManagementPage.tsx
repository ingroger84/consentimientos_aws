import { useState, useEffect } from 'react';
import { DollarSign, Globe, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

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

interface Plan {
  id: string;
  name: string;
  description: string;
}

interface Region {
  region: string;
  regionName: string;
  currency: string;
  currencySymbol: string;
}

export default function PlanPricingManagementPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [pricing, setPricing] = useState<Record<string, PlanPricing[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editedPrices, setEditedPrices] = useState<Record<string, Partial<PlanPricing>>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, regionsRes, pricingRes] = await Promise.all([
        api.get('/plans'),
        api.get('/plans/regions/available'),
        api.get('/plans/pricing/all'),
      ]);

      setPlans(plansRes.data);
      setRegions(regionsRes.data);
      setPricing(pricingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePriceChange = (planId: string, region: string, field: keyof PlanPricing, value: any) => {
    const key = `${planId}-${region}`;
    setEditedPrices(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSave = async (planId: string, region: string) => {
    const key = `${planId}-${region}`;
    const changes = editedPrices[key];

    if (!changes || Object.keys(changes).length === 0) {
      showMessage('error', 'No hay cambios para guardar');
      return;
    }

    try {
      setSaving(key);
      await api.put(`/plans/${planId}/pricing/${region}`, changes);
      
      // Actualizar el estado local
      setPricing(prev => ({
        ...prev,
        [planId]: prev[planId].map(p => 
          p.region === region ? { ...p, ...changes } : p
        ),
      }));

      // Limpiar cambios editados
      setEditedPrices(prev => {
        const newEdited = { ...prev };
        delete newEdited[key];
        return newEdited;
      });

      showMessage('success', `Precios actualizados para ${planId} en ${region}`);
    } catch (error) {
      console.error('Error saving pricing:', error);
      showMessage('error', 'Error al guardar los precios');
    } finally {
      setSaving(null);
    }
  };

  const getCurrentValue = (planId: string, region: string, field: keyof PlanPricing): any => {
    const key = `${planId}-${region}`;
    const edited = editedPrices[key]?.[field];
    
    if (edited !== undefined) {
      return edited;
    }

    const planPricing = pricing[planId]?.find(p => p.region === region);
    return planPricing?.[field] ?? '';
  };

  const hasChanges = (planId: string, region: string): boolean => {
    const key = `${planId}-${region}`;
    return editedPrices[key] && Object.keys(editedPrices[key]).length > 0;
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const locale = currency === 'COP' ? 'es-CO' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'COP' ? 0 : 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Precios Multi-Región
            </h1>
          </div>
          <p className="text-gray-600">
            Administra los precios de los planes para diferentes regiones geográficas
          </p>
        </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 shadow-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-6">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              <p className="text-primary-100 text-sm mt-1">{plan.description}</p>
            </div>

            <div className="p-6">
              <div className="grid lg:grid-cols-2 gap-5">
                {regions.map(region => {
                  const key = `${plan.id}-${region.region}`;
                  const isSaving = saving === key;
                  const hasEdits = hasChanges(plan.id, region.region);

                  return (
                    <div
                      key={region.region}
                      className={`border-2 rounded-lg p-5 transition-all ${
                        hasEdits
                          ? 'border-yellow-400 bg-yellow-50 shadow-md'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{region.regionName}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {region.currency} • {region.currencySymbol}
                          </p>
                        </div>
                        <DollarSign className="w-6 h-6 text-primary-600" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Precio Mensual
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              {region.currencySymbol}
                            </span>
                            <input
                              type="number"
                              step={region.currency === 'COP' ? '100' : '0.01'}
                              value={getCurrentValue(plan.id, region.region, 'priceMonthly')}
                              onChange={(e) =>
                                handlePriceChange(
                                  plan.id,
                                  region.region,
                                  'priceMonthly',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 font-medium">
                            {formatCurrency(
                              getCurrentValue(plan.id, region.region, 'priceMonthly'),
                              region.currency
                            )}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Precio Anual
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              {region.currencySymbol}
                            </span>
                            <input
                              type="number"
                              step={region.currency === 'COP' ? '100' : '0.01'}
                              value={getCurrentValue(plan.id, region.region, 'priceAnnual')}
                              onChange={(e) =>
                                handlePriceChange(
                                  plan.id,
                                  region.region,
                                  'priceAnnual',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1.5 font-medium">
                            {formatCurrency(
                              getCurrentValue(plan.id, region.region, 'priceAnnual'),
                              region.currency
                            )}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Tasa (%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={getCurrentValue(plan.id, region.region, 'taxRate')}
                              onChange={(e) =>
                                handlePriceChange(
                                  plan.id,
                                  region.region,
                                  'taxRate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-600 mt-1.5 font-medium">
                              {(getCurrentValue(plan.id, region.region, 'taxRate') * 100).toFixed(0)}%
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">
                              Impuesto
                            </label>
                            <input
                              type="text"
                              value={getCurrentValue(plan.id, region.region, 'taxName')}
                              onChange={(e) =>
                                handlePriceChange(
                                  plan.id,
                                  region.region,
                                  'taxName',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              placeholder="IVA"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => handleSave(plan.id, region.region)}
                          disabled={!hasEdits || isSaving}
                          className={`w-full mt-4 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                            hasEdits && !isSaving
                              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isSaving ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              {hasEdits ? 'Guardar Cambios' : 'Sin Cambios'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Información Importante
        </h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Los cambios se reflejan inmediatamente en la landing page</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Los precios se muestran automáticamente según la ubicación del usuario</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>La tasa de impuesto es informativa, no se aplica automáticamente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Los cambios no afectan a tenants existentes, solo a nuevas suscripciones</span>
          </li>
        </ul>
      </div>
      </div>
    </div>
  );
}
