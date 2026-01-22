import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Building2, 
  Shield, 
  CheckCircle, 
  Clock, 
  Mail, 
  Cloud,
  BarChart3,
  Lock,
  Zap,
  ArrowRight,
  Check,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: FileText,
      title: 'Consentimientos Digitales',
      description: 'Crea, gestiona y envía consentimientos informados de forma digital, eliminando el papel.'
    },
    {
      icon: Shield,
      title: 'Cumplimiento Legal',
      description: 'Cumple con normativas de protección de datos y consentimientos informados.'
    },
    {
      icon: Users,
      title: 'Multi-Usuario',
      description: 'Gestiona múltiples usuarios con diferentes roles y permisos personalizados.'
    },
    {
      icon: Building2,
      title: 'Multi-Sede',
      description: 'Administra múltiples sedes o sucursales desde una sola plataforma.'
    },
    {
      icon: Mail,
      title: 'Envío Automático',
      description: 'Envía consentimientos por email automáticamente con PDFs adjuntos.'
    },
    {
      icon: Cloud,
      title: 'Almacenamiento Seguro',
      description: 'Todos tus documentos almacenados de forma segura en la nube (AWS S3).'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Estadísticas',
      description: 'Visualiza métricas y estadísticas de tus consentimientos en tiempo real.'
    },
    {
      icon: Lock,
      title: 'Firma Digital',
      description: 'Captura de firma digital del cliente directamente en la plataforma.'
    }
  ];

  const benefits = [
    'Elimina el uso de papel y archivos físicos',
    'Reduce tiempo de gestión administrativa',
    'Acceso desde cualquier dispositivo',
    'Búsqueda rápida de documentos',
    'Trazabilidad completa de consentimientos',
    'Cumplimiento normativo garantizado'
  ];

  const useCases = [
    {
      title: 'Clínicas y Consultorios Médicos',
      description: 'Gestiona consentimientos informados para procedimientos médicos, tratamientos y cirugías.',
      icon: '🏥'
    },
    {
      title: 'Centros de Estética',
      description: 'Administra consentimientos para tratamientos estéticos, procedimientos y uso de imagen.',
      icon: '💆'
    },
    {
      title: 'Gimnasios y Spas',
      description: 'Controla consentimientos de responsabilidad, tratamiento de datos y uso de instalaciones.',
      icon: '🏋️'
    },
    {
      title: 'Cualquier Negocio',
      description: 'Ideal para cualquier empresa que necesite gestionar acuerdos y consentimientos de clientes.',
      icon: '🏢'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">DatAgree</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition">Características</a>
              <a href="#benefits" className="text-gray-700 hover:text-primary-600 transition">Beneficios</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition">Planes</a>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 transition">Iniciar Sesión</Link>
              <a 
                href="#pricing" 
                className="btn btn-primary"
              >
                Comenzar Gratis
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-primary-600">Características</a>
              <a href="#benefits" className="block text-gray-700 hover:text-primary-600">Beneficios</a>
              <a href="#pricing" className="block text-gray-700 hover:text-primary-600">Planes</a>
              <Link to="/login" className="block text-gray-700 hover:text-primary-600">Iniciar Sesión</Link>
              <a href="#pricing" className="block btn btn-primary text-center">
                Comenzar Gratis
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Gestiona Consentimientos
                <span className="text-primary-600"> Digitalmente</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                La plataforma SaaS completa para digitalizar, gestionar y enviar consentimientos informados. 
                Elimina el papel, ahorra tiempo y cumple con las normativas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#pricing" className="btn btn-primary btn-lg flex items-center justify-center gap-2">
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5" />
                </a>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Iniciar Sesión
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Configuración en minutos</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <img 
                  src="/hero-dashboard.png" 
                  alt="DatAgree Dashboard" 
                  className="rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="400"%3E%3Crect fill="%23f3f4f6" width="600" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3EDashboard Preview%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DatAgree incluye todas las herramientas necesarias para gestionar consentimientos de forma profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition">
                <feature.icon className="w-12 h-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                ¿Por qué elegir DatAgree?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Transforma la gestión de consentimientos en tu negocio con nuestra plataforma intuitiva y segura.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Zap className="w-10 h-10 text-yellow-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">10x</h3>
                <p className="text-gray-600">Más rápido que el papel</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Clock className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">80%</h3>
                <p className="text-gray-600">Menos tiempo administrativo</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Shield className="w-10 h-10 text-green-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">100%</h3>
                <p className="text-gray-600">Cumplimiento legal</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <Cloud className="w-10 h-10 text-purple-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">24/7</h3>
                <p className="text-gray-600">Acceso desde cualquier lugar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ideal para cualquier negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              DatAgree se adapta a las necesidades de diferentes industrias y sectores
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 hover:shadow-lg transition">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para digitalizar tus consentimientos?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a cientos de empresas que ya confían en DatAgree para gestionar sus consentimientos
          </p>
          <a href="#pricing" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
            Ver Planes y Precios
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">DatAgree</h3>
              <p className="text-sm">
                La plataforma líder en gestión de consentimientos digitales para empresas de todos los tamaños.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Precios</a></li>
                <li><Link to="/login" className="hover:text-white transition">Iniciar Sesión</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-white transition">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} DatAgree. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
