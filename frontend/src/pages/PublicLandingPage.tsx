import { useState } from 'react';
import { 
  FileText, Users, Building2, Shield, CheckCircle, Clock, Mail, Cloud,
  BarChart3, Lock, Zap, Check, Menu, X, Star,
  Smartphone, Globe, HeadphonesIcon, ClipboardList
} from 'lucide-react';
import PricingSection from '@/components/landing/PricingSection';
import SignupModal from '@/components/landing/SignupModal';

export default function PublicLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Cargar logo del super admin
  useState(() => {
    fetch('https://archivoenlinea.com/api/settings/logo')
      .then(res => res.json())
      .then(data => {
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      })
      .catch(err => console.error('Error cargando logo:', err));
  });

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowSignupModal(true);
  };

  const features = [
    {
      icon: FileText,
      title: 'Consentimientos Digitales',
      description: 'Crea, gestiona y envía consentimientos informados de forma digital con firma electrónica y validez legal para cualquier tipo de negocio.',
      color: 'text-green-600'
    },
    {
      icon: ClipboardList,
      title: 'Historias Clínicas Electrónicas',
      description: 'Sistema completo de HC digitales con anamnesis, exámenes físicos, diagnósticos CIE-10 y evoluciones SOAP para el sector salud.',
      color: 'text-blue-600',
      badge: 'SECTOR SALUD'
    },
    {
      icon: Users,
      title: 'Gestión de Clientes',
      description: 'Base de datos centralizada de clientes con historial completo, búsqueda avanzada y trazabilidad total de documentos.',
      color: 'text-purple-600'
    },
    {
      icon: Building2,
      title: 'Multi-Sede',
      description: 'Gestiona múltiples sedes o sucursales desde una sola plataforma con asignación de usuarios por ubicación.',
      color: 'text-orange-600'
    },
    {
      icon: Lock,
      title: 'Firma Digital',
      description: 'Captura de firma digital integrada con validación legal, trazabilidad completa y cumplimiento normativo.',
      color: 'text-pink-600'
    },
    {
      icon: Cloud,
      title: 'Almacenamiento Seguro',
      description: 'Todos tus documentos almacenados de forma segura en la nube con AWS S3 y respaldo automático.',
      color: 'text-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Estadísticas',
      description: 'Visualiza métricas y estadísticas de consentimientos, clientes y documentos en tiempo real con dashboards.',
      color: 'text-indigo-600'
    },
    {
      icon: Shield,
      title: 'Cumplimiento Legal',
      description: 'Cumple con normativas de protección de datos, consentimientos informados y documentación legal automáticamente.',
      color: 'text-emerald-600'
    }
  ];

  const benefits = [
    'Consentimientos digitales para cualquier tipo de negocio',
    'Módulo especializado de historias clínicas para sector salud',
    'Elimina el uso de papel y archivos físicos',
    'Reduce hasta 80% el tiempo de gestión administrativa',
    'Acceso desde cualquier dispositivo con internet',
    'Búsqueda rápida de documentos en segundos',
    'Trazabilidad completa de consentimientos y documentos',
    'Cumplimiento normativo y legal garantizado',
    'Personalización con tu marca corporativa',
    'Soporte técnico especializado 24/7'
  ];

  const useCases = [
    {
      title: 'Clínicas y Consultorios Médicos',
      description: 'Gestiona historias clínicas completas, consentimientos informados para procedimientos médicos, tratamientos, cirugías y protección de datos de pacientes.',
      icon: '🏥',
      examples: ['Historias clínicas completas', 'Consentimientos quirúrgicos', 'Diagnósticos CIE-10', 'Evoluciones SOAP']
    },
    {
      title: 'Centros de Estética y Belleza',
      description: 'Gestiona consentimientos de tratamientos estéticos, procedimientos, uso de imagen y seguimiento de clientes con historias clínicas estéticas.',
      icon: '💆',
      examples: ['Consentimientos de procedimientos', 'HC estéticas opcionales', 'Fotografías de evolución', 'Seguimiento de tratamientos']
    },
    {
      title: 'Gimnasios y Centros Deportivos',
      description: 'Administra consentimientos de responsabilidad, evaluaciones físicas, programas de entrenamiento y documentación legal de miembros.',
      icon: '🏋️',
      examples: ['Consentimientos deportivos', 'Evaluaciones físicas', 'Programas de entrenamiento', 'Liberación de responsabilidad']
    },
    {
      title: 'Spas y Centros de Bienestar',
      description: 'Gestiona consentimientos de servicios, tratamientos terapéuticos, políticas de privacidad y documentación de clientes.',
      icon: '🧘',
      examples: ['Consentimientos de servicios', 'Tratamientos de spa', 'Terapias alternativas', 'Políticas de privacidad']
    },
    {
      title: 'Empresas y Negocios',
      description: 'Administra consentimientos de uso de datos, políticas de privacidad, acuerdos comerciales y documentación legal con clientes.',
      icon: '🏢',
      examples: ['Consentimientos de datos', 'Políticas de privacidad', 'Acuerdos comerciales', 'Documentación legal']
    },
    {
      title: 'Centros Educativos',
      description: 'Gestiona consentimientos de padres, autorizaciones de actividades, uso de imagen y documentación de estudiantes.',
      icon: '🎓',
      examples: ['Autorizaciones de padres', 'Uso de imagen', 'Actividades extracurriculares', 'Políticas del centro']
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Carlos Méndez',
      role: 'Director Médico',
      company: 'Clínica Salud Total',
      content: 'Archivo en Línea transformó completamente nuestra gestión de consentimientos. Ahorramos más de 10 horas semanales en tareas administrativas.',
      rating: 5
    },
    {
      name: 'María González',
      role: 'Gerente',
      company: 'Centro Estético Belleza',
      content: 'La plataforma es muy intuitiva y nuestros clientes están encantados con el proceso digital. Altamente recomendado.',
      rating: 5
    },
    {
      name: 'Juan Pérez',
      role: 'Propietario',
      company: 'Gimnasio FitLife',
      content: 'Excelente solución para gestionar los consentimientos de nuestros miembros. El soporte técnico es excepcional.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Archivo en Línea" 
                  className="h-24 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className={logoUrl ? 'hidden' : 'text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent'}>
                Archivo en Línea
              </span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 transition">Características</a>
              <a href="#benefits" className="text-gray-700 hover:text-primary-600 transition">Beneficios</a>
              <a href="#use-cases" className="text-gray-700 hover:text-primary-600 transition">Casos de Uso</a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 transition">Planes</a>
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
              <a href="#use-cases" className="block text-gray-700 hover:text-primary-600">Casos de Uso</a>
              <a href="#pricing" className="block text-gray-700 hover:text-primary-600">Planes</a>
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
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Plataforma de Gestión de Consentimientos Digitales</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Consentimientos Digitales
                <span className="text-primary-600"> para tu Negocio</span>
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                La plataforma SaaS completa para gestionar consentimientos informados de forma digital. 
                Ideal para cualquier negocio que requiera documentación legal con clientes.
                <span className="block mt-2 font-semibold text-primary-700">
                  + Módulo especializado de Historias Clínicas para el sector salud
                </span>
              </p>
              
              {/* Pills de módulos */}
              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Consentimientos</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Historias Clínicas</span>
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Salud</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full border border-purple-200">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Gestión de Clientes</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mt-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Prueba gratis por 7 días</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Configuración en minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Soporte remoto gratuito</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <ClipboardList className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Historia Clínica Creada</p>
                      <p className="text-sm text-gray-600">Paciente: María González</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Consentimiento Firmado</p>
                      <p className="text-sm text-gray-600">Firma digital validada</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <Mail className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Email Enviado</p>
                      <p className="text-sm text-gray-600">PDF adjunto automáticamente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                    <Cloud className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Almacenado en la Nube</p>
                      <p className="text-sm text-gray-600">Acceso seguro 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-6 rounded-xl shadow-xl">
                <p className="text-3xl font-bold">10x</p>
                <p className="text-sm">Más rápido</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <p className="text-4xl font-bold mb-2">500+</p>
              <p className="text-primary-100">Empresas Confían</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">100K+</p>
              <p className="text-primary-100">Consentimientos Gestionados</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">99.9%</p>
              <p className="text-primary-100">Uptime Garantizado</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">24/7</p>
              <p className="text-primary-100">Soporte Disponible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              2 Tipos de Consentimientos + Módulo de Salud
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el tipo de consentimiento que necesitas según tu negocio. Para el sector salud, incluimos un módulo completo de historias clínicas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Módulo 1: Consentimientos Convencionales */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                PARA TODOS
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Consentimientos Convencionales
              </h3>
              <p className="text-gray-600 mb-6">
                Ideal para cualquier negocio o empresa que requiera que sus clientes firmen consentimientos, acuerdos o documentación legal.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Plantillas personalizables</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Firma digital con validez legal</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">PDFs profesionales automáticos</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Envío automático por email</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Gestión de clientes</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Ideal para:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Gimnasios</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Spas</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Empresas</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Educación</span>
                </div>
              </div>
            </div>

            {/* Módulo 2: Consentimientos de HC */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                  SECTOR SALUD
                </span>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Consentimientos de Historias Clínicas
              </h3>
              <p className="text-gray-600 mb-6">
                Consentimientos especializados vinculados a historias clínicas. Incluye firma digital, logos personalizados y generación automática de PDFs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Vinculados a historias clínicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Plantillas especializadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Logos personalizados por HC</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Firma digital integrada</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">PDFs con formato médico</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Ideal para:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Clínicas</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Consultorios</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Estética</span>
                </div>
              </div>
            </div>

            {/* Módulo 3: Historias Clínicas */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4">
                PLUS SALUD
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Historias Clínicas Electrónicas
              </h3>
              <p className="text-gray-600 mb-6">
                Módulo completo de historias clínicas digitales con todos los componentes necesarios para una gestión profesional del sector salud.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Anamnesis completa</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Exámenes físicos y signos vitales</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Diagnósticos CIE-10</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Evoluciones SOAP</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Gestión de pacientes</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium mb-2">Incluido en planes:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Profesional</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Empresarial</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  ¿Qué tipo de consentimiento necesito?
                </h4>
                <p className="text-gray-700 mb-3">
                  <strong>Consentimientos Convencionales:</strong> Para cualquier negocio que requiera que sus clientes firmen documentos legales, acuerdos o autorizaciones.
                </p>
                <p className="text-gray-700">
                  <strong>Consentimientos de HC + Historias Clínicas:</strong> Para clínicas, consultorios médicos, centros de estética o cualquier negocio del sector salud que necesite gestionar historias clínicas completas además de consentimientos.
                </p>
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
              Características Completas para tu Negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Archivo en Línea incluye todas las herramientas necesarias para gestionar consentimientos digitales de forma profesional, con módulo especializado para el sector salud
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group relative">
                {feature.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                      {feature.badge}
                    </span>
                  </div>
                )}
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`} />
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
                ¿Por qué elegir Archivo en Línea?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Transforma la gestión de tu negocio con nuestra plataforma integral de consentimientos digitales. 
                Ideal para cualquier empresa, con módulo especializado para el sector salud.
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
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <Zap className="w-10 h-10 text-yellow-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">10x</h3>
                <p className="text-gray-600">Más rápido que el papel</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <Clock className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">80%</h3>
                <p className="text-gray-600">Menos tiempo administrativo</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <Shield className="w-10 h-10 text-green-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">100%</h3>
                <p className="text-gray-600">Cumplimiento legal</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <Cloud className="w-10 h-10 text-purple-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">24/7</h3>
                <p className="text-gray-600">Acceso desde cualquier lugar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Soluciones para Múltiples Industrias
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Archivo en Línea se adapta a las necesidades de cualquier negocio que requiera gestionar consentimientos digitales, desde empresas hasta el sector salud
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-6 rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary-300">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xl text-gray-600">
              Empresas de todos los tamaños confían en Archivo en Línea
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-primary-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes y Precios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a las necesidades de tu negocio. Todos incluyen soporte técnico.
            </p>
          </div>

          <PricingSection onSelectPlan={handleSelectPlan} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para digitalizar tu negocio?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a cientos de empresas que ya confían en Archivo en Línea para gestionar sus consentimientos digitales de forma profesional. Prueba gratis por 7 días.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
              Comenzar Prueba Gratis
            </a>
            <a href="#features" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 btn-lg">
              Ver Características
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Archivo en Línea</h3>
              <p className="text-sm mb-4">
                Plataforma SaaS completa para gestión de consentimientos digitales. Ideal para cualquier negocio, con módulo especializado para el sector salud.
              </p>
              <div className="flex gap-4">
                <Globe className="w-5 h-5" />
                <Smartphone className="w-5 h-5" />
                <HeadphonesIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Características</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Precios</a></li>
                <li><a href="#use-cases" className="hover:text-white transition">Casos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentación</a></li>
                <li><a href="mailto:soporte@archivoenlinea.com" className="hover:text-white transition">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="/status" className="hover:text-white transition">Estado del Sistema</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Términos de Servicio</a></li>
                <li><a href="#" className="hover:text-white transition">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Política de Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Archivo en Línea by Innova Systems. Todos los derechos reservados.</p>
            <p className="mt-2 text-gray-500">Hecho con ❤️ en Colombia</p>
          </div>
        </div>
      </footer>

      {/* Signup Modal */}
      {showSignupModal && (
        <SignupModal
          selectedPlan={selectedPlan}
          onClose={() => {
            setShowSignupModal(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
}
