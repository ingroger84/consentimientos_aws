import { useState, useEffect } from 'react';
import { X, Check, Info } from 'lucide-react';
import { tenantsService } from '../services/tenants';
import { plansService, PlanConfig } from '../services/plans.service';
import { Tenant, TenantStatus, TenantPlan, BillingCycle, CreateTenantDto } from '../types/tenant';

interface TenantFormModalProps {
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TenantFormModal({ tenant, onClose, onSuccess }: TenantFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [customizeLimits, setCustomizeLimits] = useState(false);
  const [formData, setFormData] = useState<CreateTenantDto>({
    name: '',
    slug: '',
    status: TenantStatus.TRIAL,
    plan: TenantPlan.FREE,
    billingCycle: BillingCycle.MONTHLY,
    billingDay: new Date().getDate() > 28 ? 28 : new Date().getDate(), // Día actual o 28 si es mayor
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    maxUsers: 2,
    maxBranches: 1,
    maxConsents: 50,
    maxServices: 3,
    maxQuestions: 5,
    storageLimitMb: 100,
    features: {
      customization: false,
      advancedReports: false,
      prioritySupport: false,
    },
    adminUser: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (tenant) {
      setFormData({
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        plan: tenant.plan,
        billingCycle: tenant.billingCycle || BillingCycle.MONTHLY,
        billingDay: tenant.billingDay || 1,
        contactName: tenant.contactName || '',
        contactEmail: tenant.contactEmail || '',
        contactPhone: tenant.contactPhone || '',
        maxUsers: tenant.maxUsers,
        maxBranches: tenant.maxBranches,
        maxConsents: tenant.maxConsents,
        maxServices: tenant.maxServices || 3,
        maxQuestions: tenant.maxQuestions || 5,
        storageLimitMb: tenant.storageLimitMb || 100,
        features: tenant.features || {
          watermark: true,
          customization: false,
          advancedReports: false,
          apiAccess: false,
          prioritySupport: false,
        },
        adminUser: {
          name: '',
          email: '',
          password: '',
        },
      });
      setBillingCycle(tenant.billingCycle || BillingCycle.MONTHLY);
      
      // Verificar si los límites están personalizados
      const plan = plansService.getPlanById(plans, tenant.plan);
      if (plan) {
        const isCustomized = 
          tenant.maxUsers !== plan.limits.users ||
          tenant.maxBranches !== plan.limits.branches ||
          tenant.maxConsents !== plan.limits.consents ||
          tenant.maxServices !== plan.limits.services ||
          tenant.maxQuestions !== plan.limits.questions ||
          tenant.storageLimitMb !== plan.limits.storageMb;
        setCustomizeLimits(isCustomized);
      }
    }
  }, [tenant, plans]);

  useEffect(() => {
    if (plans.length > 0 && formData.plan) {
      const plan = plansService.getPlanById(plans, formData.plan);
      setSelectedPlan(plan || null);
      if (plan) {
        applyPlanLimits(plan);
      }
    }
  }, [formData.plan, plans]);

  const loadPlans = async () => {
    try {
      const data = await plansService.getAll();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const applyPlanLimits = (plan: PlanConfig) => {
    // Solo aplicar límites si no están personalizados
    if (!customizeLimits) {
      setFormData(prev => ({
        ...prev,
        maxUsers: plan.limits.users,
        maxBranches: plan.limits.branches,
        maxConsents: plan.limits.consents,
        maxServices: plan.limits.services,
        maxQuestions: plan.limits.questions,
        storageLimitMb: plan.limits.storageMb,
      }));
    }
    // Siempre aplicar features del plan
    setFormData(prev => ({
      ...prev,
      features: {
        customization: plan.features.customization,
        advancedReports: plan.features.advancedReports,
        prioritySupport: plan.features.prioritySupport,
      },
    }));
  };

  const resetToBaseLimits = () => {
    if (selectedPlan) {
      setFormData(prev => ({
        ...prev,
        maxUsers: selectedPlan.limits.users,
        maxBranches: selectedPlan.limits.branches,
        maxConsents: selectedPlan.limits.consents,
        maxServices: selectedPlan.limits.services,
        maxQuestions: selectedPlan.limits.questions,
        storageLimitMb: selectedPlan.limits.storageMb,
      }));
      setCustomizeLimits(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tenant) {
        // Al editar, no enviamos adminUser
        const { adminUser, ...updateData } = formData;
        await tenantsService.update(tenant.id, updateData);
      } else {
        // Al crear, validamos que adminUser esté completo
        if (!formData.adminUser.name || !formData.adminUser.email || !formData.adminUser.password) {
          setError('Todos los campos del administrador son requeridos');
          setLoading(false);
          return;
        }
        if (formData.adminUser.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }
        await tenantsService.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error al guardar tenant:', err);
      
      // Mejorar mensajes de error
      let errorMessage = 'Error al guardar el tenant';
      
      if (err.response?.data?.message) {
        const message = err.response.data.message;
        
        // Traducir errores comunes
        if (message.includes('slug') && message.includes('uso')) {
          errorMessage = 'El slug ya está en uso. Por favor usa uno diferente.';
        } else if (message.includes('email') && message.includes('uso')) {
          errorMessage = 'El email del administrador ya está en uso. Por favor usa uno diferente.';
        } else if (message.includes('duplicate key')) {
          if (message.includes('slug') || err.response.data.message.includes('UQ_32731f181236a46182a38c992a8')) {
            errorMessage = 'El slug ya está en uso. Por favor usa uno diferente (ej: demo-2, mi-clinica, etc).';
          } else {
            errorMessage = 'Ya existe un registro con estos datos. Por favor verifica los campos únicos (slug, email).';
          }
        } else {
          errorMessage = message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      adminUser: {
        ...prev.adminUser,
        [name]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {tenant ? 'Editar Tenant' : 'Crear Nuevo Tenant'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Ej: Clínica Dental ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Ej: clinica-abc"
                  pattern="[a-z0-9-]+"
                  title="Solo letras minúsculas, números y guiones"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value={TenantStatus.TRIAL}>Prueba</option>
                  <option value={TenantStatus.ACTIVE}>Activo</option>
                  <option value={TenantStatus.SUSPENDED}>Suspendido</option>
                  <option value={TenantStatus.EXPIRED}>Expirado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Día de Corte de Facturación
                </label>
                <select
                  name="billingDay"
                  value={formData.billingDay}
                  onChange={handleChange}
                  className="input"
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Día {day} de cada mes
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Las facturas se generarán automáticamente en este día cada mes
                </p>
              </div>
            </div>
          </div>

          {/* Selección de Plan */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan de Suscripción</h3>
            
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle(BillingCycle.MONTHLY);
                    setFormData(prev => ({ ...prev, billingCycle: BillingCycle.MONTHLY }));
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    billingCycle === BillingCycle.MONTHLY
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle(BillingCycle.ANNUAL);
                    setFormData(prev => ({ ...prev, billingCycle: BillingCycle.ANNUAL }));
                  }}
                  className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                    billingCycle === BillingCycle.ANNUAL
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Anual
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    -17%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Selector */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {plans.map((plan) => {
                const price = plansService.calculatePrice(plan, billingCycle);
                const isSelected = formData.plan === plan.id;
                
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, plan: plan.id as TenantPlan }));
                    }}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        Popular
                      </span>
                    )}
                    <div className="font-semibold text-gray-900 mb-1">{plan.name}</div>
                    <div className="text-sm font-bold text-primary-600">
                      {price === 0 ? 'Gratis' : plansService.formatPrice(price)}
                    </div>
                    {price > 0 && (
                      <div className="text-xs text-gray-500">
                        {billingCycle === BillingCycle.ANNUAL ? '/año' : '/mes'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Plan Preview */}
            {selectedPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Plan {selectedPlan.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedPlan.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{selectedPlan.limits.users} usuarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{selectedPlan.limits.branches} sedes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{selectedPlan.limits.consents} consentimientos/mes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{selectedPlan.limits.services} servicios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{selectedPlan.limits.questions} preguntas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{plansService.formatStorage(selectedPlan.limits.storageMb)}</span>
                  </div>
                </div>

                {selectedPlan.id !== 'free' && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-sm font-semibold text-gray-900">
                      Precio: {plansService.formatPrice(plansService.calculatePrice(selectedPlan, billingCycle))}
                      <span className="text-gray-600 font-normal">
                        {billingCycle === BillingCycle.ANNUAL ? ' / año' : ' / mes'}
                      </span>
                    </div>
                    {billingCycle === BillingCycle.ANNUAL && (
                      <div className="text-xs text-green-600 mt-1">
                        Ahorro de {plansService.formatPrice((selectedPlan.priceMonthly * 12) - selectedPlan.priceAnnual)} al año
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Contacto
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: contacto@clinica.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="input"
                  placeholder="Ej: +57 300 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Usuario Administrador del Tenant (solo al crear) */}
          {!tenant && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">!</span>
                Usuario Administrador del Tenant
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Este usuario tendrá acceso completo al tenant y podrá gestionar usuarios, sedes, servicios y consentimientos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.adminUser.name}
                    onChange={handleAdminChange}
                    required
                    className="input"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Usuario de acceso) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.adminUser.email}
                    onChange={handleAdminChange}
                    required
                    className="input"
                    placeholder="Ej: admin@clinica.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.adminUser.password}
                    onChange={handleAdminChange}
                    required
                    minLength={6}
                    className="input"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El administrador recibirá un email con sus credenciales de acceso.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Límites del Plan */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Límites del Plan</h3>
                <p className="text-sm text-gray-600">
                  {customizeLimits 
                    ? 'Límites personalizados activos. Puedes ajustarlos según las necesidades del tenant.'
                    : 'Los límites se establecen automáticamente según el plan seleccionado.'}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={customizeLimits}
                  onChange={(e) => setCustomizeLimits(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Personalizar límites
                </span>
              </label>
            </div>

            {customizeLimits && selectedPlan && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-800 font-medium">
                      Límites base del plan {selectedPlan.name}:
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-blue-700">
                      <div>Usuarios: {selectedPlan.limits.users}</div>
                      <div>Sedes: {selectedPlan.limits.branches}</div>
                      <div>Consentimientos: {selectedPlan.limits.consents}</div>
                      <div>Servicios: {selectedPlan.limits.services}</div>
                      <div>Preguntas: {selectedPlan.limits.questions}</div>
                      <div>Storage: {selectedPlan.limits.storageMb} MB</div>
                    </div>
                    <button
                      type="button"
                      onClick={resetToBaseLimits}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Restaurar límites del plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Usuarios
                  {selectedPlan && !customizeLimits && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Plan: {selectedPlan.limits.users})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="maxUsers"
                  value={formData.maxUsers}
                  onChange={handleChange}
                  min="1"
                  max="10000"
                  disabled={!customizeLimits}
                  className={`input ${!customizeLimits ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Sedes
                  {selectedPlan && !customizeLimits && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Plan: {selectedPlan.limits.branches})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="maxBranches"
                  value={formData.maxBranches}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  disabled={!customizeLimits}
                  className={`input ${!customizeLimits ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consentimientos/mes
                  {selectedPlan && !customizeLimits && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Plan: {selectedPlan.limits.consents})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="maxConsents"
                  value={formData.maxConsents}
                  onChange={handleChange}
                  min="1"
                  max="1000000"
                  disabled={!customizeLimits}
                  className={`input ${!customizeLimits ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Servicios
                  {selectedPlan && !customizeLimits && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Plan: {selectedPlan.limits.services})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="maxServices"
                  value={formData.maxServices}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  disabled={!customizeLimits}
                  className={`input ${!customizeLimits ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Preguntas
                  {selectedPlan && !customizeLimits && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Plan: {selectedPlan.limits.questions})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="maxQuestions"
                  value={formData.maxQuestions}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  disabled={!customizeLimits}
                  className={`input ${!customizeLimits ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Almacenamiento (MB)
                  {selectedPlan && !customizeLimits && (
                    <span className="ml-1 text-xs text-gray-500">
                      (Plan: {selectedPlan.limits.storageMb})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  name="storageLimitMb"
                  value={formData.storageLimitMb}
                  onChange={handleChange}
                  min="1"
                  max="999999"
                  disabled={!customizeLimits}
                  className={`input ${!customizeLimits ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : tenant ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
