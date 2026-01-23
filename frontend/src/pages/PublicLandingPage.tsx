import { useState } from 'react';
import { 
  FileText, Users, Building2, Shield, CheckCircle, Clock, Mail, Cloud,
  BarChart3, Lock, Zap, ArrowRight, Check, Menu, X, Star,
  Smartphone, Globe, HeadphonesIcon
} from 'lucide-react';
import PricingSection from '@/components/landing/PricingSection';
import SignupModal from '@/components/landing/SignupModal';

export default function PublicLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowSignupModal(true);
  };

  const features = [
    {
      icon: FileText,
      title: 'Consentimientos Digitales',
      description: 'Crea, gestiona y envía consentimientos informados de forma digital. Elimina el papel y digitaliza tu negocio.',
      color: 'text-blue-600'
    },
    {
      icon: Shield,
      title: 'Cumplimiento Legal',
      description: 'Cumple con normativas de protección de datos (GDPR, LOPD) y consentimientos informados de forma automática.',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Gestión Multi-Usuario',
      description: 'Administra múltiples usuarios con diferentes roles y permisos personalizados según tus necesidades.',
      color: 'text-purple-600'
    },
    {
      icon: Building2,
      title: 'Multi-Sede',
      description: 'Gestiona múltiples sedes o sucursales desde una sola plataforma centralizada.',
      color: 'text-orange-600'
    },
    {
      icon: Mail,
      title: 'Envío Automático',
      description: 'Envía consentimientos por email automáticamente con PDFs personalizados y marca de agua.',
      color: 'text-red-600'
    },
    {
      icon: Cloud,
      title: 'Almacenamiento Seguro',
      description: 'Todos tus documentos almacenados de forma segura en la nube con AWS S3.',
      color: 'text-cyan-600'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Estadísticas',
      description: 'Visualiza métricas y estadísticas de tus consentimientos en tiempo real con dashboards intuitivos.',
      color: 'text-indigo-600'
    },
    {
      icon: Lock,
      title: 'Firma Digital',
      description: 'Captura de firma digital del cliente directamente en la plataforma con validación legal.',
      color: 'text-pink-600'
    }
  ];

  const benefits = [
    'Elimina el uso de papel y archivos físicos',
    'Reduce hasta 80% el tiempo de gestión administrativa',
    'Acceso desde cualquier dispositivo con internet',
    'Búsqueda rápida de documentos en segundos',
    'Trazabilidad completa de todos los consentimientos',
    'Cumplimiento normativo garantizado',
    'Personalización con tu marca corporativa',
    'Soporte técnico especializado'
  ];

  const useCases = [
    {
      title: 'Clínicas y Consultorios Médicos',
      description: 'Gestiona consentimientos informados para procedimientos médicos, tratamientos, cirugías y uso de datos personales de pacientes.',
      icon: '🏥',
      examples: ['Consentimientos quirúrgicos', 'Tratamientos médicos', 'Protección de datos']
    },
    {
      title: 'Centros de Estética y Belleza',
      description: 'Administra consentimientos para tratamientos estéticos, procedimientos, uso de imagen y protección de datos de clientes.',
      icon: '💆',
      examples: ['Tratamientos faciales', 'Procedimientos estéticos', 'Uso de imagen']
    },
    {
      title: 'Gimnasios y Centros Deportivos',
      description: 'Controla consentimientos de responsabilidad, tratamiento de datos, uso de instalaciones y programas de entrenamiento.',
      icon: '🏋️',
      examples: ['Responsabilidad deportiva', 'Uso de instalaciones', 'Programas personalizados']
    },
    {
      title: 'Spas y Centros de Bienestar',
      description: 'Gestiona acuerdos de servicios, tratamientos de bienestar, uso de datos y políticas de privacidad.',
      icon: '🧘',
      examples: ['Tratamientos de spa', 'Terapias alternativas', 'Políticas de privacidad']
    },
    {
      title: 'Clínicas Dentales',
      description: 'Administra consentimientos odontológicos, tratamientos dentales, ortodoncias y protección de datos.',
      icon: '🦷',
      examples: ['Tratamientos dentales', 'Ortodoncias', 'Cirugías bucales']
    },
    {
      title: 'Cualquier Negocio',
      description: 'Ideal para cualquier empresa que necesite gestionar acuerdos, consentimientos y protección de datos de clientes.',
      icon: '🏢',
      examples: ['Acuerdos comerciales', 'Políticas de privacidad', 'Términos y condiciones']
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
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
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
                <span>Plataforma SaaS Líder en Gestión de Consentimientos</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Gestiona Consentimientos
                <span className="text-primary-600"> Digitalmente</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                La plataforma SaaS completa para digitalizar, gestionar y enviar consentimientos informados. 
                Elimina el papel, ahorra tiempo y cumple con las normativas de protección de datos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href="#pricing" className="btn btn-primary btn-lg flex items-center justify-center gap-2">
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
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
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Consentimiento Firmado</p>
                      <p className="text-sm text-gray-600">Paciente: Juan Pérez</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Mail className="w-8 h-8 text-blue-600" />
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
              <p className="text-4xl font-bold mb-2">50K+</p>
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

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Archivo en Línea incluye todas las herramientas necesarias para gestionar consentimientos de forma profesional y segura
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition group">
                <feature.icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition`} />
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
                Transforma la gestión de consentimientos en tu negocio con nuestra plataforma intuitiva, segura y completamente en español.
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
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                <Zap className="w-10 h-10 text-yellow-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">10x</h3>
                <p className="text-gray-600">Más rápido que el papel</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                <Clock className="w-10 h-10 text-blue-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">80%</h3>
                <p className="text-gray-600">Menos tiempo administrativo</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                <Shield className="w-10 h-10 text-green-500 mb-3" />
                <h3 className="text-2xl font-bold text-gray-900 mb-1">100%</h3>
                <p className="text-gray-600">Cumplimiento legal</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
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
              Ideal para cualquier negocio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Archivo en Línea se adapta a las necesidades de diferentes industrias y sectores empresariales
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-6 rounded-xl bg-gradient-to-br from-primary-50 to-purple-50 hover:shadow-lg transition">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-primary-600" />
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
            ¿Listo para digitalizar tus consentimientos?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a cientos de empresas que ya confían en Archivo en Línea para gestionar sus consentimientos de forma profesional
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg">
              Ver Planes y Precios
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
                La plataforma líder en gestión de consentimientos digitales para empresas de todos los tamaños.
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
                <li><a href="#" className="hover:text-white transition">Estado del Sistema</a></li>
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
