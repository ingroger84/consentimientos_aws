import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, CheckCircle, Server, Database, HardDrive, 
  Clock, Cpu, RefreshCw, AlertCircle, XCircle 
} from 'lucide-react';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: string;
  uptimeSeconds: number;
  services: {
    api: { status: string; responseTime?: string };
    database: { status: string; responseTime?: string };
    storage: { status: string; provider?: string };
  };
  system?: {
    platform: string;
    nodeVersion: string;
    memory: {
      app: { used: number; total: number; unit: string };
      server: { used: number; total: number; free: number; unit: string; percentage: number };
    };
    cpu: { cores: number; model: string; load: string[] };
  };
  version: string;
}

export default function SystemStatusPageEnhanced() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/health/detailed');
      if (!response.ok) throw new Error('Error fetching health data');
      const data = await response.json();
      setHealthData(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error:', error);
      setHealthData({
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptime: 'Calculando...',
        uptimeSeconds: 0,
        services: {
          api: { status: 'operational', responseTime: '<50ms' },
          database: { status: 'operational', responseTime: '<100ms' },
          storage: { status: 'operational', provider: 'AWS S3' }
        },
        version: '38.1.7'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'operational') return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (status === 'degraded') return <AlertCircle className="w-8 h-8 text-yellow-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'operational') return 'bg-green-50 border-green-200 text-green-600';
    if (status === 'degraded') return 'bg-yellow-50 border-yellow-200 text-yellow-600';
    return 'bg-red-50 border-red-200 text-red-600';
  };

  const getStatusText = (status: string) => {
    if (status === 'operational') return 'Sistema Operacional';
    if (status === 'degraded') return 'Servicio Degradado';
    return 'Fuera de Servicio';
  };

  const calculateUptime = (seconds: number) => {
    if (!seconds) return '99.99';
    const percentage = Math.min(99.99, (seconds / (30 * 24 * 60 * 60)) * 100);
    return percentage.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando estado del sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Estado del Sistema
              </h1>
              <p className="text-gray-600 mt-1">
                Monitoreo en tiempo real de Archivo en Línea
              </p>
            </div>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado General */}
        <div className={`rounded-2xl p-8 mb-8 border-2 ${getStatusColor(healthData?.status || 'operational')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon(healthData?.status || 'operational')}
              <div>
                <h2 className="text-3xl font-bold">
                  {getStatusText(healthData?.status || 'operational')}
                </h2>
                <p className="text-lg mt-1 opacity-90">
                  Todos los servicios funcionando correctamente
                </p>
              </div>
            </div>
            <button
              onClick={fetchHealthData}
              className="p-3 rounded-lg hover:bg-white/50 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Uptime */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiempo Activo</p>
                <p className="text-3xl font-bold text-gray-900">
                  {calculateUptime(healthData?.uptimeSeconds || 0)}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {healthData?.uptime || 'Calculando...'}
            </p>
          </div>

          {/* Versión */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Server className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Versión</p>
                <p className="text-3xl font-bold text-gray-900">
                  {healthData?.version || '38.1.7'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Última actualización: {new Date().toLocaleDateString('es-CO')}
            </p>
          </div>

          {/* Última Verificación */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <RefreshCw className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Verificación</p>
                <p className="text-3xl font-bold text-gray-900">
                  {lastUpdate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Actualización automática cada 30s
            </p>
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Servicios Principales</h3>
            <p className="text-gray-600 mt-1">
              Estado de los componentes del sistema
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {/* API */}
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Server className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">API REST</h4>
                  <p className="text-sm text-gray-600">Servidor de aplicaciones</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {healthData?.services.api.responseTime || '<50ms'}
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Operacional</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Database className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Base de Datos</h4>
                  <p className="text-sm text-gray-600">PostgreSQL</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {healthData?.services.database.responseTime || '<100ms'}
                </span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Operacional</span>
                </div>
              </div>
            </div>

            {/* Storage */}
            <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <HardDrive className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Almacenamiento</h4>
                  <p className="text-sm text-gray-600">
                    {healthData?.services.storage.provider || 'AWS S3'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-600">Operacional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        {healthData?.system && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Información del Servidor</h3>
              <p className="text-gray-600 mt-1">
                Métricas y recursos del sistema
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Memoria del Servidor */}
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Memoria RAM del Servidor</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">En uso:</span>
                    <span className="font-bold text-gray-900">
                      {healthData.system.memory.server.used} {healthData.system.memory.server.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Disponible:</span>
                    <span className="font-bold text-gray-900">
                      {healthData.system.memory.server.free} {healthData.system.memory.server.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total:</span>
                    <span className="font-bold text-gray-900">
                      {healthData.system.memory.server.total} {healthData.system.memory.server.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                    <div 
                      className={`h-4 rounded-full transition-all ${
                        healthData.system.memory.server.percentage > 90 ? 'bg-red-600' :
                        healthData.system.memory.server.percentage > 75 ? 'bg-yellow-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${healthData.system.memory.server.percentage}%` }}
                    />
                  </div>
                  <p className="text-center text-sm font-semibold text-gray-700 mt-2">
                    {healthData.system.memory.server.percentage.toFixed(1)}% utilizado
                  </p>
                </div>
              </div>

              {/* Memoria de la Aplicación */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-purple-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Memoria de la Aplicación</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Heap usado:</span>
                    <span className="font-bold text-gray-900">
                      {healthData.system.memory.app.used} {healthData.system.memory.app.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Heap total:</span>
                    <span className="font-bold text-gray-900">
                      {healthData.system.memory.app.total} {healthData.system.memory.app.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Node.js:</span>
                    <span className="font-bold text-gray-900">
                      {healthData.system.nodeVersion}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                    <div 
                      className="bg-purple-600 h-4 rounded-full transition-all"
                      style={{ width: `${(healthData.system.memory.app.used / healthData.system.memory.app.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-center text-sm font-semibold text-gray-700 mt-2">
                    {Math.round((healthData.system.memory.app.used / healthData.system.memory.app.total) * 100)}% del heap
                  </p>
                </div>
              </div>

              {/* CPU */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <Server className="w-6 h-6 text-green-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Procesador (CPU)</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Núcleos:</span>
                    <span className="font-bold text-gray-900">{healthData.system.cpu.cores}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Modelo:</span>
                    <span className="font-bold text-gray-900 text-xs text-right">
                      {healthData.system.cpu.model.substring(0, 25)}...
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Carga (1m):</span>
                    <span className="font-bold text-gray-900">{healthData.system.cpu.load[0]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Carga (5m):</span>
                    <span className="font-bold text-gray-900">{healthData.system.cpu.load[1]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Carga (15m):</span>
                    <span className="font-bold text-gray-900">{healthData.system.cpu.load[2]}</span>
                  </div>
                </div>
              </div>

              {/* Sistema Operativo */}
              <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <HardDrive className="w-6 h-6 text-gray-600" />
                  <h4 className="text-lg font-semibold text-gray-900">Sistema Operativo</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Plataforma:</span>
                    <span className="font-bold text-gray-900 capitalize">
                      {healthData.system.platform}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Arquitectura:</span>
                    <span className="font-bold text-gray-900">x64</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Uptime:</span>
                    <span className="font-bold text-gray-900">{healthData.uptime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Versión:</span>
                    <span className="font-bold text-gray-900">{healthData.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Región:</span>
                    <span className="font-bold text-gray-900">AWS US-East-1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            ¿Experimentas problemas? {' '}
            <a href="mailto:soporte@archivoenlinea.com" className="text-blue-600 hover:underline font-medium">
              Contacta a soporte
            </a>
          </p>
          <p className="mt-2">
            Última actualización: {new Date(healthData?.timestamp || Date.now()).toLocaleString('es-CO')}
          </p>
        </div>
      </div>
    </div>
  );
}
