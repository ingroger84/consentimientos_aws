import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { getPlanName } from '@/utils/plan-names';
import api from '@/services/api';
import {
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  Building2,
  Briefcase,
  FileText,
  HelpCircle,
  HardDrive,
} from 'lucide-react';

interface ResourceUsage {
  current: number;
  max: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
  unit?: string;
}

interface PlanUsage {
  plan: {
    id: string;
    name: string;
    billingCycle: string;
    status: string;
    trialEndsAt?: string;
    subscriptionEndsAt?: string;
  };
  resources: {
    users: ResourceUsage;
    branches: ResourceUsage;
    services: ResourceUsage;
    consents: ResourceUsage;
    medicalRecords: ResourceUsage;
    consentTemplates: ResourceUsage;
    mrConsentTemplates: ResourceUsage;
    questions: ResourceUsage;
    storage: ResourceUsage;
  };
  alerts: Array<{
    type: 'warning' | 'critical';
    resource: string;
    message: string;
  }>;
}

const MyPlanPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const tenantId = user?.tenant?.id;
      if (!tenantId) {
        console.error('No tenant ID found', user);
        setLoading(false);
        return;
      }
      console.log('Loading usage for tenant:', tenantId);
      const response = await api.get(`/tenants/${tenantId}/usage`);
      console.log('Usage data received:', response.data);
      setUsage(response.data);
    } catch (error: any) {
      console.error('Error loading usage:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('es-CO');
  };

  const getResourceIcon = (resource: string) => {
    const iconClass = "w-6 h-6";
    switch (resource) {
      case 'users':
        return <Users className={iconClass} />;
      case 'branches':
        return <Building2 className={iconClass} />;
      case 'services':
        return <Briefcase className={iconClass} />;
      case 'consents':
        return <FileText className={iconClass} />;
      case 'medicalRecords':
        return <FileText className={iconClass} />;
      case 'consentTemplates':
        return <FileText className={iconClass} />;
      case 'mrConsentTemplates':
        return <FileText className={iconClass} />;
      case 'questions':
        return <HelpCircle className={iconClass} />;
      case 'storage':
        return <HardDrive className={iconClass} />;
      default:
        return <TrendingUp className={iconClass} />;
    }
  };

  const getResourceLabel = (resource: string): string => {
    const labels: Record<string, string> = {
      users: 'Usuarios',
      branches: 'Sedes',
      services: 'Servicios Médicos',
      consents: 'Consentimientos (CN)',
      medicalRecords: 'Historias Clínicas (HC)',
      consentTemplates: 'Plantillas CN',
      mrConsentTemplates: 'Plantillas HC',
      questions: 'Preguntas Personalizadas',
      storage: 'Almacenamiento',
    };
    return labels[resource] || resource;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600">Cargando información del plan...</p>
      </div>
    );
  }

  if (!user?.tenant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Esta página solo está disponible para usuarios de tenants. 
          Si eres Super Admin, no tienes un plan asignado.
        </p>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          No se pudo cargar la información del plan. Por favor, verifica que tu tenant tenga un plan asignado.
        </p>
        <button
          onClick={loadUsage}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Plan</h1>
        <p className="text-gray-600 mt-2">
          Información sobre tu plan actual y uso de recursos
        </p>
      </div>

      {/* Alertas */}
      {usage.alerts.length > 0 && (
        <div className="space-y-2">
          {usage.alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                alert.type === 'critical'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}
            >
              {alert.type === 'critical' ? (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={
                  alert.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                }
              >
                {alert.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Plan Actual */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Plan {getPlanName(usage.plan.id)}
            </h2>
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  usage.plan.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {usage.plan.status === 'active' ? 'Activo' : usage.plan.status}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {usage.plan.billingCycle === 'annual' ? 'Anual' : 'Mensual'}
              </span>
            </div>
            {usage.plan.trialEndsAt && (
              <p className="text-sm text-gray-600 mt-2">
                Período de prueba hasta:{' '}
                {new Date(usage.plan.trialEndsAt).toLocaleDateString('es-CO')}
              </p>
            )}
            {usage.plan.subscriptionEndsAt && (
              <p className="text-sm text-gray-600 mt-2">
                Renovación:{' '}
                {new Date(usage.plan.subscriptionEndsAt).toLocaleDateString('es-CO')}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Actualizar Plan
          </button>
        </div>
      </div>

      {/* Uso de Recursos */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Uso de Recursos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(usage.resources).map(([key, resource]) => (
            <div key={key} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-blue-600 text-3xl">{getResourceIcon(key)}</div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {getResourceLabel(key)}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatNumber(resource.current)}
                      <span className="text-lg text-gray-400 font-normal"> / {formatNumber(resource.max)}</span>
                      {resource.unit && <span className="text-sm text-gray-500 font-normal ml-1">{resource.unit}</span>}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-bold ${getStatusColor(
                    resource.status
                  )}`}
                >
                  {resource.percentage}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(
                      resource.percentage
                    )}`}
                    style={{ width: `${Math.min(resource.percentage, 100)}%` }}
                  />
                </div>
                {resource.percentage >= 80 && (
                  <p className={`text-xs font-medium ${
                    resource.percentage >= 100 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {resource.percentage >= 100 
                      ? '⚠️ Límite alcanzado - No puedes crear más' 
                      : '⚠️ Cerca del límite - Considera actualizar tu plan'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPlanPage;
