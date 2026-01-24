import { useState, useEffect } from 'react';
import { Search, UserPlus, User, Check, X } from 'lucide-react';
import { clientService } from '../../services/client.service';
import { Client, ClientDocumentType, DOCUMENT_TYPE_LABELS } from '../../types/client';
import { useDebounce } from '../../hooks/useDebounce';

interface ClientSearchFormProps {
  onClientSelected: (client: Client | null) => void;
  onClientDataChange: (data: {
    clientName: string;
    clientId: string;
    clientEmail: string;
    clientPhone: string;
    documentType: ClientDocumentType;
  }) => void;
  initialData?: {
    clientName?: string;
    clientId?: string;
    clientEmail?: string;
    clientPhone?: string;
  };
}

export default function ClientSearchForm({
  onClientSelected,
  onClientDataChange,
  initialData,
}: ClientSearchFormProps) {
  const [searchMode, setSearchMode] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Formulario para nuevo cliente
  const [formData, setFormData] = useState({
    fullName: initialData?.clientName || '',
    documentType: ClientDocumentType.CC,
    documentNumber: initialData?.clientId || '',
    email: initialData?.clientEmail || '',
    phone: initialData?.clientPhone || '',
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Buscar clientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (debouncedSearch && debouncedSearch.length >= 3 && searchMode === 'search') {
      searchClients();
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearch, searchMode]);

  // Notificar cambios en los datos del formulario
  useEffect(() => {
    if (searchMode === 'create') {
      onClientDataChange({
        clientName: formData.fullName,
        clientId: formData.documentNumber,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        documentType: formData.documentType,
      });
    }
  }, [formData, searchMode]);

  const searchClients = async () => {
    try {
      setLoading(true);
      const results = await clientService.search({ search: debouncedSearch });
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error al buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm('');
    setShowResults(false);
    onClientSelected(client);
    onClientDataChange({
      clientName: client.fullName,
      clientId: client.documentNumber,
      clientEmail: client.email || '',
      clientPhone: client.phone || '',
      documentType: client.documentType,
    });
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    setSearchTerm('');
    onClientSelected(null);
    setSearchMode('search');
  };

  const handleCreateNew = () => {
    setSearchMode('create');
    setSelectedClient(null);
    setSearchTerm('');
    onClientSelected(null);
  };

  const handleBackToSearch = () => {
    setSearchMode('search');
    setFormData({
      fullName: '',
      documentType: ClientDocumentType.CC,
      documentNumber: '',
      email: '',
      phone: '',
    });
  };

  // Si hay un cliente seleccionado, mostrar resumen
  if (selectedClient) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{selectedClient.fullName}</h3>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  <Check className="w-3 h-3" />
                  Cliente Frecuente
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {DOCUMENT_TYPE_LABELS[selectedClient.documentType]}: {selectedClient.documentNumber}
              </p>
              {selectedClient.email && (
                <p className="text-sm text-gray-600">{selectedClient.email}</p>
              )}
              {selectedClient.phone && (
                <p className="text-sm text-gray-600">{selectedClient.phone}</p>
              )}
              {selectedClient.consentsCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedClient.consentsCount} consentimiento(s) previo(s)
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            className="text-gray-400 hover:text-gray-600"
            title="Cambiar cliente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Modo búsqueda
  if (searchMode === 'search') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Buscar Cliente Existente
          </label>
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <UserPlus className="w-4 h-4" />
            Crear Nuevo Cliente
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, documento, email o teléfono..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading && (
          <div className="text-center py-4 text-gray-500">
            Buscando clientes...
          </div>
        )}

        {showResults && searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
            {searchResults.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelectClient(client)}
                className="w-full p-3 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{client.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {DOCUMENT_TYPE_LABELS[client.documentType]}: {client.documentNumber}
                    </p>
                    {client.email && (
                      <p className="text-xs text-gray-500 truncate">{client.email}</p>
                    )}
                  </div>
                  {client.consentsCount > 0 && (
                    <div className="text-xs text-gray-500">
                      {client.consentsCount} consentimiento(s)
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            No se encontraron clientes. 
            <button
              type="button"
              onClick={handleCreateNew}
              className="text-blue-600 hover:text-blue-700 ml-1"
            >
              Crear nuevo cliente
            </button>
          </div>
        )}

        <div className="text-sm text-gray-500 text-center">
          Ingresa al menos 3 caracteres para buscar
        </div>
      </div>
    );
  }

  // Modo crear nuevo cliente
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Datos del Nuevo Cliente
        </label>
        <button
          type="button"
          onClick={handleBackToSearch}
          className="text-sm text-gray-600 hover:text-gray-700"
        >
          ← Volver a búsqueda
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Documento *
          </label>
          <select
            required
            value={formData.documentType}
            onChange={(e) => setFormData({ ...formData, documentType: e.target.value as ClientDocumentType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Documento *
          </label>
          <input
            type="text"
            required
            value={formData.documentNumber}
            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="123456789"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="+57 300 123 4567"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Este cliente será creado automáticamente al guardar el consentimiento.
        </p>
      </div>
    </div>
  );
}
