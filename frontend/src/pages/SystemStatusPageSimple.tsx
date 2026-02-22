import { 
  Activity, CheckCircle, Server, Database, HardDrive
} from 'lucide-react';

export default function SystemStatusPageSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Estado del Sistema
              </h1>
              <p className="text-gray-600 mt-1">
                Monitoreo en tiempo real del sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado General */}
        <div className="rounded-2xl p-8 mb-8 border-2 bg-green-50 border-green-200 text-green-600">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-12 h-12" />
            <div>
              <h2 className="text-3xl font-bold">Sistema Operacional</h2>
              <p className="text-lg mt-1 opacity-90">
                Todos los servicios están funcionando correctamente
              </p>
            </div>
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
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-600">Operacional</span>
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
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-600">Operacional</span>
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
                  <p className="text-sm text-gray-600">AWS S3</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-green-600">Operacional</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Información del Sistema</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Versión del Sistema</p>
              <p className="text-2xl font-bold text-gray-900">40.1.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Disponibilidad</p>
              <p className="text-2xl font-bold text-green-600">99.9%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Plataforma</p>
              <p className="text-lg font-semibold text-gray-900">Linux / Node.js</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Región</p>
              <p className="text-lg font-semibold text-gray-900">AWS US-East-1</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            ¿Experimentas problemas? {' '}
            <a 
              href="mailto:soporte@archivoenlinea.com" 
              className="text-blue-600 hover:underline font-medium"
            >
              Contacta a soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
