import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, User, Phone, Mail, FileText, Edit, Trash2, Building2, ChevronDown, ChevronRight, List } from 'lucide-react';
import { clientService } from '../services/client.service';
import { Client, DOCUMENT_TYPE_LABELS } from '../types/client';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';
import CreateClientModal from '../components/clients/CreateClientModal';
import EditClientModal from '../components/clients/EditClientModal';
import ClientDetailsModal from '../components/clients/ClientDetailsModal';

interface ClientWithTenant extends Client {
  tenantName?: string;
  tenantSlug?: string;
}

export default function ClientsPage() {
  const { hasPermission } = usePermissions();
  const [clients, setClients] = useState<ClientWithTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(new Set());
  const [groupByTenant, setGroupByTenant] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadClients();
  }, [debouncedSearch]);

  const loadClients = async () => {
    try {
      setLoading(true);
      if (debouncedSearch) {
        const results = await clientService.search({ search: debouncedSearch });
        setClients(results);
      } else {
        const allClients = await clientService.getAll();
        setClients(allClients);
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar clientes por tenant
  const groupedClients = useMemo(() => {
    if (!clients) return { tenants: {} };

    const tenants: Record<string, { tenantName: string; tenantSlug: string | null; clients: ClientWithTenant[] }> = {};

    clients.forEach(client => {
      const tenantKey = client.tenantName || 'Sin Tenant';
      if (!tenants[tenantKey]) {
        tenants[tenantKey] = {
          tenantName: client.tenantName || 'Sin Tenant',
          tenantSlug: client.tenantSlug || null,
          clients: []
        };
      }
      tenants[tenantKey].clients.push(client);
    });

    return { tenants };
  }, [clients]);

  const toggleTenant = (tenantName: string) => {
    setExpandedTenants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tenantName)) {
        newSet.delete(tenantName);
      } else {
        newSet.add(tenantName);
      }
      return newSet;
    });
  };

  const handleCreateClient = () => {
    setShowCreateModal(false);
    loadClients();
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleUpdateClient = () => {
    setShowEditModal(false);
    setSelectedClient(null);
    loadClients();
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!confirm(`¿Está seguro de eliminar al cliente ${client.fullName}?`)) {
      return;
    }

    try {
      await clientService.delete(client.id);
      loadClients();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar cliente');
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO');
  };

  const renderClientRow = (client: ClientWithTenant) => (
    <tr key={client.id} className="hover:bg-gray-50 border-b">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {client.fullName}
            </div>
            {client.city && (
              <div className="text-sm text-gray-500">{client.city}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {DOCUMENT_TYPE_LABELS[client.documentType]}
        </div>
        <div className="text-sm text-gray-500">{client.documentNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {client.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {client.phone}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          {client.consentsCount}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(client.lastConsentAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleViewDetails(client)}
            className="text-blue-600 hover:text-blue-900"
            title="Ver detalles"
          >
            <FileText className="w-5 h-5" />
          </button>
          {hasPermission('edit_clients') && (
            <button
              onClick={() => handleEditClient(client)}
              className="text-yellow-600 hover:text-yellow-900"
              title="Editar"
            >
              <Edit className="w-5 h-5" />
            </button>
          )}
          {hasPermission('delete_clients') && (
            <button
              onClick={() => handleDeleteClient(client)}
              className="text-red-600 hover:text-red-900"
              title="Eliminar"
              disabled={client.consentsCount > 0}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la base de datos de clientes del tenant
          </p>
        </div>
        <div className="flex gap-3">
          {clients.some(c => c.tenantName) && (
            <button
              onClick={() => setGroupByTenant(!groupByTenant)}
              className="btn btn-secondary flex items-center gap-2"
              title={groupByTenant ? 'Vista de lista' : 'Agrupar por tenant'}
            >
              {groupByTenant ? <List className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
              {groupByTenant ? 'Vista Lista' : 'Agrupar por Tenant'}
            </button>
          )}
          {hasPermission('create_clients') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Nuevo Cliente
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clients List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Cargando clientes...
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
        </div>
      ) : groupByTenant && clients.some(c => c.tenantName) ? (
        <div className="space-y-4">
          {/* Tenants Sections */}
          {Object.entries(groupedClients.tenants).map(([tenantName, { tenantSlug, clients: tenantClients }]) => (
            <div key={tenantName} className="card">
              <button
                onClick={() => toggleTenant(tenantName)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTenants.has(tenantName) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{tenantName}</h3>
                    <p className="text-sm text-gray-500">
                      {tenantClients.length} cliente(s){tenantSlug && ` • /${tenantSlug}`}
                    </p>
                  </div>
                </div>
                {tenantSlug && (
                  <a
                    href={`https://${tenantSlug}.${import.meta.env.VITE_BASE_DOMAIN || 'archivoenlinea.com'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Acceder →
                  </a>
                )}
              </button>

              {expandedTenants.has(tenantName) && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Consentimientos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Último Consentimiento
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantClients.map(renderClientRow)}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  {clients.some(c => c.tenantName) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenant
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consentimientos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Consentimiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.fullName}
                          </div>
                          {client.city && (
                            <div className="text-sm text-gray-500">{client.city}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {DOCUMENT_TYPE_LABELS[client.documentType]}
                      </div>
                      <div className="text-sm text-gray-500">{client.documentNumber}</div>
                    </td>
                    {clients.some(c => c.tenantName) && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {client.tenantName ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">{client.tenantName}</span>
                            {client.tenantSlug && (
                              <span className="text-xs text-gray-500">/{client.tenantSlug}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Sin tenant</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {client.email}
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {client.consentsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.lastConsentAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(client)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        {hasPermission('edit_clients') && (
                          <button
                            onClick={() => handleEditClient(client)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {hasPermission('delete_clients') && (
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                            disabled={client.consentsCount > 0}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateClient}
        />
      )}

      {showEditModal && selectedClient && (
        <EditClientModal
          client={selectedClient}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          onSuccess={handleUpdateClient}
        />
      )}

      {showDetailsModal && selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
