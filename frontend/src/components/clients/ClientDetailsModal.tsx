import { X, User, Mail, Phone, MapPin, Calendar, Heart, AlertCircle } from 'lucide-react';
import { Client, DOCUMENT_TYPE_LABELS } from '../../types/client';

interface ClientDetailsModalProps {
  client: Client;
  onClose: () => void;
}

export default function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Detalles del Cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{client.fullName}</h3>
              <p className="text-gray-600">
                {DOCUMENT_TYPE_LABELS[client.documentType]} {client.documentNumber}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Consentimientos</div>
              <div className="text-2xl font-bold text-blue-600">{client.consentsCount}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Último Consentimiento</div>
              <div className="text-lg font-semibold text-green-600">
                {formatDate(client.lastConsentAt)}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Información de Contacto</h4>
            <div className="space-y-3">
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{client.address}{client.city && `, ${client.city}`}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal Info */}
          {(client.birthDate || client.gender || client.bloodType) && (
            <div>
              <h4 className="text-lg font-semibold mb-3">Información Personal</h4>
              <div className="grid grid-cols-2 gap-4">
                {client.birthDate && (
                  <div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Fecha de Nacimiento
                    </div>
                    <div className="font-medium">{formatDate(client.birthDate)}</div>
                  </div>
                )}
                {client.gender && (
                  <div>
                    <div className="text-sm text-gray-600">Género</div>
                    <div className="font-medium">{client.gender}</div>
                  </div>
                )}
                {client.bloodType && (
                  <div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Tipo de Sangre
                    </div>
                    <div className="font-medium">{client.bloodType}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(client.emergencyContactName || client.emergencyContactPhone) && (
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Contacto de Emergencia
              </h4>
              <div className="space-y-2">
                {client.emergencyContactName && (
                  <div>
                    <div className="text-sm text-gray-600">Nombre</div>
                    <div className="font-medium">{client.emergencyContactName}</div>
                  </div>
                )}
                {client.emergencyContactPhone && (
                  <div>
                    <div className="text-sm text-gray-600">Teléfono</div>
                    <div className="font-medium">{client.emergencyContactPhone}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div>
              <h4 className="text-lg font-semibold mb-3">Notas</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t text-sm text-gray-500">
            <div>Registrado: {formatDate(client.createdAt)}</div>
            <div>Última actualización: {formatDate(client.updatedAt)}</div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
