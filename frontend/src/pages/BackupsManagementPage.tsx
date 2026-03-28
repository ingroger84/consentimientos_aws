import { useEffect, useState } from 'react';
import {
  Database,
  Download,
  RefreshCw,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  HardDrive,
  Calendar,
  Settings,
} from 'lucide-react';
import backupsService, { Backup, BackupStats } from '../services/backups.service';

export default function BackupsManagementPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedule1, setSchedule1] = useState('12:00');
  const [schedule2, setSchedule2] = useState('19:00');
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    loadData();
    loadSchedule();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupsData, statsData] = await Promise.all([
        backupsService.listBackups(),
        backupsService.getStats(),
      ]);
      setBackups(backupsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar backups:', error);
      alert('Error al cargar los backups');
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const scheduleData = await backupsService.getCurrentSchedule();
      setSchedule1(scheduleData.schedule1);
      setSchedule2(scheduleData.schedule2);
    } catch (error) {
      console.error('Error al cargar horario:', error);
    }
  };

  const handleCreateBackup = async () => {
    if (!confirm('¿Deseas crear un backup manual ahora?\n\nRecibirás un email cuando se complete.')) {
      return;
    }

    try {
      setCreating(true);
      const response = await backupsService.createBackup();
      alert(response.message);
      // Recargar después de 5 segundos
      setTimeout(() => {
        loadData();
      }, 5000);
    } catch (error) {
      console.error('Error al crear backup:', error);
      alert('Error al crear el backup');
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;

    try {
      setRestoring(true);
      const response = await backupsService.restoreBackup(selectedBackup.fileName);
      alert(`${response.message}\n\n${response.warning}`);
      setShowRestoreModal(false);
    } catch (error) {
      console.error('Error al restaurar backup:', error);
      alert('Error al restaurar el backup');
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteBackup = async () => {
    if (!selectedBackup) return;

    try {
      await backupsService.deleteBackup(selectedBackup.fileName);
      alert('Backup eliminado correctamente');
      setShowDeleteModal(false);
      loadData();
    } catch (error) {
      console.error('Error al eliminar backup:', error);
      alert('Error al eliminar el backup');
    }
  };

  const handleDownload = async (backup: Backup) => {
    try {
      const response = await backupsService.getDownloadUrl(backup.fileName);
      window.open(response.url, '_blank');
    } catch (error) {
      console.error('Error al obtener URL de descarga:', error);
      alert('Error al generar la URL de descarga');
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setSavingSchedule(true);
      await backupsService.updateSchedule(schedule1, schedule2);
      alert('Horario de backups actualizado correctamente.\n\nLos backups automáticos se ejecutarán en los nuevos horarios.');
      setShowScheduleModal(false);
    } catch (error: any) {
      console.error('Error al actualizar horario:', error);
      alert(error.response?.data?.message || 'Error al actualizar el horario');
    } finally {
      setSavingSchedule(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando backups...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-600" />
          Gestión de Backups
        </h1>
        <p className="text-gray-600 mt-2">
          Administra los backups automáticos del sistema
        </p>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Backups</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Database className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tamaño Total</p>
                <p className="text-3xl font-bold mt-2">{stats.totalSizeFormatted}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <HardDrive className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Tamaño Promedio</p>
                <p className="text-3xl font-bold mt-2">{stats.averageSizeFormatted}</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <HardDrive className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Último Backup</p>
                <p className="text-lg font-bold mt-2">
                  {stats.lastBackup
                    ? formatDate(stats.lastBackup.lastModified).split(' ')[1]
                    : 'N/A'}
                </p>
                <p className="text-xs text-orange-100">
                  {stats.lastBackup
                    ? formatDate(stats.lastBackup.lastModified).split(' ')[0]
                    : ''}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Clock className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
            <p className="text-sm text-gray-600 mt-1">
              Los backups automáticos se ejecutan a las {schedule1} y {schedule2}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configurar Horario
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={handleCreateBackup}
              disabled={creating}
              className="btn btn-primary flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              {creating ? 'Creando...' : 'Crear Backup Manual'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Backups */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Backups Disponibles ({backups.length})
        </h3>

        {backups.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No hay backups disponibles</p>
            <p className="text-sm text-gray-500 mt-2">
              Crea un backup manual o espera al próximo backup automático
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Consecutivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre del Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        #{backup.consecutivo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(backup.lastModified)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-mono">
                        {backup.fileName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{backup.sizeFormatted}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(backup)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Descargar"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowRestoreModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Restaurar"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBackup(backup);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Restauración */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Restauración
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas restaurar este backup?
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  ⚠️ Advertencias Importantes:
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>El sistema estará fuera de línea durante 10-15 minutos</li>
                  <li>Se creará un backup del estado actual antes de restaurar</li>
                  <li>Todos los usuarios serán desconectados</li>
                  <li>Los servicios se reiniciarán automáticamente</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Backup a restaurar:</strong>
                </p>
                <p className="text-sm font-mono text-gray-900 mb-2">
                  {selectedBackup.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Consecutivo:</strong> #{selectedBackup.consecutivo}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {formatDate(selectedBackup.lastModified)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRestoreModal(false)}
                disabled={restoring}
                className="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestoreBackup}
                disabled={restoring}
                className="flex-1 btn btn-primary bg-yellow-600 hover:bg-yellow-700"
              >
                {restoring ? 'Restaurando...' : 'Confirmar Restauración'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {showDeleteModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Eliminar Backup</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar este backup?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">
                  ⚠️ Esta acción no se puede deshacer. El backup será eliminado
                  permanentemente de S3.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-mono text-gray-900 mb-2">
                  {selectedBackup.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  Consecutivo: #{selectedBackup.consecutivo}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteBackup}
                className="flex-1 btn btn-primary bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuración de Horario */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Configurar Horario de Backups
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Configura los horarios en los que se ejecutarán los backups automáticos diariamente.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">
                  ℹ️ Información:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Los backups se ejecutan automáticamente todos los días</li>
                  <li>Se recomienda programarlos en horarios de baja actividad</li>
                  <li>Recibirás un email cuando cada backup se complete</li>
                  <li>Los cambios se aplican inmediatamente</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Backup Diario
                  </label>
                  <input
                    type="time"
                    value={schedule1}
                    onChange={(e) => setSchedule1(e.target.value)}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Horario actual: {schedule1}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Backup Diario
                  </label>
                  <input
                    type="time"
                    value={schedule2}
                    onChange={(e) => setSchedule2(e.target.value)}
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Horario actual: {schedule2}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                disabled={savingSchedule}
                className="flex-1 btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="flex-1 btn btn-primary"
              >
                {savingSchedule ? 'Guardando...' : 'Guardar Horario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
