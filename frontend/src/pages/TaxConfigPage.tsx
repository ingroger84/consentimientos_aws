import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, Star } from 'lucide-react';
import { taxConfigService, TaxConfig, TaxApplicationType, CreateTaxConfigDto } from '@/services/tax-config.service';

export default function TaxConfigPage() {
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxConfig | null>(null);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<CreateTaxConfigDto>({
    name: '',
    rate: 0,
    applicationType: TaxApplicationType.ADDITIONAL,
    isActive: true,
    isDefault: false,
    description: '',
  });

  useEffect(() => {
    loadTaxConfigs();
  }, []);

  const loadTaxConfigs = async () => {
    try {
      setLoading(true);
      const data = await taxConfigService.getAll();
      setTaxConfigs(data);
    } catch (error: any) {
      console.error('Error loading tax configs:', error);
      showMessage('Error al cargar las configuraciones de impuestos');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleOpenModal = (tax?: TaxConfig) => {
    if (tax) {
      setEditingTax(tax);
      setFormData({
        name: tax.name,
        rate: tax.rate,
        applicationType: tax.applicationType,
        isActive: tax.isActive,
        isDefault: tax.isDefault,
        description: tax.description || '',
      });
    } else {
      setEditingTax(null);
      setFormData({
        name: '',
        rate: 0,
        applicationType: TaxApplicationType.ADDITIONAL,
        isActive: true,
        isDefault: false,
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTax(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!formData.name.trim()) {
      showMessage('Error: El nombre es requerido');
      return;
    }

    if (formData.rate < 0 || formData.rate > 100) {
      showMessage('Error: La tasa debe estar entre 0 y 100');
      return;
    }

    try {
      if (editingTax) {
        await taxConfigService.update(editingTax.id, formData);
        showMessage('Configuración de impuesto actualizada correctamente');
      } else {
        await taxConfigService.create(formData);
        showMessage('Configuración de impuesto creada correctamente');
      }
      handleCloseModal();
      loadTaxConfigs();
    } catch (error: any) {
      console.error('Error saving tax config:', error);
      
      // Manejar error de nombre duplicado
      if (error.response?.data?.message?.includes('duplicate') || 
          error.response?.data?.message?.includes('unique constraint') ||
          error.response?.data?.message?.includes('ya existe')) {
        showMessage('Error: Ya existe un impuesto con ese nombre. Por favor usa un nombre diferente.');
      } else {
        showMessage(error.response?.data?.message || 'Error al guardar la configuración');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta configuración de impuesto?')) {
      return;
    }

    try {
      await taxConfigService.delete(id);
      showMessage('Configuración de impuesto eliminada correctamente');
      loadTaxConfigs();
    } catch (error: any) {
      console.error('Error deleting tax config:', error);
      showMessage(error.response?.data?.message || 'Error al eliminar la configuración');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await taxConfigService.setDefault(id);
      showMessage('Impuesto establecido como predeterminado');
      loadTaxConfigs();
    } catch (error: any) {
      console.error('Error setting default tax:', error);
      showMessage('Error al establecer el impuesto predeterminado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Impuestos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las configuraciones de impuestos para la facturación
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Impuesto
        </button>
      </div>

      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-100 text-red-700 border border-red-400'
            : 'bg-green-100 text-green-700 border border-green-400'
        }`}>
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Lista de Impuestos */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : taxConfigs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay configuraciones de impuestos
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu primera configuración de impuesto para comenzar
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Crear Configuración
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxConfigs.map((tax) => (
            <div
              key={tax.id}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border-l-4 ${
                tax.isDefault ? 'border-blue-500' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{tax.name}</h3>
                    {tax.isDefault && (
                      <Star className="w-5 h-5 text-blue-600 fill-current" />
                    )}
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{tax.rate}%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(tax)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!tax.isDefault && (
                    <button
                      onClick={() => handleDelete(tax.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tipo de aplicación:</span>
                  <span className="font-medium text-gray-900">
                    {taxConfigService.getApplicationTypeLabel(tax.applicationType)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tax.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tax.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {tax.description && (
                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                  {tax.description}
                </p>
              )}

              {!tax.isDefault && (
                <button
                  onClick={() => handleSetDefault(tax.id)}
                  className="w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Establecer como predeterminado
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTax ? 'Editar Impuesto' : 'Nuevo Impuesto'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: IVA 19%"
                  required
                />
              </div>

              {/* Tasa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tasa (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="19.00"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: Para IVA del 19%, ingresa 19
                </p>
              </div>

              {/* Tipo de Aplicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Aplicación *
                </label>
                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="applicationType"
                      value={TaxApplicationType.ADDITIONAL}
                      checked={formData.applicationType === TaxApplicationType.ADDITIONAL}
                      onChange={(e) => setFormData({ ...formData, applicationType: e.target.value as TaxApplicationType })}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Adicional al precio</p>
                      <p className="text-sm text-gray-600">
                        El impuesto se suma al monto base
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Ejemplo: $100.000 + 19% = $119.000
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="applicationType"
                      value={TaxApplicationType.INCLUDED}
                      checked={formData.applicationType === TaxApplicationType.INCLUDED}
                      onChange={(e) => setFormData({ ...formData, applicationType: e.target.value as TaxApplicationType })}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Incluido en el precio</p>
                      <p className="text-sm text-gray-600">
                        El monto ya incluye el impuesto
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Ejemplo: $119.000 incluye 19% de impuesto ($19.000)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Descripción del impuesto..."
                />
              </div>

              {/* Estado Activo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Activo
                </label>
              </div>

              {/* Predeterminado */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Establecer como predeterminado
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTax ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
