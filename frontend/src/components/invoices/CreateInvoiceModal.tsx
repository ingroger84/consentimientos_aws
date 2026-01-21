import { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle } from 'lucide-react';
import { invoicesService, InvoiceItem } from '@/services/invoices.service';
import { taxConfigService, TaxConfig } from '@/services/tax-config.service';

interface CreateInvoiceModalProps {
  tenantId: string;
  tenantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  taxExempt: boolean;
  taxExemptReason: string;
  taxConfigId: string;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
  items: InvoiceItem[];
  notes: string;
}

export default function CreateInvoiceModal({
  tenantId,
  tenantName,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    taxExempt: false,
    taxExemptReason: '',
    taxConfigId: '',
    dueDate: '',
    periodStart: '',
    periodEnd: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    notes: '',
  });

  useEffect(() => {
    loadTaxConfigs();
    setDefaultDates();
  }, []);

  const loadTaxConfigs = async () => {
    try {
      const configs = await taxConfigService.getActive();
      setTaxConfigs(configs);
      
      // Establecer el impuesto por defecto
      const defaultConfig = configs.find(c => c.isDefault);
      if (defaultConfig && !formData.taxExempt) {
        setFormData(prev => ({ ...prev, taxConfigId: defaultConfig.id }));
      }
    } catch (error) {
      console.error('Error loading tax configs:', error);
    }
  };

  const setDefaultDates = () => {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);
    
    const periodStart = new Date(now);
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    setFormData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0],
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
    }));
  };

  const calculateItemTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    if (formData.taxExempt) return 0;
    
    const subtotal = calculateSubtotal();
    const taxConfig = taxConfigs.find(c => c.id === formData.taxConfigId);
    
    if (!taxConfig) return 0;
    
    const rate = taxConfig.rate / 100;
    if (taxConfig.applicationType === 'included') {
      const baseAmount = subtotal / (1 + rate);
      return subtotal - baseAmount;
    } else {
      return subtotal * rate;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + (formData.taxExempt ? 0 : tax);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = calculateItemTotal(
        newItems[index].quantity,
        newItems[index].unitPrice
      );
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleTaxExemptChange = (exempt: boolean) => {
    setFormData({
      ...formData,
      taxExempt: exempt,
      taxExemptReason: exempt ? formData.taxExemptReason : '',
      taxConfigId: exempt ? '' : (taxConfigs.find(c => c.isDefault)?.id || ''),
    });
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (formData.taxExempt && !formData.taxExemptReason.trim()) {
      showMessage('Error: Debe proporcionar una razón para la exención de impuestos');
      return;
    }

    // Solo requerir impuesto si NO es exenta Y hay impuestos disponibles
    if (!formData.taxExempt && taxConfigs.length > 0 && !formData.taxConfigId) {
      showMessage('Error: Debe seleccionar un impuesto');
      return;
    }

    if (formData.items.some(item => !item.description.trim())) {
      showMessage('Error: Todos los items deben tener descripción');
      return;
    }

    try {
      setLoading(true);
      
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      await invoicesService.create({
        tenantId,
        taxConfigId: formData.taxExempt ? undefined : formData.taxConfigId,
        taxExempt: formData.taxExempt,
        taxExemptReason: formData.taxExempt ? formData.taxExemptReason : undefined,
        amount: subtotal,
        tax,
        total,
        dueDate: formData.dueDate,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        items: formData.items,
        notes: formData.notes,
      });

      showMessage('Factura creada exitosamente');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      showMessage(error.response?.data?.message || 'Error al crear la factura');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Factura</h2>
            <p className="text-sm text-gray-600 mt-1">Tenant: {tenantName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg flex items-start ${
            message.includes('Error') || message.includes('error')
              ? 'bg-red-100 text-red-700 border border-red-400'
              : 'bg-green-100 text-green-700 border border-green-400'
          }`}>
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tax Exempt Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Configuración de Impuestos</h3>
            
            {/* Tax Exempt Checkbox */}
            <div className="flex items-start mb-4">
              <input
                type="checkbox"
                id="taxExempt"
                checked={formData.taxExempt}
                onChange={(e) => handleTaxExemptChange(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <label htmlFor="taxExempt" className="ml-3">
                <span className="font-medium text-gray-900">Factura Exenta de Impuestos</span>
                <p className="text-sm text-gray-600">
                  Marque esta opción si la factura no debe incluir impuestos
                </p>
              </label>
            </div>

            {/* Tax Exempt Reason */}
            {formData.taxExempt && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón de Exención *
                </label>
                <textarea
                  value={formData.taxExemptReason}
                  onChange={(e) => setFormData({ ...formData, taxExemptReason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Ej: Organización sin fines de lucro - Resolución DIAN 12345"
                  required={formData.taxExempt}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Debe especificar el motivo legal de la exención de impuestos
                </p>
              </div>
            )}

            {/* Tax Selection */}
            {!formData.taxExempt && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impuesto a Aplicar {taxConfigs.length > 0 ? '*' : '(No hay impuestos configurados)'}
                </label>
                {taxConfigs.length > 0 ? (
                  <select
                    value={formData.taxConfigId}
                    onChange={(e) => setFormData({ ...formData, taxConfigId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!formData.taxExempt && taxConfigs.length > 0}
                  >
                    <option value="">Seleccione un impuesto</option>
                    {taxConfigs.map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.name} - {config.rate}% ({config.applicationType === 'included' ? 'Incluido' : 'Adicional'})
                        {config.isDefault && ' (Por defecto)'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    No hay impuestos activos configurados. La factura se creará sin impuestos.
                    <br />
                    <a href="/tax-config" className="underline font-medium">
                      Configurar impuestos
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Inicio *
              </label>
              <input
                type="date"
                value={formData.periodStart}
                onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período Fin *
              </label>
              <input
                type="date"
                value={formData.periodEnd}
                onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Items de la Factura *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Agregar Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Descripción"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Cantidad"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Precio"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      ${item.total.toLocaleString('es-CO')}
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Notas adicionales sobre la factura..."
            />
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">
                ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {formData.taxExempt ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuesto:</span>
                <span className="font-medium text-green-600">EXENTA</span>
              </div>
            ) : taxConfigs.length === 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuesto:</span>
                <span className="font-medium text-gray-600">Sin impuestos configurados</span>
              </div>
            ) : formData.taxConfigId ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {taxConfigs.find(c => c.id === formData.taxConfigId)?.name || 'Impuesto'}:
                </span>
                <span className="font-medium text-gray-900">
                  ${tax.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Impuesto:</span>
                <span className="font-medium text-gray-600">No seleccionado</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span className="text-gray-900">Total:</span>
              <span className="text-blue-600">
                ${total.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
